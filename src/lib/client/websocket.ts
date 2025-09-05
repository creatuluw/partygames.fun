import { io, type Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import type { 
	WebSocketEvent, 
	ConnectionStatus, 
	Player,
	AgarioGameState,
	AgarioPlayerInput
} from '../api/types';

class GameWebSocketClient {
	private socket: Socket | null = null;
	private connectionStatus: Writable<ConnectionStatus> = writable('disconnected');
	private currentSessionId: string | null = null;
	private currentPlayerId: string | null = null;

	// Event stores
	public gameEvents: Writable<WebSocketEvent[]> = writable([]);
	public players: Writable<Player[]> = writable([]);
	public gameState: Writable<AgarioGameState | null> = writable(null);
	public error: Writable<string | null> = writable(null);

	constructor(private serverUrl: string = '') {
		// Use current location for WebSocket connection
		if (typeof window !== 'undefined') {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			this.serverUrl = serverUrl || `${protocol}//${host}`;
		}
	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.connectionStatus.set('connecting');

				this.socket = io(this.serverUrl, {
					transports: ['websocket', 'polling'],
					timeout: 10000,
				});

				this.setupEventHandlers();

				this.socket.on('connect', () => {
					console.log('✅ Connected to game server');
					this.connectionStatus.set('connected');
					this.error.set(null);
					resolve();
				});

				this.socket.on('connect_error', (error) => {
					console.error('❌ Connection failed:', error);
					this.connectionStatus.set('error');
					this.error.set('Failed to connect to game server');
					reject(error);
				});

			} catch (error) {
				console.error('❌ Failed to create socket connection:', error);
				this.connectionStatus.set('error');
				this.error.set('Failed to initialize connection');
				reject(error);
			}
		});
	}

	private setupEventHandlers() {
		if (!this.socket) return;

		// Handle game events
		this.socket.on('game-event', (event: WebSocketEvent) => {
			console.log('📨 Game event received:', event.type, event.data);
			
			// Add to event history
			this.gameEvents.update(events => [...events, event].slice(-50)); // Keep last 50 events

			// Handle specific event types
			switch (event.type) {
				case 'player:join':
				case 'player:leave':
				case 'player:kick':
					// These events will trigger a players update
					break;
				
				case 'game:start':
					this.gameState.set(null); // Reset game state for new game
					break;
				
				case 'game:state':
					this.gameState.set(event.data.gameState);
					break;
				
				case 'game:end':
					// Game ended, results available in event.data
					break;
			}
		});

		// Handle players list updates
		this.socket.on('players-update', (playersList: Player[]) => {
			console.log('👥 Players updated:', playersList);
			this.players.set(playersList);
		});

		// Handle being kicked
		this.socket.on('kicked', (data: { reason: string }) => {
			console.log('🚫 Kicked from session:', data.reason);
			this.error.set(`Kicked from session: ${data.reason}`);
			this.disconnect();
		});

		// Handle errors
		this.socket.on('error', (error: { message: string }) => {
			console.error('❌ Server error:', error.message);
			this.error.set(error.message);
		});

		// Handle disconnect
		this.socket.on('disconnect', (reason) => {
			console.log('🔌 Disconnected:', reason);
			this.connectionStatus.set('disconnected');
			
			if (reason === 'io server disconnect') {
				// Server disconnected us, don't try to reconnect automatically
				this.error.set('Disconnected by server');
			}
		});
	}

	// Session Management
	public async joinSession(sessionId: string, playerId: string): Promise<void> {
		if (!this.socket) throw new Error('Not connected to server');

		this.currentSessionId = sessionId;
		this.currentPlayerId = playerId;

		return new Promise((resolve, reject) => {
			this.socket!.emit('join-session', { sessionId, playerId });
			
			// Wait for confirmation or error
			const timeout = setTimeout(() => {
				reject(new Error('Join session timeout'));
			}, 5000);

			const onSuccess = () => {
				clearTimeout(timeout);
				resolve();
			};

			const onError = (error: { message: string }) => {
				clearTimeout(timeout);
				reject(new Error(error.message));
			};

			this.socket!.once('players-update', onSuccess);
			this.socket!.once('error', onError);
		});
	}

	public leaveSession(): void {
		if (!this.socket) return;
		
		this.socket.emit('leave-session');
		this.currentSessionId = null;
		this.currentPlayerId = null;
		this.players.set([]);
		this.gameState.set(null);
	}

	// Host actions
	public kickPlayer(playerId: string): void {
		if (!this.socket || !this.currentSessionId || !this.currentPlayerId) return;
		
		this.socket.emit('kick-player', {
			sessionId: this.currentSessionId,
			playerId,
			hostId: this.currentPlayerId
		});
	}

	public startGame(gameType: string, settings: any = {}): void {
		if (!this.socket || !this.currentSessionId) return;
		
		this.socket.emit('start-game', {
			sessionId: this.currentSessionId,
			gameType,
			settings
		});
	}

	public endGame(results: Array<{ playerId: string; score: number; placement: number }>, roundNumber: number): void {
		if (!this.socket || !this.currentSessionId) return;
		
		this.socket.emit('game-end', {
			sessionId: this.currentSessionId,
			results,
			roundNumber
		});
	}

	// Game actions
	public sendPlayerMove(input: Omit<AgarioPlayerInput, 'playerId' | 'timestamp'>): void {
		if (!this.socket || !this.currentPlayerId) return;
		
		this.socket.emit('player-move', {
			playerId: this.currentPlayerId,
			...input,
			timestamp: Date.now()
		});
	}

	public broadcastGameState(gameState: AgarioGameState): void {
		if (!this.socket || !this.currentSessionId) return;
		
		this.socket.emit('game-state', {
			sessionId: this.currentSessionId,
			gameState
		});
	}

	// Connection management
	public disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.connectionStatus.set('disconnected');
		this.currentSessionId = null;
		this.currentPlayerId = null;
		this.players.set([]);
		this.gameState.set(null);
		this.gameEvents.set([]);
	}

	// Getters
	public get isConnected(): boolean {
		return this.socket?.connected || false;
	}

	public get sessionId(): string | null {
		return this.currentSessionId;
	}

	public get playerId(): string | null {
		return this.currentPlayerId;
	}

	// Store getters
	public getConnectionStatus() {
		return this.connectionStatus;
	}

	public getPlayers() {
		return this.players;
	}

	public getGameState() {
		return this.gameState;
	}

	public getGameEvents() {
		return this.gameEvents;
	}

	public getError() {
		return this.error;
	}
}

// Global client instance
export const gameClient = new GameWebSocketClient();

// Export for direct instantiation if needed
export { GameWebSocketClient };
