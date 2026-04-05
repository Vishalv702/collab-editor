import 'dotenv/config';
import express, { json } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './utils/db.js';
import documentRoutes from './routes/documentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { registerSocketHandlers } from './sockets/documentSocket.js';

const app    = express();
const server = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || '*';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: false },
  transports: ['websocket','polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: CLIENT_URL, credentials: false }));
app.use(json({ limit: '10mb' }));

connectDB();

app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

app.use((err, _req, res, _next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

setInterval(() => {
  fetch(`https://collab-editor-backend-yehr.onrender.com/health`)
    .catch(() => {});
}, 10 * 60 * 1000);

registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);