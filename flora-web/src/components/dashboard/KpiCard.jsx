import React, { useState, useEffect } from 'react';

export const KpiCard = ({ label, value, icon: Icon, subtext, statusColor = 'text-primary' }) => {
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);
  const [count, setCount] = useState(isNumeric ? 0 : value);

  useEffect(() => {
    if (!isNumeric) return;

    // Detect user accessibility motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(numericValue);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 500; // fast 500ms count-up
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const currentCount = Math.floor(progress * (end - start) + start);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    }

    requestAnimationFrame(updateCount);
  }, [value, isNumeric, numericValue]);

  return (
    <div className="bg-surface border border-brand-border rounded p-5 shadow-sm transition-all duration-150 hover:border-brand-borderStrong hover:-translate-y-[1px] hover:shadow flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">{label}</p>
        <h3 className="text-3xl font-bold tracking-tight text-brand-text mb-1.5 leading-none">
          {isNumeric ? count : value}
        </h3>
        {subtext && <p className="text-[11px] text-brand-muted font-medium truncate">{subtext}</p>}
      </div>
      <div className={`p-2.5 rounded bg-slate-50 border border-brand-border shrink-0 ${statusColor}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};
export default KpiCard;
