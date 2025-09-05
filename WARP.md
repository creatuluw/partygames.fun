# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This is a **multiplayer party games web application** where players use their phones as controllers to play real-time games together. The primary game is an Agario-style experience with WebSocket-based real-time multiplayer functionality.

**Key Architecture**: SvelteKit frontend + PostgreSQL database + Socket.io WebSockets + PostgREST API

## Essential Commands

### Development
```bash
npm run dev              # Start development server (port 3000)
npm run build           # Build for production
npm run preview         # Preview production build
```

### Database Setup
```bash
npm run setup-db        # Initialize database schema
```

### Testing
```bash
npm run test            # Run all tests
npm run test:unit       # Run unit tests with Vitest
npm run test:e2e        # Run E2E tests with Playwright
npm run check           # Type check with svelte-check
npm run check:watch     # Type check in watch mode
```

### Testing Individual Components
```bash
# Run specific test files
npx vitest src/demo.spec.ts
npx playwright test e2e/demo.test.ts

# Run tests in specific directories
npx vitest src/lib/components/
```

## Architecture Overview

### Real-time Multiplayer System
- **Frontend**: SvelteKit with TypeScript handles UI and client-side game state
- **WebSocket Layer**: Socket.io manages real-time communication between players
- **Database**: PostgreSQL stores sessions, players, and game results
- **API**: PostgREST provides REST endpoints for session management

### Key Architectural Components

1. **Session Management** (`src/lib/services/sessionService.ts`)
   - Handles creating/joining game sessions
   - Manages client state through Svelte stores
   - Coordinates WebSocket connections

2. **WebSocket Server** (`src/lib/server/websocket.ts`)
   - Core real-time multiplayer engine
   - Handles player connections, game events, and state broadcasting
   - Manages session rooms and player tracking

3. **API Client** (`src/lib/api/postgrest.ts`)
   - Interfaces with PostgREST for database operations
   - Handles session creation, player management, and game results

4. **Type Definitions** (`src/lib/api/types.ts`)
   - Comprehensive TypeScript interfaces for all game entities
   - WebSocket event types and client state management
   - Game-specific types (Agario player mechanics, etc.)

### Screen-Based Architecture
The app uses a screen-based navigation system:
- **HomeScreen**: Session creation and joining
- **LobbyScreen**: Player management and game start
- **GameScreen**: Active gameplay interface  
- **ResultsScreen**: Score display and round management

### Database Schema
The PostgreSQL database uses three core tables:
- `sessions`: Game sessions with room codes and settings
- `players`: Player information and connection status
- `game_results`: Round scores and player performance

Key database functions:
- `create_session()`: Generates unique room codes
- `join_session()`: Validates and adds players
- `get_session_details()`: Retrieves session info with player counts

## Mobile-First Design

This app is designed **mobile-first** as phones act as game controllers:
- Touch-optimized UI with large tap targets (44px minimum)
- Responsive design using Tailwind CSS
- Real-time input handling for game controls
- Auto-zoom and visual feedback for gameplay

## Environment Setup

Required environment variables in `.env`:
```
DATABASE_URL=your_postgresql_connection_string
POSTGREST_URL=your_postgrest_api_endpoint
```

## Game Development Patterns

### Adding New Games
1. Create game component in `src/lib/components/games/`
2. Define game-specific types in `src/lib/api/types.ts`
3. Add WebSocket event handlers in `src/lib/server/websocket.ts`
4. Update session service for game-specific settings

### WebSocket Event Flow
All real-time events follow this pattern:
1. Client sends action via `gameClient` 
2. Server processes in `websocket.ts`
3. Server broadcasts state updates to all session players
4. Clients update UI based on received events

### State Management
- Global client state managed through Svelte stores
- WebSocket connection status and game state are reactive
- Screen navigation handled through `clientState.currentScreen`

## Development Workflow

### Working with Real-time Features
1. Start development server: `npm run dev`
2. WebSocket server initializes automatically on port 3000
3. Test multiplayer by opening multiple browser tabs
4. Use browser dev tools to monitor WebSocket connections

### Database Development
1. Modify schema in `migrations/` directory
2. Run `npm run setup-db` to apply changes
3. Update TypeScript types to match schema changes
4. Test API endpoints through PostgREST

### Testing Strategy
- **Unit tests**: Component logic and utility functions
- **E2E tests**: Full multiplayer game sessions
- **Manual testing**: Multiple devices for real-world multiplayer testing

## Common Debugging

### WebSocket Issues
- Check browser console for connection errors
- Verify WebSocket server initialization in terminal
- Monitor network tab for real-time message flow

### Database Connection
- Ensure PostgreSQL is running and accessible
- Verify `DATABASE_URL` environment variable
- Check PostgREST endpoint connectivity

### Mobile-specific Issues
- Test on actual mobile devices, not just browser dev tools
- Check touch event handling and viewport scaling
- Verify real-time input latency on mobile networks

## Performance Considerations

- WebSocket events should be < 50ms latency for real-time gameplay
- Database queries use indexed lookups on room_code and session_id
- Game state updates are broadcast efficiently to session participants only
- Mobile UI optimized for 60fps smooth animations during gameplay

---

## 🎨 UI/UX Design System Rules

### Typography Standards
- **ALWAYS** use design system heading classes: `.h1`, `.h2`, `.h3`, `.h4` 
- **ALWAYS** use `font-cabinet-grotesk` for headings and display text
- **ALWAYS** use `font-inter` (default) for body text and UI elements  
- **NEVER** use inline `font-family`, `font-size`, or `font-weight` styles
- **ALWAYS** apply `antialiased` class to body elements for smooth text rendering
- **ALWAYS** use `tracking-tight` for improved readability in headings

### Color System Rules
- **ALWAYS** use design system color classes: `bg-blue-500`, `text-gray-800`, `border-gray-200`
- **NEVER** use hardcoded colors like `#3B82F6`, `rgb()`, `rgba()`, `hsl()`, `hsla()`
- **Primary brand color**: `bg-blue-500` / `text-blue-500` / `border-blue-500`
- **Hover states**: `hover:bg-blue-600` / `hover:text-blue-600`
- **Light backgrounds**: `bg-gray-50`, `bg-gray-100`
- **Text colors**: `text-gray-800` (primary), `text-gray-500` (secondary), `text-gray-400` (muted)
- **ONLY exception**: Use `transparent`, `currentColor`, `inherit` when semantically appropriate

### Button System Rules
- **ALWAYS** use design system button classes:
  - Primary: `btn-primary` or `btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs`
  - Secondary: `btn-secondary` or `btn text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600 shadow-xs`
  - Small: `btn-small` or `btn-sm text-white bg-blue-500 hover:bg-blue-600 shadow-xs`
- **ALWAYS** include `type` attribute on buttons (`type="button"` or `type="submit"`)
- **ALWAYS** include `transition duration-150 ease-in-out` for interactive states
- **ALWAYS** use `aria-label` for icon-only buttons
- **NEVER** create custom button styles - use design system variants

### Form System Rules  
- **ALWAYS** use design system form classes:
  - Inputs: `form-input w-full text-gray-800`
  - Textareas: `form-textarea w-full text-gray-800`  
  - Selects: `form-select w-full text-gray-800`
  - Checkboxes: `form-checkbox`
  - Radio buttons: `form-radio`
- **ALWAYS** use proper label structure:
  ```html
  <label class="block text-gray-500 text-sm font-medium mb-1" for="inputId">
    Label Text
  </label>
  <input id="inputId" class="form-input w-full text-gray-800" />
  ```
- **ALWAYS** include `for` attribute on labels linking to input `id`
- **ALWAYS** use `placeholder-gray-400` for placeholder text
- **ALWAYS** use `focus:border-blue-500` for focus states

### Layout & Container Rules
- **ALWAYS** use design system container classes:
  - Standard: `container-standard` or `max-w-6xl mx-auto px-4 sm:px-6`
  - Narrow: `container-narrow` or `max-w-3xl mx-auto`  
  - Form: `container-form` or `max-w-sm mx-auto`
- **ALWAYS** use standard section spacing:
  - `section-standard` or `pt-32 pb-12 md:pt-40 md:pb-20`
- **ALWAYS** use proper page wrapper structure:
  ```html
  <div class="page-wrapper">
    <!-- Header -->
    <main class="page-main">
      <!-- Content -->
    </main>
    <!-- Footer -->
  </div>
  ```
- **ALWAYS** use header height: `h-16 md:h-20`

### Card & Component Rules
- **ALWAYS** use design system card classes:
  - Basic: `card-basic` 
  - Hoverable: `card-hoverable`
  - Gallery: `card-gallery` with `card-overlay` and `card-backdrop`
- **ALWAYS** use proper hover effects: `group hover:shadow-xl transition duration-150 ease-in-out`
- **ALWAYS** use `overflow-hidden` for card containers with rounded corners

---

## 🛠️ Component Development Rules

### Component Generation Rules
- **ALWAYS** generate new components using: `npm run generate:component <name> <type> src/lib/components`
- **AVAILABLE types**: `button`, `card`, `input`, `header`, `page`, `section`
- **ALWAYS** start with generated templates, then customize as needed
- **NEVER** create components from scratch without using the generator first
- **ALWAYS** follow the generated component structure and patterns

### Component Structure Rules
- **ALWAYS** use TypeScript for component props
- **ALWAYS** export props with descriptive names and default values
- **ALWAYS** use reactive statements (`$:`) for computed values
- **ALWAYS** include proper prop documentation:
  ```typescript
  export let variant: 'primary' | 'secondary' | 'small' = 'primary';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' = 'button';
  ```
- **ALWAYS** use `<slot />` for flexible content injection
- **ALWAYS** follow the design system CSS class patterns

### Svelte-Specific Rules
- **ALWAYS** use `bind:value` for form inputs
- **ALWAYS** use `{#if}`, `{#each}`, `{:else}` for conditional rendering
- **ALWAYS** use `on:click`, `on:submit`, etc. for event handling
- **ALWAYS** use `class:active={condition}` for conditional classes
- **NEVER** use inline event handlers in HTML attributes
- **ALWAYS** use `<svelte:head>` for page-specific meta tags

---

## 🎯 Accessibility Rules

### Required Accessibility Standards
- **ALWAYS** include `alt` attributes on all images with descriptive text
- **ALWAYS** use `aria-label` on icon-only buttons and interactive elements
- **ALWAYS** use proper semantic HTML elements (`button`, `nav`, `main`, `section`, `header`)
- **ALWAYS** ensure proper heading hierarchy (h1 → h2 → h3 → h4)
- **ALWAYS** use `for` attributes on labels associated with form controls
- **ALWAYS** include `aria-describedby` for form validation messages
- **ALWAYS** ensure keyboard navigation works for all interactive elements
- **ALWAYS** maintain color contrast ratios (use design system colors)

### Focus Management Rules
- **ALWAYS** use `focus-visible:ring-2 ring-blue-500 ring-offset-2` for focus indicators
- **NEVER** remove focus outlines without providing alternative indicators
- **ALWAYS** manage focus appropriately in modals and dynamic content

---

## 🔧 Development Workflow Rules

### Before Writing Code
- **ALWAYS** run `npm run design:validate` to check current compliance
- **ALWAYS** generate components using the automated tools
- **ALWAYS** import design system CSS: `@import './lib/styles/design-system.css';`

### During Development  
- **ALWAYS** use design system CSS classes instead of custom styles
- **ALWAYS** follow the established component patterns
- **ALWAYS** test components in both desktop and mobile viewports
- **ALWAYS** validate forms and interactive elements work properly

### Before Committing
- **ALWAYS** run `npm run design:check` to validate compliance
- **ALWAYS** run `npm run design:fix` to auto-fix issues
- **ALWAYS** ensure all validation passes before committing
- The pre-commit hook will automatically validate design system compliance

### Code Review Standards
- **VERIFY** design system compliance in all new components
- **VERIFY** accessibility standards are met
- **VERIFY** responsive design works on mobile and desktop
- **VERIFY** proper TypeScript types are used

---

## 🚀 Design System Automation

### Essential Design System Commands
```bash
# Generate new component following design system
npm run generate:component MyComponent button src/lib/components

# Validate design system compliance
npm run design:validate

# Auto-fix design system issues
npm run design:fix

# Full check (lint + format + validate)
npm run design:check

# Lint design system compliance
npm run design:lint

# Format component files
npm run design:format
```

### Available Component Templates
- `button` - Buttons with design system classes and accessibility
- `card` - Card components with hover effects and proper structure
- `input` - Form inputs following design guidelines and validation
- `header` - Navigation headers with proper responsive structure
- `page` - Full page layouts with design system containers
- `section` - Content sections with standard spacing patterns

### Design System CSS Classes
- **Typography**: `.h1`, `.h2`, `.h3`, `.h4`, `font-cabinet-grotesk`, `font-inter`
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-small`
- **Forms**: `.form-input`, `.form-textarea`, `.form-select`, `.form-checkbox`
- **Layout**: `.container-standard`, `.container-narrow`, `.container-form`, `.section-standard`
- **Cards**: `.card-basic`, `.card-hoverable`, `.card-gallery`
- **Utilities**: `.page-wrapper`, `.page-main`, `.no-scrollbar`

---

## 🚨 Validation & Quality Gates

### Automated Validation
- **Pre-commit hook** automatically validates design system compliance
- **ESLint rules** enforce design system standards during development
- **CSS validation** ensures proper class usage and prevents hardcoded styles
- **Accessibility checks** verify ARIA attributes, alt text, and semantic HTML

### Common Issues Prevention
- **NEVER** use hardcoded colors - always use design system classes
- **NEVER** create buttons without proper design system classes
- **NEVER** forget accessibility attributes (alt, aria-label, for)
- **NEVER** use inline font styles - use design system typography
- **NEVER** skip validation before committing code

### Error Resolution Process
1. Run `npm run design:validate` to see issues
2. Run `npm run design:fix` to auto-fix what's possible  
3. Manually fix remaining issues using design system classes
4. Re-validate until all checks pass
5. Commit changes

### Definition of "Done" for UI Components
- ✅ Generated using automated tools or following templates
- ✅ Uses design system CSS classes exclusively  
- ✅ Passes all design system validation checks
- ✅ Includes proper accessibility attributes
- ✅ Works responsively on mobile and desktop
- ✅ Follows established component patterns
- ✅ Has proper TypeScript types and props
- ✅ Includes comprehensive error handling

---

## 📚 Design System Reference Files

### Primary Documentation
- **UI_DESIGN_GUIDELINES.md** - Complete design system reference
- **DESIGN_SYSTEM_AUTOMATION.md** - How to use automation tools
- **src/lib/styles/design-system.css** - All available CSS classes
- **scripts/generate-component.js** - Component generation templates

### Key Automation Files
- **Component Generator**: `scripts/generate-component.js`  
- **Validation Script**: `scripts/validate-design-system.js`
- **ESLint Rules**: `.eslintrc-design-system.js`
- **Pre-commit Hook**: `.husky/pre-commit`

---

## 🚀 Deployment Workflow

### Standard Deployment Process
**ALWAYS follow this exact sequence when deploying changes to Railway:**

#### 1. Development & Testing
```bash
# Make your changes to components/features
# Test locally
npm run dev

# Validate design system compliance
npm run design:validate

# Build and test
npm run build
```

#### 2. Commit Changes
```bash
# Stage all changes
git add .

# Commit with descriptive message following our pattern
git commit -m "✨ Feature: [Brief description]

🔧 Changes:
- [Specific change 1]
- [Specific change 2]
- [Specific change 3]

🎮 UI/UX:
- [Any UI improvements]
- [Design system updates]

[Additional context if needed]"
```

#### 3. Push to GitHub
```bash
# Push to trigger Railway deployment
git push origin master
```

#### 4. Railway Deployment
```bash
# Check Railway status
railway status

# Monitor deployment (optional)
railway logs

# Deploy manually if auto-deploy didn't trigger
railway up
```

### Commit Message Templates

#### Feature Addition
```
✨ Feature: Add [feature name]

🔧 Changes:
- Add [component/feature]
- Update [related files]
- Implement [functionality]

🎮 UI/UX:
- [Design improvements]
- [User experience updates]
```

#### Bug Fix
```
🐛 Fix: [Brief description of bug fixed]

🔧 Changes:
- Fix [specific issue]
- Update [affected components]
- Resolve [problem]

🎯 Impact:
- [What this fixes for users]
```

#### Design System Update
```
🎨 Design: [Design change description]

🔧 Changes:
- Update design system [component/pattern]
- Rebuild [affected components]
- Standardize [design elements]

🚀 Improvements:
- [Design consistency]
- [User experience]
```

#### Solo Testing Feature
```
🧪 Solo Testing: Add [game/feature] testing mode

🔧 Changes:
- Allow games to be played with just 1 player for testing
- Update game configuration [details]
- Add test mode indicators

🎮 Features:
- Solo testing functionality for development
```

### Railway Deployment Notes
- **Auto-deployment**: Railway automatically deploys when changes are pushed to `master`
- **Build time**: Typically 2-3 minutes for full deployment
- **WebSocket server**: Automatically restarts with new deployment
- **Environment**: Production environment with full database connectivity
- **Monitoring**: Use `railway logs` to monitor deployment progress

### Emergency Deployment
If you need to deploy urgently:
```bash
git add .
git commit -m "🚨 Hotfix: [urgent fix description]"
git push origin master
railway up  # Force immediate deployment
```

### Post-Deployment Checklist
- ✅ Verify the app loads correctly
- ✅ Test WebSocket connections work
- ✅ Check game session creation/joining
- ✅ Verify mobile responsiveness
- ✅ Test multiplayer functionality
- ✅ Confirm design system is working properly

**This workflow ensures consistent, reliable deployments and maintains our codebase quality.**
