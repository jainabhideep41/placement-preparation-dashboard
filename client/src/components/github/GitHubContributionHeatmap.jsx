import React, { useState } from 'react';
import { GitCommit, ExternalLink, Flame, Trophy, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Exact GitHub Contribution Calendar Heatmap
 * Pixel-perfect replica of the official GitHub contribution graph.
 */
export function GitHubContributionHeatmap({ 
  username, 
  calendar, 
  totalContributions, 
  loading = false,
  title,
  subtitle
}) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [internalCalendar, setInternalCalendar] = useState(calendar || null);
  const [internalLoading, setInternalLoading] = useState(false);

  React.useEffect(() => {
    if (calendar && calendar.weeks && calendar.weeks.length > 0) {
      setInternalCalendar(calendar);
      return;
    }

    if (username && username !== 'unlinked' && (!calendar || !calendar.weeks || calendar.weeks.length === 0)) {
      let isMounted = true;
      setInternalLoading(true);
      fetch(`/api/github/${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.success && data.data?.calendar) {
            setInternalCalendar(data.data.calendar);
          }
        })
        .catch(err => console.warn('Auto-fetch GitHub calendar warning:', err))
        .finally(() => {
          if (isMounted) setInternalLoading(false);
        });
      return () => { isMounted = false; };
    }
  }, [username, calendar]);

  const activeCalendar = calendar?.weeks?.length > 0 ? calendar : internalCalendar;
  const isLoading = loading || (internalLoading && (!activeCalendar || activeCalendar.weeks?.length === 0));

  const total = totalContributions !== undefined 
    ? totalContributions 
    : (activeCalendar?.totalContributions ?? 0);

  const weeks = activeCalendar?.weeks || [];
  const months = activeCalendar?.months || [];
  const currentStreak = activeCalendar?.currentStreak ?? 0;
  const longestStreak = activeCalendar?.longestStreak ?? 0;
  const maxInOneDay = activeCalendar?.maxInOneDay || { count: 0, date: '' };

  // Exact GitHub Contribution Colors (Level 0 to 4)
  const getLevelColor = (level) => {
    switch (level) {
      case 1:
        return 'bg-[#9be9a8] border-[#85e194]';
      case 2:
        return 'bg-[#40c463] border-[#34b655]';
      case 3:
        return 'bg-[#30a14e] border-[#279043]';
      case 4:
        return 'bg-[#216e39] border-[#1b5c2f]';
      default:
        return 'bg-[#ebedf0] border-black/5';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00Z');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleMouseEnter = (day, e) => {
    if (!day) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-black font-display tracking-tight">
              {title || (username ? `${total.toLocaleString()} contributions in the last year` : 'GitHub Contribution Activity')}
            </h3>
            {username && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Sync
              </span>
            )}
          </div>
          <p className="text-[11px] text-black/60 font-medium mt-0.5">
            {subtitle || (username 
              ? `Real-time contribution calendar synchronized with @${username} on GitHub`
              : 'Link your GitHub handle in settings to synchronize your verified contribution graph.')}
          </p>
        </div>

        {username && (
          <a
            href={`https://github.com/${encodeURIComponent(username)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/20 text-black text-xs font-mono font-bold transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          >
            <span>github.com/{username}</span>
            <ExternalLink className="w-3 h-3 text-black/50" />
          </a>
        )}
      </div>

      {/* Heatmap Area */}
      {isLoading ? (
        <div className="space-y-2 py-6 animate-pulse">
          <div className="h-4 bg-neutral-100 rounded w-1/3" />
          <div className="h-28 bg-neutral-100 rounded-xl w-full" />
        </div>
      ) : weeks.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#F9F9F7] border border-dashed border-black/20 text-center space-y-2">
          <Calendar className="w-8 h-8 text-black/30 mx-auto" />
          <p className="text-xs font-bold text-black font-display">No GitHub contribution calendar data available</p>
          <p className="text-[11px] text-black/60 max-w-sm mx-auto">
            Provide a valid public GitHub username to automatically pull the exact 365-day contribution heatmap.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Scrollable Container with Subtle Padding */}
          <div className="overflow-x-auto pb-2 pt-1 select-none">
            <div className="min-w-[760px] inline-block">
              {/* Month Header Labels */}
              <div className="flex text-[10px] font-mono text-black/60 font-semibold mb-1 pl-8 relative h-4">
                {months.map((m, idx) => (
                  <span
                    key={idx}
                    className="absolute"
                    style={{ left: `${32 + m.weekIndex * 13.5}px` }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>

              {/* Grid: Weekday Column (Mon, Wed, Fri) + 53 Week Columns */}
              <div className="flex gap-[3px]">
                {/* Weekday Row Labels */}
                <div className="flex flex-col justify-between text-[9px] font-mono text-black/50 pr-1.5 font-bold h-[92px] shrink-0">
                  <span className="leading-none pt-0.5">Sun</span>
                  <span className="leading-none pt-1">Mon</span>
                  <span className="leading-none pt-1 opacity-0">Tue</span>
                  <span className="leading-none pt-1">Wed</span>
                  <span className="leading-none pt-1 opacity-0">Thu</span>
                  <span className="leading-none pt-1">Fri</span>
                  <span className="leading-none pt-0.5 opacity-0">Sat</span>
                </div>

                {/* 53 Weeks Grid */}
                <div className="flex gap-[3px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${wIdx}-${dIdx}`}
                              className="w-[10.5px] h-[10.5px] rounded-[2px] opacity-0"
                            />
                          );
                        }

                        const level = day.level ?? 0;
                        const count = day.count ?? 0;

                        return (
                          <div
                            key={day.date || `${wIdx}-${dIdx}`}
                            onMouseEnter={(e) => handleMouseEnter(day, e)}
                            onMouseLeave={handleMouseLeave}
                            className={`w-[10.5px] h-[10.5px] rounded-[2px] border transition-transform hover:scale-125 hover:z-10 cursor-pointer ${getLevelColor(level)}`}
                            data-date={day.date}
                            data-count={count}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar: Legend & Statistics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/10 text-xs font-mono">
            {/* Quick Stats: Streaks and Peak Day */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-black/75">
              <span className="inline-flex items-center gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Current Streak: <strong>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</strong></span>
              </span>
              <span className="text-black/20">•</span>
              <span className="inline-flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5 text-blue-600" />
                <span>Longest Streak: <strong>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</strong></span>
              </span>
              {maxInOneDay.count > 0 && (
                <>
                  <span className="text-black/20">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span>Peak Day: <strong>{maxInOneDay.count} commits</strong> ({maxInOneDay.date})</span>
                  </span>
                </>
              )}
            </div>

            {/* GitHub Exact Color Legend */}
            <div className="flex items-center gap-1.5 text-[10px] text-black/60 font-bold shrink-0 self-end sm:self-auto">
              <span>Less</span>
              <div className="w-[10.5px] h-[10.5px] rounded-[2px] bg-[#ebedf0] border border-black/10" title="0 contributions" />
              <div className="w-[10.5px] h-[10.5px] rounded-[2px] bg-[#9be9a8] border border-[#85e194]" title="1-3 contributions" />
              <div className="w-[10.5px] h-[10.5px] rounded-[2px] bg-[#40c463] border-[#34b655]" title="4-6 contributions" />
              <div className="w-[10.5px] h-[10.5px] rounded-[2px] bg-[#30a14e] border-[#279043]" title="7-9 contributions" />
              <div className="w-[10.5px] h-[10.5px] rounded-[2px] bg-[#216e39] border-[#1b5c2f]" title="10+ contributions" />
              <span>More</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip (Exact GitHub wording) */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 bg-[#24292f] text-white text-[11px] font-sans font-medium rounded-md shadow-lg border border-neutral-700 whitespace-nowrap animate-fadeIn"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`
          }}
        >
          <div className="font-bold">
            {hoveredDay.count === 0 
              ? 'No contributions' 
              : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'contribution' : 'contributions'}`}
            <span className="font-normal text-neutral-300"> on {formatDate(hoveredDay.date)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GitHubContributionHeatmap;
