import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export function setupNotificationSocket(server: HTTPServer): SocketServer {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; email: string };
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`User ${userId} connected to notifications socket`);

    // Join user's room for targeted notifications
    socket.join(`user_${userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from notifications socket`);
    });

    // Handle custom events if needed
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
}
