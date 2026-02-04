import { useState } from 'react';
import { useTimerStore } from '../store';
import type { Interval } from '../store';
import clsx from 'clsx';
import { Clock, Plus, Trash2, Edit2, Copy, GripVertical } from 'lucide-react';
import { IntervalEditor } from './IntervalEditor';
import { nanoid } from 'nanoid';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Sortable Item Component
const SortableIntervalItem = ({
    interval,
    index,
    isActive,
    isPast,
    onEdit,
    onDelete,
    onDuplicate,
    onJump
}: {
    interval: Interval;
    index: number;
    isActive: boolean;
    isPast: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: (e: React.MouseEvent) => void;
    onJump: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: interval.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onJump}
            className={clsx(
                "group relative flex items-center justify-between p-3 rounded-lg border transition-all pr-24 touch-manipulation",
                isActive
                    ? "bg-white dark:bg-gray-800 border-indigo-500 ring-1 ring-indigo-500 shadow-sm"
                    : "bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700",
                isPast && "opacity-50"
            )}
        >
            <div className="flex items-center space-x-3 overflow-hidden flex-1">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="touch-none p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                </div>

                <span className={clsx(
                    "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    isActive ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}>
                    {index + 1}
                </span>
                <div className="flex flex-col truncate">
                    <span className="font-medium truncate">{interval.name}</span>
                    <div className="flex items-center text-xs font-mono text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {interval.durationSeconds}s
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                    onClick={onDuplicate}
                    className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-gray-400 hover:text-indigo-600 rounded"
                    title="Duplicate"
                >
                    <Copy className="w-4 h-4" />
                </button>
                <button
                    onClick={onEdit}
                    className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-gray-500 hover:text-indigo-600 rounded"
                    title="Edit"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/50 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const IntervalList = () => {
    const {
        presets,
        activePresetId,
        currentIntervalIndex,
        deleteInterval,
        updateInterval,
        addInterval,
        duplicateInterval,
        updatePreset, // Need to update the whole list
        jumpToInterval,
        lastDeleted,
        undoDeleteInterval
    } = useTimerStore();

    const activePreset = presets.find(p => p.id === activePresetId);
    const [editingIntervalId, setEditingIntervalId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor, {
            // Press delay to prevent accidental drags while scrolling
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Helper to generate unique ID
    const generateId = (): string => nanoid();

    if (!activePreset) return null;

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = activePreset.intervals.findIndex((i) => i.id === active.id);
            const newIndex = activePreset.intervals.findIndex((i) => i.id === over.id);

            const newIntervals = arrayMove(activePreset.intervals, oldIndex, newIndex);
            updatePreset(activePresetId!, { intervals: newIntervals });
        }
    };

    const handleAdd = () => {
        const newInterval: Interval = {
            id: generateId(),
            name: 'New Interval',
            durationSeconds: 30,
            soundType: 'beep',
            voiceOver: true,
            soundVolume: null,
            ttsVolume: null
        };
        addInterval(newInterval);
        setEditingIntervalId(newInterval.id);
    };

    const handleDuplicate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newId = generateId();
        duplicateInterval(id, newId);
    };

    return (
        <>
            <div className="flex-1 overflow-auto mt-4 w-full max-w-md mx-auto pb-20 no-scrollbar">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center px-1">
                    <span>Timeline ({activePreset.intervals.length})</span>
                    <button
                        onClick={handleAdd}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400"
                        title="Add Interval"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </h3>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={activePreset.intervals.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2 pb-4">
                            {activePreset.intervals.map((interval, index) => (
                                <SortableIntervalItem
                                    key={interval.id}
                                    interval={interval}
                                    index={index}
                                    isActive={index === currentIntervalIndex}
                                    isPast={index < currentIntervalIndex}
                                    onEdit={() => setEditingIntervalId(interval.id)}
                                    onDelete={() => deleteInterval(interval.id)}
                                    onDuplicate={(e) => handleDuplicate(interval.id, e)}
                                    onJump={() => jumpToInterval(index)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Undo Toast */}
                {lastDeleted && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-4">
                            <span className="text-sm">Deleted "{lastDeleted.interval.name}"</span>
                            <button
                                onClick={undoDeleteInterval}
                                className="text-indigo-400 hover:text-indigo-300 font-bold text-sm uppercase tracking-wide"
                            >
                                Undo
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleAdd}
                    className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center space-x-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Interval</span>
                </button>

                <div className="mt-2 flex space-x-2 justify-center opacity-50 hover:opacity-100 transition-opacity pb-8">
                    <button
                        onClick={() => {
                            import('../../../utils/fileOps').then(mod => {
                                const result = mod.exportPresets(presets);
                                mod.downloadFile(`nexus-presets-${new Date().getTime()}.json`, result);
                            });
                        }}
                        className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded"
                    >
                        Export Presets
                    </button>
                </div>
            </div>

            {editingIntervalId && (
                <IntervalEditor
                    interval={activePreset.intervals.find(i => i.id === editingIntervalId)!}
                    onSave={(updates) => {
                        updateInterval(editingIntervalId, updates);
                        setEditingIntervalId(null);
                    }}
                    onCancel={() => setEditingIntervalId(null)}
                />
            )}
        </>
    );
};
