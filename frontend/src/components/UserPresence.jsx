import React, { useState } from 'react';

/**
 * UserPresence
 * Shows: connection dot · stacked user avatars · typing indicator · dropdown list
 */
const UserPresence = ({ activeUsers = [], typingUsers = [], isConnected }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="presence" onClick={() => setOpen(o => !o)}>
      {/* Connection dot */}
      <div className={`conn-dot ${isConnected ? 'conn-dot--on' : 'conn-dot--off'}`} />

      {/* Stacked avatars */}
      <div className="avatars">
        {activeUsers.slice(0, 5).map((u, i) => (
          <div
            key={u.socketId}
            className="avatar"
            title={u.name}
            style={{ background: u.color, marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}
          >
            {u.name[0].toUpperCase()}
          </div>
        ))}
        {activeUsers.length > 5 && (
          <div className="avatar avatar--more">+{activeUsers.length - 5}</div>
        )}
      </div>

      <span className="presence-count">
        {activeUsers.length} {activeUsers.length === 1 ? 'editor' : 'editors'}
      </span>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-row">
          <span className="typing-dots"><span/><span/><span/></span>
          <span className="typing-label">
            {typingUsers.slice(0, 2).map(u => u.name).join(', ')}
            {typingUsers.length === 1 ? ' is' : ' are'} typing
          </span>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="presence-menu" onClick={e => e.stopPropagation()}>
          <p className="presence-menu__title">Active editors</p>
          {activeUsers.map(u => (
            <div key={u.socketId} className="presence-menu__row">
              <span className="presence-menu__dot" style={{ background: u.color }} />
              <span>{u.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPresence;
