import React from 'react';

/**
 * Responsive SVG Donut Chart for Platform Solves Distribution
 */
export function DonutChart({
  data = [], // [{ label: 'LeetCode', value: 482, color: '#3b82f6' }]
  size = 180,
  strokeWidth = 24,
  centerLabel = 'Total',
  centerValue = '0'
}) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            data.map((item, idx) => {
              const strokeDashoffset = circumference - (item.value / total) * circumference;
              const angle = (item.value / total) * 360;
              const rotation = currentAngle;
              currentAngle += angle;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(${rotation + 90} ${size / 2} ${size / 2})`}
                  className="transition-all duration-700 hover:opacity-80"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-black">{centerValue}</span>
          <span className="text-[10px] uppercase font-semibold text-black/50 tracking-wider">
            {centerLabel}
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-black/70 font-medium truncate max-w-[80px]">{item.label}</span>
            </div>
            <span className="font-mono font-semibold text-black">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Difficulty Distribution Bar Chart (Easy, Medium, Hard)
 */
export function DifficultyDistribution({ easy = 0, medium = 0, hard = 0 }) {
  const total = easy + medium + hard || 1;
  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = 100 - easyPct - medPct;

  return (
    <div className="space-y-3 w-full">
      <div className="h-3 w-full rounded-full bg-black/10 overflow-hidden flex">
        <div
          style={{ width: `${easyPct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Easy: ${easy} (${easyPct}%)`}
        />
        <div
          style={{ width: `${medPct}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`Medium: ${medium} (${medPct}%)`}
        />
        <div
          style={{ width: `${hardPct}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Hard: ${hard} (${hardPct}%)`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="block text-[11px] text-emerald-700 font-semibold">Easy</span>
          <span className="text-base font-bold text-black">{easy}</span>
          <span className="block text-[10px] text-black/50">{easyPct}%</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="block text-[11px] text-amber-700 font-semibold">Medium</span>
          <span className="text-base font-bold text-black">{medium}</span>
          <span className="block text-[10px] text-black/50">{medPct}%</span>
        </div>
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="block text-[11px] text-rose-700 font-semibold">Hard</span>
          <span className="text-base font-bold text-black">{hard}</span>
          <span className="block text-[10px] text-black/50">{hardPct}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Radar / Spider Chart for Multi-Pillar Technical Balance
 */
export function RadarChart({
  pillars = [
    { label: 'DSA', score: 81 },
    { label: 'Web Dev', score: 68 },
    { label: 'Sys Design', score: 55 },
    { label: 'Projects', score: 70 },
    { label: 'Dev Activity', score: 65 }
  ],
  size = 280
}) {
  const center = size / 2;
  const radius = center - 40;
  const total = pillars.length;

  // Compute vertices for polygon
  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Concentric polygon grids (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];

  const valuePoints = pillars
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grids */}
        {gridLevels.map((lvl, idx) => {
          const points = pillars
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1"
              strokeDasharray={lvl === 100 ? 'none' : '3 3'}
            />
          );
        })}

        {/* Axis lines */}
        {pillars.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={valuePoints}
          fill="rgba(37, 99, 235, 0.15)"
          stroke="#2563eb"
          strokeWidth="2"
        />

        {/* Data points & labels */}
        {pillars.map((p, i) => {
          const { x, y } = getCoordinates(i, p.score);
          const labelCoord = getCoordinates(i, 118);

          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-mono fill-black/70 font-semibold"
              >
                {p.label} ({p.score}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
