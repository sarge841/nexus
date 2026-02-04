import { useTimerStore } from '../store';
import clsx from 'clsx';

export const TimerDisplay = () => {
    const {
        presets,
        activePresetId,
        currentIntervalIndex,
        elapsedInInterval
    } = useTimerStore();

    const activePreset = presets.find(p => p.id === activePresetId);
    const currentInterval = activePreset?.intervals[currentIntervalIndex];

    if (!currentInterval) return <div>No Interval</div>;

    const durationMs = currentInterval.durationSeconds * 1000;
    const remainingMs = Math.max(0, durationMs - elapsedInInterval);
    const progress = Math.min(1, elapsedInInterval / durationMs);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // SVG Ring Config
    const radius = 120;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="relative flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: 0 }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-gray-200 dark:text-gray-800"
                    />
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className={clsx(
                            "text-indigo-500",
                            currentInterval.name === 'Rest' && "text-amber-500" // Example conditional color
                        )}
                    />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                    <span className="text-5xl font-bold font-mono tracking-tighter text-gray-900 dark:text-white">
                        {formatTime(remainingMs)}
                    </span>
                    <span className="text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2">
                        {currentInterval.name}
                    </span>
                </div>
            </div>
        </div>
    );
};
