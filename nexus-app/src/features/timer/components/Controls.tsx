import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';
import { useTimerStore } from '../store';
import { useState } from 'react';

interface ControlsProps {
    onReset: () => void;
}

export const Controls = ({ onReset }: ControlsProps) => {
    const { isRunning, setIsRunning, activePresetId, presets, updatePreset } = useTimerStore();
    const [showSettings, setShowSettings] = useState(false);

    const activePreset = presets.find(p => p.id === activePresetId);

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-6">
                <button
                    onClick={onReset}
                    className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Reset Header"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="p-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform active:scale-95 transition-all"
                    aria-label={isRunning ? 'Pause' : 'Start'}
                >
                    {isRunning ? (
                        <Pause className="w-8 h-8 fill-current" />
                    ) : (
                        <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                </button>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-4 rounded-full transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    aria-label="Timer Settings"
                >
                    <Settings2 className="w-6 h-6" />
                </button>
            </div>

            {/* Inline Settings Panel */}
            {showSettings && activePreset && (
                <div className="mt-6 w-full max-w-xs bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-sm animate-in slide-in-from-top-2 fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Auto-Repeat</span>
                        <button
                            onClick={() => updatePreset(activePreset.id, { autoRepeat: !activePreset.autoRepeat })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${activePreset.autoRepeat ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${activePreset.autoRepeat ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Master Volume */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Master Volume</span>
                                <span className="text-gray-500">{Math.round((activePreset.masterVolume ?? 1.0) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={activePreset.masterVolume ?? 1.0}
                                onChange={(e) => updatePreset(activePreset.id, { masterVolume: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                            />
                        </div>

                        {/* Sound Volume */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sound Effects</span>
                                <span className="text-xs text-gray-400">{Math.round((activePreset.globalSoundVolume ?? 1.0) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={activePreset.globalSoundVolume ?? 1.0}
                                onChange={(e) => updatePreset(activePreset.id, { globalSoundVolume: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                            />
                        </div>

                        {/* TTS Volume */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Text-to-Speech</span>
                                <span className="text-xs text-gray-400">{Math.round((activePreset.globalTTSVolume ?? 1.0) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={activePreset.globalTTSVolume ?? 1.0}
                                onChange={(e) => updatePreset(activePreset.id, { globalTTSVolume: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
