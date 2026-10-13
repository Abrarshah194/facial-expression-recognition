/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module C: Smart Input Quality Assessment Lab.
 * Comprehensive optical and sensor quality diagnostics:
 *  - Blur via 2D Laplacian operator variance
 *  - Lighting & luminance distribution
 *  - Resolution & bounding box crop limits
 *  - Partial occlusion & landmark visibility
 *  - Actionable recommendations for scientific capture
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sun,
  Maximize2,
  Sparkles,
  Sliders,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { QualityAssessment } from '../types/fer';
import { QualityAssessmentCard } from '../components/QualityAssessmentCard';
import { SYNTHETIC_IMAGE_SAMPLES, DemoSampleItem } from '../utils/demoAssets';
import { assessInputQuality } from '../utils/cvEngine';

export const AnalysisQualityView: React.FC<AnalysisQualityViewProps> = () => {
  const [selectedSample, setSelectedSample] = useState<DemoSampleItem>(SYNTHETIC_IMAGE_SAMPLES[0]);
  const [customLaplacian, setCustomLaplacian] = useState<number>(310);
  const [customLuminance, setCustomLuminance] = useState<number>(128);
  const [customResolution, setCustomResolution] = useState<number>(180);
  const [customOcclusion, setCustomOcclusion] = useState<number>(5);

  // Compute live quality assessment from controls
  const computedQuality: QualityAssessment = React.useMemo(() => {
    const isBlurry = customLaplacian < 85;
    const blurScore = Math.min(100, Math.max(0, Math.round((customLaplacian / 350) * 100)));

    let lightingStatus: 'Optimal' | 'Underexposed' | 'Overexposed' | 'HighContrast' = 'Optimal';
    if (customLuminance < 45) lightingStatus = 'Underexposed';
    else if (customLuminance > 215) lightingStatus = 'Overexposed';

    const isLowResolution = customResolution < 72;
    const occlusionRatio = customOcclusion / 100;
    const isPartiallyOccluded = occlusionRatio > 0.35;

    let deduction = 0;
    if (isBlurry) deduction += 35;
    if (lightingStatus !== 'Optimal') deduction += 25;
    if (isLowResolution) deduction += 25;
    if (isPartiallyOccluded) deduction += 20;

    const overallScore = Math.max(10, Math.min(100, 100 - deduction));
    const usableFrame = overallScore >= 40 && !isLowResolution;

    const recommendations: string[] = [];
    if (isBlurry) recommendations.push('Adjust optical focus or increase shutter speed to eliminate motion blur.');
    if (lightingStatus === 'Underexposed') recommendations.push('Increase front ambient lighting to elevate mean luminance above 50.');
    if (lightingStatus === 'Overexposed') recommendations.push('Reduce harsh backlight or glare to prevent luma washout.');
    if (isLowResolution) recommendations.push('Subject must move closer to lens; face bounding crop is under 80x80px.');
    if (isPartiallyOccluded) recommendations.push('Lower occlusion detected; ensure mouth and brows are visible.');
    if (recommendations.length === 0) recommendations.push('Optimal sensor conditions for research evaluation.');

    return {
      overallScore,
      blurScore,
      isBlurry,
      laplacianVariance: customLaplacian,
      meanLuminance: customLuminance,
      lightingStatus,
      faceDimensionPx: { width: customResolution, height: Math.round(customResolution * 1.3) },
      isLowResolution,
      occlusionRatio,
      isPartiallyOccluded,
      formatValid: true,
      usableFrame,
      actionableRecommendations: recommendations
    };
  }, [customLaplacian, customLuminance, customResolution, customOcclusion]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Smart Input Quality Assessment Laboratory
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Validation of sensor characteristics, optical blur, illumination limits, and facial resolution constraints
        </p>
      </div>

      {/* Simulator / Interactive Diagnostic Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Interactive Sensor Distortion & Metric Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Adjust parameters to evaluate how optical degradation triggers automated uncertainty flags and abstention warnings:
            </p>

            <div className="space-y-4 pt-2">
              {/* Blur Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Blur (Laplacian Variance σ²):
                  </span>
                  <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                    {customLaplacian} ({customLaplacian < 85 ? 'Blurry / Out of Focus' : 'Sharp'})
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="450"
                  value={customLaplacian}
                  onChange={e => setCustomLaplacian(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>20 (Severe Motion Blur)</span>
                  <span>Threshold: 85</span>
                  <span>450 (Pristine Edge Contrast)</span>
                </div>
              </div>

              {/* Luminance Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Mean Luminance (μ):
                  </span>
                  <span className="font-mono tabular-nums text-amber-400 font-semibold">
                    {customLuminance} ({computedQuality.lightingStatus})
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="245"
                  value={customLuminance}
                  onChange={e => setCustomLuminance(parseInt(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>15 (Underexposed)</span>
                  <span>Optimal: 45 - 215</span>
                  <span>245 (Overexposed Glare)</span>
                </div>
              </div>

              {/* Resolution Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                    Face Crop Width (px):
                  </span>
                  <span className="font-mono tabular-nums text-purple-400 font-semibold">
                    {customResolution}px ({customResolution < 72 ? 'Below Research Minimum' : 'Adequate'})
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="320"
                  value={customResolution}
                  onChange={e => setCustomResolution(parseInt(e.target.value))}
                  className="w-full accent-purple-400 bg-slate-950 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>40px (Sub-pixel crop)</span>
                  <span>Min threshold: 72px</span>
                  <span>320px (High-res portrait)</span>
                </div>
              </div>

              {/* Occlusion Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Occlusion Ratio (%):
                  </span>
                  <span className="font-mono tabular-nums text-rose-400 font-semibold">
                    {customOcclusion}% ({customOcclusion > 35 ? 'Partially Obstructed' : 'Unobstructed'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={customOcclusion}
                  onChange={e => setCustomOcclusion(parseInt(e.target.value))}
                  className="w-full accent-rose-400 bg-slate-950 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quality Rules Specification */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-200">
              Technical Assessment Methodology
            </h4>
            <div className="space-y-1.5 leading-relaxed">
              <p>
                <strong>Laplacian Variance Operator:</strong> Computes the second spatial derivative of the 2D image matrix using kernel [[0, 1, 0], [1, -4, 1], [0, 1, 0]]. Sharp edges generate large magnitude gradients; blurred images lack sharp edges, resulting in σ² &lt; 85.
              </p>
              <p>
                <strong>Exposure Boundary:</strong> Derived from standard ITU-R BT.601 luminance coefficients. Images with μ &lt; 45 or μ &gt; 215 cause non-linear sensor clipping that degrades facial muscle feature extraction.
              </p>
              <p>
                <strong>Non-Destructive Principle:</strong> The system does NOT alter, interpolate, or hallucinate missing pixels on raw user images. Degraded frames trigger an explicit &quot;Unable to classify / Low quality&quot; output state.
              </p>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Card Display */}
        <div className="space-y-4">
          <QualityAssessmentCard quality={computedQuality} />
        </div>
      </div>
    </div>
  );
};
interface AnalysisQualityViewProps {}
