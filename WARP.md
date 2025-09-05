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
