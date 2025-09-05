<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let message: string;
	export let autoClose: boolean = true;
	export let duration: number = 5000;
	export let onClose: (() => void) | undefined = undefined;
	
	const dispatch = createEventDispatcher();
	let visible = true;
	
	function close() {
		visible = false;
		if (onClose) {
			onClose();
		}
		dispatch('close');
	}
	
	onMount(() => {
		if (autoClose) {
			const timer = setTimeout(close, duration);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if visible}
	<div class="fixed top-4 left-4 right-4 z-50 flex items-center justify-between bg-red-600 text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
		<div class="flex items-center">
			<svg class="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
			</svg>
			<span class="text-sm font-medium">{message}</span>
		</div>
		
		<button 
			class="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-red-700 transition-colors touch-manipulation"
			style="min-height: 44px; min-width: 44px;"
			on:click={close}
			aria-label="Close notification"
		>
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
			</svg>
		</button>
	</div>
{/if}
