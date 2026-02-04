import { useEffect, useRef, useCallback } from 'react';
import { useWakeLock } from '../../../hooks/useWakeLock';

/**
 * Hook to manage the timer engine (Web Worker).
 * @param isRunning - Boolean indicating if the timer should be running.
 * @param onTick - Callback function called on every tick with total elapsed time in ms.
 */
export const useTimerEngine = (
    isRunning: boolean,
    onTick: (elapsedMs: number) => void
) => {
    useWakeLock(isRunning);

    const workerRef = useRef<Worker | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const pausedTimeRef = useRef<number>(0);
    const onTickRef = useRef(onTick);

    // Keep latest callback accessible without restarting effect
    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/timer.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e) => {
            if (e.data === 'tick') {
                if (startTimeRef.current !== null) {
                    const now = Date.now();
                    const totalElapsed = now - startTimeRef.current + pausedTimeRef.current;
                    onTickRef.current(totalElapsed);
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Handle Start/Stop
    useEffect(() => {
        if (isRunning) {
            if (startTimeRef.current === null) {
                startTimeRef.current = Date.now();
            }
            workerRef.current?.postMessage('start');
        } else {
            // Pause logic
            if (startTimeRef.current !== null) {
                pausedTimeRef.current += Date.now() - startTimeRef.current;
                startTimeRef.current = null;
            }
            workerRef.current?.postMessage('stop');
        }
    }, [isRunning]);

    const reset = useCallback(() => {
        pausedTimeRef.current = 0;
        startTimeRef.current = null;
        if (isRunning) {
            // If resetting while running, restart start time? Or stop? 
            // Usually reset implies stop + zero.
            // But if we want to reset and keep running (lap?), different logic.
            // Assuming Reset = Stop and Zero for now.
        }
        workerRef.current?.postMessage('stop');
        onTickRef.current(0);
    }, [isRunning]);

    return { reset };
};
