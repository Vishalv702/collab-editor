import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const navigate  = useNavigate();
  const [creating, setCreating] = useState(false);
  const [joinId,   setJoinId]   = useState('');
  const [error,    setError]    = useState('');

  const createNew = async () => {
    setCreating(true); setError('');
    try {
      const doc = await documentService.create('Untitled Document');
      navigate(`/documents/${doc.id}`);
    } catch {
      setError('Could not reach server. Is the backend running on port 3001?');
      setCreating(false);
    }
  };

  const joinDoc = (e) => {
    e.preventDefault();
    const raw = joinId.trim();
    if (!raw) { setError('Paste a document ID or share URL.'); return; }
    // Accept either a full URL like /documents/<uuid> or just the uuid
    const match = raw.match(/documents\/([0-9a-f-]{36})/i);
    navigate(`/documents/${match ? match[1] : raw}`);
  };

  return (
    <div className="home">
      <div className="home-bg" />

      <header className="home-header">
        <div className="home-logo">
          <span>◈</span> CollabDocs
        </div>
      </header>

      <main className="home-main">
        <div className="home-hero">
          <h1>Write together,<br /><em>in real time.</em></h1>
          <p>
            Conflict-free collaboration powered by Yjs CRDT — every keystroke
            synced instantly, zero merge conflicts, with AI writing assistance built in.
          </p>
        </div>

        <div className="home-cards">
          {/* New document */}
          <div className="home-card home-card--accent">
            <div className="home-card__icon">✦</div>
            <h2>New document</h2>
            <p>Start fresh and invite collaborators with a shareable link.</p>
            <button className="btn btn--primary" onClick={createNew} disabled={creating}>
              {creating ? 'Creating…' : 'Create document'}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => navigate(`/documents/${uuidv4()}`)}
            >
              Quick start (no save)
            </button>
          </div>

          {/* Join existing */}
          <div className="home-card">
            <div className="home-card__icon">⊕</div>
            <h2>Open document</h2>
            <p>Paste a document ID or share URL to jump into an existing session.</p>
            <form onSubmit={joinDoc} style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
              <input
                className="home-input"
                value={joinId}
                onChange={e => { setJoinId(e.target.value); setError(''); }}
                placeholder="Document ID or share link"
              />
              <button className="btn btn--primary" type="submit">Open →</button>
            </form>
          </div>
        </div>

        {error && <div className="home-error">{error}</div>}

        <div className="home-features">
          {[
            { icon:'⚡', title:'Real-time sync',    desc:'Sub-50ms update propagation via Socket.IO' },
            { icon:'◈', title:'CRDT merging',       desc:'Zero data loss on concurrent edits with Yjs' },
            { icon:'✦', title:'AI assistance',      desc:'Summarize, improve, and fix grammar' },
            { icon:'◇', title:'Version history',    desc:'20-snapshot auto-save ring buffer' },
          ].map(f => (
            <div key={f.title} className="home-feature">
              <span className="home-feature__icon">{f.icon}</span>
              <strong>{f.title}</strong>
              <span>{f.desc}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
