import { Timer, Settings, Utensils } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Dashboard = () => {
    const { setActiveTool } = useAppStore();

    const tools = [
        {
            id: 'timer' as const,
            name: 'Interval Timer',
            description: 'Customizable interval timer for workouts and productivity.',
            icon: Timer,
            color: 'bg-indigo-500',
        },
        {
            id: 'meal-matcher' as const,
            name: 'Meal Matcher',
            description: 'Decide what to eat through head-to-head food category elimination.',
            icon: Utensils,
            color: 'bg-amber-500',
        },
        {
            id: 'settings' as const,
            name: 'Settings',
            description: 'Global application settings.',
            icon: Settings,
            color: 'bg-gray-500',
        }
    ];

    return (
        <div className="flex flex-col space-y-6">
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Nexus</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Your personal suite of utilities.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className="flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group text-left"
                    >
                        <div className={`p-3 rounded-lg ${tool.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                            <tool.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {tool.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tool.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};
