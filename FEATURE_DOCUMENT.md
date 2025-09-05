# Party Games Web App - Feature Document

## Overview
A multiplayer party games webapp where players use their phones as controllers to play real-time games together. Sessions are hosted by players and accessed via invite codes/links.

## Technical Stack
- **Frontend**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Hosting**: Railway
- **Real-time**: WebSockets (Socket.io)
- **Mobile-first**: Responsive design optimized for phone controllers

## Core Features

### 1. Session Management
- **Host Creation**: Any user can create a new game session
- **Invite System**: Sessions accessible via:
  - Shareable link
  - 6-digit room code
- **Player Limits**: 2-20 players per session (game-dependent)
- **Privacy**: All sessions are private/invite-only
- **Guest Access**: Players join with display name only (no registration required)

### 2. Game Architecture
- **Modular Design**: Each game is a separate module for easy addition
- **Launch Game**: Agario-style game as the first implementation
- **One Game Per Session**: Each session runs a single game type
- **Real-time Gameplay**: Simultaneous multiplayer with low latency

### 3. Host Controls
- **Player Management**: 
  - View connected players
  - Kick players if needed
  - Start/stop games
- **Game Settings**:
  - Choose number of rounds/games per session
  - Configure game-specific settings
- **Session Control**: 
  - End session
  - Restart rounds

### 4. Player Experience (Mobile-First)
- **Controller Interface**: Phone acts as game controller
- **Responsive Design**: Optimized for mobile touch controls
- **Low Latency**: Minimal input delay for real-time games
- **Simple UI**: Clean, intuitive controls suitable for party settings
- **Connection Status**: Visual indicators for connection quality

### 5. Game Flow
1. **Lobby Phase**: Players join and wait for host to start
2. **Game Phase**: Active gameplay with real-time interactions  
3. **Results Phase**: Show scores/winners after each round
4. **Multi-Round**: Host can configure multiple games per session
5. **Final Leaderboard**: Overall session winners

### 6. Scoring System
- **Round Scoring**: Points awarded per game/round
- **Session Leaderboard**: Cumulative scores across multiple rounds
- **Real-time Updates**: Live score updates during gameplay
- **Winner Announcement**: Clear victory screens

## Game #1: Agario-Style Game

### Game Mechanics
- **Objective**: Grow by consuming pellets and smaller players
- **Controls**: Touch/drag to move player circle
- **Real-time**: Simultaneous multiplayer movement
- **Elimination**: Smaller players absorbed by larger ones
- **Duration**: Configurable time limit (2-5 minutes per round)

### Mobile Controls
- **Movement**: Touch and drag anywhere on screen
- **Visual Feedback**: Clear player identification with colors/names
- **Zoom**: Auto-zoom based on player size
- **Minimap**: Small overview map showing all players

### Game Features
- **Player Spawning**: Random safe spawn locations
- **Pellet Generation**: Continuous food spawning
- **Size Mechanics**: Mathematical growth system
- **Collision Detection**: Accurate player-to-player interactions
- **Spectator Mode**: Eliminated players can watch remainder

## Database Schema (Initial)

### Sessions Table
- id (UUID, primary key)
- host_id (text)
- room_code (text, 6 digits)
- game_type (text)
- max_players (integer)
- status (enum: waiting, playing, finished)
- settings (JSONB)
- created_at (timestamp)
- updated_at (timestamp)

### Players Table
- id (UUID, primary key)
- session_id (UUID, foreign key)
- display_name (text)
- is_host (boolean)
- connection_status (enum: connected, disconnected)
- joined_at (timestamp)

### Game_Results Table
- id (UUID, primary key)
- session_id (UUID, foreign key)
- player_id (UUID, foreign key)
- round_number (integer)
- score (integer)
- placement (integer)
- game_data (JSONB)
- created_at (timestamp)

## API Endpoints (REST + WebSocket)

### REST Endpoints
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:code/join` - Join session with code
- `GET /api/sessions/:id` - Get session details
- `DELETE /api/sessions/:id` - End session (host only)

### WebSocket Events
- `player:join` - Player joins session
- `player:leave` - Player leaves session  
- `player:kick` - Host kicks player
- `game:start` - Host starts game
- `game:move` - Player movement input
- `game:state` - Broadcast game state updates
- `game:end` - Round/game completion

## Non-Functional Requirements
- **Performance**: <50ms input latency for real-time games
- **Scalability**: Support 100+ concurrent sessions
- **Reliability**: Graceful handling of player disconnections
- **Security**: Input validation, rate limiting, session isolation
- **Mobile UX**: Touch-optimized with large tap targets
- **Browser Support**: Modern mobile browsers (iOS Safari, Chrome)

## Future Considerations
- Additional game modules (trivia, drawing, voting games)
- Player statistics and history
- Customizable themes/skins
- Tournament brackets
- Replay system
