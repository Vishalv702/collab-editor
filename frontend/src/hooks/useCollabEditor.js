import { useEffect, useRef, useCallback, useState } from 'react';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import socket from '../services/socket';

const useCollabEditor = ({ documentId, quillRef, userName }) => {
  const ydocRef           = useRef(null);
  const bindingRef        = useRef(null);
  const isApplyingRemote  = useRef(false);
  const hasJoined         = useRef(false);
  const saveDebounceRef   = useRef(null);
  const typingDebounceRef = useRef(null);

  const [isConnected,   setIsConnected]   = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [activeUsers,   setActiveUsers]   = useState([]);
  const [typingUsers,   setTypingUsers]   = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});

  const emitSave = useCallback((content, yjsState) => {
    if (!documentId) return;
    setIsSaving(true);
    socket.emit('save-document', { documentId, content, yjsState });
    setTimeout(() => setIsSaving(false), 800);
  }, [documentId]);

  useEffect(() => {
    if (!quillRef.current || !documentId) return;

    const quill = quillRef.current;

    // Init Yjs document
    const ydoc  = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText('quill');

    // Bind Yjs ↔ Quill
    const binding = new QuillBinding(ytext, quill);
    bindingRef.current = binding;

    // Join room
    const joinDocument = () => {
      if (hasJoined.current) return;
      hasJoined.current = true;
      socket.emit('join-document', {
        documentId,
        user: { name: userName || guestName() },
      });
    };

    // Event handlers
    const onConnect = () => {
      setIsConnected(true);
      hasJoined.current = false;
      joinDocument();
    };

    const onDisconnect = () => setIsConnected(false);

    const onLoadDocument = ({ content, yjsState }) => {
      isApplyingRemote.current = true;
      if (yjsState) {
        try {
          const bytes = Uint8Array.from(atob(yjsState), c => c.charCodeAt(0));
          Y.applyUpdate(ydoc, bytes);
          isApplyingRemote.current = false;
          return;
        } catch { /* fall through */ }
      }
      if (content?.ops?.length) quill.setContents(content);
      isApplyingRemote.current = false;
    };

    const onReceiveChanges = ({ yjsUpdate }) => {
      if (!yjsUpdate) return;
      isApplyingRemote.current = true;
      try {
        Y.applyUpdate(ydoc, Uint8Array.from(Object.values(yjsUpdate)));
      } catch (err) {
        console.error('[Collab] applyUpdate failed:', err);
      }
      isApplyingRemote.current = false;
    };

    const onUsersChanged  = (users) => setActiveUsers(users);

    const onCursorUpdate  = ({ socketId, name, color, range }) =>
      setRemoteCursors(prev => ({ ...prev, [socketId]: { name, color, range } }));

    const onCursorRemove  = ({ socketId }) =>
      setRemoteCursors(prev => {
        const n = { ...prev };
        delete n[socketId];
        return n;
      });

    const onUserTyping = ({ socketId, name, color, isTyping }) =>
      setTypingUsers(prev =>
        isTyping
          ? prev.find(u => u.socketId === socketId)
            ? prev
            : [...prev, { socketId, name, color }]
          : prev.filter(u => u.socketId !== socketId)
      );

    // Remove old then add fresh listeners
    socket.off('connect',         onConnect);
    socket.off('disconnect',      onDisconnect);
    socket.off('load-document',   onLoadDocument);
    socket.off('receive-changes', onReceiveChanges);
    socket.off('users-changed',   onUsersChanged);
    socket.off('cursor-update',   onCursorUpdate);
    socket.off('cursor-remove',   onCursorRemove);
    socket.off('user-typing',     onUserTyping);

    socket.on('connect',         onConnect);
    socket.on('disconnect',      onDisconnect);
    socket.on('load-document',   onLoadDocument);
    socket.on('receive-changes', onReceiveChanges);
    socket.on('users-changed',   onUsersChanged);
    socket.on('cursor-update',   onCursorUpdate);
    socket.on('cursor-remove',   onCursorRemove);
    socket.on('user-typing',     onUserTyping);

    // CRITICAL: socket.connected may already be true when this runs
    // because autoConnect:true connects immediately at import time.
    // We must check and handle both cases here.
    if (socket.connected) {
      // Already connected — set state and join immediately
      setIsConnected(true);
      joinDocument();
    } else {
      // Not connected yet — onConnect will fire when ready
      setIsConnected(false);
    }

    // Observe local Yjs edits → relay to peers
    const onYjsUpdate = (update) => {
      if (isApplyingRemote.current) return;
      socket.emit('send-changes', {
        documentId,
        delta:     quill.getContents(),
        yjsUpdate: Array.from(update),
      });
      clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(() => {
        const state = Y.encodeStateAsUpdate(ydoc);
        const b64   = btoa(String.fromCharCode(...state));
        emitSave(quill.getContents(), b64);
      }, 2000);
    };

    ydoc.on('update', onYjsUpdate);

    // Cursor and typing
    const onSelectionChange = (range) => {
      socket.emit('cursor-move', { documentId, range });
      if (range) {
        socket.emit('typing', { documentId, isTyping: true });
        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = setTimeout(
          () => socket.emit('typing', { documentId, isTyping: false }),
          1500
        );
      } else {
        socket.emit('typing', { documentId, isTyping: false });
      }
    };

    quill.on('selection-change', onSelectionChange);

    return () => {
      clearTimeout(saveDebounceRef.current);
      clearTimeout(typingDebounceRef.current);
      hasJoined.current = false;
      ydoc.off('update', onYjsUpdate);
      quill.off('selection-change', onSelectionChange);
      socket.off('connect',         onConnect);
      socket.off('disconnect',      onDisconnect);
      socket.off('load-document',   onLoadDocument);
      socket.off('receive-changes', onReceiveChanges);
      socket.off('users-changed',   onUsersChanged);
      socket.off('cursor-update',   onCursorUpdate);
      socket.off('cursor-remove',   onCursorRemove);
      socket.off('user-typing',     onUserTyping);
      binding.destroy();
      ydoc.destroy();
    };
  }, [documentId, quillRef, userName, emitSave]);

  return { isConnected, isSaving, activeUsers, typingUsers, remoteCursors };
};

const guestName = () => {
  const adj  = ['Swift','Bright','Calm','Bold','Keen','Wise','Deft'];
  const noun = ['Falcon','Maple','River','Stone','Cloud','Ember','Cedar'];
  return `${adj[~~(Math.random()*adj.length)]} ${noun[~~(Math.random()*noun.length)]}`;
};

export default useCollabEditor;