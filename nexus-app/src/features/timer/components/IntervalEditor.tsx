import { useState } from 'react';
import { X, Volume2, Mic, Play } from 'lucide-react';
import { useTimerStore } from '../store';
import type { SoundType, Interval } from '../store';
import clsx from 'clsx';
import { useAudio } from '../../../hooks/useAudio';

interface IntervalEditorProps {
    interval: Interval;
    onSave: (updates: Partial<Interval>) => void;
    onCancel: () => void;
}

export const IntervalEditor = ({ interval, onSave, onCancel }: IntervalEditorProps) => {
    const [name, setName] = useState(interval.name);
    const [hours, setHours] = useState(Math.floor(interval.durationSeconds / 3600));
    const [minutes, setMinutes] = useState(Math.floor((interval.durationSeconds % 3600) / 60));
    const [seconds, setSeconds] = useState(interval.durationSeconds % 60);
    const [soundType, setSoundType] = useState<SoundType>(interval.soundType);
    const [voiceOver, setVoiceOver] = useState(interval.voiceOver);
    const [soundVolume, setSoundVolume] = useState<number | null>(interval.soundVolume);
    const [ttsVolume, setTtsVolume] = useState<number | null>(interval.ttsVolume);

    const { playSound, speak } = useAudio();
    const { activePresetId, presets } = useTimerStore();

    const handleTestSound = () => {
        const activePreset = presets.find(p => p.id === activePresetId);
        if (!activePreset) return;

        const master = activePreset.masterVolume ?? 1.0;
        const activeGlobal = activePreset.globalSoundVolume ?? 1.0;
        const volume = master * (soundVolume ?? activeGlobal);

        playSound(soundType, volume);
    };

    const handleTestTTS = () => {
        const activePreset = presets.find(p => p.id === activePresetId);
        if (!activePreset) return;

        const master = activePreset.masterVolume ?? 1.0;
        const activeGlobal = activePreset.globalTTSVolume ?? 1.0;
        const volume = master * (ttsVolume ?? activeGlobal);

        speak(interval.name, volume);
    };

    const handleSave = () => {
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        onSave({
            name,
            durationSeconds: Math.max(1, totalSeconds), // Minimum 1s
            soundType,
            voiceOver,
            soundVolume,
            ttsVolume
        });
    };

    const soundOptions: { value: SoundType, label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'beep', label: 'Beep' },
        { value: 'double-beep', label: 'Double Beep' },
        { value: 'chime', label: 'Chime' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 sm:zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold">Edit Interval</h3>
                    <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. Work, Rest"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">Hours</label>
                                <input type="number" min="0" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">Min</label>
                                <input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">Sec</label>
                                <input type="number" min="0" max="59" value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* Sound */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sound</label>
                            <button
                                onClick={handleTestSound}
                                className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                <Play className="w-3 h-3 mr-1 fill-current" /> Test
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {soundOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSoundType(opt.value)}
                                    className={clsx(
                                        "px-3 py-2 text-sm rounded-lg border transition-all flex items-center justify-center space-x-2",
                                        soundType === opt.value
                                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    )}
                                >
                                    <Volume2 className="w-4 h-4" />
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sound Volume */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="useCustomSoundVol"
                                    checked={soundVolume !== null}
                                    onChange={(e) => setSoundVolume(e.target.checked ? 1.0 : null)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="useCustomSoundVol" className="text-xs text-gray-500 select-none">Use Custom Volume</label>
                            </div>

                            {soundVolume !== null ? (
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 w-12">Vol: {Math.round(soundVolume * 100)}%</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={soundVolume}
                                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                                    />
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 pl-6">Using Global Sound Volume</div>
                            )}
                        </div>
                    </div>

                    {/* Voice Over */}
                    <div className="space-y-2 border rounded-lg p-3 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Mic className="w-5 h-5 text-gray-500" />
                                <div>
                                    <span className="block text-sm font-medium">Text-to-Speech</span>
                                    <span className="block text-xs text-gray-500">Announce interval name</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleTestTTS}
                                    className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                    disabled={!voiceOver}
                                >
                                    <Play className="w-3 h-3 mr-1 fill-current" /> Test
                                </button>
                                <button
                                    onClick={() => setVoiceOver(!voiceOver)}
                                    className={clsx(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                        voiceOver ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            voiceOver ? "translate-x-6" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>

                        {voiceOver && (
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="useCustomTTSVol"
                                        checked={ttsVolume !== null}
                                        onChange={(e) => setTtsVolume(e.target.checked ? 1.0 : null)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="useCustomTTSVol" className="text-xs text-gray-500 select-none">Use Custom Volume</label>
                                </div>

                                {ttsVolume !== null ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 w-12">Vol: {Math.round(ttsVolume * 100)}%</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={ttsVolume}
                                            onChange={(e) => setTtsVolume(parseFloat(e.target.value))}
                                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 pl-6">Using Global TTS Volume</div>
                                )}
                            </div>
                        )}

                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
                        <button onClick={onCancel} className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-sm">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
