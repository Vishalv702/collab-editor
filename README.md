# CollabDocs — Real-Time Collaborative Text Editor

A production-grade collaborative document editor with conflict-free real-time sync, AI writing assistance, and version history.

## Live Demo
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-app.onrender.com

## Tech Stack
- **Frontend:** React 18, Vite, Quill.js, Yjs (CRDT), Socket.IO client
- **Backend:** Node.js, Express.js, Socket.IO, MongoDB (Mongoose)
- **AI:** Google Gemini 1.5 Flash / OpenAI GPT-4o-mini

## Features
- Real-time collaborative editing (multiple users, zero lag)
- Conflict-free merging using Yjs CRDT
- Live user presence with colored cursors and typing indicators
- AI: Summarize document, Improve selection, Fix grammar
- Auto-save to MongoDB every 2 seconds
- Version history with one-click restore
- Share any document via URL

## Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB running locally OR a MongoDB Atlas URI
- Gemini API key (free at https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/collab-editor.git
cd collab-editor
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env — fill in MONGODB_URI and GEMINI_API_KEY
npm install
npm run dev
# Runs on http://localhost:3001
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env
# .env already points to localhost:3001 — no changes needed locally
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Open and test
- Open http://localhost:5173
- Create a document
- Copy the URL and open it in a second browser tab
- Start typing in both tabs — changes sync in real time

## Environment Variables

**backend/.env**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/collab-editor
CLIENT_URL=*
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

**frontend/.env**
```
VITE_SOCKET_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001/api
```

## Project Structure
```
collab-editor/
├── backend/
│   ├── controllers/        # documentController, aiController
│   ├── models/             # Document.js (Mongoose schema)
│   ├── routes/             # documentRoutes, aiRoutes
│   ├── sockets/            # documentSocket.js (Socket.IO handlers)
│   ├── utils/              # db.js
│   └── server.js           # Entry point
└── frontend/
    └── src/
        ├── components/     # QuillEditor, UserPresence, AIPanel, VersionHistory
        ├── hooks/          # useCollabEditor.js, useAI.js
        ├── pages/          # Home.jsx, Editor.jsx
        ├── services/       # api.js, socket.js
        └── styles/         # global.css
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents | Create new document |
| GET | /api/documents/:id | Fetch document |
| GET | /api/documents/:id/versions | Version history |
| POST | /api/ai/summarize | Summarize document |
| POST | /api/ai/improve | Improve selected text |
| POST | /api/ai/grammar | Fix grammar |
| GET | /health | Health check |

## AI Tools Used
| Tool | Usage |
|------|-------|
| Claude (Anthropic) | Used to scaffold project, implement Yjs CRDT integration, and debug Socket.IO race conditions |
| Google Gemini 1.5 Flash | In-app AI features: summarize, improve, fix grammar |

## Known Limitations
- No authentication — anyone with the URL can edit (by design for demo)
- Room state is in-memory — clears on server restart (documents persist in MongoDB)
- Render free tier sleeps after 15 min inactivity