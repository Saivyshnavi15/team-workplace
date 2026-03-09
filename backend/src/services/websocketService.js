import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join workspace room
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace-${workspaceId}`);
      console.log(`User ${socket.userId} joined workspace ${workspaceId}`);
    });

    // Join channel room
    socket.on('join-channel', (channelId) => {
      socket.join(`channel-${channelId}`);
      console.log(`User ${socket.userId} joined channel ${channelId}`);
    });

    // Handle new message
    socket.on('send-message', (data) => {
      // Broadcast to channel room
      socket.to(`channel-${data.channelId}`).emit('new-message', data);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(`channel-${data.channelId}`).emit('user-typing', {
        userId: socket.userId,
        ...data
      });
    });

    // Handle task updates
    socket.on('task-update', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('task-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });
};