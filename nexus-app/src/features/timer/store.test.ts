import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore } from './store';

describe('useTimerStore', () => {
    beforeEach(() => {
        useTimerStore.getState().resetTimer();
        useTimerStore.getState().setActivePreset('default-tabata');
        useTimerStore.setState({ isRunning: false, currentIntervalIndex: 0, elapsedInInterval: 0, intervalBaseline: 0 });
    });

    it('should initialize with default values', () => {
        const state = useTimerStore.getState();
        expect(state.currentIntervalIndex).toBe(0);
        expect(state.elapsedInInterval).toBe(0);
        expect(state.isRunning).toBe(false);
    });

    it('should calculate elapsed time correctly', () => {
        const { tickTimer, setIsRunning } = useTimerStore.getState();

        setIsRunning(true);
        // Simulate engine tick at 500ms
        tickTimer(500);

        expect(useTimerStore.getState().elapsedInInterval).toBe(500);
    });

    it('should advance to next interval when duration exceeded', () => {
        const { tickTimer, setIsRunning } = useTimerStore.getState();

        // Default interval 1 is 20s (20000ms)
        setIsRunning(true);

        // Tick slightly before end
        tickTimer(19900);
        expect(useTimerStore.getState().currentIntervalIndex).toBe(0);

        // Tick past end
        tickTimer(20100);

        const state = useTimerStore.getState();
        expect(state.currentIntervalIndex).toBe(1);
        // Baseline should have updated by adding previous interval duration (20000)
        // So elapsed = Total (20100) - Baseline (20000) = 100
        expect(state.elapsedInInterval).toBe(100);
    });

    it('should loop back to start if autoRepeat is true', () => {
        const { tickTimer, setIsRunning, presets, activePresetId } = useTimerStore.getState();
        // Assuming default preset has 2 intervals.
        const preset = presets.find(p => p.id === activePresetId)!;
        expect(preset.intervals.length).toBe(2);

        setIsRunning(true);

        // Complete interval 1 (20s)
        useTimerStore.setState({ elapsedInInterval: 20000, currentIntervalIndex: 0, intervalBaseline: 0 });
        tickTimer(20000); // Trigger transition
        // Should be at 1
        expect(useTimerStore.getState().currentIntervalIndex).toBe(1);

        // Complete interval 2 (10s) -> Total 30s
        // Baseline for index 1 is 20000.
        // Tick at 30100 (Total)
        useTimerStore.setState({ intervalBaseline: 20000 });
        tickTimer(30100); // 30100 - 20000 = 10100 > 10000

        // Should loop to 0
        expect(useTimerStore.getState().currentIntervalIndex).toBe(0);
        expect(useTimerStore.getState().elapsedInInterval).toBe(100); // Overshoot preserved
    });
});
