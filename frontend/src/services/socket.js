import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://collab-editor-backend-yehr.onrender.com';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket','polling' ],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export default socket;
export const getSocket = () => socket;