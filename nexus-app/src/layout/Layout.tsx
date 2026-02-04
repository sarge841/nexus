import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../store/useAppStore';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { setSidebarOpen } = useAppStore();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200">
            <Sidebar />

            <main className="flex-1 flex flex-col items-center h-full relative overflow-hidden">
                {/* Header / Top Bar for Mobile + Controls */}
                <header className="w-full p-4 flex justify-between items-center lg:justify-end absolute top-0 left-0 z-10 pointer-events-none">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 lg:hidden pointer-events-auto"
                        aria-label="Open Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="pointer-events-auto">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Content Area */}
                <div className="w-full h-full overflow-auto pt-16 px-4 pb-4 lg:pt-4">
                    <div className="max-w-3xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
