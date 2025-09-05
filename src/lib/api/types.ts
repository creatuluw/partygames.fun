// Database Types
export interface Session {
	id: string;
	host_id: string;
	room_code: string;
	game_type: string;
	max_players: number;
	status: 'waiting' | 'playing' | 'finished';
	settings: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface Player {
	id: string;
	session_id: string;
	display_name: string;
	is_host: boolean;
	connection_status: 'connected' | 'disconnected';
	joined_at: string;
	player_data: Record<string, any>;
}

export interface GameResult {
	id: string;
	session_id: string;
	player_id: string;
	round_number: number;
	score: number;
	placement: number | null;
	game_data: Record<string, any>;
	created_at: string;
}

// API Request/Response Types
export interface CreateSessionParams {
	hostId: string;
	gameType: string;
	maxPlayers?: number;
}

export interface JoinSessionParams {
	roomCode: string;
	displayName: string;
}

export interface SessionDetails {
	session_id: string;
	room_code: string;
	game_type: string;
	max_players: number;
	status: 'waiting' | 'playing' | 'finished';
	settings: Record<string, any>;
	player_count: number;
}

// Game-specific Types
export interface GameConfig {
	name: string;
	displayName: string;
	description: string;
	minPlayers: number;
	maxPlayers: number;
	duration: number; // game duration in seconds
	category: string;
	icon: string;
	defaultSettings: Record<string, any>;
}

// Agario Game Types
export interface AgarioPlayer {
	id: string;
	playerId: string;
	displayName: string;
	x: number;
	y: number;
	size: number;
	color: string;
	isAlive: boolean;
	score: number;
}

export interface AgarioPellet {
	id: string;
	x: number;
	y: number;
	color: string;
	value: number;
}

export interface AgarioGameState {
	players: AgarioPlayer[];
	pellets: AgarioPellet[];
	worldSize: { width: number; height: number };
	gameTime: number;
	maxTime: number;
	isRunning: boolean;
}

export interface AgarioPlayerInput {
	playerId: string;
	targetX: number;
	targetY: number;
	timestamp: number;
}

// WebSocket Event Types
export interface WebSocketEvent {
	type: string;
	data: any;
	timestamp: number;
}

export interface PlayerJoinEvent extends WebSocketEvent {
	type: 'player:join';
	data: {
		sessionId: string;
		player: Player;
	};
}

export interface PlayerLeaveEvent extends WebSocketEvent {
	type: 'player:leave';
	data: {
		sessionId: string;
		playerId: string;
	};
}

export interface PlayerKickEvent extends WebSocketEvent {
	type: 'player:kick';
	data: {
		sessionId: string;
		playerId: string;
		hostId: string;
	};
}

export interface GameStartEvent extends WebSocketEvent {
	type: 'game:start';
	data: {
		sessionId: string;
		gameType: string;
		settings: Record<string, any>;
	};
}

export interface GameMoveEvent extends WebSocketEvent {
	type: 'game:move';
	data: AgarioPlayerInput;
}

export interface GameStateEvent extends WebSocketEvent {
	type: 'game:state';
	data: {
		sessionId: string;
		gameState: AgarioGameState;
	};
}

export interface GameEndEvent extends WebSocketEvent {
	type: 'game:end';
	data: {
		sessionId: string;
		results: {
			playerId: string;
			score: number;
			placement: number;
		}[];
		roundNumber: number;
	};
}

// Client State Types
export interface ClientState {
	isConnected: boolean;
	sessionId: string | null;
	playerId: string | null;
	isHost: boolean;
	currentScreen: 'home' | 'lobby' | 'game' | 'results';
	session: Session | null;
	players: Player[];
	gameState: AgarioGameState | null;
	error: string | null;
}

// Utility Types
export type WebSocketEventType = 
	| 'player:join'
	| 'player:leave' 
	| 'player:kick'
	| 'game:start'
	| 'game:move'
	| 'game:state'
	| 'game:end';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
