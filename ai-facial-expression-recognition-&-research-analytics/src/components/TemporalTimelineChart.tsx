/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module A: Temporal Expression Analytics.
 * Renders time-series probability distributions across video frames with:
 *  - Configurable sampling interval and precise timestamps
 *  - Interactive scrubber to inspect individual frame vs aggregate metrics
 *  - Visual missing-data indicators for lost or occluded frames
 *  - Moving Average (EMA) & Savitzky-Golay polynomial smoothing controls
 *  - Play, pause, step forward/back controls
 *  - Ethical disclaimer
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Info,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  FramePrediction,
  ExpressionCategory,
  ALL_EXPRESSIONS,
  FaceDetection
} from '../types/fer';
import {
  applyExponentialSmoothing,
  applySavitzkyGolaySmoothing,
  SmoothingMethod
} from '../utils/smoothing';
import { ExpressionBadge } from './ExpressionBadge';

interface TemporalTimelineChartProps {
  frames: FramePrediction[];
  samplingIntervalMs?: number;
  videoDurationSeconds?: number;
  onSelectFrame?: (frameIndex: number) => void;
  selectedFrameIndex?: number;
}

const CATEGORY_COLORS: Record<ExpressionCategory, string> = {
  Happy: '#10B981',   // Emerald
  Surprise: '#06B6D4',// Cyan
  Sad: '#3B82F6',     // Blue
  Angry: '#F43F5E',   // Rose
  Fear: '#A855F7',    // Purple
  Disgust: '#F59E0B', // Amber
  Neutral: '#94A3B8'  // Slate
};

export const TemporalTimelineChart: React.FC<TemporalTimelineChartProps> = ({
  frames,
  samplingIntervalMs = 250,
  videoDurationSeconds = 10,
  onSelectFrame,
  selectedFrameIndex: externalFrameIndex
}) => {
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [smoothing, setSmoothing] = useState<SmoothingMethod>('none');
  const [activeCategories, setActiveCategories] = useState<Set<ExpressionCategory>>(
    new Set(['Happy', 'Surprise', 'Sad', 'Angry', 'Neutral'])
  );

  // Sync external index if provided
  useEffect(() => {
    if (externalFrameIndex !== undefined) {
      setCurrentFrameIdx(externalFrameIndex);
    }
  }, [externalFrameIndex]);

  // Apply chosen smoothing
  const processedFrames = useMemo(() => {
    if (smoothing === 'exponential') {
      return applyExponentialSmoothing(frames, 0.35);
    }
    if (smoothing === 'savitzky_golay') {
      return applySavitzkyGolaySmoothing(frames);
    }
    return frames;
  }, [frames, smoothing]);

  // Auto-play animation timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(50, samplingIntervalMs / playbackSpeed);

    const timer = setInterval(() => {
      setCurrentFrameIdx(prev => {
        if (prev >= processedFrames.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        const next = prev + 1;
        if (onSelectFrame) onSelectFrame(next);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, samplingIntervalMs, processedFrames.length, onSelectFrame]);

  const activeFrame = processedFrames[currentFrameIdx] || processedFrames[0];
  const activeFace = activeFrame?.faceDetections?.[0];

  // Aggregate distribution calculation
  const aggregateFrequencies = useMemo(() => {
    const freqs: Record<ExpressionCategory, number> = {
      Happy: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0, Neutral: 0
    };
    let count = 0;
    processedFrames.forEach(f => {
      if (!f.missingData && f.faceDetections.length > 0) {
        const exp = f.faceDetections[0].expression;
        if (exp !== 'Uncertain') {
          freqs[exp]++;
          count++;
        }
      }
    });
    return { freqs, count };
  }, [processedFrames]);

  const toggleCategory = (cat: ExpressionCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const chartWidth = 840;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const totalPoints = Math.max(1, processedFrames.length);

  // Generate SVG paths for each active category
  const categoryPaths = useMemo(() => {
    const paths: { category: ExpressionCategory; d: string; color: string }[] = [];

    Array.from(activeCategories).forEach(cat => {
      let d = '';
      let isDrawing = false;

      processedFrames.forEach((frame, idx) => {
        const x = padding.left + (idx / (totalPoints - 1 || 1)) * innerWidth;

        if (frame.missingData || frame.faceDetections.length === 0) {
          isDrawing = false;
          return;
        }

        const prob = frame.faceDetections[0].classProbabilities?.[cat] ?? 0;
        const y = padding.top + innerHeight - prob * innerHeight;

        if (!isDrawing) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          isDrawing = true;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });

      if (d) {
        paths.push({ category: cat, d, color: CATEGORY_COLORS[cat] });
      }
    });

    return paths;
  }, [processedFrames, activeCategories, innerWidth, innerHeight, padding.left, padding.top, totalPoints]);

  // Missing data intervals
  const missingIntervals = useMemo(() => {
    const intervals: { x: number; width: number }[] = [];
    processedFrames.forEach((frame, idx) => {
      if (frame.missingData || frame.faceDetections.length === 0) {
        const x = padding.left + (idx / (totalPoints - 1 || 1)) * innerWidth;
        const w = Math.max(2, innerWidth / totalPoints);
        intervals.push({ x, width: w });
      }
    });
    return intervals;
  }, [processedFrames, innerWidth, padding.left, totalPoints]);

  const scrubberX = padding.left + (currentFrameIdx / (totalPoints - 1 || 1)) * innerWidth;

  const handleTimelineClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - padding.left;
    const ratio = Math.max(0, Math.min(1, clickX / innerWidth));
    const targetIdx = Math.round(ratio * (totalPoints - 1));
    setCurrentFrameIdx(targetIdx);
    if (onSelectFrame) onSelectFrame(targetIdx);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
        {/* Playback & Scrubber Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center w-8 h-8 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors"
            title={isPlaying ? 'Pause timeline playback' : 'Play timeline'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setCurrentFrameIdx(0);
              if (onSelectFrame) onSelectFrame(0);
            }}
            className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              const prev = Math.max(0, currentFrameIdx - 1);
              setCurrentFrameIdx(prev);
              if (onSelectFrame) onSelectFrame(prev);
            }}
            className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Step back 1 frame"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              const next = Math.min(totalPoints - 1, currentFrameIdx + 1);
              setCurrentFrameIdx(next);
              if (onSelectFrame) onSelectFrame(next);
            }}
            className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Step forward 1 frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Timecode display */}
          <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono tabular-nums text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {activeFrame ? `${activeFrame.timestampSeconds.toFixed(2)}s` : '0.00s'}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">
              Frame {currentFrameIdx + 1} of {totalPoints}
            </span>
          </div>
        </div>

        {/* Smoothing Selector & Justification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Smoothing:</span>
          </div>
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded">
            <button
              onClick={() => setSmoothing('none')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                smoothing === 'none'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw (None)
            </button>
            <button
              onClick={() => setSmoothing('exponential')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                smoothing === 'exponential'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Exponential Moving Average (alpha=0.35) reduces camera noise"
            >
              EMA
            </button>
            <button
              onClick={() => setSmoothing('savitzky_golay')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                smoothing === 'savitzky_golay'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Savitzky-Golay quadratic filter preserves peak micro-movements"
            >
              Savitzky-Golay
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Series:</span>
            {ALL_EXPRESSIONS.map(exp => {
              const active = activeCategories.has(exp);
              const color = CATEGORY_COLORS[exp];
              return (
                <button
                  key={exp}
                  onClick={() => toggleCategory(exp)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all text-xs font-medium border ${
                    active
                      ? 'border-slate-700 bg-slate-800/90 text-slate-200'
                      : 'border-slate-900 bg-slate-950/60 text-slate-600 line-through'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: active ? color : '#475569' }}
                  />
                  <span>{exp}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-500" />
            <span>Click or drag scrubber to inspect specific frame</span>
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto cursor-crosshair select-none bg-slate-950 border border-slate-800/80 rounded"
            onClick={handleTimelineClick}
          >
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map(prob => {
              const y = padding.top + innerHeight - prob * innerHeight;
              return (
                <g key={prob}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray={prob === 0 || prob === 1 ? undefined : '2,2'}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {(prob * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Missing Data Bands (Lost tracking / occlusion) */}
            {missingIntervals.map((interval, i) => (
              <rect
                key={i}
                x={interval.x}
                y={padding.top}
                width={interval.width}
                height={innerHeight}
                fill="rgba(244, 63, 94, 0.15)"
              />
            ))}

            {/* Expression Probability Curves */}
            {categoryPaths.map(p => (
              <path
                key={p.category}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Scrubber Vertical Line */}
            <line
              x1={scrubberX}
              y1={padding.top}
              x2={scrubberX}
              y2={padding.top + innerHeight}
              stroke="#22D3EE"
              strokeWidth="2"
            />
            {/* Scrubber Top Handle */}
            <polygon
              points={`${scrubberX - 5},${padding.top - 2} ${scrubberX + 5},${padding.top - 2} ${scrubberX},${padding.top + 6}`}
              fill="#22D3EE"
            />

            {/* X-Axis Time Labels */}
            {[0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
              const x = padding.left + ratio * innerWidth;
              const timeSec = (ratio * videoDurationSeconds).toFixed(1);
              return (
                <g key={ratio}>
                  <line
                    x1={x}
                    y1={padding.top + innerHeight}
                    x2={x}
                    y2={padding.top + innerHeight + 4}
                    stroke="#475569"
                  />
                  <text
                    x={x}
                    y={padding.top + innerHeight + 16}
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {timeSec}s
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Frame Inspection Card vs Aggregate Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Individual Frame Inspection */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Frame #{currentFrameIdx + 1} Inspection
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                t = {activeFrame ? activeFrame.timestampSeconds.toFixed(2) : '0.00'}s
              </span>
            </div>

            {activeFrame?.missingData ? (
              <div className="flex items-center gap-2 py-3 text-xs text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Tracking lost: No usable face detected in this frame.</span>
              </div>
            ) : activeFace ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dominant Estimate:</span>
                  <ExpressionBadge
                    expression={activeFace.expression}
                    confidence={activeFace.confidence}
                    uncertaintyStatus={activeFace.uncertaintyStatus}
                  />
                </div>
                {/* Probability Bar Breakdown for Active Frame */}
                <div className="space-y-1 pt-1">
                  {ALL_EXPRESSIONS.map(exp => {
                    const prob = activeFace.classProbabilities?.[exp] ?? 0;
                    return (
                      <div key={exp} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 w-16 truncate">{exp}</span>
                        <div className="flex-1 mx-2 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(prob * 100)}%`,
                              backgroundColor: CATEGORY_COLORS[exp]
                            }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-slate-400 w-9 text-right">
                          {(prob * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-2">No face data</div>
            )}
          </div>

          {/* Aggregate Video Distribution */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Aggregate Temporal Distribution
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                {aggregateFrequencies.count} usable frames
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {ALL_EXPRESSIONS.map(exp => {
                const count = aggregateFrequencies.freqs[exp] || 0;
                const pct = aggregateFrequencies.count > 0
                  ? Math.round((count / aggregateFrequencies.count) * 100)
                  : 0;
                return (
                  <div key={exp} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 w-16 truncate">{exp}</span>
                    <div className="flex-1 mx-2 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: CATEGORY_COLORS[exp]
                        }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-slate-400 w-14 text-right">
                      {pct}% ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Technical Justification Note */}
        <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-400">Smoothing Protocol:</strong> Savitzky-Golay uses a 5-frame local quadratic polynomial convolution to suppress sensor noise while preserving authentic micro-expression peaks. EMA applies causal exponential smoothing (α=0.35). Raw data is retained in underlying records.
          </p>
        </div>
      </div>
    </div>
  );
};
