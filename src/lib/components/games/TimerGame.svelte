<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { sessionService } from '$lib/services/sessionService';
	
	const dispatch = createEventDispatcher();
	
	// Game state
	let gameStarted = false;
	let gameEnded = false;
	let startTime = 0;
	let playerTapTime: number | null = null;
	let showResults = false;
	let countdown = 3;
	
	// Results
	let accuracy = 0;
	let difference = 0;
	let placement = 0;
	
	let countdownInterval: NodeJS.Timeout;
	let gameTimer: NodeJS.Timeout;
	
	onMount(() => {
		startCountdown();
	});
	
	onDestroy(() => {
		if (countdownInterval) clearInterval(countdownInterval);
		if (gameTimer) clearTimeout(gameTimer);
	});
	
	function startCountdown() {
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown === 0) {
				clearInterval(countdownInterval);
				startGame();
			}
		}, 1000);
	}
	
	function startGame() {
		gameStarted = true;
		startTime = Date.now();
		console.log('🎮 Timer game started at:', startTime);
		
		// Auto-end game after 30 seconds (safety measure)
		gameTimer = setTimeout(() => {
			if (!gameEnded) {
				endGame();
			}
		}, 30000);
	}
	
	function handleTap() {
		if (!gameStarted || gameEnded) return;
		
		const tapTime = Date.now();
		playerTapTime = tapTime;
		const elapsedTime = tapTime - startTime;
		const targetTime = 15000; // 15 seconds in milliseconds
		
		difference = elapsedTime - targetTime;
		accuracy = Math.max(0, 100 - Math.abs(difference) / 100); // Accuracy percentage
		
		console.log('🎯 Player tapped after:', elapsedTime, 'ms, difference:', difference, 'ms');
		
		endGame();
	}
	
	function endGame() {
		if (gameEnded) return;
		
		gameEnded = true;
		showResults = true;
		
		// If player never tapped, set a very bad score
		if (playerTapTime === null) {
			difference = 30000; // 30 seconds off
			accuracy = 0;
		}
		
		// Calculate placement (for now, random between 1-4 for demo)
		placement = Math.floor(Math.random() * 4) + 1;
		
		console.log('🏁 Game ended. Final stats:', { 
			accuracy: accuracy.toFixed(1), 
			difference, 
			placement 
		});
		
		// Send results after a short delay
		setTimeout(() => {
			const results = {
				playerId: 'current-player', // This should come from session state
				score: Math.round(accuracy),
				placement: placement,
				gameData: {
					targetTime: 15000,
					actualTime: playerTapTime ? playerTapTime - startTime : 30000,
					difference: difference,
					accuracy: accuracy
				}
			};
			
			dispatch('gameComplete', results);
		}, 3000);
	}
	
	function formatTime(ms: number): string {
		const seconds = Math.abs(ms) / 1000;
		const sign = ms >= 0 ? '+' : '-';
		return `${sign}${seconds.toFixed(2)}s`;
	}
	
	function getAccuracyColor(acc: number): string {
		if (acc >= 80) return 'text-green-600';
		if (acc >= 60) return 'text-yellow-600';
		if (acc >= 40) return 'text-orange-600';
		return 'text-red-600';
	}
	
	function getPlacementEmoji(place: number): string {
		switch(place) {
			case 1: return '🥇';
			case 2: return '🥈';  
			case 3: return '🥉';
			default: return '🏅';
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col items-center justify-center p-4 text-white no-select">
	
	{#if countdown > 0}
		<!-- Countdown -->
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-8">⏰ 15-Second Challenge</h1>
			<div class="text-8xl font-bold mb-4 animate-pulse">{countdown}</div>
			<p class="text-xl">Get ready to tap when you think 15 seconds have passed!</p>
		</div>
		
	{:else if gameStarted && !gameEnded}
		<!-- Game Active -->
		<div class="text-center">
			<h1 class="text-3xl font-bold mb-8">🎯 Timer Running...</h1>
			<p class="text-lg mb-12">Tap when you think 15 seconds have passed!</p>
			
			<!-- Tap Area -->
			<button 
				class="w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center text-6xl font-bold text-white border-8 border-yellow-300 hover:scale-105 active:scale-95 transition-transform duration-150"
				on:click={handleTap}
				style="touch-action: manipulation;"
			>
				TAP!
			</button>
			
			<p class="text-sm mt-8 opacity-75">Trust your instincts!</p>
		</div>
		
	{:else if showResults}
		<!-- Results -->
		<div class="text-center max-w-md">
			<h1 class="text-4xl font-bold mb-4">📊 Results</h1>
			
			<div class="bg-white/10 rounded-xl p-6 mb-6">
				<div class="text-6xl mb-4">{getPlacementEmoji(placement)}</div>
				<div class="text-2xl font-bold mb-2">#{placement} Place</div>
				
				<div class="space-y-4">
					<div>
						<div class="text-sm opacity-75">Target Time</div>
						<div class="text-xl font-mono">15.00s</div>
					</div>
					
					<div>
						<div class="text-sm opacity-75">Your Time</div>
						<div class="text-xl font-mono">
							{playerTapTime ? ((playerTapTime - startTime) / 1000).toFixed(2) : '30.00'}s
						</div>
					</div>
					
					<div>
						<div class="text-sm opacity-75">Difference</div>
						<div class="text-xl font-mono font-bold">
							{formatTime(difference)}
						</div>
					</div>
					
					<div>
						<div class="text-sm opacity-75">Accuracy</div>
						<div class="text-2xl font-bold {getAccuracyColor(accuracy)}">
							{accuracy.toFixed(1)}%
						</div>
					</div>
				</div>
			</div>
			
			<div class="text-sm opacity-75">
				{#if accuracy >= 90}
					🎯 Perfect timing! You have incredible instincts!
				{:else if accuracy >= 80}
					🎉 Excellent! You're really good at this!
				{:else if accuracy >= 60}
					👍 Good job! Not bad at all!
				{:else if accuracy >= 40}
					🤔 Getting there! Practice makes perfect!
				{:else}
					😅 Keep trying! Timing is tricky!
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.no-select {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
</style>
