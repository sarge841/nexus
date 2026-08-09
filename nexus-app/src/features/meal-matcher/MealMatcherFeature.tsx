import { Utensils, Settings, History, Play } from 'lucide-react';
import { useMealMatcherStore } from './store';
import { MatchView } from './components/MatchView';
import { ResultView } from './components/ResultView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import clsx from 'clsx';

export const MealMatcherFeature = () => {
  const { activeSubView, setActiveSubView } = useMealMatcherStore();

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* Feature Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Meal Matcher
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Narrow down what to eat through head-to-head category choices.
            </p>
          </div>
        </div>

        {/* Sub-view Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubView('match')}
            className={clsx(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubView === 'match' || activeSubView === 'result'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Matcher</span>
          </button>

          <button
            onClick={() => setActiveSubView('settings')}
            className={clsx(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubView === 'settings'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveSubView('history')}
            className={clsx(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubView === 'history'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div>
        {activeSubView === 'match' && <MatchView />}
        {activeSubView === 'result' && <ResultView />}
        {activeSubView === 'settings' && <SettingsView />}
        {activeSubView === 'history' && <HistoryView />}
      </div>
    </div>
  );
};
