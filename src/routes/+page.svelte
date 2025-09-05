<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { sessionService, clientState } from '$lib/services/sessionService';
	
	// Import screen components
	import HomeScreen from '$lib/components/screens/HomeScreen.svelte';
	import LobbyScreen from '$lib/components/screens/LobbyScreen.svelte';
	import GameScreen from '$lib/components/screens/GameScreen.svelte';
	import ResultsScreen from '$lib/components/screens/ResultsScreen.svelte';
	import ErrorNotification from '$lib/components/ui/ErrorNotification.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	
	let currentScreen = 'home';
	let isConnected = false;
	let error: string | null = null;
	
	// Subscribe to client state changes
	const unsubscribe = clientState.subscribe((state) => {
		currentScreen = state.currentScreen;
		isConnected = state.isConnected;
		error = state.error;
		
		// Update connection status indicator
		updateConnectionStatus(state.isConnected);
	});
	
	function updateConnectionStatus(connected: boolean) {
		const statusEl = document.getElementById('connection-status');
		if (statusEl) {
			if (connected) {
				statusEl.className = 'connection-status connected';
				statusEl.textContent = 'Connected';
				statusEl.style.display = 'block';
				// Hide after 2 seconds
				setTimeout(() => {
					statusEl.style.display = 'none';
				}, 2000);
			} else if (currentScreen !== 'home') {
				statusEl.className = 'connection-status disconnected';
				statusEl.textContent = 'Disconnected';
				statusEl.style.display = 'block';
			} else {
				statusEl.style.display = 'none';
			}
		}
	}
	
	onDestroy(() => {
		unsubscribe();
	});
</script>

<svelte:head>
	<title>Party Games - Multiplayer Fun with Friends</title>
</svelte:head>

<!-- Game container following design system -->
<div class="game-container bg-gradient-to-br from-gray-50 to-blue-50">
	<!-- Error Notification -->
	{#if error}
		<ErrorNotification 
			message={error} 
			onClose={() => sessionService.clearError()} 
		/>
	{/if}
	
	<!-- Screen Router -->
	{#if currentScreen === 'home'}
		<HomeScreen />
	{:else if currentScreen === 'lobby'}
		<LobbyScreen />
	{:else if currentScreen === 'game'}
		<GameScreen />
	{:else if currentScreen === 'results'}
		<ResultsScreen />
	{:else}
		<div class="container-standard">
			<div class="section-standard">
				<div class="flex items-center justify-center">
					<LoadingSpinner />
				</div>
			</div>
		</div>
	{/if}
</div>
