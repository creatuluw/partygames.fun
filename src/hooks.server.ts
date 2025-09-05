import type { Handle } from '@sveltejs/kit';

// SvelteKit handle function
// TODO: WebSocket server will be added once module resolution is fixed
export const handle: Handle = async ({ event, resolve }) => {
	// You can add middleware logic here if needed
	
	const response = await resolve(event);
	return response;
};
