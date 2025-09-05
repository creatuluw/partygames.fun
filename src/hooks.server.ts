import type { Handle } from '@sveltejs/kit';

// SvelteKit handle function
// WebSocket server is now initialized in server.js for production
export const handle: Handle = async ({ event, resolve }) => {
	// You can add middleware logic here if needed
	
	const response = await resolve(event);
	return response;
};
