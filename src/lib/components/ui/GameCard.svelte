<script lang="ts">
	import type { GameConfig } from '$lib/api/types';
	import { GAME_CATEGORIES } from '$lib/config/games';

	export let game: GameConfig;
	export let isSelected: boolean = false;
	export let playerCount: number = 0;
	export let onSelect: (game: GameConfig) => void = () => {};
	export let onQuickTest: (game: GameConfig) => void = () => {};

	$: canPlay = playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
	$: categoryInfo = GAME_CATEGORIES[game.category as keyof typeof GAME_CATEGORIES];
	
	// Design system classes based on state
	$: cardClasses = `
		card-hoverable
		${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
		${canPlay ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}
		transition-all duration-150 ease-in-out
		${canPlay ? 'hover:shadow-xl' : ''}
	`;

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

<!-- Game Card following design system -->
<div 
	class="{cardClasses} p-6 relative min-h-48"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
	aria-label="Select {game.displayName} game"
>
	<!-- Game Icon and Category -->
	<div class="flex items-start justify-between mb-4">
		<div class="text-3xl w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full">
			{game.icon}
		</div>
		<div class="px-2 py-1 text-xs text-white rounded-full font-medium {categoryInfo?.color || 'bg-gray-500'}">
			{categoryInfo?.name || game.category}
		</div>
	</div>

	<!-- Game Info -->
	<div class="flex-1">
		<h3 class="text-lg font-bold text-gray-800 mb-2 font-cabinet-grotesk">
			{game.displayName}
		</h3>
		
		<p class="text-gray-600 text-sm mb-4 line-clamp-2">
			{game.description}
		</p>

		<!-- Game Details -->
		<div class="space-y-2 mb-4">
			<div class="flex items-center space-x-2">
				<span class="text-sm">👥</span>
				<span class="text-sm text-gray-700">
					{game.minPlayers}-{game.maxPlayers} players
				</span>
			</div>
			
			<div class="flex items-center space-x-2">
				<span class="text-sm">⏱️</span>
				<span class="text-sm text-gray-700">
					{formatDuration(game.duration)}
				</span>
			</div>
		</div>

		<!-- Player Count Status -->
		<div class="text-sm font-medium">
			{#if playerCount < game.minPlayers && game.minPlayers > 1}
				<span class="text-orange-600">
					Need {game.minPlayers - playerCount} more player{game.minPlayers - playerCount !== 1 ? 's' : ''}
				</span>
			{:else if playerCount > game.maxPlayers}
				<span class="text-red-600">
					Too many players (max {game.maxPlayers})
				</span>
			{:else if playerCount === 1 && game.minPlayers === 1}
				<div class="space-y-2">
					<span class="text-purple-600 font-semibold">
						🧪 Test Mode Available
					</span>
					<button 
						type="button"
						class="btn-small w-full bg-purple-600 hover:bg-purple-700 text-white"
						on:click|stopPropagation={() => onQuickTest(game)}
						aria-label="Quick test {game.displayName}"
					>
						🚀 Quick Test
					</button>
				</div>
			{:else}
				<span class="text-green-600">
					Ready to play!
				</span>
			{/if}
		</div>
	</div>

	<!-- Selection Indicator -->
	{#if isSelected}
		<div class="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
			✓ Selected
		</div>
	{/if}
</div>
