import { useState } from 'react';
import { Trash2, ArrowLeft, Crown, Sparkles, Clock } from 'lucide-react';
import { useMealMatcherStore } from '../store';

export const HistoryView = () => {
  const { history, clearHistory, setActiveSubView } = useMealMatcherStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmClear = () => {
    clearHistory();
    setShowConfirmClear(false);
  };

  // Count total choices and total game winners
  const gameWinnersCount = history.filter((h) => h.isGameWinner).length;

  return (
    <div className="flex flex-col space-y-6 max-w-xl mx-auto w-full pb-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubView('match')}
          className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matcher</span>
        </button>

        {history.length > 0 && (
          <div>
            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/80 p-1.5 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-xs font-bold text-red-700 dark:text-red-300 pl-1">
                  Clear all history?
                </span>
                <button
                  onClick={handleConfirmClear}
                  className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Feed Container */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Choice Activity Feed
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
            <span>{history.length} Round Choices</span>
            {gameWinnersCount > 0 && (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                {gameWinnersCount} Games Won
              </span>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500 space-y-2">
            <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="font-semibold text-base">No choice history yet.</p>
            <p className="text-xs text-gray-400">
              As you make choices during a match, your choices will appear here live in real-time!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {history.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border transition-all ${
                  entry.isGameWinner
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                    : 'bg-gray-50/70 dark:bg-gray-700/30 border-gray-200/70 dark:border-gray-700/60'
                }`}
              >
                {/* Game Winner Banner if applicable */}
                {entry.isGameWinner && (
                  <div className="flex items-center space-x-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mb-2">
                    <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="uppercase tracking-wider">Overall Winner Crowned</span>
                  </div>
                )}

                {/* Feed Row Content - Simple & Light */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-200/60 dark:bg-gray-600/50 px-2 py-0.5 rounded">
                      Round {entry.roundNumber}
                    </span>

                    {/* Winner Name */}
                    <span className="font-bold text-gray-900 dark:text-white inline-flex items-center space-x-1">
                      <span>{entry.winnerEmoji}</span>
                      <span>{entry.winnerName}</span>
                    </span>

                    <span className="text-xs text-gray-400 dark:text-gray-500">over</span>

                    {/* Loser Name */}
                    <span className="text-gray-500 dark:text-gray-400 inline-flex items-center space-x-1">
                      <span>{entry.loserEmoji}</span>
                      <span>{entry.loserName}</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
