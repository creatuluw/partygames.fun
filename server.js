import { createServer } from 'http';
import { handler } from './build/handler.js';

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

// Start server
server.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log('🎮 Party Games ready for multiplayer sessions!');

  // Initialize WebSocket server after server is listening
  try {
    // Dynamic import to avoid build issues
    import('./src/lib/server/websocket.js').then(({ initializeWebSocketServer }) => {
      initializeWebSocketServer(server);
      console.log('✅ WebSocket server initialized (Production)');
    }).catch(error => {
      console.error('❌ Failed to initialize WebSocket server (Production):', error);
    });
  } catch (error) {
    console.error('❌ Failed to import WebSocket server:', error);
  }
});
