import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'], // ✅ Add both transports
  autoConnect: true, // ✅ Connect immediately
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// ✅ Add connection logging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
});

export default socket;