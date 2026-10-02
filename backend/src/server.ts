import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { setSocketIO } from './providers/notifications/notification.service';
import { startEscalationCronJob } from './jobs/escalation.job';

async function bootstrap() {
  try {
    // 1. Connect Database
    await connectDatabase();

    // 2. Initialize App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 3. Initialize WebSockets (Socket.IO)
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.io] Client connected: ${socket.id}`);

      // Client joins room by userId
      socket.on('join_user_room', (userId: string) => {
        socket.join(userId);
        console.log(`[Socket.io] Socket ${socket.id} joined user room: ${userId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      });
    });

    setSocketIO(io);

    // 4. Start Background Jobs
    if (env.NODE_ENV !== 'test') {
      startEscalationCronJob();
    }

    // 5. Start Server
    server.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Smart Village Grievance Backend Server Running!`);
      console.log(`📍 Port: http://localhost:${env.PORT}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/health`);
      console.log(`🔗 API Base: http://localhost:${env.PORT}/api/v1`);
      console.log(`=======================================================`);
    });
  } catch (error: any) {
    console.error('Fatal Server Bootstrap Error:', error);
    process.exit(1);
  }
}

bootstrap();
