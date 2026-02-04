import { useEffect, useState } from 'react';
import { useTimerStore } from '../store';
import type { TimerPreset } from '../store';
import { nanoid } from 'nanoid';
import { Loader2, Download, RefreshCw, X } from 'lucide-react';

interface SharedPresetImportProps {
    shortId: string;
    onClose: () => void;
}

export const SharedPresetImport = ({ shortId, onClose }: SharedPresetImportProps) => {
    const { addPreset, presets, updatePreset } = useTimerStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchedPreset, setFetchedPreset] = useState<TimerPreset | null>(null);
    const [importName, setImportName] = useState('');

    useEffect(() => {
        const fetchPreset = async () => {
            try {
                const res = await fetch(`/api/share/${shortId}`);
                if (!res.ok) throw new Error('Workout not found or expired');
                const data = await res.json();

                // Sanity check data structure
                if (!data.intervals) throw new Error('Invalid workout data');

                setFetchedPreset(data);
                setImportName(data.name);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPreset();
    }, [shortId]);

    const handleImportAsNew = () => {
        if (!fetchedPreset) return;

        // Find a unique name
        let name = importName;
        // Basic dedupe logic if they didn't rename it
        if (presets.some(p => p.name === name)) {
            name = `${name} (Imported)`;
        }

        const newPreset: TimerPreset = {
            ...fetchedPreset,
            id: nanoid(),
            name: name,
            intervals: fetchedPreset.intervals.map(i => ({ ...i, id: nanoid() }))
        };

        addPreset(newPreset);
        onClose();
    };

    const handleOverwrite = () => {
        // This is tricky because we don't know WHICH preset to overwrite unless we match by name?
        // The user request said: "If the workout already exists... give the option to overwrite"
        // We can check if a preset with the EXACT same name exists.
        if (!fetchedPreset) return;

        const existing = presets.find(p => p.name === fetchedPreset.name);
        if (existing) {
            updatePreset(existing.id, {
                intervals: fetchedPreset.intervals.map(i => ({ ...i, id: nanoid() })),
                // Keep existing settings? Or overwrite all? Usually overwrite means replace content.
                autoRepeat: fetchedPreset.autoRepeat,
                masterVolume: fetchedPreset.masterVolume,
                globalSoundVolume: fetchedPreset.globalSoundVolume,
                globalTTSVolume: fetchedPreset.globalTTSVolume
            });
            onClose();
        }
    };

    const existingPreset = fetchedPreset ? presets.find(p => p.name === fetchedPreset.name) : null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="font-medium">Loading shared workout...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <X className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">Import Failed</h3>
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Import Workout
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Someone shared a workout with you
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Workout Name
                        </label>
                        <input
                            type="text"
                            value={importName}
                            onChange={(e) => setImportName(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-lg font-medium focus:border-indigo-500 focus:outline-none"
                        />
                        <div className="mt-2 text-xs text-gray-400 flex justify-between">
                            <span>{fetchedPreset?.intervals.length} intervals</span>
                            <span>
                                {fetchedPreset && Math.floor(fetchedPreset.intervals.reduce((acc, i) => acc + i.durationSeconds, 0) / 60)}m duration
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {existingPreset && (
                            <button
                                onClick={handleOverwrite}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg font-medium transition-colors border border-amber-200 dark:border-amber-900/50"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Overwrite "{existingPreset.name}"</span>
                            </button>
                        )}

                        <button
                            onClick={handleImportAsNew}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span>Import as New</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
