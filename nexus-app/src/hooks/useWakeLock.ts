import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to lock the screen wake state to prevent the device from sleeping.
 * Returns methods to request and release the wake lock.
 */
export const useWakeLock = (active: boolean) => {
    const wakeLock = useRef<WakeLockSentinel | null>(null);

    const requestLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
                // console.log('[WakeLock] Acquired');

                wakeLock.current.addEventListener('release', () => {
                    // console.log('[WakeLock] Released');
                    wakeLock.current = null;
                });
            } catch (err) {
                console.warn('[WakeLock] Request failed:', err);
            }
        } else {
            // console.warn('[WakeLock] API not supported');
        }
    }, []);

    const releaseLock = useCallback(async () => {
        if (wakeLock.current) {
            try {
                await wakeLock.current.release();
                wakeLock.current = null;
            } catch (err) {
                console.warn('[WakeLock] Release failed:', err);
            }
        }
    }, []);

    // Handle visibility change to re-acquire lock if page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && active) {
                requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [active, requestLock]);

    // Manage lock based on active state
    useEffect(() => {
        if (active) {
            requestLock();
        } else {
            releaseLock();
        }

        return () => {
            releaseLock();
        };
    }, [active, requestLock, releaseLock]);
};
