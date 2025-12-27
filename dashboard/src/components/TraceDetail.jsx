import { useState } from 'react';
import StepCard from './StepCard';

function TraceDetail({ trace }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set([0]));

  const toggleStep = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAll = () => {
    setExpandedSteps(new Set(trace.steps.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (start, end) => {
    if (!end) return 'In progress...';
    const duration = end - start;
    return `${duration}ms`;
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(trace, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trace-${trace.traceId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Trace Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {trace.metadata?.workflow || 'Trace Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {trace.metadata?.description || trace.traceId}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadJSON}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              title="Download trace as JSON"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download JSON
            </button>
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Trace Metadata */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Start Time:</span>
            <p className="font-medium text-gray-900">{formatTime(trace.startTime)}</p>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <p className="font-medium text-gray-900">
              {formatDuration(trace.startTime, trace.endTime)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Steps:</span>
            <p className="font-medium text-gray-900">{trace.steps.length}</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-6 space-y-4 flex-1">
        {trace.steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            index={index}
            isExpanded={expandedSteps.has(index)}
            onToggle={() => toggleStep(index)}
            isLast={index === trace.steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default TraceDetail;
