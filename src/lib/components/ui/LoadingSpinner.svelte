<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let message: string = '';

	$: sizeClasses = {
		small: 'w-4 h-4',
		medium: 'w-8 h-8',
		large: 'w-12 h-12'
	}[size];
</script>

<!-- Loading spinner following design system -->
<div class="flex flex-col items-center justify-center space-y-3">
	<div class="{sizeClasses} text-blue-500 animate-spin transition-all duration-700" 
		 aria-hidden="true">
		<svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
			<circle 
				class="opacity-25" 
				cx="12" 
				cy="12" 
				r="10" 
				stroke="currentColor" 
				stroke-width="4"
			></circle>
			<path 
				class="opacity-75" 
				fill="currentColor" 
				d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	</div>
	
	{#if message}
		<p class="text-sm text-gray-500 text-center max-w-xs">
			{message}
		</p>
	{/if}
	
	<span class="sr-only">Loading...</span>
</div>
