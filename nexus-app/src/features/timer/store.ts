import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SoundType = 'beep' | 'double-beep' | 'chime' | 'none';

export interface Interval {
    id: string;
    name: string;
    durationSeconds: number;
    soundType: SoundType;
    voiceOver: boolean;
    soundVolume: number | null; // null = use global
    ttsVolume: number | null;   // null = use global
}

export interface TimerPreset {
    id: string;
    name: string;
    intervals: Interval[];
    autoRepeat: boolean;
    masterVolume: number; // 0.0 to 1.0
    globalSoundVolume: number; // 0.0 to 1.0
    globalTTSVolume: number; // 0.0 to 1.0
}

const defaultPreset: TimerPreset = {
    id: 'default-tabata',
    name: 'Simple Tabata',
    intervals: [
        { id: '1', name: 'Work', durationSeconds: 20, soundType: 'beep', voiceOver: true, soundVolume: null, ttsVolume: null },
        { id: '2', name: 'Rest', durationSeconds: 10, soundType: 'double-beep', voiceOver: true, soundVolume: null, ttsVolume: null },
    ],
    autoRepeat: true,
    masterVolume: 1.0,
    globalSoundVolume: 1.0,
    globalTTSVolume: 1.0,
};

interface TimerState {
    // Persistence
    presets: TimerPreset[];
    activePresetId: string | null;

    // Runtime State
    currentIntervalIndex: number;
    isRunning: boolean;
    elapsedInInterval: number; // milliseconds
    intervalBaseline: number; // Time accumulated before current interval started

    // Actions
    addPreset: (preset: TimerPreset) => void;
    updatePreset: (id: string, updates: Partial<TimerPreset>) => void;
    deletePreset: (id: string) => void;
    duplicatePreset: (id: string, newId: string) => void;
    setActivePreset: (id: string) => void;

    setIsRunning: (isRunning: boolean) => void;
    resetTimer: () => void;
    tickTimer: (totalElapsedMs: number) => void;
    nextInterval: () => void;

    // Interval CRUD for Active Preset
    addInterval: (interval: Interval) => void;
    updateInterval: (intervalId: string, updates: Partial<Interval>) => void;
    deleteInterval: (intervalId: string) => void;
    duplicateInterval: (intervalId: string, newId: string) => void;
    moveInterval: (fromIndex: number, toIndex: number) => void;
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            presets: [defaultPreset],
            activePresetId: defaultPreset.id,

            currentIntervalIndex: 0,
            isRunning: false,
            elapsedInInterval: 0,
            intervalBaseline: 0,

            addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
            updatePreset: (id, updates) => set((state) => ({
                presets: state.presets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
            })),
            deletePreset: (id) => set((state) => {
                if (state.presets.length <= 1) return state; // Prevent deleting last preset
                const newPresets = state.presets.filter((p) => p.id !== id);
                // If we deleted the active preset, switch to the first available
                const newActiveId = state.activePresetId === id ? newPresets[0].id : state.activePresetId;
                return {
                    presets: newPresets,
                    activePresetId: newActiveId
                };
            }),
            duplicatePreset: (id, newId) => set((state) => {
                const preset = state.presets.find(p => p.id === id);
                if (!preset) return state;
                const newPreset: TimerPreset = { ...preset, id: newId, name: `${preset.name} Copy` };
                return { presets: [...state.presets, newPreset] };
            }),
            setActivePreset: (id) => set({ activePresetId: id, currentIntervalIndex: 0, elapsedInInterval: 0, intervalBaseline: 0 }),

            setIsRunning: (isRunning) => set({ isRunning }),

            resetTimer: () => set({
                isRunning: false,
                currentIntervalIndex: 0,
                elapsedInInterval: 0,
                intervalBaseline: 0
            }),

            tickTimer: (totalElapsedMs) => {
                const state = get();
                const activePreset = state.presets.find(p => p.id === state.activePresetId);
                if (!activePreset || !activePreset.intervals.length) return;

                const currentInterval = activePreset.intervals[state.currentIntervalIndex];
                const intervalDurationMs = currentInterval.durationSeconds * 1000;

                // Calculate time spent in current interval
                // intervalBaseline is the totalElapsedMs at the moment this interval started
                const timeInThisInterval = totalElapsedMs - state.intervalBaseline;

                if (timeInThisInterval >= intervalDurationMs) {
                    // Interval Finished
                    state.nextInterval();
                    // We need to re-calculate baseline for the NEW interval
                    // The "overshoot" should be accounted for? 
                    // New baseline = totalElapsedMs - (overshoot)
                    // But nextInterval just increments index.
                    // We need to update intervalBaseline to the exact detailed cut point?
                    // Ideally: intervalBaseline += intervalDurationMs
                    // This preserves drift correction!

                    // Check if nextInterval actually moved us or stopped us.
                    const freshState = get(); // State after nextInterval
                    if (freshState.isRunning && freshState.currentIntervalIndex !== state.currentIntervalIndex) {
                        // We moved to next interval (or looped)
                        set({ intervalBaseline: state.intervalBaseline + intervalDurationMs });
                        // Recalculate elapsed for new interval (should be small, approx 0 + overshoot)
                        const newElapsed = totalElapsedMs - (state.intervalBaseline + intervalDurationMs);
                        set({ elapsedInInterval: newElapsed });
                    } else {
                        // Stopped
                    }
                } else {
                    set({ elapsedInInterval: timeInThisInterval });
                }
            },

            nextInterval: () => {
                const state = get();
                const activePreset = state.presets.find(p => p.id === state.activePresetId);
                if (!activePreset) return;

                const nextIndex = state.currentIntervalIndex + 1;
                if (nextIndex < activePreset.intervals.length) {
                    set({ currentIntervalIndex: nextIndex, elapsedInInterval: 0 });
                } else if (activePreset.autoRepeat) {
                    set({ currentIntervalIndex: 0, elapsedInInterval: 0 });
                } else {
                    set({ isRunning: false, currentIntervalIndex: 0, elapsedInInterval: 0, intervalBaseline: 0 });
                }
            },

            addInterval: (interval) => set((state) => {
                const presets = state.presets.map(p => {
                    if (p.id === state.activePresetId) {
                        return { ...p, intervals: [...p.intervals, interval] };
                    }
                    return p;
                });
                return { presets };
            }),

            updateInterval: (intervalId, updates) => set((state) => {
                const presets = state.presets.map(p => {
                    if (p.id === state.activePresetId) {
                        return {
                            ...p,
                            intervals: p.intervals.map(i => i.id === intervalId ? { ...i, ...updates } : i)
                        };
                    }
                    return p;
                });
                return { presets };
            }),

            deleteInterval: (intervalId) => set((state) => {
                const presets = state.presets.map(p => {
                    if (p.id === state.activePresetId) {
                        return {
                            ...p,
                            intervals: p.intervals.filter(i => i.id !== intervalId)
                        };
                    }
                    return p;
                });
                return { presets };
            }),

            duplicateInterval: (intervalId, newId) => set((state) => {
                const presets = state.presets.map(p => {
                    if (p.id === state.activePresetId) {
                        const index = p.intervals.findIndex(i => i.id === intervalId);
                        if (index === -1) return p;

                        const original = p.intervals[index];
                        const duplicate: Interval = { ...original, id: newId };

                        const newIntervals = [...p.intervals];
                        newIntervals.splice(index + 1, 0, duplicate);

                        return {
                            ...p,
                            intervals: newIntervals
                        };
                    }
                    return p;
                });
                return { presets };
            }),

            moveInterval: (fromIndex, toIndex) => set((state) => {
                const presets = state.presets.map(p => {
                    if (p.id === state.activePresetId) {
                        if (toIndex < 0 || toIndex >= p.intervals.length) return p;

                        const newIntervals = [...p.intervals];
                        const [moved] = newIntervals.splice(fromIndex, 1);
                        newIntervals.splice(toIndex, 0, moved);

                        return { ...p, intervals: newIntervals };
                    }
                    return p;
                });
                return { presets };
            })
        }),
        {
            name: 'nexus-timer-storage',
            partialize: (state) => ({
                presets: state.presets,
                activePresetId: state.activePresetId
            }),
        }
    )
);
