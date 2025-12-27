import { useState, useEffect } from 'react';
import TraceList from './components/TraceList';
import TraceDetail from './components/TraceDetail';

const API_URL = 'http://localhost:3001';

function App() {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all traces
  const fetchTraces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/traces`);
      if (!response.ok) throw new Error('Failed to fetch traces');
      const data = await response.json();
      setTraces(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run demo workflow
  const runDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/demo/run`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to run demo');
      const newTrace = await response.json();
      setTraces([...traces, newTrace]);
      setSelectedTrace(newTrace);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTraces();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">X-Ray Debugger</h1>
            <p className="text-sm text-gray-500 mt-1">
              Multi-step decision process visualization
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTraces}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={runDemo}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : 'Run Demo'}
            </button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar - Trace List */}
          <div className="w-80 flex-shrink-0">
            <TraceList
              traces={traces}
              selectedTrace={selectedTrace}
              onSelectTrace={setSelectedTrace}
            />
          </div>

          {/* Main Area - Trace Detail */}
          <div className="flex-1">
            {selectedTrace ? (
              <TraceDetail key={selectedTrace.traceId} trace={selectedTrace} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No trace selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a trace from the list or run a demo to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
