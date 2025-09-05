import { building } from '$app/environment';
import { initializeWebSocketServer } from '$lib/server/websocket';
import type { Handle } from '@sveltejs/kit';

// Initialize WebSocket server when not building
if (!building) {
	// This will be called when the server starts
	const server = global.__server__;
	if (server) {
		initializeWebSocketServer(server);
	}
}

// SvelteKit handle function
export const handle: Handle = async ({ event, resolve }) => {
	// You can add middleware logic here if needed
	
	const response = await resolve(event);
	return response;
};
