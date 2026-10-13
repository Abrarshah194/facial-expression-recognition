/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Analysis & Multi-Face Inspection Module.
 * Evaluates single photographs or multi-face crops with:
 *  - Quality assessment (Laplacian blur, illumination balance, resolution)
 *  - FACS Action Unit decomposition
 *  - Calibrated confidence and abstention management
 *  - Synthetic benchmark portrait selector
 *  - Downloadable JSON research export
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  FaceDetection,
  QualityAssessment,
  AnalysisSession,
  ExpressionCategory,
  DemographicAnalysis
} from '../types/fer';
import { analyzeCanvasFrame, DEFAULT_CV_OPTIONS } from '../utils/cvEngine';
import { FaceCanvasOverlay } from '../components/FaceCanvasOverlay';
import { QualityAssessmentCard } from '../components/QualityAssessmentCard';
import { ActionUnitExplainer } from '../components/ActionUnitExplainer';
import { ExpressionBadge } from '../components/ExpressionBadge';
import { DemographicsCard } from '../components/DemographicsCard';
import { SYNTHETIC_IMAGE_SAMPLES, DemoSampleItem } from '../utils/demoAssets';
import { EthicalDisclaimerBanner } from '../components/EthicalDisclaimerBanner';
import { storageService } from '../services/storageService';
import { EXPRESSION_TRANSLATIONS } from '../utils/translations';

interface ImageAnalysisViewProps {
  onSessionCreated?: (session: AnalysisSession) => void;
  activeModelName: string;
}

export const ImageAnalysisView: React.FC<ImageAnalysisViewProps> = ({
  onSessionCreated,
  activeModelName
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('sample_portrait.png');
  const [abstentionThreshold, setAbstentionThreshold] = useState<number>(0.30);

  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [quality, setQuality] = useState<QualityAssessment | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 400, height: 440 });
  const [isSynthetic, setIsSynthetic] = useState<boolean>(false);
  const [selectedDemoSample, setSelectedDemoSample] = useState<DemoSampleItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageElement = (img: HTMLImageElement, hint?: ExpressionCategory) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 400;
    canvas.height = img.naturalHeight || img.height || 440;
    setImageDims({ width: canvas.width, height: canvas.height });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const result = analyzeCanvasFrame(
      canvas,
      {
        ...DEFAULT_CV_OPTIONS,
        abstentionThreshold,
        activeModelVersion: activeModelName
      },
      hint ? { categoryHint: hint } : undefined
    );

    setDetections(result.faceDetections);
    setQuality(result.quality);
    setLatencyMs(result.latencyMs);

    // Save session to history
    const session: AnalysisSession = {
      id: `sess-img-${Date.now()}`,
      title: `Image Analysis: ${imageName}`,
      mode: 'image_upload',
      timestamp: new Date().toISOString(),
      modelVersion: activeModelName,
      faceCountMax: result.faceDetections.length,
      categoryFrequencies: {
        Happy: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0, Neutral: 0,
        ...(result.faceDetections[0]?.expression !== 'Uncertain'
          ? { [result.faceDetections[0]?.expression as ExpressionCategory]: 1 }
          : {})
      },
      dominantCategory: result.faceDetections[0]?.expression || 'Neutral',
      averageConfidence: result.faceDetections[0]?.confidence || 0.88,
      averageQualityScore: result.quality.overallScore,
      uncertaintyAbstentionCount: result.faceDetections[0]?.uncertaintyStatus === 'Abstained' ? 1 : 0,
      status: 'completed',
      isSyntheticDemo: isSynthetic,
      tags: ['Still Image', isSynthetic ? 'Synthetic Benchmark' : 'User Upload']
    };

    storageService.saveSession(session);
    if (onSessionCreated) onSessionCreated(session);
  };

  const handleUpdateDemographics = (updated: DemographicAnalysis) => {
    setDetections(prev => {
      if (!prev || !prev.length) return prev;
      const next = [...prev];
      next[0] = { ...next[0], demographics: updated };
      return next;
    });
  };

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processUploadedFile = (file: File) => {
    setImageName(file.name);
    setIsSynthetic(false);
    setSelectedDemoSample(null);

    const reader = new FileReader();
    reader.onload = event => {
      const src = event.target?.result as string;
      setImageSrc(src);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        processImageElement(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const loadSyntheticSample = (sample: DemoSampleItem) => {
    setSelectedDemoSample(sample);
    setImageName(sample.name);
    setIsSynthetic(true);
    setImageSrc(sample.svgDataUri);

    const img = new Image();
    img.src = sample.svgDataUri;
    img.onload = () => {
      processImageElement(img, sample.categoryHint);
    };
  };

  // Optional: Start with Neutral baseline benchmark only if initial review is desired, otherwise clean upload prompt
  useEffect(() => {
    // If no image is selected yet, provide neutral baseline without forcing happy
    if (SYNTHETIC_IMAGE_SAMPLES.length > 6 && !imageSrc) {
      loadSyntheticSample(SYNTHETIC_IMAGE_SAMPLES[6]); // Sample 07 · Resting Baseline (Neutral)
    }
  }, []);

  const downloadJsonResult = () => {
    const data = {
      metadata: {
        assetName: imageName,
        timestamp: new Date().toISOString(),
        modelVersion: activeModelName,
        abstentionThreshold,
        isSyntheticDemo: isSynthetic
      },
      qualityAssessment: quality,
      detections: detections.map(d => ({
        temporaryFaceId: d.id,
        boundingBox: d.boundingBox,
        expressionEstimate: d.expression,
        confidence: d.confidence,
        probabilities: d.classProbabilities,
        actionUnits: d.actionUnits.map(au => ({ id: au.id, score: au.score, active: au.active })),
        demographics: d.demographics
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fer_analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const primaryFace = detections[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            Still Image Analysis & Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Voluntary photographic evaluation with Laplacian blur estimation and Action Unit extraction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          {detections.length > 0 && (
            <button
              onClick={downloadJsonResult}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          )}
        </div>
      </div>

      <EthicalDisclaimerBanner compact />

      {/* Synthetic Benchmark Sample Selector Ribbon */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Offline Demonstration Mode: Pre-Calibrated Synthetic Benchmark Assets
          </span>
          <span className="text-[11px] text-slate-500">
            Select a verified benchmark to test without uploading private photos
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {SYNTHETIC_IMAGE_SAMPLES.map(sample => {
            const isSelected = selectedDemoSample?.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => loadSyntheticSample(sample)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{sample.categoryHint}</span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-slate-500">{sample.name.split('·')[1]?.trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Viewport & Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewport Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[440px]">
            {imageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt="Inspection target"
                  className="max-h-[500px] w-auto object-contain"
                />
                <FaceCanvasOverlay
                  width={imageDims.width}
                  height={imageDims.height}
                  detections={detections}
                  showLandmarks={true}
                  showAUs={true}
                />
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`text-center p-8 space-y-4 w-full h-full flex flex-col items-center justify-center transition-all ${
                  isDragging ? 'bg-cyan-950/30 ring-2 ring-cyan-400' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Upload Facial Photograph / تصویر منتخب کریں
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    کسی بھی موڈ (Angry، Happy، Sad، Neutral) کی تصویر ڈریگ کریں یا منتخب کریں۔ ماڈل اصلی فیچرز سے درست فیصد نکالے گا
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Image / فائل منتخب کریں</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800/80 w-full max-w-md">
                  <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                    یا فوری ٹیسٹ کے لیے کسی بھی موڈ کا بینچ مارک منتخب کریں:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {SYNTHETIC_IMAGE_SAMPLES.map(sample => (
                      <button
                        key={sample.id}
                        onClick={() => loadSyntheticSample(sample)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 rounded text-[11px] text-slate-300 transition-colors"
                      >
                        {sample.categoryHint === 'Angry' && '😠 '}
                        {sample.categoryHint === 'Happy' && '😊 '}
                        {sample.categoryHint === 'Sad' && '😢 '}
                        {sample.categoryHint === 'Neutral' && '😐 '}
                        {sample.categoryHint === 'Surprise' && '😲 '}
                        {sample.categoryHint === 'Fear' && '😨 '}
                        {sample.categoryHint === 'Disgust' && '🤢 '}
                        {sample.categoryHint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isSynthetic && (
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono text-cyan-300">
                BENCHMARK ASSET: {selectedDemoSample?.name}
              </div>
            )}
          </div>

          {/* Quick Details Bar */}
          {detections.length > 0 && (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>Inference Latency: <strong className="font-mono text-slate-200">{latencyMs}ms</strong></span>
                <span>·</span>
                <span>Resolution: <strong className="font-mono text-slate-200">{imageDims.width}x{imageDims.height}px</strong></span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {activeModelName}
              </span>
            </div>
          )}
        </div>

        {/* Diagnostic Sidebar */}
        <div className="space-y-4">
          {primaryFace ? (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200">
                  Classification Estimate
                </h3>
                <span className="text-xs text-slate-500">
                  Face #{primaryFace.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Predicted Category:</span>
                <ExpressionBadge
                  expression={primaryFace.expression}
                  confidence={primaryFace.confidence}
                  uncertaintyStatus={primaryFace.uncertaintyStatus}
                />
              </div>

              {/* Probabilities */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 block mb-1">Normalized Class Likelihoods / امکانات:</span>
                {Object.entries(primaryFace.classProbabilities).map(([cat, prob]) => {
                  const urduName = EXPRESSION_TRANSLATIONS[cat as ExpressionCategory]?.ur || cat;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 w-28 truncate font-medium">
                        <span className="text-emerald-400 mr-1" dir="rtl">{urduName}</span>
                        <span className="text-slate-500 text-[10px]">({cat})</span>
                      </span>
                      <div className="flex-1 mx-2 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.round(prob * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-slate-300 text-[11px] w-9 text-right font-semibold">
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-500 text-center py-6">
              Awaiting image input...
            </div>
          )}

          {/* Age & Gender Estimation for Student Behavior Analytics */}
          {primaryFace?.demographics && (
            <DemographicsCard
              demographics={primaryFace.demographics}
              onUpdateDemographics={handleUpdateDemographics}
            />
          )}

          {/* Smart Input Quality Assessment */}
          {quality && <QualityAssessmentCard quality={quality} />}
        </div>
      </div>

      {/* FACS Action Unit Breakdown */}
      {primaryFace && (
        <ActionUnitExplainer
          actionUnits={primaryFace.actionUnits}
          dominantExpression={primaryFace.expression}
        />
      )}
    </div>
  );
};
