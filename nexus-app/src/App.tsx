import { Layout } from './layout/Layout';
import { useAppStore } from './store/useAppStore';
import { TimerFeature } from './features/timer';
import { MealMatcherFeature } from './features/meal-matcher';
import { Dashboard } from './features/dashboard/Dashboard';
import { SharedPresetImport } from './features/timer/components/SharedPresetImport';
import { useState, useEffect } from 'react';

function App() {
  const { activeTool } = useAppStore();
  const [sharedShortId, setSharedShortId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/s\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      setSharedShortId(match[1]);
    }
  }, []);

  const handleCloseImport = () => {
    setSharedShortId(null);
    window.history.pushState({}, '', '/'); // Clean URL
  };

  return (
    <Layout>
      {activeTool === 'home' && <Dashboard />}
      {activeTool === 'timer' && <TimerFeature />}
      {activeTool === 'meal-matcher' && <MealMatcherFeature />}

      {activeTool === 'settings' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p>Global app settings will go here.</p>
        </div>
      )}

      {sharedShortId && (
        <SharedPresetImport
          shortId={sharedShortId}
          onClose={handleCloseImport}
        />
      )}
    </Layout>
  );
}

export default App;
