import React, { useState } from 'react';
import { documentService } from '../services/api';

/**
 * VersionHistory
 * Loads up to 20 auto-saved snapshots and lets the user restore any of them.
 */
const VersionHistory = ({ documentId, onRestore }) => {
  const [open,     setOpen]     = useState(false);
  const [versions, setVersions] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const toggle = async () => {
    if (!open) {
      setLoading(true);
      try {
        const data = await documentService.getVersions(documentId);
        setVersions([...data.versions].reverse()); // newest first
      } catch (e) {
        console.error('Failed to load versions:', e);
      } finally {
        setLoading(false);
      }
    }
    setOpen(o => !o);
  };

  return (
    <div className="versions">
      <button className="versions__btn" onClick={toggle}>
        ⊕ Version history
      </button>

      {open && (
        <div className="versions__list">
          <p className="versions__title">Saved snapshots</p>
          {loading && <p className="versions__hint">Loading…</p>}
          {!loading && versions.length === 0 && (
            <p className="versions__hint">No snapshots yet</p>
          )}
          {versions.map((v, i) => (
            <div key={i} className="versions__row">
              <div>
                <p className="versions__time">
                  {new Date(v.savedAt).toLocaleString()}
                </p>
                <p className="versions__by">{v.savedBy}</p>
              </div>
              <button
                className="versions__restore"
                onClick={() => { onRestore(v.content); setOpen(false); }}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
