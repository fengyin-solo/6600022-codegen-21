export type BoardState = number[][];

export interface Move {
  row: number;
  col: number;
  player: number; // 1=black, 2=white
  timestamp: number;
}

export interface GameRecord {
  id: string;
  moves: Move[];
  winner: number | null; // 0=draw, 1=black, 2=white, null=ongoing
  createdAt: string;
  duration: number;
}

export interface AIConfig {
  depth: number;
  enabled: boolean;
  playerColor: number; // AI plays as this color
}

export type GameStatus = 'idle' | 'playing' | 'finished' | 'replaying';

// --- Achievement System ---

export type AchievementCategory = 'first_win' | 'consecutive_wins' | 'endgame' | 'review';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  threshold: number;
}

export interface UnlockRecord {
  badgeId: string;
  unlockedAt: number;
}

export interface AchievementStats {
  firstWinDone: boolean;
  currentWinStreak: number;
  maxWinStreak: number;
  endgamesCompleted: number;
  reviewCount: number;
  unlockedBadges: string[];
  recentUnlocks: UnlockRecord[];
}

// --- Endgame (残局) Puzzles ---

export interface PuzzleStone {
  row: number;
  col: number;
  player: number;
}

export interface EndgamePuzzle {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  stones: PuzzleStone[];
  playerColor: number;
}
