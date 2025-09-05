import type { 
	Session, 
	Player, 
	GameResult, 
	CreateSessionParams, 
	JoinSessionParams,
	SessionDetails 
} from './types';

const POSTGREST_URL = 'https://postgrestpostgrest-production-dd5b.up.railway.app';

class PostgRESTClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	public async request<T>(
		path: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		
		console.log('🔗 API Request:', {
			url,
			method: options.method || 'GET',
			body: options.body,
			headers: options.headers
		});
		
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				'Prefer': 'return=representation',
				...options.headers,
			},
		});

		console.log('📡 API Response:', {
			status: response.status,
			statusText: response.statusText,
			url: response.url
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ API Error Response:', errorText);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log('✅ API Success Data:', data);
		return data;
	}

	// Session Management
	async createSession(params: CreateSessionParams): Promise<{ session_id: string; room_code: string }> {
		return this.request('/rpc/create_session', {
			method: 'POST',
			body: JSON.stringify({
				p_host_id: params.hostId,
				p_game_type: params.gameType,
				p_max_players: params.maxPlayers || 20
			})
		});
	}

	async joinSession(params: JoinSessionParams): Promise<{ session_id: string; player_id: string; is_host: boolean }> {
		return this.request('/rpc/join_session', {
			method: 'POST',
			body: JSON.stringify({
				p_room_code: params.roomCode,
				p_display_name: params.displayName
			})
		});
	}

	async getSessionDetails(sessionId: string): Promise<SessionDetails> {
		return this.request(`/rpc/get_session_details?p_session_id=${sessionId}`, {
			method: 'GET'
		});
	}

	// Direct table operations
	async getSessions(): Promise<Session[]> {
		return this.request('/sessions');
	}

	async getSessionPlayers(sessionId: string): Promise<Player[]> {
		return this.request(`/players?session_id=eq.${sessionId}&connection_status=eq.connected`);
	}

	async updatePlayerConnection(playerId: string, status: 'connected' | 'disconnected'): Promise<void> {
		await this.request(`/players?id=eq.${playerId}`, {
			method: 'PATCH',
			body: JSON.stringify({ connection_status: status })
		});
	}

	async updateSessionStatus(sessionId: string, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
		await this.request(`/sessions?id=eq.${sessionId}`, {
			method: 'PATCH',
			body: JSON.stringify({ status })
		});
	}

	async kickPlayer(playerId: string): Promise<void> {
		await this.request(`/players?id=eq.${playerId}`, {
			method: 'DELETE'
		});
	}

	async saveGameResult(result: Omit<GameResult, 'id' | 'created_at'>): Promise<void> {
		await this.request('/game_results', {
			method: 'POST',
			body: JSON.stringify(result)
		});
	}

	async getGameResults(sessionId: string): Promise<GameResult[]> {
		return this.request(`/game_results?session_id=eq.${sessionId}&order=round_number.asc,placement.asc`);
	}

	async getLeaderboard(sessionId: string): Promise<Array<{
		player_id: string;
		display_name: string;
		total_score: number;
		rounds_played: number;
		average_placement: number;
	}>> {
		// This would be implemented as a PostgreSQL view or stored procedure
		return this.request(`/rpc/get_leaderboard?p_session_id=${sessionId}`);
	}
}

export const apiClient = new PostgRESTClient(POSTGREST_URL);
export { PostgRESTClient };
