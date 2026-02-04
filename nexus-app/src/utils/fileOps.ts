import type { TimerPreset } from '../features/timer/store';

export const exportPresets = (presets: TimerPreset[]): string => {
    const data = {
        version: 1,
        type: 'nexus-timer-presets',
        exportedAt: new Date().toISOString(),
        presets,
    };
    return JSON.stringify(data, null, 2);
};

export const importPresets = (json: string): TimerPreset[] => {
    try {
        const data = JSON.parse(json);
        if (data.type !== 'nexus-timer-presets' || !Array.isArray(data.presets)) {
            throw new Error('Invalid preset file format');
        }
        // Basic validation could be expanded here
        return data.presets as TimerPreset[];
    } catch (e) {
        console.error('Failed to import presets:', e);
        return [];
    }
};

export const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
