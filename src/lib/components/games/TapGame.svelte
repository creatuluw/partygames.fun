<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { sessionService } from '$lib/services/sessionService';

	export let gameSettings = {
		gameTime: 15,
		showOtherScores: false
	};

	let gameState: 'waiting' | 'countdown' | 'playing' | 'finished' = 'waiting';
	let score = 0;
	let timeLeft = gameSettings.gameTime;
	let countdownTimer = 3;
	let gameTimer: number | null = null;
	let countdownInterval: number | null = null;
	let tapButton: HTMLButtonElement;
	let gameArea: HTMLDivElement;
	let finalScore = 0;

	// Tap effects
	let tapEffects: Array<{ id: number; x: number; y: number }> = [];
	let effectId = 0;

	onMount(() => {
		startCountdown();
	});

	onDestroy(() => {
		if (gameTimer) clearInterval(gameTimer);
		if (countdownInterval) clearInterval(countdownInterval);
	});

	function startCountdown() {
		gameState = 'countdown';
		countdownTimer = 3;
		
		countdownInterval = setInterval(() => {
			countdownTimer--;
			if (countdownTimer <= 0) {
				clearInterval(countdownInterval!);
				startGame();
			}
		}, 1000);
	}

	function startGame() {
		gameState = 'playing';
		timeLeft = gameSettings.gameTime;
		score = 0;
		
		gameTimer = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				endGame();
			}
		}, 1000);
	}

	function endGame() {
		gameState = 'finished';
		finalScore = score;
		
		if (gameTimer) {
			clearInterval(gameTimer);
			gameTimer = null;
		}

		// Send score to other players via WebSocket
		// sessionService.sendGameResult(score);
		
		// Auto-return to lobby after 5 seconds
		setTimeout(() => {
			sessionService.goToLobby();
		}, 5000);
	}

	function handleTap(event: MouseEvent | TouchEvent) {
		if (gameState !== 'playing') return;
		
		event.preventDefault();
		score++;
		
		// Create tap effect
		let x, y;
		if (event instanceof TouchEvent && event.touches.length > 0) {
			const touch = event.touches[0];
			const rect = gameArea.getBoundingClientRect();
			x = touch.clientX - rect.left;
			y = touch.clientY - rect.top;
		} else if (event instanceof MouseEvent) {
			const rect = gameArea.getBoundingClientRect();
			x = event.clientX - rect.left;
			y = event.clientY - rect.top;
		} else {
			x = Math.random() * 300;
			y = Math.random() * 200;
		}
		
		addTapEffect(x, y);
		
		// Haptic feedback on mobile
		if (navigator.vibrate) {
			navigator.vibrate(10);
		}
	}

	function addTapEffect(x: number, y: number) {
		const effect = { id: effectId++, x, y };
		tapEffects = [...tapEffects, effect];
		
		// Remove effect after animation
		setTimeout(() => {
			tapEffects = tapEffects.filter(e => e.id !== effect.id);
		}, 600);
	}

	function formatTime(seconds: number): string {
		return seconds.toString().padStart(2, '0');
	}

	function getTapsPerSecond(): number {
		const elapsed = gameSettings.gameTime - timeLeft;
		return elapsed > 0 ? (score / elapsed) : 0;
	}
</script>

<div class="tap-game-container">
	{#if gameState === 'waiting'}
		<div class="game-status">
			<h2 class="game-title">👆 Tap Master</h2>
			<p class="game-description">Get ready to tap as fast as you can!</p>
			<div class="countdown-display">
				<span class="countdown-number">Ready?</span>
			</div>
		</div>
	{:else if gameState === 'countdown'}
		<div class="game-status">
			<h2 class="game-title">👆 Tap Master</h2>
			<p class="game-description">Tap the button as fast as possible!</p>
			<div class="countdown-display">
				<span class="countdown-number">{countdownTimer}</span>
			</div>
		</div>
	{:else if gameState === 'playing'}
		<div class="playing-interface">
			<!-- Game Header -->
			<div class="game-header">
				<div class="score-display">
					<span class="score-label">Taps</span>
					<span class="score-number">{score}</span>
				</div>
				<div class="timer-display">
					<span class="timer-label">Time</span>
					<span class="timer-number">{formatTime(timeLeft)}</span>
				</div>
				<div class="tps-display">
					<span class="tps-label">TPS</span>
					<span class="tps-number">{getTapsPerSecond().toFixed(1)}</span>
				</div>
			</div>

			<!-- Tap Area -->
			<div 
				class="tap-area" 
				bind:this={gameArea}
				on:click={handleTap}
				on:touchstart={handleTap}
				role="button"
				tabindex="0"
				aria-label="Tap to score points"
			>
				<div class="tap-button-wrapper">
					<button 
						class="tap-button"
						bind:this={tapButton}
						on:click={handleTap}
						on:touchstart={handleTap}
						aria-label="Tap button"
					>
						<span class="tap-icon">👆</span>
						<span class="tap-text">TAP!</span>
					</button>
				</div>

				<!-- Tap Effects -->
				{#each tapEffects as effect (effect.id)}
					<div 
						class="tap-effect"
						style="left: {effect.x}px; top: {effect.y}px;"
					>
						+1
					</div>
				{/each}
			</div>

			<!-- Progress Bar -->
			<div class="progress-container">
				<div class="progress-bar">
					<div 
						class="progress-fill" 
						style="width: {((gameSettings.gameTime - timeLeft) / gameSettings.gameTime) * 100}%"
					></div>
				</div>
			</div>
		</div>
	{:else if gameState === 'finished'}
		<div class="game-results">
			<h2 class="results-title">🎉 Game Complete!</h2>
			
			<div class="final-score-display">
				<div class="score-circle">
					<span class="final-score-number">{finalScore}</span>
					<span class="final-score-label">Total Taps</span>
				</div>
			</div>

			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-value">{(finalScore / gameSettings.gameTime).toFixed(1)}</span>
					<span class="stat-label">Taps/Second</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{gameSettings.gameTime}s</span>
					<span class="stat-label">Duration</span>
				</div>
			</div>

			<div class="results-message">
				<p>Returning to lobby in 5 seconds...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.tap-game-container {
		@apply min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex flex-col items-center justify-center p-4;
	}

	.game-status {
		@apply text-center space-y-6;
	}

	.game-title {
		@apply text-4xl font-bold text-gray-800 mb-4;
	}

	.game-description {
		@apply text-lg text-gray-600 max-w-md mx-auto;
	}

	.countdown-display {
		@apply flex items-center justify-center;
	}

	.countdown-number {
		@apply text-8xl font-bold text-orange-500 animate-pulse;
	}

	.playing-interface {
		@apply w-full max-w-md mx-auto space-y-6;
	}

	.game-header {
		@apply grid grid-cols-3 gap-4 mb-6;
	}

	.score-display, .timer-display, .tps-display {
		@apply bg-white rounded-lg p-4 text-center shadow-lg;
	}

	.score-label, .timer-label, .tps-label {
		@apply block text-xs font-medium text-gray-500 uppercase tracking-wide;
	}

	.score-number, .timer-number, .tps-number {
		@apply block text-2xl font-bold text-gray-800;
	}

	.tap-area {
		@apply relative bg-white rounded-2xl shadow-xl p-8 min-h-80 flex items-center justify-center overflow-hidden;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
	}

	.tap-button-wrapper {
		@apply flex items-center justify-center;
	}

	.tap-button {
		@apply w-48 h-48 bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 active:from-orange-600 active:to-red-700 rounded-full shadow-2xl flex flex-col items-center justify-center text-white font-bold transition-all duration-75 transform active:scale-95;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.tap-icon {
		@apply text-4xl mb-2;
	}

	.tap-text {
		@apply text-2xl font-black tracking-wider;
	}

	.tap-effect {
		@apply absolute pointer-events-none text-2xl font-bold text-green-500 animate-ping;
		animation: tap-effect 0.6s ease-out forwards;
		z-index: 10;
	}

	@keyframes tap-effect {
		0% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
		100% {
			opacity: 0;
			transform: scale(1.5) translateY(-50px);
		}
	}

	.progress-container {
		@apply w-full;
	}

	.progress-bar {
		@apply w-full h-3 bg-gray-200 rounded-full overflow-hidden;
	}

	.progress-fill {
		@apply h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-linear;
	}

	.game-results {
		@apply text-center space-y-8;
	}

	.results-title {
		@apply text-4xl font-bold text-gray-800;
	}

	.final-score-display {
		@apply flex justify-center;
	}

	.score-circle {
		@apply w-48 h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex flex-col items-center justify-center text-white shadow-2xl;
	}

	.final-score-number {
		@apply text-5xl font-black;
	}

	.final-score-label {
		@apply text-lg font-medium;
	}

	.stats-grid {
		@apply grid grid-cols-2 gap-4 max-w-xs mx-auto;
	}

	.stat-item {
		@apply bg-white rounded-lg p-4 text-center shadow-lg;
	}

	.stat-value {
		@apply block text-2xl font-bold text-gray-800;
	}

	.stat-label {
		@apply block text-sm text-gray-600 mt-1;
	}

	.results-message {
		@apply text-gray-600;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.tap-button {
			@apply w-40 h-40;
		}

		.tap-icon {
			@apply text-3xl;
		}

		.tap-text {
			@apply text-xl;
		}

		.game-header {
			@apply gap-2;
		}

		.score-display, .timer-display, .tps-display {
			@apply p-3;
		}

		.score-number, .timer-number, .tps-number {
			@apply text-xl;
		}
	}

	/* Prevent text selection on tap area */
	.tap-area * {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}
</style>
