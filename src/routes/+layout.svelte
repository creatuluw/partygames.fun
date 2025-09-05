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
<div class="page-wrapper">
	<!-- WebSocket connection status indicator -->
	<div id="connection-status" class="connection-status" style="display: none;"></div>
	
	<!-- Main content area -->
	<main class="page-main">
		{@render children?.()}
	</main>
</div>
