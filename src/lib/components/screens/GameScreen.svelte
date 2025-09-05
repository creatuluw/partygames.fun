<script lang="ts">
	import { sessionService, clientState } from '$lib/services/sessionService';
	
	let gameState = null;
	
	// Subscribe to client state
	const unsubscribe = clientState.subscribe((state) => {
		gameState = state.gameState;
	});
</script>

<div class="min-h-screen bg-black flex flex-col items-center justify-center p-4 no-select">
	<div class="text-white text-center">
		<h1 class="text-4xl font-bold mb-4">🎮 Agario Game</h1>
		<p class="text-xl mb-8">Touch and drag to move your circle</p>
		
		<!-- Game Canvas Area -->
		<div class="w-full max-w-md h-96 bg-gray-800 rounded-lg mb-8 flex items-center justify-center">
			<div class="text-gray-400">
				<p>Game canvas will be here</p>
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
