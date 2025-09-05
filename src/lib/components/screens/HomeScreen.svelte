<script lang="ts">
	import { sessionService } from '$lib/services/sessionService';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	
	let isCreating = false;
	let isJoining = false;
	let showJoinForm = false;
	let showCreateForm = false;
	
	// Join form state
	let roomCode = '';
	let playerName = '';
	
	// Create form state  
	let hostName = 'Host';
	let maxPlayers = 10;
	
	async function createSession() {
		if (!hostName.trim()) {
			alert('Please enter your name');
			return;
		}
		
		isCreating = true;
		try {
			const result = await sessionService.createSession('agario', maxPlayers, hostName);
			console.log('Session created:', result);
		} catch (error) {
			console.error('Failed to create session:', error);
			alert('Failed to create session: ' + (error instanceof Error ? error.message : 'Unknown error'));
		} finally {
			isCreating = false;
		}
	}
	
	async function joinSession() {
		if (!roomCode.trim() || !playerName.trim()) {
			alert('Please enter both room code and your name');
			return;
		}
		
		if (!sessionService.isValidRoomCode(roomCode)) {
			alert('Room code must be 6 digits');
			return;
		}
		
		isJoining = true;
		try {
			await sessionService.joinSession(roomCode, playerName);
		} catch (error) {
			console.error('Failed to join session:', error);
		} finally {
			isJoining = false;
		}
	}
	
	function resetForms() {
		showJoinForm = false;
		showCreateForm = false;
		roomCode = '';
		playerName = '';
		hostName = 'Host';
		maxPlayers = 10;
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4">
	<!-- App Header -->
	<div class="text-center mb-12">
		<h1 class="text-5xl font-bold text-gray-800 mb-4">🎮</h1>
		<h1 class="text-4xl font-bold text-gray-800 mb-2">Party Games</h1>
		<p class="text-gray-600 text-lg max-w-md">
			Play real-time multiplayer games with friends using your phone as a controller
		</p>
	</div>
	
	<!-- Main Actions -->
	{#if !showJoinForm && !showCreateForm}
		<div class="w-full max-w-sm space-y-4">
			<button 
				class="btn btn-primary w-full text-xl py-4"
				on:click={() => showCreateForm = true}
				disabled={isCreating || isJoining}
			>
				{#if isCreating}
					<LoadingSpinner size="sm" color="text-white" />
					<span class="ml-2">Creating...</span>
				{:else}
					Create Game Session
				{/if}
			</button>
			
			<button 
				class="btn btn-secondary w-full text-xl py-4"
				on:click={() => showJoinForm = true}
				disabled={isCreating || isJoining}
			>
				{#if isJoining}
					<LoadingSpinner size="sm" color="text-white" />
					<span class="ml-2">Joining...</span>
				{:else}
					Join Game Session
				{/if}
			</button>
		</div>
		
		<!-- How it Works -->
		<div class="mt-16 max-w-2xl text-center">
			<h3 class="text-xl font-semibold text-gray-800 mb-4">How it works</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
						<span class="text-xl">📱</span>
					</div>
					<p><strong>1. Use Your Phone</strong><br>Your phone becomes the game controller</p>
				</div>
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
						<span class="text-xl">👥</span>
					</div>
					<p><strong>2. Invite Friends</strong><br>Share the room code with your friends</p>
				</div>
				<div class="flex flex-col items-center">
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
						<span class="text-xl">🎯</span>
					</div>
					<p><strong>3. Play Together</strong><br>Compete in real-time party games</p>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Create Session Form -->
	{#if showCreateForm}
		<div class="card w-full max-w-md">
			<h2 class="text-2xl font-bold text-center mb-6">Create Game Session</h2>
			
			<form on:submit|preventDefault={createSession} class="space-y-6">
				<div>
					<label for="host-name" class="block text-sm font-medium text-gray-700 mb-2">
						Your Name
					</label>
					<input 
						id="host-name"
						type="text"
						class="input"
						bind:value={hostName}
						placeholder="Enter your name"
						maxlength="20"
						required
					/>
				</div>
				
				<div>
					<label for="max-players" class="block text-sm font-medium text-gray-700 mb-2">
						Max Players (2-20)
					</label>
					<input 
						id="max-players"
						type="number"
						class="input"
						bind:value={maxPlayers}
						min="2"
						max="20"
						required
					/>
				</div>
				
				<div class="flex space-x-3">
					<button 
						type="submit"
						class="btn btn-primary flex-1"
						disabled={isCreating}
					>
						{#if isCreating}
							<LoadingSpinner size="sm" color="text-white" />
							<span class="ml-2">Creating...</span>
						{:else}
							Create Session
						{/if}
					</button>
					
					<button 
						type="button"
						class="btn btn-secondary flex-1"
						on:click={resetForms}
						disabled={isCreating}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}
	
	<!-- Join Session Form -->
	{#if showJoinForm}
		<div class="card w-full max-w-md">
			<h2 class="text-2xl font-bold text-center mb-6">Join Game Session</h2>
			
			<form on:submit|preventDefault={joinSession} class="space-y-6">
				<div>
					<label for="room-code" class="block text-sm font-medium text-gray-700 mb-2">
						Room Code
					</label>
					<input 
						id="room-code"
						type="text"
						class="input text-center text-2xl font-mono tracking-widest"
						bind:value={roomCode}
						placeholder="123456"
						maxlength="6"
						pattern="[0-9]{6}"
						inputmode="numeric"
						required
					/>
					<p class="text-xs text-gray-500 mt-1">Enter the 6-digit room code</p>
				</div>
				
				<div>
					<label for="player-name" class="block text-sm font-medium text-gray-700 mb-2">
						Your Name
					</label>
					<input 
						id="player-name"
						type="text"
						class="input"
						bind:value={playerName}
						placeholder="Enter your name"
						maxlength="20"
						required
					/>
				</div>
				
				<div class="flex space-x-3">
					<button 
						type="submit"
						class="btn btn-primary flex-1"
						disabled={isJoining}
					>
						{#if isJoining}
							<LoadingSpinner size="sm" color="text-white" />
							<span class="ml-2">Joining...</span>
						{:else}
							Join Session
						{/if}
					</button>
					
					<button 
						type="button"
						class="btn btn-secondary flex-1"
						on:click={resetForms}
						disabled={isJoining}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
