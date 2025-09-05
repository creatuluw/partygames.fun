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

<!-- Tap Game following design system -->
<section class="container-standard">
	<div class="section-standard">
		{#if gameState === 'waiting'}
			<div class="text-center">
				<div class="mb-4">
					<span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
						🧪 Solo Test Mode
					</span>
				</div>
				<h2 class="h2 mb-4">👆 Tap Master</h2>
				<p class="text-xl text-gray-600 mb-8">Get ready to tap as fast as you can!</p>
				<div class="text-6xl font-bold text-blue-500">
					Ready?
				</div>
			</div>
		{:else if gameState === 'countdown'}
			<div class="text-center">
				<h2 class="h2 mb-4">👆 Tap Master</h2>
				<p class="text-xl text-gray-600 mb-8">Tap the button as fast as possible!</p>
				<div class="text-8xl font-bold text-green-500 game-feedback">
					{countdownTimer}
				</div>
			</div>
		{:else if gameState === 'playing'}
			<div class="text-center">
				<h2 class="h2 mb-6">👆 Playing Tap Master</h2>
				<div class="mb-8">
					<div class="text-4xl font-bold text-blue-600 mb-2">{score}</div>
					<div class="text-lg text-gray-600">Taps | {formatTime(timeLeft)} seconds left</div>
				</div>
				<div class="flex justify-center">
					<button 
						type="button"
						class="btn-primary text-6xl py-16 px-16 rounded-full min-h-32 min-w-32 game-controls"
						bind:this={tapButton}
						on:click={handleTap}
						on:touchstart={handleTap}
						aria-label="Tap button to score points"
					>
						<span class="block">👆</span>
						<span class="block text-xl mt-2">TAP!</span>
					</button>
				</div>
			</div>
		{:else if gameState === 'finished'}
			<div class="text-center">
				<h2 class="h2 mb-6">🎉 Game Complete!</h2>
				<div class="mb-8">
					<div class="text-6xl font-bold text-green-600 mb-2">{finalScore}</div>
					<div class="text-xl text-gray-600">Total Taps</div>
					<div class="text-lg text-gray-500 mt-2">
						{(finalScore / gameSettings.gameTime).toFixed(1)} taps per second
					</div>
				</div>
				<p class="text-gray-600">Returning to lobby...</p>
			</div>
		{/if}
	</div>
</section>
