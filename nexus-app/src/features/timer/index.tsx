import { useState, useEffect, useRef } from 'react';
import { useTimerStore } from './store';
import { useTimerEngine } from './hooks/useTimerEngine';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { IntervalList } from './components/IntervalList';
import { PresetManager } from './components/PresetManager';
import { useAudio } from '../../hooks/useAudio';
import { List } from 'lucide-react';

export const TimerFeature = () => {
    const { isRunning, tickTimer, resetTimer, activePresetId, presets, currentIntervalIndex } = useTimerStore();
    const { playSound, speak } = useAudio();
    const previousIntervalIndexRef = useRef(currentIntervalIndex);
    const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);

    const activePreset = presets.find(p => p.id === activePresetId);

    const { reset } = useTimerEngine(isRunning, (elapsed) => {
        tickTimer(elapsed);
    });

    const handleReset = () => {
        resetTimer();
        reset();
    };

    // Audio Side Effects
    useEffect(() => {
        if (!activePreset || !isRunning) return;

        // Check if index changed
        if (currentIntervalIndex !== previousIntervalIndexRef.current) {
            const interval = activePreset.intervals[currentIntervalIndex];
            if (interval) {
                // Determine final volumes
                const master = activePreset.masterVolume ?? 1.0;
                const finalSoundVolume = master * (interval.soundVolume ?? (activePreset.globalSoundVolume ?? 1.0));
                const finalTTSVolume = master * (interval.ttsVolume ?? (activePreset.globalTTSVolume ?? 1.0));

                playSound(interval.soundType, finalSoundVolume);
                if (interval.voiceOver) {
                    speak(interval.name, finalTTSVolume);
                }
            }
            previousIntervalIndexRef.current = currentIntervalIndex;
        }
    }, [currentIntervalIndex, isRunning, activePresetId, activePreset, playSound, speak]);

    // Reset ref on stop/reset
    useEffect(() => {
        if (!isRunning && currentIntervalIndex === 0) {
            previousIntervalIndexRef.current = 0;
        }
    }, [isRunning, currentIntervalIndex]);

    return (
        <div className="flex flex-col h-full space-y-6 relative">
            <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Workout</span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs " title={activePreset?.name}>
                        {activePreset?.name || 'Unknown Preset'}
                    </h2>
                </div>
                <button
                    onClick={() => setIsPresetManagerOpen(true)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
                    title="Switch Workout"
                >
                    <List className="w-6 h-6" />
                </button>
            </div>

            <TimerDisplay />
            <Controls onReset={handleReset} />
            <IntervalList />

            {isPresetManagerOpen && (
                <PresetManager onClose={() => setIsPresetManagerOpen(false)} />
            )}
        </div>
    );
};
