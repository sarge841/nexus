/* eslint-disable no-restricted-globals */
// Simplified web worker that ticks every 100ms

const tickRate = 100;
let timerId: number | null = null;

self.onmessage = (e: MessageEvent) => {
    if (e.data === 'start') {
        if (timerId) clearInterval(timerId);
        timerId = self.setInterval(() => {
            self.postMessage('tick');
        }, tickRate);
    } else if (e.data === 'stop') {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }
};
export { };
