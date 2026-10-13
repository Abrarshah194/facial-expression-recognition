/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module A: Dedicated Expression Timeline View.
 * Provides deep time-series exploration across video frames with:
 *  - Session selector (recorded runs or benchmark sequences)
 *  - Configurable sampling intervals and timestamps
 *  - Interactive scrubber and playback
 *  - Moving Average (EMA) and Savitzky-Golay quadratic polynomial smoothing
 *  - Clear separation between individual frame inference and aggregate trends
 *  - Ethical disclaimers
 */

import React, { useState } from 'react';
import { Activity, Clock, Sliders, Info, ShieldCheck } from 'lucide-react';
import { AnalysisSession, FramePrediction } from '../types/fer';
import { TemporalTimelineChart } from '../components/TemporalTimelineChart';
import { EthicalDisclaimerBanner } from '../components/EthicalDisclaimerBanner';
import { createSampleDemoSession } from '../utils/demoAssets';

interface ExpressionTimelineViewProps {
  sessions: AnalysisSession[];
  initialSessionId?: string;
}

export const ExpressionTimelineView: React.FC<ExpressionTimelineViewProps> = ({
  sessions,
  initialSessionId
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessionId || sessions[0]?.id || 'demo-session'
  );

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0] || createSampleDemoSession('video_interview');
  const frames: FramePrediction[] = activeSession.frames || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Temporal Expression Analytics & Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous time-series analysis across video frames with Savitzky-Golay noise filtering
          </p>
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Select Session:</span>
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.durationSeconds || 10}s)
              </option>
            ))}
          </select>
        </div>
      </div>

      <EthicalDisclaimerBanner />

      {/* Session Metadata Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">
            {activeSession.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-400 mt-1">
            <span>Duration: <strong className="text-slate-300 font-mono">{activeSession.durationSeconds || 10}s</strong></span>
            <span>·</span>
            <span>Sampling Interval: <strong className="text-slate-300 font-mono">{activeSession.samplingIntervalMs || 250}ms</strong></span>
            <span>·</span>
            <span>Model: <strong className="text-slate-300">{activeSession.modelVersion}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Dominant State</span>
            <span className="font-semibold text-cyan-400 text-sm">
              {activeSession.dominantCategory}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Mean Confidence</span>
            <span className="font-mono tabular-nums text-slate-200 text-sm">
              {Math.round(activeSession.averageConfidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Chart Component */}
      <TemporalTimelineChart
        frames={frames}
        samplingIntervalMs={activeSession.samplingIntervalMs || 250}
        videoDurationSeconds={activeSession.durationSeconds || 10}
      />
    </div>
  );
};
