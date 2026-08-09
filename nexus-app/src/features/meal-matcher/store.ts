import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { FoodCategory, HistoryEntry, MatchStepSnapshot, SubView } from './types';
import { DEFAULT_CATEGORIES } from './defaultCategories';

// Utility helper to shuffle array randomly (Fisher-Yates shuffle)
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface MealMatcherState {
  // Persistent State
  categories: FoodCategory[];
  history: HistoryEntry[];

  // Session State
  currentGameId: string | null;
  reigningId: string | null;
  challengerId: string | null;
  queueRemaining: string[];
  stepIndex: number;
  totalSteps: number;
  undoStack: MatchStepSnapshot[];
  winnerCategory: FoodCategory | null;
  activeSubView: SubView;

  // Actions
  setActiveSubView: (view: SubView) => void;
  startSession: () => boolean;
  selectWinner: (winnerId: string) => void;
  undo: () => void;
  restartSession: () => void;
  
  // Category Management
  toggleCategory: (id: string) => void;
  toggleAllCategories: (enable: boolean) => void;
  addCustomCategory: (name: string, emoji: string) => void;
  removeCustomCategory: (id: string) => void;
  resetCategoriesToDefault: () => void;

  // History Management
  clearHistory: () => void;
}

export const useMealMatcherStore = create<MealMatcherState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      history: [],

      currentGameId: null,
      reigningId: null,
      challengerId: null,
      queueRemaining: [],
      stepIndex: 0,
      totalSteps: 0,
      undoStack: [],
      winnerCategory: null,
      activeSubView: 'match',

      setActiveSubView: (view) => set({ activeSubView: view }),

      startSession: () => {
        const { categories } = get();
        const enabledCategories = categories.filter((c) => c.enabled);

        if (enabledCategories.length < 2) {
          set({ activeSubView: 'settings' });
          return false;
        }

        const shuffledIds = shuffle(enabledCategories.map((c) => c.id));
        const reigningId = shuffledIds[0];
        const challengerId = shuffledIds[1];
        const queueRemaining = shuffledIds.slice(2);
        const totalSteps = shuffledIds.length - 1;
        const currentGameId = nanoid();

        set({
          currentGameId,
          reigningId,
          challengerId,
          queueRemaining,
          stepIndex: 1,
          totalSteps,
          undoStack: [],
          winnerCategory: null,
          activeSubView: 'match',
        });
        return true;
      },

      selectWinner: (winnerId) => {
        const {
          currentGameId,
          reigningId,
          challengerId,
          queueRemaining,
          stepIndex,
          undoStack,
          categories,
          history,
        } = get();

        if (!reigningId || !challengerId) return;

        const reigningCat = categories.find((c) => c.id === reigningId);
        const challengerCat = categories.find((c) => c.id === challengerId);
        const winnerCat = categories.find((c) => c.id === winnerId);
        const loserCat = winnerId === reigningId ? challengerCat : reigningCat;

        const isGameWinner = queueRemaining.length === 0;

        const liveRoundEntry: HistoryEntry = {
          id: nanoid(),
          timestamp: Date.now(),
          gameId: currentGameId || nanoid(),
          roundNumber: stepIndex,
          winnerName: winnerCat?.name || '',
          winnerEmoji: winnerCat?.emoji || '🍽️',
          loserName: loserCat?.name || '',
          loserEmoji: loserCat?.emoji || '🍽️',
          isGameWinner,
        };

        const currentSnapshot: MatchStepSnapshot = {
          reigningId,
          challengerId,
          queueRemaining: [...queueRemaining],
          stepIndex,
          historySnapshot: [...history],
        };

        const newUndoStack = [...undoStack, currentSnapshot];
        const updatedHistory = [liveRoundEntry, ...history];

        if (isGameWinner) {
          // Tournament complete!
          set({
            history: updatedHistory,
            winnerCategory: winnerCat || null,
            activeSubView: 'result',
            undoStack: newUndoStack,
          });
        } else {
          const nextChallengerId = queueRemaining[0];
          const nextQueue = queueRemaining.slice(1);

          set({
            reigningId: winnerId,
            challengerId: nextChallengerId,
            queueRemaining: nextQueue,
            stepIndex: stepIndex + 1,
            history: updatedHistory,
            undoStack: newUndoStack,
          });
        }
      },

      undo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return;

        const lastSnapshot = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);

        set({
          reigningId: lastSnapshot.reigningId,
          challengerId: lastSnapshot.challengerId,
          queueRemaining: lastSnapshot.queueRemaining,
          stepIndex: lastSnapshot.stepIndex,
          history: lastSnapshot.historySnapshot,
          undoStack: newUndoStack,
          winnerCategory: null,
          activeSubView: 'match',
        });
      },

      restartSession: () => {
        get().startSession();
      },

      toggleCategory: (id) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
          ),
        })),

      toggleAllCategories: (enable) =>
        set((state) => ({
          categories: state.categories.map((c) => ({ ...c, enabled: enable })),
        })),

      addCustomCategory: (name, emoji) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        const newCategory: FoodCategory = {
          id: `custom_${nanoid()}`,
          name: trimmedName,
          emoji: emoji.trim() || '🍽️',
          isCustom: true,
          enabled: true,
        };
        set((state) => ({
          categories: [newCategory, ...state.categories],
        }));
      },

      removeCustomCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      resetCategoriesToDefault: () => set({ categories: DEFAULT_CATEGORIES }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'nexus-meal-matcher-storage',
      partialize: (state) => ({
        categories: state.categories,
        history: state.history,
      }),
    }
  )
);
