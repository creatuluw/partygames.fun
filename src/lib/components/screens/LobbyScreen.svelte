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

	function quickTestGame(game: GameConfig) {
		// Immediately start the game for solo testing
		console.log('🧪 Quick testing game:', game.displayName);
		sessionService.startGame(game.name, game.defaultSettings);
	}
</script>

<!-- Lobby Screen following design system -->
<section class="container-standard">
	<div class="section-standard">
		<div class="card-basic p-6 w-full max-w-2xl mx-auto">
			<h1 class="h2 text-center mb-8">Game Lobby</h1>
		
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
							type="button"
							class="{showGameSelection ? 'btn-secondary' : 'btn-primary'} btn-small"
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
									onQuickTest={quickTestGame}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Host Controls -->
				<div class="host-controls">
					{#if players.length === 1 && selectedGames.length > 0}
						<!-- Solo Testing Mode -->
						<div class="solo-test-info">
							<div class="text-center mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
								<span class="text-purple-600 font-medium">
									🧪 Solo Test Mode
								</span>
								<p class="text-sm text-purple-500 mt-1">Test the game by yourself</p>
							</div>
						</div>
						<button 
							type="button"
							class="btn-primary w-full text-lg py-4 bg-purple-600 hover:bg-purple-700"
							on:click={startGameSession}
						>
							{#if selectedGames.length === 1}
								🧪 Test {selectedGames[0].displayName}
							{:else}
								🧪 Test Games ({selectedGames.length})
							{/if}
						</button>
					{:else}
						<!-- Regular Multiplayer Mode -->
						<button 
							type="button"
							class="btn-primary w-full text-lg py-4"
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
					{/if}
				</div>
			{:else}
				<div class="text-center text-gray-600 py-8">
					<p class="text-lg">🎮 Waiting for host to start the game...</p>
					<p class="text-sm mt-2">The host is selecting games for this session</p>
				</div>
			{/if}
			
			<!-- Leave Button -->
			<div class="pt-4 border-t border-gray-200">
				<button type="button" class="btn-secondary w-full" on:click={() => sessionService.leaveSession()}>
					Leave Session
				</button>
			</div>
		</div>
		</div>
	</div>
</section>

