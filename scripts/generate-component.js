#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Component templates following UI Design Guidelines
const templates = {
  button: `<script>
  export let variant = 'primary'; // 'primary' | 'secondary' | 'small'
  export let type = 'button';
  export let disabled = false;
  export let href = null;
  
  $: buttonClasses = {
    primary: 'btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs',
    secondary: 'btn text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600 shadow-xs',
    small: 'btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs'
  }[variant];
</script>

{#if href}
  <a {href} class="{buttonClasses} {disabled ? 'opacity-50 cursor-not-allowed' : ''}" aria-disabled={disabled}>
    <slot />
  </a>
{:else}
  <button {type} {disabled} class="{buttonClasses} transition duration-150 ease-in-out">
    <slot />
  </button>
{/if}
`,

  card: `<script>
  export let hoverable = false;
  export let href = null;
</script>

{#if href}
  <a {href} class="block {hoverable ? 'group hover:shadow-xl transition duration-150 ease-in-out' : ''}">
    <div class="bg-white rounded-lg shadow-xs overflow-hidden">
      <slot />
    </div>
  </a>
{:else}
  <div class="bg-white rounded-lg shadow-xs overflow-hidden {hoverable ? 'group hover:shadow-xl transition duration-150 ease-in-out' : ''}">
    <slot />
  </div>
{/if}
`,

  input: `<script>
  export let label = '';
  export let id = '';
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let disabled = false;
  export let error = '';
</script>

<div class="mb-4">
  {#if label}
    <label for={id} class="block text-gray-500 text-sm font-medium mb-1">
      {label}
    </label>
  {/if}
  
  <input
    {id}
    {type}
    {placeholder}
    {required}
    {disabled}
    bind:value
    class="form-input w-full text-gray-800 {error ? 'border-red-500 focus:border-red-500' : ''}"
  />
  
  {#if error}
    <p class="text-red-500 text-sm mt-1">{error}</p>
  {/if}
</div>
`,

  header: `<script>
  export let logoHref = '/';
  export let brandName = 'Party Games';
  export let showAuth = true;
</script>

<header class="absolute w-full z-30">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16 md:h-20">
      <!-- Logo -->
      <div class="shrink-0 mr-4">
        <a href={logoHref} class="block group" aria-label={brandName}>
          <div class="font-cabinet-grotesk font-bold text-xl text-blue-500 group-hover:text-blue-600 transition duration-150 ease-in-out">
            {brandName}
          </div>
        </a>
      </div>
      
      <!-- Navigation -->
      <nav class="flex grow">
        <ul class="flex grow justify-end flex-wrap items-center">
          {#if showAuth}
            <li>
              <a href="/signin" class="font-medium text-gray-600 decoration-blue-500 decoration-2 underline-offset-2 hover:underline px-3 lg:px-5 py-2">
                Sign in
              </a>
            </li>
            <li class="ml-3">
              <a href="/signup" class="btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
                Join Game
              </a>
            </li>
          {/if}
        </ul>
      </nav>
    </div>
  </div>
</header>
`,

  page: `<script>
  export let title = 'Party Games';
  export let showHeader = true;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<!-- Page wrapper following design guidelines -->
<div class="flex flex-col min-h-screen overflow-hidden font-inter antialiased bg-white text-gray-800 tracking-tight">
  
  {#if showHeader}
    <slot name="header">
      <!-- Default header slot -->
    </slot>
  {/if}
  
  <!-- Main content -->
  <main class="grow">
    <slot />
  </main>
  
  <!-- Footer slot -->
  <slot name="footer" />
</div>
`,

  section: `<script>
  export let containerClass = 'max-w-6xl';
  export let paddingClass = 'pt-32 pb-12 md:pt-40 md:pb-20';
</script>

<section>
  <div class="{containerClass} mx-auto px-4 sm:px-6">
    <div class={paddingClass}>
      <slot />
    </div>
  </div>
</section>
`
};

// Generate component function
function generateComponent(componentName, componentType, outputPath) {
  const template = templates[componentType];
  
  if (!template) {
    console.error(`❌ Unknown component type: ${componentType}`);
    console.log(`Available types: ${Object.keys(templates).join(', ')}`);
    return;
  }

  const fullPath = join(outputPath, `${componentName}.svelte`);
  const dir = dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Write the component file
  writeFileSync(fullPath, template);
  console.log(`✅ Generated ${componentName}.svelte at ${fullPath}`);
}

// CLI Interface
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
🎨 Party Games Component Generator

Usage: node generate-component.js <component-name> <component-type> [output-path]

Available component types:
${Object.keys(templates).map(type => `  - ${type}`).join('\n')}

Examples:
  node generate-component.js MyButton button src/lib/components
  node generate-component.js GameCard card src/lib/components  
  node generate-component.js UserInput input src/lib/components

This generator creates components that follow the UI Design Guidelines automatically.
`);
  process.exit(1);
}

const [componentName, componentType, outputPath = 'src/lib/components'] = args;

generateComponent(componentName, componentType, outputPath);
