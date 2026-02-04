import { Timer, Settings, X, Ghost, Home } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import clsx from 'clsx';

export const Sidebar = () => {
    const { activeTool, setActiveTool, sidebarOpen, setSidebarOpen } = useAppStore();

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'timer', label: 'Timer', icon: Timer },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    'fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden',
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200 ease-in-out',
                    // Logic: Hidden by default on mobile (translate-x-full), visible if sidebarOpen.
                    // On Desktop (lg): Always visible (translate-0), sidebarOpen prop ignored for main layout structure usually?
                    // Actually, if we use the same class for both:
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:static lg:translate-x-0' // FORCE visible on desktop
                )}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Ghost className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Nexus
                        </span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTool(item.id);
                                setSidebarOpen(false);
                            }}
                            className={clsx(
                                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                                activeTool === item.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                        v0.1.0 Alpha
                    </p>
                </div>
            </aside>
        </>
    );
};
