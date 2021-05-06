import { io } from 'socket.io-client';

let socket;

export function broadcast(user, action) {
  if (socket && user) {
    socket.send({ action, user: user.fullname });
  }
}

export function registerListener(cb) {
  if (!socket) {
    socket = io(import.meta.env.VITE_WEBSOCKET);
  }

  socket.on('message', cb);
}
