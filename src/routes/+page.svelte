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
	});
	
	onDestroy(() => {
		unsubscribe();
	});
</script>

<svelte:head>
	<title>Party Games - Multiplayer Fun with Friends</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
		<div class="flex items-center justify-center h-screen">
			<LoadingSpinner />
		</div>
	{/if}
</main>

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	
	:global(.btn) {
		@apply px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 touch-manipulation;
		min-height: 44px; /* Minimum touch target size */
		min-width: 44px;
	}
	
	:global(.btn-primary) {
		@apply bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg;
	}
	
	:global(.btn-secondary) {
		@apply bg-gray-600 hover:bg-gray-700 active:bg-gray-800;
	}
	
	:global(.btn-danger) {
		@apply bg-red-600 hover:bg-red-700 active:bg-red-800;
	}
	
	:global(.btn:disabled) {
		@apply opacity-50 cursor-not-allowed;
	}
	
	:global(.input) {
		@apply w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors;
		min-height: 44px; /* Minimum touch target size */
		font-size: 16px; /* Prevent zoom on iOS */
	}
	
	:global(.card) {
		@apply bg-white rounded-xl shadow-lg p-6 border border-gray-200;
	}
</style>
