<script lang="ts">
	import { sessionService, clientState } from '$lib/services/sessionService';
	import { AVAILABLE_GAMES } from '$lib/config/games';
	import GameCard from '$lib/components/ui/GameCard.svelte';
	import type { GameConfig } from '$lib/api/types';
	
	let players = [];
	let isHost = false;
	let selectedGames: GameConfig[] = [];
	let showGameSelection = false;
	
	// Subscribe to client state
	const unsubscribe = clientState.subscribe((state) => {
		players = state.players;
		isHost = state.isHost;
	});

	function toggleGameSelection(game: GameConfig) {
		if (selectedGames.find(g => g.name === game.name)) {
			// Remove game from selection
			selectedGames = selectedGames.filter(g => g.name !== game.name);
		} else {
			// Add game to selection
			selectedGames = [...selectedGames, game];
		}
	}

	function startGameSession() {
		if (selectedGames.length === 0) {
			alert('Please select at least one game to play!');
			return;
		}
		// Start the first selected game
		sessionService.startGame(selectedGames[0].name, selectedGames[0].defaultSettings);
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4">
	<div class="card w-full max-w-2xl">
		<h1 class="text-3xl font-bold text-center mb-8">Game Lobby</h1>
		
		<div class="space-y-6">
			<!-- Room Info -->
			<div class="text-center">
				<h2 class="text-xl font-semibold mb-2">Room Code: <span class="font-mono text-2xl text-blue-600">123456</span></h2>
				<p class="text-gray-600">Share this code with your friends</p>
			</div>
			
			<!-- Players List -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Players ({players.length})</h3>
				<div class="space-y-2">
					{#each players as player (player.id)}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<span class="font-medium">{player.display_name}</span>
							{#if player.is_host}
								<span class="text-sm text-blue-600 font-medium">Host</span>
							{/if}
						</div>
					{:else}
						<p class="text-gray-500 text-center py-8">Waiting for players...</p>
					{/each}
				</div>
			</div>
			
			<!-- Game Selection (Host Only) -->
			{#if isHost}
				<div class="game-selection-section">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold">Select Games</h3>
						<button 
							class="btn-sm {showGameSelection ? 'btn-secondary' : 'btn-primary'}"
							on:click={() => showGameSelection = !showGameSelection}
						>
							{showGameSelection ? 'Hide Games' : 'Choose Games'}
						</button>
					</div>

					<!-- Selected Games Display -->
					{#if selectedGames.length > 0}
						<div class="selected-games mb-4">
							<h4 class="text-sm font-medium text-gray-700 mb-2">Selected Games ({selectedGames.length}):</h4>
							<div class="flex flex-wrap gap-2">
								{#each selectedGames as game}
									<div class="selected-game-chip">
										<span class="game-emoji">{game.icon}</span>
										<span class="game-name">{game.displayName}</span>
										<button 
											class="remove-game"
											on:click={() => toggleGameSelection(game)}
											aria-label="Remove {game.displayName}"
										>
											×
										</button>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="no-games-selected mb-4">
							<p class="text-gray-500 text-center py-4">No games selected yet</p>
						</div>
					{/if}

					<!-- Game Cards Grid -->
					{#if showGameSelection}
						<div class="game-cards-grid">
							{#each AVAILABLE_GAMES as game}
								<GameCard 
									{game}
									isSelected={selectedGames.some(g => g.name === game.name)}
									playerCount={players.length}
									onSelect={toggleGameSelection}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Host Controls -->
				<div class="host-controls">
					<button 
						class="btn btn-primary w-full text-lg py-4"
						on:click={startGameSession}
						disabled={selectedGames.length === 0}
					>
						{#if selectedGames.length === 0}
							Select Games to Start
						{:else if selectedGames.length === 1}
							Start {selectedGames[0].displayName}
						{:else}
							Start Game Session ({selectedGames.length} games)
						{/if}
					</button>
				</div>
			{:else}
				<div class="text-center text-gray-600 py-8">
					<p class="text-lg">🎮 Waiting for host to start the game...</p>
					<p class="text-sm mt-2">The host is selecting games for this session</p>
				</div>
			{/if}
			
			<!-- Leave Button -->
			<div class="pt-4 border-t">
				<button class="btn btn-secondary w-full" on:click={() => sessionService.leaveSession()}>
					Leave Session
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.game-selection-section {
		@apply border-t pt-6;
	}

	.btn-sm {
		@apply px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200;
	}

	.btn-sm.btn-primary {
		@apply bg-blue-600 text-white hover:bg-blue-700;
	}

	.btn-sm.btn-secondary {
		@apply bg-gray-600 text-white hover:bg-gray-700;
	}

	.selected-game-chip {
		@apply flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium;
	}

	.game-emoji {
		@apply text-lg;
	}

	.game-name {
		@apply font-medium;
	}

	.remove-game {
		@apply w-5 h-5 flex items-center justify-center bg-blue-200 hover:bg-red-200 text-blue-600 hover:text-red-600 rounded-full text-xs font-bold transition-colors duration-200;
	}

	.game-cards-grid {
		@apply grid grid-cols-1 md:grid-cols-2 gap-4 mt-4;
	}

	.host-controls {
		@apply pt-6 border-t mt-6;
	}

	@media (max-width: 640px) {
		.selected-game-chip {
			@apply text-xs px-2 py-1;
		}
		
		.game-cards-grid {
			@apply grid-cols-1;
		}
	}
</style>
