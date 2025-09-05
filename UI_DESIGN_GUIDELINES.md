# UI & Design Guidelines

This document serves as the comprehensive UI and design system guide for the Party Games project, based on the **Creative HTML template** by Cruip. These guidelines ensure consistent, polished design patterns throughout the application.

## Overview

The design system is built on **Tailwind CSS v4** with custom fonts, utilities, and component patterns. It emphasizes a modern, clean aesthetic with smooth animations and responsive design.

### Core Technologies
- **Tailwind CSS v4** - Utility-first CSS framework
- **Alpine.js** - Lightweight JavaScript framework for interactivity
- **AOS (Animate On Scroll)** - Scroll-triggered animations
- **Swiper.js** - Touch sliders and carousels

---

## Typography

### Font Families
- **Primary Font**: Inter (Google Fonts) - Used for body text and UI elements
- **Display Font**: Cabinet Grotesk (Custom) - Used for headings and emphasis

### Font Weights Available
- **Inter**: 400 (Regular), 500 (Medium), 600 (Semibold)
- **Cabinet Grotesk**: 500 (Medium), 700 (Bold), 800 (Extrabold)

### Typography Scale & Utilities

#### Heading Classes
```css
.h1 - text-6xl font-extrabold (text-7xl on md+ screens)
.h2 - text-4xl font-extrabold (text-5xl on md+ screens)
.h3 - text-3xl font-extrabold
.h4 - text-2xl font-extrabold
```

#### Text Sizes
- `text-xs` (0.75rem)
- `text-sm` (0.875rem)  
- `text-base` (1rem)
- `text-lg` (1.125rem)
- `text-xl` (1.25rem)
- `text-2xl` (1.5rem)
- `text-3xl` (1.875rem)
- `text-4xl` (2.25rem)
- `text-5xl` (3rem)
- `text-6xl` (3.75rem)
- `text-7xl` (5.5rem)

### Typography Best Practices
- Use `font-cabinet-grotesk` class for headings
- Use `font-inter` (or default) for body text
- Apply `antialiased` class to body for smoother text rendering
- Use `tracking-tight` for improved readability in headings

---

## Color System

### Primary Color Palette
- **Blue (Primary Brand Color)**
  - `bg-blue-500` / `text-blue-500` - Main brand blue
  - `bg-blue-600` / `text-blue-600` - Darker blue for hover states
  - `bg-blue-100` / `text-blue-100` - Light blue for backgrounds
  - `bg-blue-300` / `text-blue-300` - Medium blue for accents

### Neutral Colors
- **Gray Scale**
  - `bg-white` / `text-white` - Pure white
  - `bg-gray-50` - Lightest gray background
  - `bg-gray-100` - Light gray for subtle backgrounds
  - `bg-gray-200` - Border color
  - `bg-gray-300` - Inactive states
  - `bg-gray-400` - Placeholder text
  - `bg-gray-500` - Medium gray text
  - `bg-gray-600` - Darker text
  - `bg-gray-800` - Primary dark text
  - `text-gray-800` - Primary text color

### Accent Colors
- **Red**: Available for errors/warnings
- **Green**: Available for success states
- **Orange/Amber**: Available for warnings
- **Twitter Blue**: `bg-[#1D9BF0]` for social login

---

## Layout & Spacing

### Container Classes
- `max-w-6xl mx-auto px-4 sm:px-6` - Standard page container
- `max-w-3xl mx-auto` - Narrow content container
- `max-w-sm mx-auto` - Form container

### Common Layout Patterns

#### Page Wrapper
```html
<div class="flex flex-col min-h-screen overflow-hidden">
  <!-- Header -->
  <!-- Main content -->
</div>
```

#### Section Structure
```html
<section>
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="pt-32 pb-12 md:pt-40 md:pb-20">
      <!-- Content -->
    </div>
  </div>
</section>
```

#### Header Heights
- `h-16 md:h-20` - Standard header height

---

## Components

### Buttons

#### Button Classes
```css
.btn - px-6 py-3 font-medium inline-flex items-center justify-center rounded-full
.btn-sm - px-4 py-2 font-medium inline-flex items-center justify-center rounded-full
```

#### Button Examples
```html
<!-- Primary Button -->
<button class="btn text-white bg-blue-500 hover:bg-blue-600 w-full shadow-xs">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="btn text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600 shadow-xs">
  Secondary Action
</button>

<!-- Small Button -->
<button class="btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
  Small Action
</button>
```

### Forms

#### Form Input Classes
```css
.form-input - Standard text input styling
.form-textarea - Textarea styling
.form-select - Select dropdown styling
.form-checkbox - Checkbox styling
.form-radio - Radio button styling
```

#### Form Examples
```html
<!-- Text Input -->
<label class="block text-gray-500 text-sm font-medium mb-1" for="email">Email</label>
<input id="email" type="email" class="form-input w-full text-gray-800" required />

<!-- Checkbox -->
<label class="flex items-start">
  <input type="checkbox" class="form-checkbox mt-0.5" checked />
  <span class="text-sm text-gray-500 ml-3">
    I accept the <a class="underline hover:decoration-blue-500 underline-offset-2 hover:underline" href="#0">terms</a>
  </span>
</label>
```

### Navigation & Header

#### Standard Header Structure
```html
<header class="absolute w-full z-30">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16 md:h-20">
      <!-- Logo -->
      <div class="shrink-0 mr-4">
        <a class="block group" href="/" aria-label="Brand">
          <!-- Logo SVG -->
        </a>
      </div>
      
      <!-- Navigation -->
      <nav class="flex grow">
        <ul class="flex grow justify-end flex-wrap items-center">
          <li>
            <a class="font-medium text-gray-600 decoration-blue-500 decoration-2 underline-offset-2 hover:underline px-3 lg:px-5 py-2" href="/signin">
              Sign in
            </a>
          </li>
          <li class="ml-3">
            <a class="btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs" href="/signup">
              Join The Community
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</header>
```

### Cards & Content Blocks

#### Gallery/Card Patterns
```html
<!-- Card with hover effects -->
<a class="relative group hover:shadow-xl transition duration-150 ease-in-out" href="#0">
  <img class="w-full aspect-square object-cover" src="image.jpg" alt="Description" />
  
  <!-- Content overlay on hover -->
  <div class="md:hidden md:group-hover:block absolute bottom-0 left-0 right-0 p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 -mt-4 bg-linear-to-t from-gray-800 to-transparent opacity-80 pointer-events-none"></div>
    <!-- Content -->
    <div class="relative flex justify-between">
      <!-- Card content -->
    </div>
  </div>
</a>
```

### Category/Filter Buttons
```html
<button class="relative font-medium text-gray-800 text-sm pl-3 pr-1.5 py-1.5 border rounded-full inline-flex m-1.5" 
        :class="active ? 'bg-blue-100 border-blue-300': 'bg-white border-gray-200'">
  <div class="flex items-center justify-center">
    <span>Category Name</span>
    <span class="text-xs font-semibold px-1 py-px rounded-full ml-2"
          :class="active ? 'text-white bg-blue-300': 'text-gray-400 bg-gray-100'">
      Count
    </span>
  </div>
</button>
```

---

## Animations & Effects

### AOS (Animate On Scroll) Configuration
```javascript
AOS.init({
  once: true,
  disable: 'phone',
  duration: 700,
  easing: 'ease-out-cubic',
});
```

### Common Animation Classes
- `data-aos="fade-up"` - Fade in from bottom
- `data-aos="fade-down"` - Fade in from top
- `data-aos="fade-right"` - Fade in from left
- `data-aos="fade-left"` - Fade in from right
- `data-aos-delay="100"` - Add delay (100ms, 200ms, etc.)

### Transition Classes
- `transition duration-150 ease-in-out` - Standard transition
- `group-hover:` prefix for hover effects on parent elements

---

## Interactive Elements

### Alpine.js Patterns

#### Category Selection
```html
<div x-data="{ category: '0' }">
  <button @click="category = '1'" 
          :class="category === '1' ? 'active-classes' : 'inactive-classes'">
    Category 1
  </button>
  
  <div x-show="category === '1'">
    <!-- Conditional content -->
  </div>
</div>
```

#### Hamburger Menu (if needed)
```html
<button class="hamburger" :class="{ 'active': mobileNav }" @click="mobileNav = !mobileNav">
  <!-- Hamburger SVG with animation classes -->
</button>
```

---

## Responsive Design

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile, progressively enhance
- **Standard Breakpoints**: 
  - `sm:` (640px+)
  - `md:` (768px+) 
  - `lg:` (1024px+)
  - `xl:` (1280px+)

### Common Responsive Patterns
- `flex-col md:flex-row` - Stack on mobile, row on desktop
- `text-center md:text-left` - Center on mobile, left on desktop
- `hidden md:block` - Hide on mobile, show on desktop
- `max-w-sm mx-auto sm:max-w-none` - Constrain width on mobile

---

## Utility Classes & Patterns

### Custom Utility Classes

#### Scrollbar Hiding
```css
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```

#### Alpine.js Cloak
```css
[x-cloak] {
  display: none;
}
```

### Shadow System
- `shadow-xs` - Very subtle shadow for buttons/cards
- `hover:shadow-xl` - Dramatic shadow on hover

### Border & Dividers
```html
<!-- Horizontal divider with "or" text -->
<div class="flex items-center my-6">
  <div class="border-t border-gray-200 grow mr-3"></div>
  <div class="text-sm text-gray-500 italic">or</div>
  <div class="border-t border-gray-200 grow ml-3"></div>
</div>
```

---

## Performance & Accessibility

### Font Loading
- Use `font-display: fallback` for custom fonts
- Load Google Fonts with `display=fallback` parameter

### Accessibility
- Always include `aria-label` for icon-only buttons
- Use semantic HTML elements
- Ensure sufficient color contrast
- Support keyboard navigation

### Performance
- Use `defer` for non-critical JavaScript
- Optimize images with proper sizing
- Use CSS layers for proper cascade order

---

## Implementation Guidelines

### File Structure
```
/css
  /additional-styles
    custom-fonts.css
    theme.css
    utility-patterns.css
    range-slider.css
    toggle-switch.css
  style.css (main input file)
/js
  main.js
  /vendors
    alpinejs.min.js
    aos.js
    swiper-bundle.min.js
style.css (compiled output)
```

### Build Process
- **Development**: `npm run dev` (watch mode)
- **Production**: `npm run build` (optimized build)

### CSS Architecture
- Use `@layer` directives for proper cascade order
- Import custom styles after Tailwind base
- Utilize CSS custom properties for theme variables

---

## Best Practices

1. **Consistency**: Always use established component patterns
2. **Accessibility**: Include proper ARIA labels and semantic markup
3. **Performance**: Optimize animations and use efficient selectors
4. **Responsive**: Design mobile-first, enhance for larger screens
5. **Maintainability**: Use utility classes over custom CSS when possible
6. **User Experience**: Provide clear visual feedback for interactive elements

This design system provides a solid foundation for creating cohesive, professional interfaces that align with the Creative HTML template aesthetic while being adapted for the Party Games multiplayer web application.
