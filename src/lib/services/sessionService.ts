import { apiClient } from '../api/postgrest';
import { gameClient } from '../client/websocket';
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import type { 
	Session, 
	Player, 
	ClientState,
	CreateSessionParams,
	JoinSessionParams 
} from '../api/types';

// Client state store
const createClientState = (): ClientState => ({
	isConnected: false,
	sessionId: null,
	playerId: null,
	isHost: false,
	currentScreen: 'home',
	session: null,
	players: [],
	gameState: null,
	error: null
});

export const clientState = writable<ClientState>(createClientState());

class SessionService {
	private hostId: string;

	constructor() {
		this.hostId = uuidv4();
		this.setupEventHandlers();
	}

	private setupEventHandlers() {
		// Subscribe to WebSocket events
		gameClient.getConnectionStatus().subscribe(status => {
			clientState.update(state => ({
				...state,
				isConnected: status === 'connected'
			}));
		});

		gameClient.getPlayers().subscribe(players => {
			clientState.update(state => ({
				...state,
				players
			}));
		});

		gameClient.getGameState().subscribe(gameState => {
			clientState.update(state => ({
				...state,
				gameState
			}));
		});

		gameClient.getError().subscribe(error => {
			clientState.update(state => ({
				...state,
				error
			}));
		});

		// Listen for game events to update screen
		gameClient.getGameEvents().subscribe(events => {
			const latestEvent = events[events.length - 1];
			if (!latestEvent) return;

			clientState.update(state => {
				switch (latestEvent.type) {
					case 'game:start':
						return { ...state, currentScreen: 'game' };
					
					case 'game:end':
						return { ...state, currentScreen: 'results' };
					
					default:
						return state;
				}
			});
		});
	}

	// Session Creation
	async createSession(gameType: string, maxPlayers: number = 20, hostName: string = 'Host'): Promise<{ sessionId: string; roomCode: string }> {
		console.log('🎮 Starting session creation:', { gameType, maxPlayers, hostName });
		try {
			// Reset state
			clientState.update(() => createClientState());

			console.log('🔌 Connecting to WebSocket server...');
			// Connect to WebSocket server
			await gameClient.connect();

			// Create session in database
			console.log('\ud83d\udce6 Creating session with:', { hostId: this.hostId, gameType, maxPlayers });
			const response = await apiClient.createSession({
				hostId: this.hostId,
				gameType,
				maxPlayers
			});

			console.log('\ud83d\udcdd Session response:', response);
			// The response is an array, so get the first item
			const sessionData = Array.isArray(response) ? response[0] : response;
			const sessionId = sessionData.session_id;
			const roomCode = sessionData.room_code;
			console.log('\ud83c\udfaf Extracted:', { sessionId, roomCode });

			// Add the host as a player directly to avoid 404 issues
			console.log('\ud83d\udc65 Adding host as player directly...');
			const hostPlayerResponse = await apiClient.request('/players', {
				method: 'POST',
				body: JSON.stringify({
					session_id: sessionId,
					display_name: hostName,
					is_host: true,
					connection_status: 'connected'
				})
			});
			
			const joinResponse = {
				player_id: hostPlayerResponse[0].id,
				session_id: sessionId,
				is_host: true
			};

			// Join the WebSocket session
			console.log('🔌 Connecting to WebSocket for session:', sessionId);
			await gameClient.joinSession(sessionId, joinResponse.player_id);

			// Update client state
			clientState.update(state => ({
				...state,
				sessionId,
				playerId: joinResponse.player_id,
				isHost: true,
				currentScreen: 'lobby'
			}));

			console.log('✅ Session created:', { sessionId, roomCode });
			return { sessionId, roomCode };

		} catch (error) {
			console.error('❌ Failed to create session:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
			
			clientState.update(state => ({
				...state,
				error: errorMessage
			}));

			throw error;
		}
	}

	// Join Session
	async joinSession(roomCode: string, displayName: string): Promise<void> {
		try {
			// Reset state
			clientState.update(() => createClientState());

			// Connect to WebSocket server
			await gameClient.connect();

			// Join session in database
			const response = await apiClient.joinSession({
				roomCode,
				displayName
			});

			// Join the WebSocket session
			await gameClient.joinSession(response.session_id, response.player_id);

			// Update client state
			clientState.update(state => ({
				...state,
				sessionId: response.session_id,
				playerId: response.player_id,
				isHost: response.is_host,
				currentScreen: 'lobby'
			}));

			console.log('✅ Joined session:', response);

		} catch (error) {
			console.error('❌ Failed to join session:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
			
			clientState.update(state => ({
				...state,
				error: errorMessage
			}));

			throw error;
		}
	}

	// Leave Session
	async leaveSession(): Promise<void> {
		try {
			// Leave WebSocket session
			gameClient.leaveSession();

			// Disconnect from server
			gameClient.disconnect();

			// Reset client state
			clientState.update(() => ({
				...createClientState(),
				currentScreen: 'home'
			}));

			console.log('✅ Left session');

		} catch (error) {
			console.error('❌ Failed to leave session:', error);
		}
	}

	// Host Actions
	kickPlayer(playerId: string): void {
		gameClient.kickPlayer(playerId);
	}

	startGame(gameType: string = 'agario', settings: any = {}): void {
		// Default Agario settings
		const defaultSettings = {
			worldSize: { width: 2000, height: 2000 },
			gameTime: 180, // 3 minutes
			pelletCount: 200,
			spawnSafeZone: 100
		};

		const gameSettings = { ...defaultSettings, ...settings };
		gameClient.startGame(gameType, gameSettings);

		console.log('🎮 Starting game:', gameType, gameSettings);
	}

	endGame(results: Array<{ playerId: string; score: number; placement: number }>, roundNumber: number): void {
		gameClient.endGame(results, roundNumber);
	}

	// Player Actions
	sendMove(targetX: number, targetY: number): void {
		gameClient.sendPlayerMove({ targetX, targetY });
	}

	// Utility Methods
	generateRoomCode(): string {
		return Math.random().toString().substring(2, 8);
	}

	isValidRoomCode(code: string): boolean {
		return /^\d{6}$/.test(code);
	}

	// Get current state
	getState() {
		return clientState;
	}

	// Screen navigation helpers
	goToHome(): void {
		clientState.update(state => ({ ...state, currentScreen: 'home' }));
	}

	goToLobby(): void {
		clientState.update(state => ({ ...state, currentScreen: 'lobby' }));
	}

	// Error handling
	clearError(): void {
		clientState.update(state => ({ ...state, error: null }));
	}

	// Get session info
	async getSessionInfo(sessionId: string) {
		try {
			return await apiClient.getSessionDetails(sessionId);
		} catch (error) {
			console.error('❌ Failed to get session info:', error);
			throw error;
		}
	}
}

// Export singleton instance
export const sessionService = new SessionService();

// Export class for testing
export { SessionService };
