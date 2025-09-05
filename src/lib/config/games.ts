import type { GameConfig } from '../api/types';

export const AVAILABLE_GAMES: GameConfig[] = [
  {
    name: 'tap-15',
    displayName: 'Tap Master',
    description: 'Tap as fast as you can in 15 seconds! Who has the fastest fingers?',
    minPlayers: 2,
    maxPlayers: 20,
    duration: 15, // seconds
    category: 'speed',
    icon: '👆',
    defaultSettings: {
      gameTime: 15,
      tapTarget: 'screen',
      showOtherScores: false
    }
  },
  {
    name: 'agario',
    displayName: 'Grow & Survive',
    description: 'Grow by eating pellets and smaller players. Last one standing wins!',
    minPlayers: 2,
    maxPlayers: 10,
    duration: 180, // 3 minutes
    category: 'survival',
    icon: '🔵',
    defaultSettings: {
      worldSize: { width: 2000, height: 2000 },
      gameTime: 180,
      pelletCount: 200,
      spawnSafeZone: 100
    }
  }
];

export function getGameById(gameId: string): GameConfig | undefined {
  return AVAILABLE_GAMES.find(game => game.name === gameId);
}

export function getGamesByCategory(category: string): GameConfig[] {
  return AVAILABLE_GAMES.filter(game => game.category === category);
}

export const GAME_CATEGORIES = {
  speed: {
    name: 'Speed Games',
    description: 'Fast-paced games testing reflexes and speed',
    color: 'bg-red-500'
  },
  survival: {
    name: 'Survival Games', 
    description: 'Competitive games where you outlast opponents',
    color: 'bg-green-500'
  },
  puzzle: {
    name: 'Puzzle Games',
    description: 'Mind-bending challenges and brain teasers',
    color: 'bg-purple-500'
  },
  party: {
    name: 'Party Games',
    description: 'Fun social games perfect for groups',
    color: 'bg-blue-500'
  }
} as const;
