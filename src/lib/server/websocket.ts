import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';
import type { 
	WebSocketEvent, 
	PlayerJoinEvent, 
	PlayerLeaveEvent,
	PlayerKickEvent,
	GameStartEvent,
	GameMoveEvent,
	GameStateEvent,
	GameEndEvent,
	AgarioGameState,
	AgarioPlayerInput
} from '../api/types';
import { apiClient } from '../api/postgrest';

export class GameWebSocketServer {
	private io: SocketIOServer;
	private activeSessions = new Map<string, Set<string>>(); // sessionId -> Set of socketIds
	private playerSockets = new Map<string, string>(); // playerId -> socketId
	private socketPlayers = new Map<string, { playerId: string; sessionId: string }>(); // socketId -> player info

	constructor(server: Server) {
		this.io = new SocketIOServer(server, {
			cors: {
				origin: "*", // Configure this properly in production
				methods: ["GET", "POST"]
			}
		});

		this.setupEventHandlers();
	}

	private setupEventHandlers() {
		this.io.on('connection', (socket) => {
			console.log(`Client connected: ${socket.id}`);

			// Handle player joining a session
			socket.on('join-session', async (data: { sessionId: string; playerId: string }) => {
				try {
					const { sessionId, playerId } = data;
					
					// Join the socket to the session room
					socket.join(sessionId);
					
					// Track the connection
					this.addPlayerToSession(sessionId, playerId, socket.id);
					
					// Update player connection status in database
					await apiClient.updatePlayerConnection(playerId, 'connected');
					
					// Get current session players
					const players = await apiClient.getSessionPlayers(sessionId);
					
					// Notify all clients in the session about the player joining
					const joinEvent: PlayerJoinEvent = {
						type: 'player:join',
						data: {
							sessionId,
							player: players.find(p => p.id === playerId)!
						},
						timestamp: Date.now()
					};
					
					this.io.to(sessionId).emit('game-event', joinEvent);
					
					// Send current players list to the new player
					socket.emit('players-update', players);
					
				} catch (error) {
					console.error('Error joining session:', error);
					socket.emit('error', { message: 'Failed to join session' });
				}
			});

			// Handle player leaving
			socket.on('disconnect', async () => {
				await this.handlePlayerDisconnect(socket.id);
			});

			// Handle explicit leave
			socket.on('leave-session', async () => {
				await this.handlePlayerDisconnect(socket.id);
			});

			// Handle host kicking a player
			socket.on('kick-player', async (data: { sessionId: string; playerId: string; hostId: string }) => {
				try {
					const { sessionId, playerId, hostId } = data;
					
					// Verify the requester is the host
					const session = await apiClient.getSessionDetails(sessionId);
					if (session.session_id !== hostId) {
						socket.emit('error', { message: 'Only the host can kick players' });
						return;
					}
					
					// Remove player from database
					await apiClient.kickPlayer(playerId);
					
					// Disconnect the player's socket
					const socketId = this.playerSockets.get(playerId);
					if (socketId) {
						const playerSocket = this.io.sockets.sockets.get(socketId);
						if (playerSocket) {
							playerSocket.emit('kicked', { reason: 'Kicked by host' });
							playerSocket.disconnect();
						}
					}
					
					// Remove from tracking
					this.removePlayerFromSession(sessionId, playerId);
					
					// Notify other players
					const kickEvent: PlayerKickEvent = {
						type: 'player:kick',
						data: { sessionId, playerId, hostId },
						timestamp: Date.now()
					};
					
					this.io.to(sessionId).emit('game-event', kickEvent);
					
				} catch (error) {
					console.error('Error kicking player:', error);
					socket.emit('error', { message: 'Failed to kick player' });
				}
			});

			// Handle game start
			socket.on('start-game', async (data: { sessionId: string; gameType: string; settings: any }) => {
				try {
					const { sessionId, gameType, settings } = data;
					
					// Update session status
					await apiClient.updateSessionStatus(sessionId, 'playing');
					
					// Notify all players that the game is starting
					const startEvent: GameStartEvent = {
						type: 'game:start',
						data: { sessionId, gameType, settings },
						timestamp: Date.now()
					};
					
					this.io.to(sessionId).emit('game-event', startEvent);
					
				} catch (error) {
					console.error('Error starting game:', error);
					socket.emit('error', { message: 'Failed to start game' });
				}
			});

			// Handle player movement (for Agario)
			socket.on('player-move', (data: AgarioPlayerInput) => {
				const playerInfo = this.socketPlayers.get(socket.id);
				if (!playerInfo) return;
				
				// Add timestamp and broadcast to session
				const moveEvent: GameMoveEvent = {
					type: 'game:move',
					data: { ...data, timestamp: Date.now() },
					timestamp: Date.now()
				};
				
				// Broadcast to all players in the session except sender
				socket.to(playerInfo.sessionId).emit('game-event', moveEvent);
			});

			// Handle game state updates (sent by game server/host)
			socket.on('game-state', (data: { sessionId: string; gameState: AgarioGameState }) => {
				const stateEvent: GameStateEvent = {
					type: 'game:state',
					data,
					timestamp: Date.now()
				};
				
				this.io.to(data.sessionId).emit('game-event', stateEvent);
			});

			// Handle game end
			socket.on('game-end', async (data: { 
				sessionId: string; 
				results: Array<{ playerId: string; score: number; placement: number }>; 
				roundNumber: number 
			}) => {
				try {
					const { sessionId, results, roundNumber } = data;
					
					// Save results to database
					for (const result of results) {
						await apiClient.saveGameResult({
							session_id: sessionId,
							player_id: result.playerId,
							round_number: roundNumber,
							score: result.score,
							placement: result.placement,
							game_data: {}
						});
					}
					
					// Update session status back to waiting for next round
					await apiClient.updateSessionStatus(sessionId, 'waiting');
					
					// Notify all players of game end
					const endEvent: GameEndEvent = {
						type: 'game:end',
						data: { sessionId, results, roundNumber },
						timestamp: Date.now()
					};
					
					this.io.to(sessionId).emit('game-event', endEvent);
					
				} catch (error) {
					console.error('Error ending game:', error);
				}
			});
		});
	}

	private async handlePlayerDisconnect(socketId: string) {
		const playerInfo = this.socketPlayers.get(socketId);
		if (!playerInfo) return;

		const { playerId, sessionId } = playerInfo;

		try {
			// Update player connection status
			await apiClient.updatePlayerConnection(playerId, 'disconnected');
			
			// Remove from tracking
			this.removePlayerFromSession(sessionId, playerId);
			
			// Notify other players
			const leaveEvent: PlayerLeaveEvent = {
				type: 'player:leave',
				data: { sessionId, playerId },
				timestamp: Date.now()
			};
			
			this.io.to(sessionId).emit('game-event', leaveEvent);
			
		} catch (error) {
			console.error('Error handling player disconnect:', error);
		}
	}

	private addPlayerToSession(sessionId: string, playerId: string, socketId: string) {
		// Add to session tracking
		if (!this.activeSessions.has(sessionId)) {
			this.activeSessions.set(sessionId, new Set());
		}
		this.activeSessions.get(sessionId)!.add(socketId);
		
		// Add player/socket mapping
		this.playerSockets.set(playerId, socketId);
		this.socketPlayers.set(socketId, { playerId, sessionId });
	}

	private removePlayerFromSession(sessionId: string, playerId: string) {
		const socketId = this.playerSockets.get(playerId);
		
		if (socketId) {
			// Remove from session tracking
			const sessionSockets = this.activeSessions.get(sessionId);
			if (sessionSockets) {
				sessionSockets.delete(socketId);
				if (sessionSockets.size === 0) {
					this.activeSessions.delete(sessionId);
				}
			}
			
			// Remove player/socket mappings
			this.playerSockets.delete(playerId);
			this.socketPlayers.delete(socketId);
		}
	}

	// Public methods for external use
	public getSessionPlayerCount(sessionId: string): number {
		const sessionSockets = this.activeSessions.get(sessionId);
		return sessionSockets ? sessionSockets.size : 0;
	}

	public isSessionActive(sessionId: string): boolean {
		return this.activeSessions.has(sessionId);
	}

	public broadcastToSession(sessionId: string, event: WebSocketEvent) {
		this.io.to(sessionId).emit('game-event', event);
	}
}

// Global instance (will be initialized in the server)
export let gameWebSocketServer: GameWebSocketServer;

export function initializeWebSocketServer(server: Server) {
	gameWebSocketServer = new GameWebSocketServer(server);
	return gameWebSocketServer;
}
