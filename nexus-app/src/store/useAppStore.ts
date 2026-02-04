import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tool = 'home' | 'timer' | 'settings';
type Theme = 'light' | 'dark';

interface AppState {
    activeTool: Tool;
    theme: Theme;
    sidebarOpen: boolean;
    setActiveTool: (tool: Tool) => void;
    toggleTheme: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            activeTool: 'home',
            theme: 'dark',
            sidebarOpen: false,
            setActiveTool: (tool) => set({ activeTool: tool }),
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    if (typeof document !== 'undefined') {
                        document.documentElement.classList.remove(state.theme);
                        document.documentElement.classList.add(newTheme);
                    }
                    return { theme: newTheme };
                }),
            setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
        }),
        {
            name: 'nexus-app-storage',
            partialize: (state) => ({ theme: state.theme, activeTool: state.activeTool }),
        }
    )
);
