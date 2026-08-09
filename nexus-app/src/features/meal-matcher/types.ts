export interface FoodCategory {
  id: string;
  name: string;
  emoji: string;
  isCustom?: boolean;
  enabled: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  gameId: string;
  roundNumber: number;
  winnerName: string;
  winnerEmoji: string;
  loserName: string;
  loserEmoji: string;
  isGameWinner?: boolean;
}

export interface MatchStepSnapshot {
  reigningId: string;
  challengerId: string;
  queueRemaining: string[];
  stepIndex: number;
  historySnapshot: HistoryEntry[];
}

export type SubView = 'match' | 'result' | 'settings' | 'history';
