<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let message: string;
	export let type: 'error' | 'warning' | 'success' | 'info' = 'error';
	export let autoClose: boolean = true;
	export let duration: number = 5000;
	export let onClose: (() => void) | undefined = undefined;
	
	const dispatch = createEventDispatcher();
	let visible = true;
	let isClosing = false;
	
	$: notificationStyles = {
		error: 'bg-red-100 text-red-800 border border-red-200',
		warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
		success: 'bg-green-100 text-green-800 border border-green-200',
		info: 'bg-blue-100 text-blue-800 border border-blue-200'
	}[type];
	
	$: iconStyles = {
		error: 'text-red-500',
		warning: 'text-yellow-500',
		success: 'text-green-500',
		info: 'text-blue-500'
	}[type];
	
	function close() {
		isClosing = true;
		setTimeout(() => {
			visible = false;
			if (onClose) {
				onClose();
			}
			dispatch('close');
		}, 200); // Allow fade out animation
	}
	
	onMount(() => {
		if (autoClose) {
			const timer = setTimeout(close, duration);
			return () => clearTimeout(timer);
		}
	});
</script>

<!-- Error notification following design system -->
{#if visible}
	<div class="fixed top-4 left-4 right-4 z-50 mx-auto max-w-lg transition-all duration-300 ease-in-out {isClosing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}">
		<div class="{notificationStyles} rounded-lg shadow-xs p-4">
			<div class="flex items-start">
				<!-- Icon -->
				<div class="flex-shrink-0 {iconStyles}">
					{#if type === 'error'}
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
						</svg>
					{:else if type === 'warning'}
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
							<path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
						</svg>
					{:else if type === 'success'}
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
						</svg>
					{/if}
				</div>
				
				<!-- Message -->
				<div class="ml-3 flex-1">
					<p class="text-sm font-medium">
						{message}
					</p>
				</div>
				
				<!-- Close button -->
				<div class="ml-4 flex-shrink-0 flex">
					<button
						type="button"
						class="inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-500 transition duration-150 ease-in-out"
						on:click={close}
						aria-label="Close notification"
					>
						<svg class="w-4 h-4 {iconStyles}" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
							<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
