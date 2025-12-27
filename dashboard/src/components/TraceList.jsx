function TraceList({ traces, selectedTrace, onSelectTrace }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (start, end) => {
    if (!end) return 'In progress...';
    const duration = end - start;
    return `${duration}ms`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Traces</h2>
        <p className="text-sm text-gray-500">{traces.length} total</p>
      </div>
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {traces.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No traces yet</p>
            <p className="text-sm mt-1">Run a demo to get started</p>
          </div>
        ) : (
          traces.map((trace) => (
            <button
              key={trace.traceId}
              onClick={() => onSelectTrace(trace)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                selectedTrace?.traceId === trace.traceId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {trace.metadata?.workflow || 'Workflow'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {trace.traceId}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span>{formatTime(trace.startTime)}</span>
                <span className="mx-2">•</span>
                <span>{trace.steps.length} steps</span>
                <span className="mx-2">•</span>
                <span>{formatDuration(trace.startTime, trace.endTime)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default TraceList;
