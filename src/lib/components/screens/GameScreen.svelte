<script lang="ts">
	import { sessionService, clientState } from '$lib/services/sessionService';
	import TapGame from '$lib/components/games/TapGame.svelte';
	import TimerGame from '$lib/components/games/TimerGame.svelte';
	
	let gameState = null;
	let currentGame = null;
	let gameSettings = {};
	
	// Subscribe to client state and game events
	const unsubscribe = clientState.subscribe((state) => {
		gameState = state.gameState;
	});

	// Listen for game start events
	import { gameClient } from '$lib/client/websocket';
	gameClient.getGameEvents().subscribe(events => {
		const latestEvent = events[events.length - 1];
		if (latestEvent && latestEvent.type === 'game:start') {
			currentGame = latestEvent.data.gameType;
			gameSettings = latestEvent.data.settings;
			console.log('Starting game:', currentGame, gameSettings);
		}
	});
</script>

{#if currentGame === 'tap-15'}
	<TapGame {gameSettings} />
{:else if currentGame === 'agario'}
	<div class="min-h-screen bg-black flex flex-col items-center justify-center p-4 no-select">
		<div class="text-white text-center">
			<h1 class="text-4xl font-bold mb-4">🎮 Grow & Survive</h1>
			<p class="text-xl mb-8">Touch and drag to move your circle</p>
			
			<!-- Game Canvas Area -->
			<div class="w-full max-w-md h-96 bg-gray-800 rounded-lg mb-8 flex items-center justify-center">
				<div class="text-gray-400">
					<p>Agario game canvas will be here</p>
					<p class="text-sm mt-2">Coming soon...</p>
				</div>
			</div>
			
			<!-- Game Controls -->
			<div class="space-y-4">
				<p class="text-sm text-gray-300">Use your finger to control your player</p>
				
				<button 
					class="btn btn-secondary"
					on:click={() => sessionService.goToLobby()}
				>
					Back to Lobby
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">🎮 Game Starting...</h1>
			<p class="text-xl mb-8 text-gray-600">Get ready to play!</p>
			
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-8"></div>
			
			<button 
				class="btn btn-secondary"
				on:click={() => sessionService.goToLobby()}
			>
				Back to Lobby
			</button>
		</div>
	</div>
{/if}
