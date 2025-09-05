import { createServer } from 'http';
import { handler } from './build/handler.js';
import { Server as SocketIOServer } from 'socket.io';

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🌍 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: port,
  HOST: host,
  RAILWAY: !!process.env.RAILWAY_ENVIRONMENT
});

// Create HTTP server with SvelteKit handler
const server = createServer(handler);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Configure this properly in production
    methods: ["GET", "POST"]
  }
});

// WebSocket connection handling
const activeSessions = new Map(); // sessionId -> Set of socketIds
const playerSockets = new Map(); // playerId -> socketId
const socketPlayers = new Map(); // socketId -> player info

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle player joining a session
  socket.on('join-session', async (data) => {
    try {
      const { sessionId, playerId } = data;
      console.log(`👥 Player ${playerId} joining session ${sessionId}`);
      
      // Join the socket to the session room
      socket.join(sessionId);
      
      // Track the connection
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, new Set());
      }
      activeSessions.get(sessionId).add(socket.id);
      
      playerSockets.set(playerId, socket.id);
      socketPlayers.set(socket.id, { playerId, sessionId });
      
      // Notify all clients in the session
      const joinEvent = {
        type: 'player:join',
        data: { sessionId, playerId },
        timestamp: Date.now()
      };
      
      io.to(sessionId).emit('game-event', joinEvent);
      socket.emit('join-success', { sessionId, playerId });
      
    } catch (error) {
      console.error('❌ Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  // Handle player leaving
  socket.on('disconnect', async () => {
    await handlePlayerDisconnect(socket.id);
  });

  socket.on('leave-session', async () => {
    await handlePlayerDisconnect(socket.id);
  });

  // Handle game start
  socket.on('start-game', (data) => {
    const { sessionId, gameType, settings } = data;
    console.log(`🎮 Starting game in session ${sessionId}`);
    
    const startEvent = {
      type: 'game:start',
      data: { sessionId, gameType, settings },
      timestamp: Date.now()
    };
    
    io.to(sessionId).emit('game-event', startEvent);
  });

  // Handle player movement
  socket.on('player-move', (data) => {
    const playerInfo = socketPlayers.get(socket.id);
    if (!playerInfo) return;
    
    const moveEvent = {
      type: 'game:move',
      data: { ...data, timestamp: Date.now() },
      timestamp: Date.now()
    };
    
    // Broadcast to all players in the session except sender
    socket.to(playerInfo.sessionId).emit('game-event', moveEvent);
  });

  // Handle game state updates
  socket.on('game-state', (data) => {
    const stateEvent = {
      type: 'game:state',
      data,
      timestamp: Date.now()
    };
    
    io.to(data.sessionId).emit('game-event', stateEvent);
  });

  // Handle game end
  socket.on('game-end', (data) => {
    const { sessionId, results, roundNumber } = data;
    console.log(`🏁 Game ended in session ${sessionId}`);
    
    const endEvent = {
      type: 'game:end',
      data: { sessionId, results, roundNumber },
      timestamp: Date.now()
    };
    
    io.to(sessionId).emit('game-event', endEvent);
  });
});

async function handlePlayerDisconnect(socketId) {
  const playerInfo = socketPlayers.get(socketId);
  if (!playerInfo) return;

  const { playerId, sessionId } = playerInfo;
  console.log(`🔌 Player ${playerId} disconnected from session ${sessionId}`);

  try {
    // Remove from tracking
    const sessionSockets = activeSessions.get(sessionId);
    if (sessionSockets) {
      sessionSockets.delete(socketId);
      if (sessionSockets.size === 0) {
        activeSessions.delete(sessionId);
      }
    }
    
    playerSockets.delete(playerId);
    socketPlayers.delete(socketId);
    
    // Notify other players
    const leaveEvent = {
      type: 'player:leave',
      data: { sessionId, playerId },
      timestamp: Date.now()
    };
    
    io.to(sessionId).emit('game-event', leaveEvent);
    
  } catch (error) {
    console.error('❌ Error handling player disconnect:', error);
  }
}

// Start server
server.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log('🎮 Party Games ready for multiplayer sessions!');
  console.log('✅ WebSocket server initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

export { io };
