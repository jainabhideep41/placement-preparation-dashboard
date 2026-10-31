import React from 'react';

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeVariant = 'blue',
  color = 'blue',
  onClick,
  className = ''
}) {
  const borderColors = {
    blue: 'hover:border-blue-600/30',
    cyan: 'hover:border-cyan-600/30',
    emerald: 'hover:border-emerald-600/30',
    amber: 'hover:border-amber-600/30',
    purple: 'hover:border-purple-600/30',
    rose: 'hover:border-rose-600/30'
  };

  const iconBg = {
    blue: 'bg-blue-600 text-white',
    cyan: 'bg-cyan-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-500 text-white',
    purple: 'bg-purple-600 text-white',
    rose: 'bg-rose-600 text-white'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-white border border-black/10 shadow-sm hover:shadow-md hover:border-black/20 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${borderColors[color] || borderColors.blue} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-black/50 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-black">{value}</span>
            {badge && (
              <span className="text-xs font-mono font-medium text-black/40">{badge}</span>
            )}
          </div>
          {subtext && <p className="text-xs text-black/50 font-normal">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg[color] || iconBg.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
