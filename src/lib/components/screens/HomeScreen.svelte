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

<!-- Professional Hero Section following Creative HTML template -->
<main class="grow">
	<!-- Hero Section -->
	<section class="relative">
		<!-- Background with rounded corner -->
		<div class="absolute inset-0 rounded-bl-[100px] bg-gray-50 pointer-events-none -z-10" aria-hidden="true"></div>
		
		<div class="container-standard">
			<div class="section-standard">
				<!-- Hero content -->
				<div class="relative max-w-xl mx-auto md:max-w-none text-center md:text-left flex flex-col md:flex-row">
					
					<!-- Content -->
					<div class="md:w-[640px]">
						<!-- Main Heading -->
						<h1 class="h1 font-cabinet-grotesk mb-6">
							Multiplayer party games for 
							<span class="relative inline-flex text-blue-500">
								<svg class="absolute left-0 top-full -mt-4 max-w-full -z-10" width="220" height="24" viewBox="0 0 220 24" xmlns="http://www.w3.org/2000/svg">
									<path d="M134.66 13.107c-10.334-.37-20.721-.5-31.12-.291l-2.6.06c-4.116.04-8.193.602-12.3.749-14.502.43-29.029 1.196-43.514 2.465-6.414.63-12.808 1.629-19.04 2.866-7.93 1.579-16.113 3.71-23.367 5.003-2.211.374-3.397-1.832-2.31-4.906.5-1.467 1.838-3.456 3.418-4.813a16.047 16.047 0 0 1 6.107-3.365c16.88-4.266 33.763-6.67 51.009-7.389C71.25 3.187 81.81 1.6 92.309.966c11.53-.65 23.097-.938 34.66-.96 7.117-.054 14.25.254 21.36.318l16.194.803 4.62.39c3.85.32 7.693.618 11.53.813 8.346.883 16.673.802 25.144 2.159 1.864.276 3.714.338 5.566.873l.717.225c6.162 1.977 7.92 3.64 7.9 7.197l-.003.203c-.017.875.05 1.772-.112 2.593-.581 2.762-4.066 4.12-8.637 3.63-13.696-1.06-27.935-3.332-42.97-4.168-11.055-.83-22.314-1.459-33.596-1.603l-.022-.332 Z" fill="#D1D5DB" fill-rule="evenodd" />
								</svg>
								creative friends
							</span>.
						</h1>
						
						<!-- Subtitle -->
						<p class="text-xl text-gray-500 mb-10">
							Play real-time multiplayer games with friends using your phone as a controller. Create sessions, compete in party games, and have endless fun together.
						</p>
						
						<!-- Action Buttons -->
						{#if !showJoinForm && !showCreateForm}
							<div class="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-12 md:mb-20">
								<div>
									<button 
										type="button"
										class="btn text-white bg-blue-500 hover:bg-blue-600 w-full shadow-xs"
										on:click={() => showCreateForm = true}
										disabled={isCreating || isJoining}
									>
										{#if isCreating}
											<LoadingSpinner size="small" />
											<span class="ml-2">Creating...</span>
										{:else}
											Create Game Session
										{/if}
									</button>
								</div>
								<div>
									<button 
										type="button"
										class="btn text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600 w-full shadow-xs"
										on:click={() => showJoinForm = true}
										disabled={isCreating || isJoining}
									>
										{#if isJoining}
											<LoadingSpinner size="small" />
											<span class="ml-2">Joining...</span>
										{:else}
											Join Game Session
										{/if}
									</button>
								</div>
							</div>
							
							<!-- Stats -->
							<div class="inline-flex items-center space-x-4 md:space-x-6">
								<div>
									<div class="font-cabinet-grotesk text-2xl font-extrabold">🎮</div>
									<div class="text-gray-500">Games</div>
								</div>
								<svg class="fill-gray-300" width="14" height="10" xmlns="http://www.w3.org/2000/svg">
									<path d="M2.039 0c.099.006 1.237.621 1.649.787.391.17.735.41 1.067.667.682.515 1.387.995 2.089 1.48.102.071.196.153.284.245l.497-.172 1.76-.342.13-.097a.402.402 0 0 1 .206-.09l.107-.012c.218-.035.677-.132 1.143-.122l1.11-.062c.16-.001 1.67.295 1.691.339a.639.639 0 0 1 .026.129c.018.125-.035.29.09.352.045.022.167.292.084.41l-.137.203a.726.726 0 0 1-.147.164 5.18 5.18 0 0 1-.658.404l-.182.089a.534.534 0 0 0-.257.327c-.046.133-.134.134-.204.189-.376.26-.736.581-1.102.868L11 5.965l.219.284.55.784c.093.129.187.255.286.375.052.073.137.1.147.242.022.324.182.399.314.529.184.179.363.368.528.581.081.107.123.285.179.437.049.138-.138.362-.186.37-.137.023-.128.197-.178.312a.618.618 0 0 1-.058.116c-.03.034-1.375-.105-1.67-.162l-.09-.028-1.004-.368c-.552-.157-1.05-.462-1.167-.498-.117-.043-.19-.173-.275-.278l-1.604-.847c-.138-.113-.294-.199-.433-.311l-.162.083-.174.068c-.8.26-1.602.514-2.39.808-.385.15-.778.278-1.198.327-.439.038-1.692.294-1.788.271a3.114 3.114 0 0 1-.505-.227c-.09-.049-.306-.58-.324-.78-.056-.628.013-1.007.285-.96.11.02.29-.51.395-.536.06-.016.165-.088.287-.182l.334-.266c.157-.126.297-.234.363-.252.697-.205 1.325-.62 2.004-.878l.063-.035.07-.057-.01-.013a.425.425 0 0 0-.094-.115c-.586-.448-1.082-1.031-1.7-1.434-.058-.036-.165-.181-.284-.349L1.55 2.72c-.12-.168-.233-.316-.3-.356-.095-.056-.131-.619-.24-.632C.734 1.696.765 1.31.982.725 1.05.537 1.396.09 1.495.07c.192-.037.38-.07.544-.07Z" fill-rule="evenodd" />
								</svg>
								<div>
									<div class="font-cabinet-grotesk text-2xl font-extrabold">📱</div>
									<div class="text-gray-500">Controllers</div>
								</div>
								<svg class="fill-gray-300" width="14" height="10" xmlns="http://www.w3.org/2000/svg">
									<path d="M2.039 0c.099.006 1.237.621 1.649.787.391.17.735.41 1.067.667.682.515 1.387.995 2.089 1.48.102.071.196.153.284.245l.497-.172 1.76-.342.13-.097a.402.402 0 0 1 .206-.09l.107-.012c.218-.035.677-.132 1.143-.122l1.11-.062c.16-.001 1.67.295 1.691.339a.639.639 0 0 1 .026.129c.018.125-.035.29.09.352.045.022.167.292.084.41l-.137.203a.726.726 0 0 1-.147.164 5.18 5.18 0 0 1-.658.404l-.182.089a.534.534 0 0 0-.257.327c-.046.133-.134.134-.204.189-.376.26-.736.581-1.102.868L11 5.965l.219.284.55.784c.093.129.187.255.286.375.052.073.137.1.147.242.022.324.182.399.314.529.184.179.363.368.528.581.081.107.123.285.179.437.049.138-.138.362-.186.37-.137.023-.128.197-.178.312a.618.618 0 0 1-.058.116c-.03.034-1.375-.105-1.67-.162l-.09-.028-1.004-.368c-.552-.157-1.05-.462-1.167-.498-.117-.043-.19-.173-.275-.278l-1.604-.847c-.138-.113-.294-.199-.433-.311l-.162.083-.174.068c-.8.26-1.602.514-2.39.808-.385.15-.778.278-1.198.327-.439.038-1.692.294-1.788.271a3.114 3.114 0 0 1-.505-.227c-.09-.049-.306-.58-.324-.78-.056-.628.013-1.007.285-.96.11.02.29-.51.395-.536.06-.016.165-.088.287-.182l.334-.266c.157-.126.297-.234.363-.252.697-.205 1.325-.62 2.004-.878l.063-.035.07-.057-.01-.013a.425.425 0 0 0-.094-.115c-.586-.448-1.082-1.031-1.7-1.434-.058-.036-.165-.181-.284-.349L1.55 2.72c-.12-.168-.233-.316-.3-.356-.095-.056-.131-.619-.24-.632C.734 1.696.765 1.31.982.725 1.05.537 1.396.09 1.495.07c.192-.037.38-.07.544-.07Z" fill-rule="evenodd" />
								</svg>
								<div>
									<div class="font-cabinet-grotesk text-2xl font-extrabold">👥</div>
									<div class="text-gray-500">Friends</div>
								</div>
							</div>
						{/if}
					</div>
					
					<!-- Game Controller Illustration -->
					<div class="max-w-sm mx-auto md:max-w-none md:absolute md:left-[40rem] md:ml-16 lg:ml-32 xl:ml-52 mt-12 md:-mt-12">
						<div class="relative">
							<!-- Game controller SVG or placeholder -->
							<div class="w-full h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
								<div class="text-white text-center">
									<div class="text-6xl mb-4">🎮</div>
									<div class="text-xl font-bold">Phone Controller</div>
									<div class="text-sm opacity-80">Real-time Gaming</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section>
		<div class="container-standard">
			<div class="py-12 md:pt-32 md:pb-20">
				<!-- Section header -->
				<div class="pb-12 md:pb-14">
					<div class="relative text-center md:text-left">
						<svg class="fill-gray-300 hidden md:block absolute -ml-7 -mt-8" width="22" height="30" xmlns="http://www.w3.org/2000/svg">
							<path d="M13.07 1.468c-.288-.134-.161-.496.199-1.005.115-.16.583-.483.693-.462.218.039.433.08.612.152.113.04 1.233 1.173 1.62 1.564.385.368.678.795.958 1.234l.841 1.337c.279.446.553.895.814 1.35.089.152.161.312.217.48l.051.17c.177.68.48 1.289.809 1.885l.242.439a.4.4 0 0 0 .179.173c.246.114 1.162 2.064 1.203 2.35.139.698.161 1.445.28 2.146l.028.118a.256.256 0 0 1-.017.196c-.148.296-.038.478.016.685.078.288.145.58.181.883.019.152-.036.331-.064.5-.028.156-.318.209-.367.18-.139-.081-.222.072-.327.133l-.08.043a.206.206 0 0 1-.037.013c-.045.004-1.215-1.096-1.449-1.349l-.032-.037-.77-1.069c-.43-.514-.737-1.116-.83-1.223-.088-.12-.091-.277-.116-.424-.01-.075-1.069-1.706-1.103-1.772-.151-.371-.426-.678-.377-1.151.01-.092-.039-.159-.078-.228-.34-.595-.563-1.25-.826-1.887-.134-.325-.333-.613-.494-.923-.03-.056-.028-.129-.044-.193l-.04-.159a.39.39 0 0 0-.032-.074c-.426-.706-.726-1.492-1.247-2.138-.112-.153-.366-1.07-.52-1.233-.079-.093.024-.652-.093-.704ZM.414 27.098c-.28.091-.397-.262-.414-.873-.006-.196.156-.74.244-.802.172-.117.342-.228.5-.3.098-.038 1.44.005 1.902-.03.446-.021.872.039 1.293.12.859.154 1.728.267 2.596.387.193.027.379.085.562.168.55.26 1.13.358 1.714.417l.386.037a.315.315 0 0 0 .21-.055c.199-.133 2.005.124 2.23.231.561.244 1.11.605 1.677.856.08.04.172.028.236.148.147.276.331.271.509.328.248.077.494.165.737.28.12.059.228.198.341.307.1.1.006.379-.037.407-.124.08-.048.23-.052.353a.583.583 0 0 1-.012.127c-.015.043-1.373.511-1.681.59l-.047.01-1.166.121c-.596.104-1.197.054-1.324.074-.13.013-.25-.07-.374-.124l-1.882-.043c-.352-.077-.728-.03-1.042-.341-.062-.06-.137-.061-.207-.069-.62-.073-1.214-.283-1.813-.465-.305-.092-.623-.129-.934-.196-.056-.012-.104-.059-.158-.086l-.132-.073a.27.27 0 0 0-.07-.023c-.74-.137-1.447-.433-2.202-.517-.175-.017-.911-.496-1.112-.512-.114-.008-.366-.487-.478-.451Z" fill-rule="evenodd" />
						</svg>
						<h2 class="h2 font-cabinet-grotesk">How it works</h2>
					</div>
				</div>

				<!-- Steps Grid -->
				<div class="max-w-sm mx-auto sm:max-w-none grid gap-6 sm:grid-cols-2 md:grid-cols-3 items-start">
					<!-- Step 1 -->
					<div class="card-basic hover:shadow-xl transition duration-150 ease-in-out">
						<div class="p-6 text-center">
							<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span class="text-2xl">📱</span>
							</div>
							<h3 class="font-cabinet-grotesk text-xl font-bold text-gray-800 mb-2">Use Your Phone</h3>
							<p class="text-gray-600">Your phone becomes the game controller. No additional hardware needed.</p>
						</div>
					</div>

					<!-- Step 2 -->
					<div class="card-basic hover:shadow-xl transition duration-150 ease-in-out">
						<div class="p-6 text-center">
							<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span class="text-2xl">👥</span>
							</div>
							<h3 class="font-cabinet-grotesk text-xl font-bold text-gray-800 mb-2">Invite Friends</h3>
							<p class="text-gray-600">Share the room code with friends. Up to 20 players can join your session.</p>
						</div>
					</div>

					<!-- Step 3 -->
					<div class="card-basic hover:shadow-xl transition duration-150 ease-in-out">
						<div class="p-6 text-center">
							<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span class="text-2xl">🎯</span>
							</div>
							<h3 class="font-cabinet-grotesk text-xl font-bold text-gray-800 mb-2">Play Together</h3>
							<p class="text-gray-600">Compete in real-time party games with responsive controls and instant feedback.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Create Session Form -->
	{#if showCreateForm}
		<section class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="create-session-title" on:click={resetForms} on:keydown={(e) => e.key === 'Escape' && resetForms()}>
			<div class="card-basic p-6 w-full max-w-md m-4" role="document" on:click|stopPropagation on:keydown={(e) => e.stopPropagation()}>
				<h2 id="create-session-title" class="h2 text-center mb-6">Create Game Session</h2>
				
				<form on:submit|preventDefault={createSession} class="space-y-6">
					<div class="mb-4">
						<label for="host-name" class="block text-gray-500 text-sm font-medium mb-1">
							Your Name
						</label>
						<input 
							id="host-name"
							type="text"
							class="form-input w-full text-gray-800"
							bind:value={hostName}
							placeholder="Enter your name"
							maxlength="20"
							required
						/>
					</div>
					
					<div class="mb-4">
						<label for="max-players" class="block text-gray-500 text-sm font-medium mb-1">
							Max Players (2-20)
						</label>
						<input 
							id="max-players"
							type="number"
							class="form-input w-full text-gray-800"
							bind:value={maxPlayers}
							min="2"
							max="20"
							required
						/>
					</div>
					
					<div class="flex space-x-3 game-controls">
						<button 
							type="submit"
							class="btn-primary flex-1"
							disabled={isCreating}
						>
							{#if isCreating}
								<LoadingSpinner size="small" />
								<span class="ml-2">Creating...</span>
							{:else}
								Create Session
							{/if}
						</button>
						
						<button 
							type="button"
							class="btn-secondary flex-1"
							on:click={resetForms}
								disabled={isCreating}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</section>
	{/if}
	
	<!-- Join Session Form -->
	{#if showJoinForm}
		<section class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="join-session-title" on:click={resetForms} on:keydown={(e) => e.key === 'Escape' && resetForms()}>
			<div class="card-basic p-6 w-full max-w-md m-4" role="document" on:click|stopPropagation on:keydown={(e) => e.stopPropagation()}>
				<h2 id="join-session-title" class="h2 text-center mb-6">Join Game Session</h2>
				
				<form on:submit|preventDefault={joinSession} class="space-y-6">
					<div class="mb-4">
						<label for="room-code" class="block text-gray-500 text-sm font-medium mb-1">
							Room Code
						</label>
						<input 
							id="room-code"
							type="text"
							class="form-input w-full text-gray-800 text-center text-2xl font-mono tracking-widest"
							bind:value={roomCode}
							placeholder="123456"
							maxlength="6"
							pattern="[0-9]{6}"
							inputmode="numeric"
							required
							on:input={(e) => {
								// Only allow digits and limit to 6 characters
								e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
								roomCode = e.currentTarget.value;
							}}
						/>
						<p class="text-xs text-gray-500 mt-1">Enter the 6-digit room code</p>
					</div>
					
					<div class="mb-4">
						<label for="player-name" class="block text-gray-500 text-sm font-medium mb-1">
							Your Name
						</label>
						<input 
							id="player-name"
							type="text"
							class="form-input w-full text-gray-800"
							bind:value={playerName}
							placeholder="Enter your name"
							maxlength="20"
							required
						/>
					</div>
					
					<div class="flex space-x-3 game-controls">
						<button 
							type="submit"
							class="btn-primary flex-1"
							disabled={isJoining}
						>
							{#if isJoining}
								<LoadingSpinner size="small" />
								<span class="ml-2">Joining...</span>
							{:else}
								Join Session
							{/if}
						</button>
						
						<button 
							type="button"
							class="btn-secondary flex-1"
							on:click={resetForms}
							disabled={isJoining}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</section>
	{/if}
</main>
