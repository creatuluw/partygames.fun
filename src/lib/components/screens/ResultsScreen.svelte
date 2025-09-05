<script lang="ts">
	import { sessionService, clientState } from '$lib/services/sessionService';
	
	let players = [];
	let isHost = false;
	
	// Subscribe to client state
	const unsubscribe = clientState.subscribe((state) => {
		players = state.players;
		isHost = state.isHost;
	});
	
	// Mock results data
	const mockResults = [
		{ playerId: '1', playerName: 'Player 1', score: 1250, placement: 1 },
		{ playerId: '2', playerName: 'Player 2', score: 980, placement: 2 },
		{ playerId: '3', playerName: 'Player 3', score: 750, placement: 3 }
	];
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4">
	<div class="card w-full max-w-2xl">
		<h1 class="text-3xl font-bold text-center mb-8">🏆 Game Results</h1>
		
		<div class="space-y-6">
			<!-- Winner -->
			<div class="text-center">
				<div class="text-6xl mb-4">👑</div>
				<h2 class="text-2xl font-bold text-yellow-600">Winner: Player 1</h2>
				<p class="text-lg text-gray-600">Score: 1,250 points</p>
			</div>
			
			<!-- Leaderboard -->
			<div>
				<h3 class="text-xl font-semibold mb-4 text-center">Final Leaderboard</h3>
				<div class="space-y-2">
					{#each mockResults as result, index (result.playerId)}
						<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div class="flex items-center">
								<span class="text-2xl mr-3">
									{#if index === 0}🥇
									{:else if index === 1}🥈
									{:else if index === 2}🥉
									{:else}#{index + 1}
									{/if}
								</span>
								<div>
									<p class="font-semibold">{result.playerName}</p>
									<p class="text-sm text-gray-600">{result.score.toLocaleString()} points</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Host Controls -->
			{#if isHost}
				<div class="flex space-x-4">
					<button class="btn btn-primary flex-1" on:click={() => sessionService.startGame()}>
						Play Again
					</button>
					<button class="btn btn-secondary flex-1" on:click={() => sessionService.goToLobby()}>
						Back to Lobby
					</button>
				</div>
			{:else}
				<div class="text-center text-gray-600">
					<p>Waiting for host to start next game...</p>
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
