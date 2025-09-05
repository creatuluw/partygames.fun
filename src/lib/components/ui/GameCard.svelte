<script lang="ts">
	import type { GameConfig } from '$lib/api/types';
	import { GAME_CATEGORIES } from '$lib/config/games';

	export let game: GameConfig;
	export let isSelected: boolean = false;
	export let playerCount: number = 0;
	export let onSelect: (game: GameConfig) => void = () => {};

	$: canPlay = playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
	$: categoryInfo = GAME_CATEGORIES[game.category as keyof typeof GAME_CATEGORIES];

	function handleClick() {
		if (canPlay) {
			onSelect(game);
		}
	}

	function formatDuration(seconds: number): string {
		if (seconds < 60) {
			return `${seconds}s`;
		}
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
	}
</script>

<div 
	class="card game-card {isSelected ? 'selected' : ''} {canPlay ? 'playable' : 'disabled'}"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
	aria-label="Select {game.displayName} game"
>
	<!-- Game Icon and Category -->
	<div class="flex items-start justify-between mb-3">
		<div class="game-icon">
			{game.icon}
		</div>
		<div class="category-badge {categoryInfo?.color || 'bg-gray-500'}">
			{categoryInfo?.name || game.category}
		</div>
	</div>

	<!-- Game Info -->
	<div class="game-info">
		<h3 class="game-title">
			{game.displayName}
		</h3>
		
		<p class="game-description">
			{game.description}
		</p>

		<!-- Game Details -->
		<div class="game-details">
			<div class="detail-item">
				<span class="detail-icon">👥</span>
				<span class="detail-text">
					{game.minPlayers}-{game.maxPlayers} players
				</span>
			</div>
			
			<div class="detail-item">
				<span class="detail-icon">⏱️</span>
				<span class="detail-text">
					{formatDuration(game.duration)}
				</span>
			</div>
		</div>

		<!-- Player Count Status -->
		<div class="player-status">
			{#if playerCount < game.minPlayers}
				<span class="status-warning">
					Need {game.minPlayers - playerCount} more player{game.minPlayers - playerCount !== 1 ? 's' : ''}
				</span>
			{:else if playerCount > game.maxPlayers}
				<span class="status-error">
					Too many players (max {game.maxPlayers})
				</span>
			{:else}
				<span class="status-ready">
					Ready to play!
				</span>
			{/if}
		</div>
	</div>

	<!-- Selection Indicator -->
	{#if isSelected}
		<div class="selection-indicator">
			✓ Selected
		</div>
	{/if}
</div>

<style>
	.game-card {
		@apply relative cursor-pointer transition-all duration-200 transform hover:scale-105;
		min-height: 200px;
	}

	.game-card.playable {
		@apply hover:shadow-xl border-gray-200;
	}

	.game-card.disabled {
		@apply opacity-60 cursor-not-allowed transform-none hover:scale-100;
	}

	.game-card.selected {
		@apply border-blue-500 bg-blue-50 shadow-lg;
	}

	.game-icon {
		@apply text-4xl mb-2 w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-md;
	}

	.category-badge {
		@apply px-2 py-1 text-xs text-white rounded-full font-medium;
	}

	.game-info {
		@apply flex-1;
	}

	.game-title {
		@apply text-xl font-bold text-gray-800 mb-2;
	}

	.game-description {
		@apply text-gray-600 text-sm mb-4 line-clamp-2;
	}

	.game-details {
		@apply space-y-2 mb-4;
	}

	.detail-item {
		@apply flex items-center space-x-2;
	}

	.detail-icon {
		@apply text-sm;
	}

	.detail-text {
		@apply text-sm text-gray-700;
	}

	.player-status {
		@apply text-sm font-medium;
	}

	.status-ready {
		@apply text-green-600;
	}

	.status-warning {
		@apply text-orange-600;
	}

	.status-error {
		@apply text-red-600;
	}

	.selection-indicator {
		@apply absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.game-card {
			min-height: 180px;
		}
		
		.game-icon {
			@apply text-3xl w-12 h-12;
		}
		
		.game-title {
			@apply text-lg;
		}
	}
</style>
