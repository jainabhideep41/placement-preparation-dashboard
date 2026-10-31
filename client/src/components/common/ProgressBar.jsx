import React from 'react';

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  label, 
  subLabel, 
  showPercentage = true, 
  color = 'blue', 
  height = 'h-2',
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorGradients = {
    blue: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-black/70">{label}</span>
          <div className="flex items-center gap-2">
            {subLabel && <span className="text-black/40 font-mono">{subLabel}</span>}
            {showPercentage && (
              <span className="font-mono font-semibold text-black">{percentage}%</span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-black/10 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${colorGradients[color] || colorGradients.blue}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
