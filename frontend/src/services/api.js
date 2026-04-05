const BASE = import.meta.env.VITE_API_URL || 'https://collab-editor-backend-yehr.onrender.com/api';

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const documentService = {
  create:      (title) => request('POST', '/documents', { title }),
  get:         (id)    => request('GET',  `/documents/${id}`),
  getVersions: (id)    => request('GET',  `/documents/${id}/versions`),
};

export const aiService = {
  summarize:   (text) => request('POST', '/ai/summarize', { text }),
  improve:     (text) => request('POST', '/ai/improve',   { text }),
  fixGrammar:  (text) => request('POST', '/ai/grammar',   { text }),
};
