import Document from '../models/Document.js';

// Room tracking: Map<documentId, Map<socketId, userInfo>>
const rooms = new Map();

const COLORS = [
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169',
  '#319795', '#3182CE', '#6B46C1', '#D53F8C',
];

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] connect ${socket.id}`);

    // ─── JOIN DOCUMENT ──────────────────────────────────────────────────────
    socket.on('join-document', async ({ documentId, user }) => {
      socket.join(documentId);

      // Store on socket for cleanup on disconnect
      socket.documentId = documentId;
      socket.userInfo = {
        socketId: socket.id,
        name: user?.name || 'Anonymous',
        color: randomColor(),
      };

      // Add to room map
      if (!rooms.has(documentId)) rooms.set(documentId, new Map());
      rooms.get(documentId).set(socket.id, socket.userInfo);

      // Load or create document
      try {
        let doc = await Document.findById(documentId);
        if (!doc) {
          doc = new Document({ _id: documentId });
          await doc.save();
        }
        socket.emit('load-document', {
          content:  doc.content,
          yjsState: doc.yjsState || null,
        });
      } catch (err) {
        console.error('[Socket] join-document error:', err);
      }

      // Broadcast updated user list to everyone in the room
      const users = Array.from(rooms.get(documentId).values());
      io.to(documentId).emit('users-changed', users);

      console.log(`[Socket] ${socket.userInfo.name} joined doc ${documentId} — ${users.length} user(s)`);
    });

    // ─── SEND CHANGES (relay Yjs CRDT update to peers) ─────────────────────
    socket.on('send-changes', ({ documentId, delta, yjsUpdate }) => {
      socket.to(documentId).emit('receive-changes', { delta, yjsUpdate });
    });

    // ─── SAVE DOCUMENT ──────────────────────────────────────────────────────
    socket.on('save-document', async ({ documentId, content, yjsState }) => {
      try {
        const doc = await Document.findById(documentId);
        if (!doc) return;

        doc.content  = content;
        doc.yjsState = yjsState;

        // Version snapshot (ring buffer — keep last 20)
        if (!doc.versions) doc.versions = [];
        doc.versions.push({
          content,
          yjsState,
          savedAt: new Date(),
        });
        if (doc.versions.length > 20) doc.versions.shift();

        await doc.save();
      } catch (err) {
        console.error('[Socket] save-document error:', err);
      }
    });

    // ─── CURSOR MOVE ────────────────────────────────────────────────────────
    socket.on('cursor-move', ({ documentId, range }) => {
      if (!socket.userInfo) return;
      socket.to(documentId).emit('cursor-update', {
        socketId: socket.id,
        name:     socket.userInfo.name,
        color:    socket.userInfo.color,
        range,
      });
    });

    // ─── TYPING INDICATOR ───────────────────────────────────────────────────
    socket.on('typing', ({ documentId, isTyping }) => {
      if (!socket.userInfo) return;
      socket.to(documentId).emit('user-typing', {
        socketId: socket.id,
        name:     socket.userInfo.name,
        color:    socket.userInfo.color,
        isTyping,
      });
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] disconnect ${socket.id}`);

      const { documentId, userInfo } = socket;
      if (!documentId || !rooms.has(documentId)) return;

      rooms.get(documentId).delete(socket.id);

      // Tell remaining users this person left
      socket.to(documentId).emit('cursor-remove', { socketId: socket.id });
      socket.to(documentId).emit('user-typing',   { socketId: socket.id, isTyping: false });

      const users = Array.from(rooms.get(documentId).values());
      io.to(documentId).emit('users-changed', users);

      // Clean up empty rooms
      if (rooms.get(documentId).size === 0) rooms.delete(documentId);

      console.log(`[Socket] ${userInfo?.name} left doc ${documentId} — ${users.length} user(s) remaining`);
    });
  });
};

export { registerSocketHandlers };