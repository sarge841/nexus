import { describe, it, expect, beforeEach } from 'vitest';
import { useMealMatcherStore } from './store';

describe('useMealMatcherStore', () => {
  beforeEach(() => {
    useMealMatcherStore.getState().resetCategoriesToDefault();
    useMealMatcherStore.getState().clearHistory();
  });

  it('should initialize with default categories', () => {
    const state = useMealMatcherStore.getState();
    expect(state.categories.length).toBeGreaterThan(5);
    expect(state.history.length).toEqual(0);
  });

  it('should start a session and shuffle enabled categories', () => {
    const store = useMealMatcherStore.getState();
    const success = store.startSession();
    expect(success).toBe(true);

    const updatedState = useMealMatcherStore.getState();
    expect(updatedState.reigningId).not.toBeNull();
    expect(updatedState.challengerId).not.toBeNull();
    expect(updatedState.stepIndex).toEqual(1);
    expect(updatedState.activeSubView).toEqual('match');
  });

  it('should log round winner into history feed immediately as choices occur', () => {
    // Enable 3 categories
    const store = useMealMatcherStore.getState();
    store.toggleAllCategories(false);
    store.toggleCategory('mexican');
    store.toggleCategory('pizza');
    store.toggleCategory('burgers');

    store.startSession();
    const state1 = useMealMatcherStore.getState();

    // Round 1 choice
    const winnerId1 = state1.reigningId!;
    store.selectWinner(winnerId1);

    const state2 = useMealMatcherStore.getState();
    expect(state2.history.length).toEqual(1);
    expect(state2.history[0].winnerName).toEqual(
      state2.categories.find((c) => c.id === winnerId1)?.name
    );
    expect(state2.history[0].isGameWinner).toBe(false);

    // Round 2 choice (Final round)
    const winnerId2 = state2.reigningId!;
    store.selectWinner(winnerId2);

    const state3 = useMealMatcherStore.getState();
    expect(state3.activeSubView).toEqual('result');
    expect(state3.history.length).toEqual(2);
    expect(state3.history[0].isGameWinner).toBe(true);
  });

  it('should support undo step and revert history feed entry', () => {
    const store = useMealMatcherStore.getState();
    store.startSession();

    const state1 = useMealMatcherStore.getState();
    const reigning1 = state1.reigningId;

    store.selectWinner(reigning1!);
    const state2 = useMealMatcherStore.getState();
    expect(state2.undoStack.length).toEqual(1);
    expect(state2.history.length).toEqual(1);

    store.undo();
    const state3 = useMealMatcherStore.getState();
    expect(state3.reigningId).toEqual(reigning1);
    expect(state3.undoStack.length).toEqual(0);
    expect(state3.history.length).toEqual(0);
  });

  it('should allow adding and removing custom categories', () => {
    const store = useMealMatcherStore.getState();
    store.addCustomCategory('Tapas Bar', '🥘');

    let state = useMealMatcherStore.getState();
    const customCat = state.categories.find((c) => c.name === 'Tapas Bar');
    expect(customCat).toBeDefined();
    expect(customCat?.emoji).toEqual('🥘');
    expect(customCat?.isCustom).toBe(true);

    store.removeCustomCategory(customCat!.id);
    state = useMealMatcherStore.getState();
    expect(state.categories.find((c) => c.name === 'Tapas Bar')).toBeUndefined();
  });
});
