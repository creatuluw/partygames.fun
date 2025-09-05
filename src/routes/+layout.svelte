<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<title>Party Games - Multiplayer Fun for Everyone</title>
	<meta name="description" content="Play real-time multiplayer party games with friends using your phones as controllers" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Page wrapper following design system guidelines -->
<div class="flex flex-col min-h-screen overflow-hidden">
	<!-- Site header -->
	<header class="header-standard">
		<div class="container-standard">
			<div class="header-content">
				<!-- Site branding -->
				<div class="shrink-0 mr-4">
					<!-- Logo -->
					<a class="block group" href="/" aria-label="Party Games">
						<div class="flex items-center space-x-2">
							<div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition duration-150 ease-in-out">
								<span class="text-white text-lg font-bold">🎮</span>
							</div>
							<span class="font-cabinet-grotesk text-xl font-bold text-gray-800 group-hover:text-blue-600 transition duration-150 ease-in-out">Party Games</span>
						</div>
					</a>
				</div>
			</div>
		</div>
	</header>
	
	<!-- WebSocket connection status indicator -->
	<div id="connection-status" class="connection-status" style="display: none;"></div>
	
	<!-- Main content area -->
	<div class="grow">
		{@render children?.()}
	</div>
</div>
