function StepCard({ step, index, isExpanded, onToggle, isLast }) {
  const formatStepName = (name) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderJSON = (data, title) => {
    if (!data) return null;

    return (
      <div className="mt-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border border-gray-200">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  const renderFilterEvaluations = (output) => {
    if (!output.evaluations) return null;

    const passed = output.evaluations.filter((e) => e.qualified);
    const failed = output.evaluations.filter((e) => !e.qualified);

    return (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-600 font-semibold">Total Evaluated</p>
            <p className="text-2xl font-bold text-blue-900">{output.total_evaluated}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-600 font-semibold">Passed</p>
            <p className="text-2xl font-bold text-green-900">{output.passed}</p>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <p className="text-red-600 font-semibold">Failed</p>
            <p className="text-2xl font-bold text-red-900">{output.failed}</p>
          </div>
        </div>

        {/* Filters Applied */}
        {output.filters_applied && (
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Filters Applied</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(output.filters_applied).map(([key, filter]) => (
                <div key={key} className="flex items-start">
                  <span className="text-gray-600 font-medium mr-2">
                    {formatStepName(key)}:
                  </span>
                  <span className="text-gray-800">
                    {filter.rule || JSON.stringify(filter)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passed Products */}
        {passed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">
              ✓ Passed Products ({passed.length})
            </h4>
            <div className="space-y-2">
              {passed.map((item) => (
                <div
                  key={item.asin}
                  className="bg-green-50 border border-green-200 p-3 rounded text-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-green-900">{item.title}</p>
                      <p className="text-xs text-green-600">{item.asin}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-green-900 font-semibold">
                        ${item.metrics.price}
                      </p>
                      <p className="text-green-700">
                        ⭐ {item.metrics.rating} ({item.metrics.reviews} reviews)
                      </p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    {Object.entries(item.filter_results).map(([key, result]) => (
                      <div key={key} className="flex items-center text-green-700">
                        <span className="mr-2">✓</span>
                        <span>{result.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Products */}
        {failed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2">
              ✗ Failed Products ({failed.length})
            </h4>
            <div className="space-y-2">
              {failed.map((item) => (
                <div
                  key={item.asin}
                  className="bg-red-50 border border-red-200 p-3 rounded text-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-red-900">{item.title}</p>
                      <p className="text-xs text-red-600">{item.asin}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-red-900 font-semibold">
                        ${item.metrics.price}
                      </p>
                      <p className="text-red-700">
                        ⭐ {item.metrics.rating} ({item.metrics.reviews} reviews)
                      </p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    {Object.entries(item.filter_results).map(([key, result]) => (
                      <div
                        key={key}
                        className={`flex items-center ${
                          result.passed ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        <span className="mr-2">{result.passed ? '✓' : '✗'}</span>
                        <span>{result.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRankingResults = (output) => {
    if (!output.ranked_candidates) return null;

    return (
      <div className="mt-4 space-y-3">
        {/* Selected Competitor */}
        {output.selection && (
          <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              🏆 Selected Competitor
            </h4>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-blue-900">{output.selection.title}</p>
                <p className="text-xs text-blue-600">{output.selection.asin}</p>
                <p className="text-sm text-blue-700 mt-2">{output.selection.reason}</p>
              </div>
              {output.selected_competitor && (
                <div className="text-right text-sm">
                  <p className="text-blue-900 font-semibold">
                    ${output.selected_competitor.price}
                  </p>
                  <p className="text-blue-700">
                    ⭐ {output.selected_competitor.rating} (
                    {output.selected_competitor.reviews} reviews)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ranked Candidates */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Ranked Candidates
          </h4>
          <div className="space-y-2">
            {output.ranked_candidates.map((candidate) => (
              <div
                key={candidate.asin}
                className={`p-3 rounded text-sm border ${
                  candidate.rank === 1
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        candidate.rank === 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      #{candidate.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{candidate.title}</p>
                      <p className="text-xs text-gray-600">{candidate.asin}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-900 font-semibold">
                      Score: {candidate.total_score.toFixed(3)}
                    </p>
                    <p className="text-gray-700">
                      ${candidate.metrics.price} • ⭐ {candidate.metrics.rating}
                    </p>
                  </div>
                </div>
                {candidate.score_breakdown && (
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    {Object.entries(candidate.score_breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{formatStepName(key)}:</span>
                        <span className="font-mono">{value.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Step Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
            {index + 1}
          </span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">
              {formatStepName(step.step)}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(step.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Step Content */}
      {isExpanded && (
        <div className="px-4 py-4 bg-white">
          {/* Reasoning */}
          {step.reasoning && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 Reasoning</h4>
              <p className="text-sm text-blue-800">{step.reasoning}</p>
            </div>
          )}

          {/* Special rendering for filter step */}
          {step.step === 'apply_filters' && step.output && (
            <>{renderFilterEvaluations(step.output)}</>
          )}

          {/* Special rendering for ranking step */}
          {step.step === 'rank_and_select' && step.output && (
            <>{renderRankingResults(step.output)}</>
          )}

          {/* Generic Input/Output for other steps */}
          {step.step !== 'apply_filters' && step.step !== 'rank_and_select' && (
            <>
              {step.input && renderJSON(step.input, '📥 Input')}
              {step.output && renderJSON(step.output, '📤 Output')}
            </>
          )}

          {/* Metadata */}
          {step.metadata && Object.keys(step.metadata).length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Metadata</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(step.metadata).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StepCard;
