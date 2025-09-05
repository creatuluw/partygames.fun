<script lang="ts">
	import { sessionService, clientState } from '$lib/services/sessionService';
	
	let players = [];
	let isHost = false;
	
	// Subscribe to client state
	const unsubscribe = clientState.subscribe((state) => {
		players = state.players;
		isHost = state.isHost;
	});
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
			
			<!-- Host Controls -->
			{#if isHost}
				<div class="flex space-x-4">
					<button class="btn btn-primary flex-1" on:click={() => sessionService.startGame()}>
						Start Game
					</button>
				</div>
			{:else}
				<div class="text-center text-gray-600">
					<p>Waiting for host to start the game...</p>
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
