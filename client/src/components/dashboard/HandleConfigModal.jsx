import React, { useState } from 'react';
import { X, Code2, RefreshCw, Sparkles, Check, ExternalLink } from 'lucide-react';

export function HandleConfigModal({ isOpen, onClose, handles, onApplyHandles, syncing }) {
  const [lc, setLc] = useState(handles?.leetcode || '');
  const [cf, setCf] = useState(handles?.codeforces || '');
  const [gh, setGh] = useState(handles?.github || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyHandles(cf.trim(), lc.trim(), gh.trim());
    onClose();
  };

  const loadPreset = (presetCf, presetLc, presetGh) => {
    setCf(presetCf);
    setLc(presetLc);
    setGh(presetGh);
    onApplyHandles(presetCf, presetLc, presetGh);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Connected Coding Accounts</h3>
              <p className="text-[10px] text-gray-500">Auto-sync solves, contest ratings & commits</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
            Quick Demo Profiles:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => loadPreset('tourist', 'tourist', 'torvalds')}
              className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-xs font-mono font-medium hover:border-black text-gray-800 transition-colors"
            >
              Tourist (CF 3300+)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('Petr', 'neal_wu', 'gaearon')}
              className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-xs font-mono font-medium hover:border-black text-gray-800 transition-colors"
            >
              Neal Wu (LC #2)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('', '', '')}
              className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-xs font-mono font-medium hover:border-black text-gray-500 transition-colors"
            >
              Reset (0)
            </button>
          </div>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>LeetCode Username</span>
              <span className="text-[10px] text-gray-400 font-mono">Rating + Solves</span>
            </label>
            <input
              type="text"
              value={lc}
              onChange={(e) => setLc(e.target.value)}
              placeholder="e.g. neal_wu"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>Codeforces Handle</span>
              <span className="text-[10px] text-gray-400 font-mono">Contest Curve</span>
            </label>
            <input
              type="text"
              value={cf}
              onChange={(e) => setCf(e.target.value)}
              placeholder="e.g. tourist"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>GitHub Username</span>
              <span className="text-[10px] text-gray-400 font-mono">FOSS Commits</span>
            </label>
            <input
              type="text"
              value={gh}
              onChange={(e) => setGh(e.target.value)}
              placeholder="e.g. torvalds"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-black focus:bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Sync Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
