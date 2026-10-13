/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dashboard View.
 * Real metrics, recent sessions, category distribution, system status,
 * quick action launches, and ethical transparency notices.
 */

import React from 'react';
import {
  Camera,
  Film,
  Image,
  Activity,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { AnalysisSession, ALL_EXPRESSIONS, ExpressionCategory } from '../types/fer';
import { EthicalDisclaimerBanner } from '../components/EthicalDisclaimerBanner';
import { ExpressionBadge } from '../components/ExpressionBadge';
import { EXPRESSION_TRANSLATIONS } from '../utils/translations';

interface DashboardViewProps {
  sessions: AnalysisSession[];
  onNavigate: (view: string, sessionId?: string) => void;
  activeModelName: string;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  onNavigate,
  activeModelName
}) => {
  // Aggregate real session statistics
  const totalSessions = sessions.length;
  let totalFrames = 0;
  let totalConfidence = 0;
  let totalQuality = 0;
  const categoryTotals: Record<ExpressionCategory, number> = {
    Happy: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0, Neutral: 0
  };

  sessions.forEach(s => {
    totalFrames += s.frames?.length || (s.durationSeconds ? s.durationSeconds * 4 : 1);
    totalConfidence += s.averageConfidence;
    totalQuality += s.averageQualityScore;
    ALL_EXPRESSIONS.forEach(exp => {
      categoryTotals[exp] += s.categoryFrequencies[exp] || 0;
    });
  });

  const avgConfidence = totalSessions > 0 ? (totalConfidence / totalSessions) * 100 : 85;
  const avgQuality = totalSessions > 0 ? totalQuality / totalSessions : 90;

  const totalClassified = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Scientific Boundary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Facial Expression Recognition & Research Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Voluntary affective research platform with temporal series, uncertainty calibration, and local-first privacy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Active:</span>
            <span className="font-semibold text-slate-200">{activeModelName}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/50 rounded text-xs text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local Processing Only</span>
          </div>
        </div>
      </div>

      <EthicalDisclaimerBanner />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Sessions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
            {totalSessions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Stored under local policy
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Processed Frames</span>
            <Film className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
            {totalFrames.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Sampled time points
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Mean Confidence</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {avgConfidence.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Calibrated softmax output
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Input Quality Index</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
            {avgQuality.toFixed(0)}/100
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Mean Laplacian & Luma index
          </div>
        </div>
      </div>

      {/* Action Launch Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('camera')}
          className="p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-slate-200 text-sm">Live Camera Capture</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time optical feed with landmark detection, FACS Action Unit activations, and frame rate monitoring.
          </p>
        </button>

        <button
          onClick={() => onNavigate('video')}
          className="p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-lg text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Film className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-slate-200 text-sm">Video Analysis Lab</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Temporal time-series analysis across video frames with configurable sampling and Savitzky-Golay filtering.
          </p>
        </button>

        <button
          onClick={() => onNavigate('image')}
          className="p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Image className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-slate-200 text-sm">Image Analysis</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Single-frame or multi-face inspection with blur Laplacian estimation and Ekman AU decomposition.
          </p>
        </button>
      </div>

      {/* Aggregate Expression Distribution Chart & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aggregate Distribution Bar Chart */}
        <div className="lg:col-span-1 p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Expression Category Distribution
              </h3>
              <p className="text-xs text-slate-400">Aggregate across all active sessions</p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {totalClassified} points
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {ALL_EXPRESSIONS.map(exp => {
              const count = categoryTotals[exp] || 0;
              const pct = totalClassified > 0 ? Math.round((count / totalClassified) * 100) : 0;
              const urdu = EXPRESSION_TRANSLATIONS[exp]?.ur || exp;
              return (
                <div key={exp} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium flex items-center gap-1.5">
                      <span className="text-cyan-400 font-semibold" dir="rtl">{urdu}</span>
                      <span className="text-slate-400 text-[11px]">({exp})</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {pct}% ({count})
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLORS[exp]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            *Observed physical expressions only. Never to be conflated with genuine internal emotional disposition.
          </p>
        </div>

        {/* Recent Analysis Sessions Table */}
        <div className="lg:col-span-2 p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Recent Analysis Sessions
              </h3>
              <p className="text-xs text-slate-400">Local sessions stored within retention policy</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:underline"
            >
              View Full History →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Session Title</th>
                  <th className="py-2 px-3 font-semibold">Mode</th>
                  <th className="py-2 px-3 font-semibold">Dominant</th>
                  <th className="py-2 px-3 font-semibold text-right">Confidence</th>
                  <th className="py-2 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.slice(0, 5).map(session => (
                  <tr key={session.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[200px]">
                      <div>{session.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(session.timestamp).toLocaleDateString()} · {session.modelVersion}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-400">
                      {session.mode.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <ExpressionBadge
                        expression={session.dominantCategory}
                        confidence={session.averageConfidence}
                        showConfidence={false}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {Math.round(session.averageConfidence * 100)}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onNavigate('timeline', session.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
