# Architecture: Modular Utility Web App (Project "Nexus")

This document outlines the architecture for a scalable, expandable web application designed to house a suite of personal utilities, starting with a highly customizable interval timer.

---

## 🛠️ Tech Stack & Principles

* **Language:** TypeScript (for type safety and stability).
* **Framework:** React 19+ (using Vite for fast builds).
* **Styling:** Tailwind CSS (Mobile-first, default Dark Mode).
* **State Management:** Zustand (Global state with persistence).
* **Timer Precision:** Web Workers + Timestamp-based drift correction.
* **Persistence:** LocalStorage/IndexedDB (for settings and presets).
* **PWA:** Enabled for "Add to Home Screen" support and offline capability.

---

## 📂 Directory Structure

The project uses a **feature-based** modular structure. Each new utility is treated as a self-contained module within the `src/features/` directory.

```text
nexus-app/
├── public/                 # Static assets (audio files, manifest)
├── src/
│   ├── assets/             # Global styles, shared icons
│   ├── components/         # Shared UI (Buttons, Layout, Cards)
│   ├── hooks/              # Global hooks (useLocalStorage, useWakeLock)
│   ├── features/           # Modular Utilities
│   │   ├── timer/          # Timer Utility
│   │   │   ├── components/ # Timer-specific UI
│   │   │   ├── hooks/      # useTimerEngine, useAudio
│   │   │   ├── store.ts    # Timer-specific state & presets
│   │   │   └── index.tsx   # Entry point for the Timer
│   │   └── [future-tool]/  # Placeholder for next utility
│   ├── layout/             # Shell components (Menu, Sidebar)
│   ├── store/              # Global app state (Active Tool, Theme)
│   ├── utils/              # Helper functions (time formatters)
│   ├── workers/            # Web Worker logic for background tasks
│   └── App.tsx             # Main router and shell
└── tailwind.config.js      # Dark mode and theme configuration

```

---

## ⏱️ Feature Specification: Interval Timer

### 1. Data Models

```typescript
interface Interval {
  id: string;
  name: string;
  durationSeconds: number; // Duration of this specific interval
  soundType: 'beep' | 'double-beep' | 'chime' | 'none';
  voiceOver: boolean;       // TTS name of interval
}

interface TimerPreset {
  id: string;
  name: string;
  intervals: Interval[];
  autoRepeat: boolean;
  globalVolume: number;     // 0.0 to 1.0
}

```

### 2. Core Logic (The Timer Engine)

To ensure the timer does not throttle when the phone screen is off or the tab is in the background:

* **Timestamp Anchoring:** At start, record `startTime = Date.now()`.
* **Web Worker:** A dedicated worker thread will emit a `tick` every 100ms.
* **Delta Calculation:** On every tick, the main thread calculates `elapsed = Date.now() - startTime`. This eliminates the accumulation of millisecond delays found in standard `setInterval`.

### 3. Audio & Speech

* **Web Audio API:** Tones (beeps/chimes) are synthesized or triggered using `AudioContext` to ensure low latency and precise volume control.
* **Speech Synthesis API:** Used for the "Interval Name" readout. It will be queued to trigger at `timeRemaining === 0` of the previous interval.

### 4. Persistence & Portability

* **Local Persistence:** Zustand's `persist` middleware will automatically save current configurations to `localStorage`.
* **Import/Export:** The app will provide a JSON-based export/import for `TimerPreset` objects, allowing users to share or backup their routines.

---

## 🌓 UI/UX Requirements

* **Default State:** `class="dark"` applied to the `<html>` tag.
* **Mobile Optimizations:** * Large touch targets for Start/Stop/Reset.
* Visual "Progress Ring" for the current interval.
* **Screen Wake Lock:** Implementation of the `navigator.wakeLock` API to prevent the display from sleeping while the timer is active.


* **Navigation:** A "Drawer" or "Sidebar" menu to switch between the Timer and future utilities.

---

## 🧪 Testing Strategy

To maintain high reliability, the following testing standards are mandatory for all features:

### 1. Unit Testing (Vitest)

* **Logic:** All pure functions (time formatters, interval calculators) must have 100% coverage.
* **Stores:** Zustand stores must be tested in isolation to ensure state transitions (e.g., adding an interval, switching presets) work as expected.
* **Hooks:** Custom hooks like `useTimerEngine` must be tested using `@testing-library/react-hooks`.

### 2. Integration Testing (React Testing Library)

* **UI Components:** Ensure components render correctly in Dark Mode and respond to user input (e.g., clicking "Start" triggers the timer engine).
* **Persistence:** Verify that changes to settings are correctly written to and read from `localStorage` mocks.

### 3. End-to-End (E2E) Testing (Playwright)

* **Critical Path:** Test the full flow on mobile and desktop viewports:
1. User opens app.
2. User creates a custom interval preset.
3. User runs the timer to completion.


* **Audio/TTS:** Verify that audio triggers are called at the correct timestamps.

---

## 🚦 Phase 1 Implementation Plan

1. **Initialize Project:** Vite + React + TypeScript + Tailwind.
2. **The Shell:** Build the sidebar navigation and utility-switching logic.
3. **The Engine:** Implement the Web Worker-based timer logic.
4. **The UI:** Build the Interval Editor (CRUD for intervals) and the Countdown Screen.
5. **The Audio:** Integrate `useAudio` hook for beeps and TTS.
6. **Persistence:** Set up preset saving and export/import functionality.
