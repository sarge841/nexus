import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Check, Search, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useMealMatcherStore } from '../store';

const POPULAR_EMOJIS = ['🌮', '🍕', '🍔', '🍗', '🍣', '🍜', '🍝', '🥗', '🥩', '🥙', '🍩', '🥐', '🌯', '🍛'];

export const SettingsView = () => {
  const {
    categories,
    toggleCategory,
    toggleAllCategories,
    addCustomCategory,
    removeCustomCategory,
    resetCategoriesToDefault,
    setActiveSubView,
  } = useMealMatcherStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍽️');

  const enabledCount = categories.filter((c) => c.enabled).length;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCustomCategory(newCategoryName, selectedEmoji);
    setNewCategoryName('');
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 max-w-2xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubView('match')}
          className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matcher</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full">
          {enabledCount} of {categories.length} Enabled
        </span>
      </div>

      {/* Warning if < 2 enabled */}
      {enabledCount < 2 && (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-amber-800 dark:text-amber-200 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold">At least 2 categories required!</span> Please enable more categories below to start a decision tournament.
          </div>
        </div>
      )}

      {/* Add Custom Category Card */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Add Custom Category
        </h3>
        <form onSubmit={handleAddCategory} className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            {/* Emoji Selector */}
            <input
              type="text"
              maxLength={4}
              value={selectedEmoji}
              onChange={(e) => setSelectedEmoji(e.target.value)}
              className="w-12 sm:w-14 h-11 sm:h-12 text-center text-xl sm:text-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
              title="Type an emoji"
            />

            {/* Category Name Input */}
            <input
              type="text"
              placeholder="e.g. Poke Bowls, Tapas..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 min-w-0 px-3.5 h-11 sm:h-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Quick Emoji Pickers */}
          <div className="flex flex-wrap gap-1.5 py-1">
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">Quick Emojis:</span>
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Add Button at Bottom of Section */}
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="w-full h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Custom Category</span>
          </button>
        </form>
      </div>

      {/* Categories Controls & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Manage Categories
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => toggleAllCategories(true)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => toggleAllCategories(false)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Disable All
            </button>
            <button
              onClick={resetCategoriesToDefault}
              className="text-xs font-semibold px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center space-x-1"
              title="Reset to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                cat.enabled
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-75'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                <span className="font-semibold text-sm truncate">
                  {cat.name}
                  {cat.isCustom && (
                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 rounded">
                      Custom
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {cat.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomCategory(cat.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                    title="Delete custom category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    cat.enabled
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No categories found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
