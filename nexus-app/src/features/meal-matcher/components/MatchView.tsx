import { useEffect } from 'react';
import { Undo2, RotateCcw, Settings, History, Sparkles } from 'lucide-react';
import { useMealMatcherStore } from '../store';
import clsx from 'clsx';

export const MatchView = () => {
  const {
    reigningId,
    challengerId,
    stepIndex,
    totalSteps,
    undoStack,
    categories,
    selectWinner,
    undo,
    restartSession,
    startSession,
    setActiveSubView,
  } = useMealMatcherStore();

  const enabledCount = categories.filter((c) => c.enabled).length;

  useEffect(() => {
    if (!reigningId || !challengerId) {
      if (enabledCount >= 2) {
        startSession();
      }
    }
  }, [reigningId, challengerId, enabledCount, startSession]);

  if (enabledCount < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[350px]">
        <Sparkles className="w-12 h-12 text-indigo-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Not Enough Categories Enabled
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          You need at least 2 active categories to start matching meals. Head over to settings to enable more options.
        </p>
        <button
          onClick={() => setActiveSubView('settings')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95"
        >
          <Settings className="w-5 h-5" />
          <span>Open Category Settings</span>
        </button>
      </div>
    );
  }

  const reigningCat = categories.find((c) => c.id === reigningId);
  const challengerCat = categories.find((c) => c.id === challengerId);

  if (!reigningCat || !challengerCat) {
    return null;
  }

  const progressPercent = Math.min(
    100,
    Math.round((stepIndex / totalSteps) * 100)
  );

  return (
    <div className="flex flex-col space-y-6 max-w-xl mx-auto w-full">
      {/* Action Header & Progress */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col space-y-4">
        {/* Quick Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={clsx(
                'flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                undoStack.length > 0
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-100 dark:border-gray-700/50'
              )}
              title="Undo last selection"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo</span>
            </button>

            <button
              onClick={restartSession}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 rounded-lg text-sm font-medium transition-all"
              title="Restart session"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubView('settings')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveSubView('history')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="History"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Progress</span>
            <span>
              Round {stepIndex} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Choice Prompt */}
      <div className="text-center py-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Which sounds better right now?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tap the meal category you prefer to advance to the next round.
        </p>
      </div>

      {/* Match Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
        {/* Card 1 */}
        <button
          onClick={() => selectWinner(reigningCat.id)}
          className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 group text-center cursor-pointer min-h-[220px]"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
            {reigningCat.emoji}
          </span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {reigningCat.name}
          </h3>
          <span className="mt-3 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-full">
            Choice A
          </span>
        </button>

        {/* VS Badge in Center */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xs items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 pointer-events-none">
          VS
        </div>

        {/* Card 2 */}
        <button
          onClick={() => selectWinner(challengerCat.id)}
          className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-purple-100 dark:border-purple-900/40 hover:border-purple-500 dark:hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 group text-center cursor-pointer min-h-[220px]"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
            {challengerCat.emoji}
          </span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {challengerCat.name}
          </h3>
          <span className="mt-3 inline-block px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 text-xs font-semibold rounded-full">
            Choice B
          </span>
        </button>
      </div>
    </div>
  );
};
