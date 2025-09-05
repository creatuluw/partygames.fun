import { createServer } from 'http';
import { handler } from './build/handler.js';
import { initializeWebSocketServer } from './src/lib/server/websocket.js';
import { getPort, getHost, isRailway } from './src/lib/utils/environment.js';

const port = getPort();
const host = getHost();

console.log('🌍 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: port,
  HOST: host,
  RAILWAY: isRailway()
});

// Create HTTP server with SvelteKit handler
const server = createServer(handler);

// Initialize WebSocket server
try {
  initializeWebSocketServer(server);
  console.log('✅ WebSocket server initialized (Production)');
} catch (error) {
  console.error('❌ Failed to initialize WebSocket server (Production):', error);
  process.exit(1);
}

// Start server
server.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log('🎮 Party Games ready for multiplayer sessions!');
});
