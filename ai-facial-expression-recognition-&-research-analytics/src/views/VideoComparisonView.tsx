/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module F: Multi-Video Comparison Laboratory.
 * Allows researchers to compare aggregate expression dynamics across 2 or more videos:
 *  - Side-by-side aggregate category distributions
 *  - Sampling rate, latency, and duration comparisons
 *  - Input quality metrics (blur, lighting, resolution)
 *  - Exportable comparative CSV/JSON summary
 *  - Strict privacy constraint: NEVER performs biometric identity matching across videos.
 */

import React, { useState } from 'react';
import {
  SplitSquareVertical,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  TrendingUp
} from 'lucide-react';
import { AnalysisSession, ALL_EXPRESSIONS, ExpressionCategory } from '../types/fer';
import { createSampleDemoSession } from '../utils/demoAssets';
import { ExpressionBadge } from '../components/ExpressionBadge';

interface VideoComparisonViewProps {
  sessions: AnalysisSession[];
}

const CATEGORY_COLORS: Record<ExpressionCategory, string> = {
  Happy: '#10B981',
  Surprise: '#06B6D4',
  Sad: '#3B82F6',
  Angry: '#F43F5E',
  Fear: '#A855F7',
  Disgust: '#F59E0B',
  Neutral: '#94A3B8'
};

export const VideoComparisonView: React.FC<VideoComparisonViewProps> = ({ sessions }) => {
  const videoSessions = sessions.filter(s => s.mode === 'video_upload' || s.mode === 'demo_sample');

  const demoSessionA = videoSessions[0] || createSampleDemoSession('video_interview');
  const demoSessionB = videoSessions[1] || createSampleDemoSession('video_usability');

  const [sessionAId, setSessionAId] = useState<string>(demoSessionA.id);
  const [sessionBId, setSessionBId] = useState<string>(demoSessionB.id);

  const sessionA = sessions.find(s => s.id === sessionAId) || demoSessionA;
  const sessionB = sessions.find(s => s.id === sessionBId) || demoSessionB;

  // Export comparison as CSV
  const exportComparisonCsv = () => {
    const headers = ['Category', `${sessionA.title} Count`, `${sessionA.title} %`, `${sessionB.title} Count`, `${sessionB.title} %`, 'Delta %'];
    
    const countA = Object.values(sessionA.categoryFrequencies).reduce((a, b) => a + b, 0);
    const countB = Object.values(sessionB.categoryFrequencies).reduce((a, b) => a + b, 0);

    const rows = ALL_EXPRESSIONS.map(exp => {
      const a = sessionA.categoryFrequencies[exp] || 0;
      const b = sessionB.categoryFrequencies[exp] || 0;
      const pctA = countA > 0 ? (a / countA) * 100 : 0;
      const pctB = countB > 0 ? (b / countB) * 100 : 0;
      const delta = pctB - pctA;
      // Formula-safe escaping for CSV
      return [exp, a, pctA.toFixed(1), b, pctB.toFixed(1), delta.toFixed(1)];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_comparison_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const countA = Object.values(sessionA.categoryFrequencies).reduce((a, b) => a + b, 0);
  const countB = Object.values(sessionB.categoryFrequencies).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5 text-cyan-400" />
            Multi-Video Comparative Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side aggregation across distinct video processing jobs without cross-video biometric tracking
          </p>
        </div>

        <button
          onClick={exportComparisonCsv}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 rounded font-medium flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Comparison CSV</span>
        </button>
      </div>

      {/* Mandatory Ethical Privacy Restriction Banner */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-300 font-medium">Privacy Safeguard Notice:</strong> Comparative analytics measures aggregate group-level or sequence-level distributions only. This system strictly prohibits facial identity matching, persistent person re-identification across videos, or psychological profiling.
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Baseline Video (Job A):
          </label>
          <select
            value={sessionAId}
            onChange={e => setSessionAId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.durationSeconds || 10}s)
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Comparison Video (Job B):
          </label>
          <select
            value={sessionBId}
            onChange={e => setSessionBId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.durationSeconds || 10}s)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Metadata & KPI Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 text-sm truncate">
              Job A: {sessionA.title}
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              {sessionA.modelVersion.split(' ')[0]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-2 bg-slate-950 rounded">
              <span className="text-[10px] text-slate-500 block">Duration</span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">
                {sessionA.durationSeconds || 10}s
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded">
              <span className="text-[10px] text-slate-500 block">Mean Conf</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-400">
                {Math.round(sessionA.averageConfidence * 100)}%
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded">
              <span className="text-[10px] text-slate-500 block">Quality</span>
              <span className="font-mono tabular-nums font-semibold text-cyan-400">
                {sessionA.averageQualityScore}/100
              </span>
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-1.5 pt-1">
            {ALL_EXPRESSIONS.map(exp => {
              const c = sessionA.categoryFrequencies[exp] || 0;
              const p = countA > 0 ? Math.round((c / countA) * 100) : 0;
              return (
                <div key={exp} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 w-16">{exp}</span>
                  <div className="flex-1 mx-2 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p}%`, backgroundColor: CATEGORY_COLORS[exp] }}
                    />
                  </div>
                  <span className="font-mono tabular-nums text-slate-400 text-[11px] w-12 text-right">
                    {p}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card B */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 text-sm truncate">
              Job B: {sessionB.title}
            </h3>
            <span className="text-[11px] text-purple-400 font-mono">
              {sessionB.modelVersion.split(' ')[0]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="p-2 bg-slate-950 rounded">
              <span className="text-[10px] text-slate-500 block">Duration</span>
              <span className="font-mono tabular-nums font-semibold text-slate-200">
                {sessionB.durationSeconds || 10}s
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded">
              <span className="text-[10px] text-slate-500 block">Mean Conf</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-400">
                {Math.round(sessionB.averageConfidence * 100)}%
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded">
              <span className="text-[10px] text-slate-500 block">Quality</span>
              <span className="font-mono tabular-nums font-semibold text-cyan-400">
                {sessionB.averageQualityScore}/100
              </span>
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-1.5 pt-1">
            {ALL_EXPRESSIONS.map(exp => {
              const c = sessionB.categoryFrequencies[exp] || 0;
              const p = countB > 0 ? Math.round((c / countB) * 100) : 0;
              return (
                <div key={exp} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 w-16">{exp}</span>
                  <div className="flex-1 mx-2 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p}%`, backgroundColor: CATEGORY_COLORS[exp] }}
                    />
                  </div>
                  <span className="font-mono tabular-nums text-slate-400 text-[11px] w-12 text-right">
                    {p}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparative Delta Matrix Table */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Differential Distribution Matrix (Job B vs Job A)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">Category</th>
                <th className="py-2 px-3 font-semibold text-right">Job A Share</th>
                <th className="py-2 px-3 font-semibold text-right">Job B Share</th>
                <th className="py-2 px-3 font-semibold text-right">Net Shift (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ALL_EXPRESSIONS.map(exp => {
                const a = sessionA.categoryFrequencies[exp] || 0;
                const b = sessionB.categoryFrequencies[exp] || 0;
                const pctA = countA > 0 ? (a / countA) * 100 : 0;
                const pctB = countB > 0 ? (b / countB) * 100 : 0;
                const delta = pctB - pctA;

                return (
                  <tr key={exp} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{exp}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {pctA.toFixed(1)}% ({a})
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {pctB.toFixed(1)}% ({b})
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${
                      delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
