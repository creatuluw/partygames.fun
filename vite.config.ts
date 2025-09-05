import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { initializeWebSocketServer } from './src/lib/server/websocket';

const webSocketPlugin = {
	name: 'webSocketServer',
	configureServer(server: any) {
		if (!server.httpServer) return;
		
		server.httpServer.once('listening', () => {
			try {
				initializeWebSocketServer(server.httpServer);
				console.log('✅ WebSocket server initialized');
			} catch (error) {
				console.error('❌ Failed to initialize WebSocket server:', error);
			}
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketPlugin],
	server: {
		port: 3000
	}
});
