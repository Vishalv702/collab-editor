import React, { useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuillEditor    from '../components/QuillEditor.jsx';
import UserPresence   from '../components/UserPresence.jsx';
import AIPanel        from '../components/AIPanel.jsx';
import VersionHistory from '../components/VersionHistory.jsx';
import useCollabEditor from '../hooks/useCollabEditor.js';
import useAI           from '../hooks/useAI.js';

/* Persistent guest name stored in localStorage */
const getUsername = () => {
  let name = localStorage.getItem('collab_username');
  if (!name) {
    const adj  = ['Swift','Bright','Calm','Bold','Keen','Wise'];
    const noun = ['Falcon','Maple','River','Stone','Cloud','Ember'];
    name = `${adj[~~(Math.random()*adj.length)]} ${noun[~~(Math.random()*noun.length)]}`;
    localStorage.setItem('collab_username', name);
  }
  return name;
};

const Editor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title,  setTitle]  = useState('Untitled Document');
  const [copied, setCopied] = useState(false);
  const [userName]          = useState(getUsername);

  /* ── Core collaboration hook ── */
  const { isConnected, isSaving, activeUsers, typingUsers, remoteCursors } =
    useCollabEditor({ documentId, quillRef, userName });

  /* ── AI hook ── */
  const {
    loading: aiLoading, error: aiError, summary, showSummary,
    summarize, improveSelected, fixGrammar, closeSummary, clearError,
  } = useAI(quillRef);

  /* Restore a historical version into the editor */
  const handleRestore = useCallback((content) => {
    quillRef.current?.setContents(content);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editor-layout">

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar__logo" onClick={() => navigate('/')}>
          <span>◈</span> CollabDocs
        </div>

        <div className="sidebar__section">
          <p className="sidebar__label">Document ID</p>
          <p className="sidebar__docid">{documentId?.slice(0, 8)}…</p>
        </div>

        <div className="sidebar__section">
          <p className="sidebar__label">Collaborators</p>
          <UserPresence
            activeUsers={activeUsers}
            typingUsers={typingUsers}
            isConnected={isConnected}
          />
        </div>

        <div className="sidebar__section">
          <AIPanel
            loading={aiLoading}
            error={aiError}
            summary={summary}
            showSummary={showSummary}
            onSummarize={summarize}
            onImprove={improveSelected}
            onFixGrammar={fixGrammar}
            onCloseSummary={closeSummary}
            onClearError={clearError}
          />
        </div>

        <div className="sidebar__section">
          <VersionHistory documentId={documentId} onRestore={handleRestore} />
        </div>

        <div className="sidebar__footer">
          <button className="share-btn" onClick={copyLink}>
            {copied ? '✓ Copied!' : '⊕ Copy share link'}
          </button>
        </div>
      </aside>

      {/* ── Editor main area ───────────────────────────── */}
      <main className="editor-main">
        <div className="editor-topbar">
          <input
            className="editor-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled Document"
          />
          <div className="editor-status">
            <span className={`status-pill ${isConnected ? 'status-pill--live' : 'status-pill--off'}`}>
              {isConnected ? 'Live' : 'Reconnecting…'}
            </span>
            {isSaving && <span className="status-saving">Saving…</span>}
          </div>
        </div>

        <div className="editor-body">
          <QuillEditor ref={quillRef} remoteCursors={remoteCursors} />
        </div>
      </main>
    </div>
  );
};

export default Editor;
