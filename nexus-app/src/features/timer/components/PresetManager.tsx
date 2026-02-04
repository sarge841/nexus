import { useState } from 'react';
import { useTimerStore } from '../store';
import type { TimerPreset } from '../store';
import { X, Plus, Trash2, Edit2, Copy, Share2, Download } from 'lucide-react';
import clsx from 'clsx';
import { nanoid } from 'nanoid';

interface PresetManagerProps {
    onClose: () => void;
}

export const PresetManager = ({ onClose }: PresetManagerProps) => {
    const {
        presets,
        activePresetId,
        setActivePreset,
        addPreset,
        deletePreset,
        updatePreset,
        duplicatePreset
    } = useTimerStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2000);
    };

    const handleCreate = () => {
        const newId = nanoid();
        const newPreset: TimerPreset = {
            id: newId,
            name: 'New Workout',
            intervals: [
                { id: nanoid(), name: 'Work', durationSeconds: 30, soundType: 'beep', voiceOver: true, soundVolume: null, ttsVolume: null },
                { id: nanoid(), name: 'Rest', durationSeconds: 10, soundType: 'double-beep', voiceOver: true, soundVolume: null, ttsVolume: null },
            ],
            autoRepeat: true,
            masterVolume: 1.0,
            globalSoundVolume: 1.0,
            globalTTSVolume: 1.0,
        };
        addPreset(newPreset);
    };

    const handleDuplicate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        duplicatePreset(id, nanoid());
        showToast('Workout duplicated');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this preset?')) {
            deletePreset(id);
            showToast('Workout deleted');
        }
    };

    const handleShare = async (preset: TimerPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        const data = {
            version: 1,
            type: 'nexus-timer-preset',
            data: preset
        };
        try {
            await navigator.clipboard.writeText(JSON.stringify(data));
            showToast('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy', err);
            showToast('Failed to copy');
        }
    };

    const handleImport = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const json = JSON.parse(text);

            if (json.type !== 'nexus-timer-preset' || !json.data) {
                alert('Invalid preset data in clipboard');
                return;
            }

            const importedPreset = json.data as TimerPreset;

            // Check if name already exists
            const nameExists = presets.some(p => p.name === importedPreset.name);
            const finalName = nameExists ? `${importedPreset.name} (Imported)` : importedPreset.name;

            // Generate clean IDs to avoid collisions
            const newId = nanoid();
            const cleanPreset: TimerPreset = {
                ...importedPreset,
                id: newId,
                name: finalName,
                intervals: importedPreset.intervals.map(i => ({ ...i, id: nanoid() }))
            };

            addPreset(cleanPreset);
            showToast('Workout imported!');
        } catch (err) {
            console.error('Failed to import', err);
            alert('Failed to import from clipboard. Make sure you copied valid preset JSON.');
        }
    };

    const startEditing = (preset: TimerPreset, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(preset.id);
        setEditName(preset.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            updatePreset(editingId, { name: editName.trim() });
            setEditingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold">My Workouts</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {toastMessage && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                        {toastMessage}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {presets.map((preset) => {
                        const isActive = preset.id === activePresetId;
                        const isEditing = editingId === preset.id;

                        return (
                            <div
                                key={preset.id}
                                onClick={() => !isEditing && setActivePreset(preset.id)}
                                className={clsx(
                                    "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                    isActive
                                        ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500/50"
                                        : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600"
                                )}
                            >
                                <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                                    <div className={clsx(
                                        "w-2 h-2 rounded-full flex-shrink-0",
                                        isActive ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
                                    )} />

                                    {isEditing ? (
                                        <div className="flex items-center space-x-2 flex-1" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit();
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                onBlur={saveEdit}
                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center">
                                                <h4 className={clsx("font-medium truncate", isActive ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-gray-100")}>
                                                    {preset.name}
                                                </h4>
                                                {isActive && <span className="ml-2 text-[10px] uppercase font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">Active</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {preset.intervals.length} intervals • {Math.floor(preset.intervals.reduce((acc, i) => acc + i.durationSeconds, 0) / 60)}m
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleShare(preset, e)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded"
                                        title="Share to Clipboard"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => startEditing(preset, e)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDuplicate(preset.id, e)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(preset.id, e)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                        disabled={presets.length <= 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-2">
                    <button
                        onClick={handleCreate}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Workout</span>
                    </button>
                    <button
                        onClick={handleImport}
                        className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Import from Clipboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
