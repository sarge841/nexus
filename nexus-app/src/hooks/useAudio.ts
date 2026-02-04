import { useRef, useEffect, useCallback } from 'react';
import type { SoundType } from '../features/timer/store';

export const useAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on first interaction usually, or lazy load.
        // For now, we create it but it might be suspended.
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }, []);

    const playSound = useCallback((type: SoundType, volume: number = 1.0) => {
        if (!audioContextRef.current || type === 'none') return;

        // Resume context if suspended (browser auto-play policy)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;

        // Oscillator for beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Base gain logic multiplied by volume argument
        const baseGain = 0.1 * volume;

        if (type === 'beep') {
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.type = 'sine';
            gain.gain.setValueAtTime(baseGain, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'double-beep') {
            const now = ctx.currentTime;
            // First beep
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(baseGain, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);

            // Second beep
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(880, now + 0.15);
            gain2.gain.setValueAtTime(baseGain, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.25);
        } else if (type === 'chime') {
            // Simple chime synthesis (decaying sine + harmonics)
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            gain.gain.setValueAtTime(baseGain * 2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1.0);
        }
    }, []);

    const speak = useCallback((text: string, volume: number = 1.0) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel previous
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = volume;
        window.speechSynthesis.speak(utterance);
    }, []);

    return { playSound, speak };
};
