import React from 'react';

export function LoadingSkeleton({ lines = 4, className = '' }) {
  return (
    <div className={`p-6 rounded-2xl bg-white border border-black/10 shadow-sm animate-pulse space-y-4 ${className}`}>
      <div className="h-6 bg-black/10 rounded-lg w-1/3" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-black/5 rounded-md"
            style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-black/15 bg-white/50 backdrop-blur-sm">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-black/60 mb-3 border border-black/10">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-black font-display">{title}</h3>
      <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
