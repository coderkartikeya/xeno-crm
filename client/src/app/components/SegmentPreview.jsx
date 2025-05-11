import React, { useState } from 'react';

export default function SegmentPreview({ rules }) {
  const [audience, setAudience] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    // Mock backend call
    setTimeout(() => {
      setAudience(Math.floor(Math.random() * 1000));
      setLoading(false);
    }, 800);
    // In real app, use fetch('/api/segment/preview', { method: 'POST', body: JSON.stringify(rules) })
  };

  return (
    <div className="mt-4">
      <button
        onClick={handlePreview}
        className="bg-indigo-600 text-white px-4 py-2 rounded shadow"
        disabled={loading}
      >
        {loading ? 'Calculating...' : 'Preview Audience Size'}
      </button>
      {audience !== null && (
        <div className="mt-2 text-lg font-bold text-green-700 dark:text-green-400">
          Audience Size: {audience}
        </div>
      )}
      <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
        {JSON.stringify(rules, null, 2)}
      </pre>
    </div>
  );
} 