import { Layout } from './layout/Layout';
import { useAppStore } from './store/useAppStore';
import { TimerFeature } from './features/timer';
import { Dashboard } from './features/dashboard/Dashboard';

function App() {
  const { activeTool } = useAppStore();

  return (
    <Layout>
      {activeTool === 'home' && <Dashboard />}
      {activeTool === 'timer' && <TimerFeature />}

      {activeTool === 'settings' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p>Global app settings will go here.</p>
        </div>
      )}
    </Layout>
  );
}

export default App;
