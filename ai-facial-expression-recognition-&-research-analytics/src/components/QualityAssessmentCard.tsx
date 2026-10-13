/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module C: Smart Input Quality Assessment.
 * Evaluates:
 *  - Face detection quality
 *  - Blur via Laplacian variance calculation
 *  - Image dimensions & face crop resolution
 *  - Lighting limitations (mean luminance & exposure balance)
 *  - Partial occlusion & landmark visibility
 *  - Structured quality flags and actionable recommendations
 */

import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sun,
  Eye,
  Maximize2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { QualityAssessment } from '../types/fer';

interface QualityAssessmentCardProps {
  quality: QualityAssessment;
  compact?: boolean;
}

export const QualityAssessmentCard: React.FC<QualityAssessmentCardProps> = ({
  quality,
  compact = false
}) => {
  const {
    overallScore,
    blurScore,
    isBlurry,
    laplacianVariance,
    meanLuminance,
    lightingStatus,
    faceDimensionPx,
    isLowResolution,
    occlusionRatio,
    isPartiallyOccluded,
    usableFrame,
    actionableRecommendations
  } = quality;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded text-xs">
        <div className="flex items-center gap-2">
          {usableFrame ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-slate-300">Input Quality:</span>
          <span className={`font-mono font-semibold tabular-nums ${getScoreColor(overallScore)}`}>
            {overallScore}/100
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">
            {isBlurry ? 'Blurry' : 'Sharp'} / {lightingStatus}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
          {faceDimensionPx.width}x{faceDimensionPx.height}px
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
      {/* Header and Composite Score */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Smart Input Quality Diagnostics
          </h3>
          <p className="text-xs text-slate-400">
            Automated sensor and visibility validation prior to inference
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xs text-slate-400">Overall:</span>
            <span className={`text-base font-bold font-mono tabular-nums ${getScoreColor(overallScore)}`}>
              {overallScore}/100
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {usableFrame ? 'Meets research fidelity' : 'Sub-optimal visibility'}
          </span>
        </div>
      </div>

      {/* Grid of Diagnostic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Blur Metric */}
        <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Focus & Blur
            </span>
            <span className="font-mono text-[10px] text-slate-500">Laplacian</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {isBlurry ? 'Motion Blurry' : 'Sharp'}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              σ²={laplacianVariance}
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden mt-1">
            <div
              className={`h-full ${isBlurry ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${blurScore}%` }}
            />
          </div>
        </div>

        {/* Lighting & Exposure */}
        <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Illumination
            </span>
            <span className="font-mono text-[10px] text-slate-500">Luma</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {lightingStatus}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              μ={meanLuminance}
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden mt-1">
            <div
              className={`h-full ${
                lightingStatus === 'Optimal' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (meanLuminance / 255) * 100)}%` }}
            />
          </div>
        </div>

        {/* Resolution */}
        <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
              Face Crop
            </span>
            <span className="font-mono text-[10px] text-slate-500">Dimensions</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {isLowResolution ? 'Low Res' : 'Adequate'}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {faceDimensionPx.width}x{faceDimensionPx.height}
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden mt-1">
            <div
              className={`h-full ${isLowResolution ? 'bg-rose-400' : 'bg-emerald-400'}`}
              style={{ width: isLowResolution ? '35%' : '90%' }}
            />
          </div>
        </div>

        {/* Occlusion */}
        <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Occlusion
            </span>
            <span className="font-mono text-[10px] text-slate-500">Mask/Hand</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {isPartiallyOccluded ? 'Partial Obstruction' : 'Unobstructed'}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {Math.round(occlusionRatio * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden mt-1">
            <div
              className={`h-full ${isPartiallyOccluded ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.round(occlusionRatio * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded space-y-1.5">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Actionable Quality Guidance:
        </span>
        <ul className="space-y-1 pl-4 list-disc text-xs text-slate-300">
          {actionableRecommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
