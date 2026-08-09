import { Trophy, RotateCcw, Settings, History, Sparkles } from 'lucide-react';
import { useMealMatcherStore } from '../store';

export const ResultView = () => {
  const { winnerCategory, restartSession, setActiveSubView } = useMealMatcherStore();

  if (!winnerCategory) {
    return (
      <div className="text-center py-12">
        <button
          onClick={() => setActiveSubView('match')}
          className="text-indigo-600 dark:text-indigo-400 font-medium"
        >
          Back to Matcher
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full text-center space-y-6">
      {/* Trophy Badge */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 animate-pulse">
          <Trophy className="w-10 h-10" />
        </div>
        <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
      </div>

      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
          We Have A Winner!
        </span>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
          You should get...
        </h2>
      </div>

      {/* Winner Hero Card */}
      <div className="w-full bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/20 dark:via-purple-500/10 p-8 rounded-3xl border-2 border-indigo-500/30 dark:border-indigo-400/30 shadow-2xl flex flex-col items-center justify-center space-y-4">
        <span className="text-8xl transform hover:scale-110 transition-transform duration-300">
          {winnerCategory.emoji}
        </span>
        <h3 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          {winnerCategory.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Selected as your top pick for today's meal!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col space-y-3 pt-2">
        <button
          onClick={restartSession}
          className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 text-lg"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Decide Again</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveSubView('settings')}
            className="flex items-center justify-center space-x-2 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-xl transition-all active:scale-95 text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveSubView('history')}
            className="flex items-center justify-center space-x-2 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-xl transition-all active:scale-95 text-sm"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
