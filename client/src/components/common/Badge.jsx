import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }) {
  const variantStyles = {
    neutral: 'bg-black/5 text-black/60 border-black/10',
    blue: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
    cyan: 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20',
    emerald: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    rose: 'bg-rose-600/10 text-rose-600 border-rose-600/20',
    purple: 'bg-purple-600/10 text-purple-600 border-purple-600/20'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border font-mono tracking-wide ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }) {
  const lower = (difficulty || '').toLowerCase();
  if (lower === 'easy') return <Badge variant="emerald">Easy</Badge>;
  if (lower === 'medium') return <Badge variant="amber">Medium</Badge>;
  if (lower === 'hard') return <Badge variant="rose">Hard</Badge>;
  return <Badge variant="neutral">{difficulty}</Badge>;
}

export function StatusBadge({ status }) {
  const lower = (status || '').toLowerCase();
  if (lower === 'solved' || lower === 'completed' || lower === 'mastered') {
    return <Badge variant="emerald">{status}</Badge>;
  }
  if (lower === 'due' || lower === 'in progress') {
    return <Badge variant="amber">{status}</Badge>;
  }
  if (lower === 'done') {
    return <Badge variant="blue">{status}</Badge>;
  }
  return <Badge variant="neutral">{status}</Badge>;
}
