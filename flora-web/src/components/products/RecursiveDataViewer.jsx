import React from 'react';

/**
 * RecursiveDataViewer renders nested objects/arrays in a readable tree.
 * Used by both ProductDetailDrawer and IntelligencePanel.
 */
const RecursiveDataViewer = ({ data, level = 0 }) => {
  if (data === null || data === undefined) {
    return <span className="text-brand-muted italic">Not available</span>;
  }
  if (typeof data !== 'object') {
    return <span className="text-brand-text font-semibold break-all">{String(data)}</span>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-brand-muted italic">Empty array</span>;
    return (
      <ul className="list-disc pl-4 space-y-1">
        {data.map((item, idx) => (
          <li key={idx} className="text-sm">
            <RecursiveDataViewer data={item} level={level + 1} />
          </li>
        ))}
      </ul>
    );
  }
  const entries = Object.entries(data);
  if (entries.length === 0) return <span className="text-brand-muted italic">Empty object</span>;
  return (
    <div className={`space-y-2 ${level > 0 ? 'mt-1' : ''}`}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${level > 0 ? 'pl-3 border-l border-brand-border/50' : ''}`}>
          <span className="text-[10px] uppercase font-bold text-brand-muted block mb-0.5">{key}</span>
          <div className="text-sm">
            <RecursiveDataViewer data={value} level={level + 1} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecursiveDataViewer;
