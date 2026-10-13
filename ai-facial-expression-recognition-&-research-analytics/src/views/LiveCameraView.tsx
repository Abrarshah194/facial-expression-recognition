/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Live Camera Module.
 * Real optical video stream capture with:
 *  - Explicit Start/Stop controls (NEVER auto-activates on load)
 *  - MediaStream track cleanup on unmount
 *  - Bounding box, landmarks, and Action Unit overlays
 *  - Frame processing interval (configurable FPS throttling)
 *  - Blur and lighting quality diagnostics
 *  - Offline synthetic demonstration fallback if camera is unavailable or denied
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  FaceDetection,
  QualityAssessment,
  AnalysisSession,
  FramePrediction,
  ExpressionCategory,
  DemographicAnalysis
} from '../types/fer';
import { analyzeCanvasFrame, DEFAULT_CV_OPTIONS } from '../utils/cvEngine';
import { FaceCanvasOverlay } from '../components/FaceCanvasOverlay';
import { QualityAssessmentCard } from '../components/QualityAssessmentCard';
import { ActionUnitExplainer } from '../components/ActionUnitExplainer';
import { ExpressionBadge } from '../components/ExpressionBadge';
import { DemographicsCard } from '../components/DemographicsCard';
import { SYNTHETIC_IMAGE_SAMPLES } from '../utils/demoAssets';
import { storageService } from '../services/storageService';
import { EXPRESSION_TRANSLATIONS } from '../utils/translations';

interface LiveCameraViewProps {
  onSessionRecorded?: (session: AnalysisSession) => void;
  activeModelName: string;
}

export const LiveCameraView: React.FC<LiveCameraViewProps> = ({
  onSessionRecorded,
  activeModelName
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [analysisActive, setAnalysisActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false);
  const [demoSampleIndex, setDemoSampleIndex] = useState<number>(0);

  // Settings: default threshold lowered to 0.30 (30%)
  const [targetFps, setTargetFps] = useState<number>(10); // 100ms interval
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showAUs, setShowAUs] = useState<boolean>(true);
  const [showSaliency, setShowSaliency] = useState<boolean>(false);
  const [abstentionThreshold, setAbstentionThreshold] = useState<number>(0.30);

  // Live Results State
  const [currentDetections, setCurrentDetections] = useState<FaceDetection[]>([]);
  const [currentQuality, setCurrentQuality] = useState<QualityAssessment | null>(null);
  const [fpsActual, setFpsActual] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [recordedFrames, setRecordedFrames] = useState<FramePrediction[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessTimeRef = useRef<number>(0);

  // List available devices when permission is granted
  const enumerateVideoDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevs[0].deviceId);
        }
      }
    } catch {
      // ignore
    }
  };

  // Start Camera handler
  const startCamera = async () => {
    setCameraError(null);
    setIsDemoFallback(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setAnalysisActive(true);
      await enumerateVideoDevices();
      storageService.recordAuditLog('SECURITY', 'Started live camera feed', 'Local camera hardware initialized');
    } catch (err: any) {
      console.warn('Camera initialization failed:', err);
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission denied by browser. Please enable camera access in your browser site settings.'
        : err.name === 'NotFoundError'
        ? 'No camera device detected on this system.'
        : (err.message || 'Unable to access camera.');
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  // Stop Camera handler
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setAnalysisActive(false);
    setCurrentDetections([]);
    setFpsActual(0);
    storageService.recordAuditLog('SECURITY', 'Stopped live camera feed', 'Hardware media tracks released');
  }, []);

  // Ensure media tracks are stopped if component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Frame processing loop
  const processFrame = useCallback(() => {
    if (!analysisActive) return;

    const now = performance.now();
    const intervalMs = 1000 / targetFps;

    if (now - lastProcessTimeRef.current >= intervalMs) {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;

      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const result = analyzeCanvasFrame(canvas, {
              ...DEFAULT_CV_OPTIONS,
              abstentionThreshold,
              activeModelVersion: activeModelName
            });

            setCurrentDetections(result.faceDetections);
            setCurrentQuality(result.quality);
            setLatencyMs(result.latencyMs);

            // Record to session buffer
            if (result.faceDetections.length > 0) {
              setRecordedFrames(prev => [
                ...prev.slice(-120), // keep latest 120 frames in buffer
                {
                  frameIndex: prev.length,
                  timestampSeconds: prev.length * (intervalMs / 1000),
                  faceDetections: result.faceDetections,
                  missingData: false,
                  processingTimeMs: result.latencyMs
                }
              ]);
            }

            const measuredFps = Math.round(1000 / Math.max(1, now - lastProcessTimeRef.current));
            setFpsActual(measuredFps);
          } catch (e) {
            console.error('Frame inference error', e);
          }
        }
      } else if (isDemoFallback && canvas) {
        // Run against synthetic demo asset
        const sample = SYNTHETIC_IMAGE_SAMPLES[demoSampleIndex];
        const img = new window.Image();
        img.src = sample.svgDataUri;
        img.onload = () => {
          canvas.width = 400;
          canvas.height = 440;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const result = analyzeCanvasFrame(canvas, {
              ...DEFAULT_CV_OPTIONS,
              abstentionThreshold,
              activeModelVersion: activeModelName
            }, {
              categoryHint: sample.categoryHint
            });
            setCurrentDetections(result.faceDetections);
            setCurrentQuality(result.quality);
            setLatencyMs(result.latencyMs);
            setFpsActual(targetFps);
          }
        };
      }

      lastProcessTimeRef.current = now;
    }

    if (cameraActive || isDemoFallback) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [analysisActive, targetFps, abstentionThreshold, activeModelName, isDemoFallback, demoSampleIndex, cameraActive]);

  useEffect(() => {
    if ((cameraActive || isDemoFallback) && analysisActive) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cameraActive, isDemoFallback, analysisActive, processFrame]);

  // Activate synthetic demo mode if camera is unavailable
  const activateDemoFallback = () => {
    stopCamera();
    setIsDemoFallback(true);
    setCameraActive(false);
    setAnalysisActive(true);
    setCameraError(null);
  };

  const handleUpdateDemographics = (updated: DemographicAnalysis) => {
    setCurrentDetections(prev => {
      if (!prev || !prev.length) return prev;
      const next = [...prev];
      next[0] = { ...next[0], demographics: updated };
      return next;
    });
  };

  const primaryFace = currentDetections[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Live Optical Camera Stream
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicitly activated local video capture with real-time FACS landmark tracking
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs">
            <span className="text-slate-400">Stream Status:</span>
            <span className={`font-semibold ${cameraActive ? 'text-emerald-400' : isDemoFallback ? 'text-cyan-400' : 'text-slate-500'}`}>
              {cameraActive ? 'Active Hardware' : isDemoFallback ? 'Synthetic Benchmark Mode' : 'Idle (Stopped)'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono tabular-nums">
            <span className="text-slate-400">Rate:</span>
            <span className="text-cyan-400 font-semibold">{fpsActual} FPS</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{latencyMs}ms</span>
          </div>
        </div>
      </div>

      {/* Camera Permission / Device Error Banner */}
      {cameraError && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs space-y-2">
          <div className="flex items-start gap-2.5 text-rose-300 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>Camera Hardware Access Blocked</span>
          </div>
          <p className="text-slate-300 pl-6 leading-relaxed">
            {cameraError}
          </p>
          <div className="pl-6 pt-1 flex items-center gap-3">
            <button
              onClick={startCamera}
              className="px-3 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded font-medium transition-colors"
            >
              Retry Camera Connection
            </button>
            <button
              onClick={activateDemoFallback}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-medium transition-colors"
            >
              Switch to Offline Synthetic Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Stream Viewport and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewport Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {/* Hidden Canvas for computation */}
            <canvas ref={hiddenCanvasRef} className="hidden" />

            {/* Video element */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-contain ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Demo Synthetic Image fallback */}
            {isDemoFallback && (
              <div className="w-full h-full flex items-center justify-center bg-slate-950 p-6">
                <img
                  src={SYNTHETIC_IMAGE_SAMPLES[demoSampleIndex].svgDataUri}
                  alt="Synthetic Demo Asset"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            {/* Inactive Placeholder Screen */}
            {!cameraActive && !isDemoFallback && (
              <div className="text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Camera Feed Inactive
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    In compliance with ethical privacy safeguards, camera access is never initiated automatically. Click Start below to launch.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-md shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Initialize Camera Hardware</span>
                  </button>
                  <button
                    onClick={activateDemoFallback}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-md transition-colors"
                  >
                    Offline Demo Mode
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Overlay for bounding boxes, landmarks, AUs */}
            {(cameraActive || isDemoFallback) && (
              <FaceCanvasOverlay
                width={videoRef.current?.videoWidth || 640}
                height={videoRef.current?.videoHeight || 480}
                detections={currentDetections}
                showLandmarks={showLandmarks}
                showAUs={showAUs}
                showSaliencyMap={showSaliency}
              />
            )}

            {/* Demo Watermark Badge */}
            {isDemoFallback && (
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono text-cyan-300">
                DEMO MODE: {SYNTHETIC_IMAGE_SAMPLES[demoSampleIndex].name}
              </div>
            )}

            {/* Live Camera Active Banner */}
            {cameraActive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 px-2.5 py-1 rounded text-[11px] font-mono text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>LIVE FEED</span>
              </div>
            )}
          </div>

          {/* Interactive Play/Stop & Stream Controls */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {cameraActive || isDemoFallback ? (
                <>
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>

                  <button
                    onClick={() => setAnalysisActive(!analysisActive)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {analysisActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{analysisActive ? 'Pause Inference' : 'Resume Inference'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              )}

              {/* Demo Sample Switcher */}
              {isDemoFallback && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-slate-400">Sample:</span>
                  <select
                    value={demoSampleIndex}
                    onChange={e => setDemoSampleIndex(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                  >
                    {SYNTHETIC_IMAGE_SAMPLES.map((s, idx) => (
                      <option key={s.id} value={idx}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Overlays Toggles */}
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLandmarks}
                  onChange={e => setShowLandmarks(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span>Landmarks</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAUs}
                  onChange={e => setShowAUs(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span>Action Units</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSaliency}
                  onChange={e => setShowSaliency(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span>Saliency Map</span>
              </label>
            </div>
          </div>
        </div>

        {/* Real-time Diagnostics Sidebar */}
        <div className="space-y-4">
          {/* Active Estimate Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200">
                Live Facial Estimation
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Model: {activeModelName.split(' ')[0]}
              </span>
            </div>

            {primaryFace ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Observable State:</span>
                  <ExpressionBadge
                    expression={primaryFace.expression}
                    confidence={primaryFace.confidence}
                    uncertaintyStatus={primaryFace.uncertaintyStatus}
                  />
                </div>

                {/* Probability Distribution */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block mb-1">Softmax Class Probabilities / تاثرات کے امکانات:</span>
                  {Object.entries(primaryFace.classProbabilities).map(([cat, prob]) => {
                    const urduName = EXPRESSION_TRANSLATIONS[cat as ExpressionCategory]?.ur || cat;
                    return (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 w-28 truncate font-medium">
                          <span className="text-cyan-400 mr-1" dir="rtl">{urduName}</span>
                          <span className="text-slate-500 text-[10px]">({cat})</span>
                        </span>
                        <div className="flex-1 mx-2 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
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
              <div className="text-xs text-slate-500 py-6 text-center">
                {cameraActive || isDemoFallback
                  ? 'Searching for facial profile...'
                  : 'Feed not running. Click Start Camera.'}
              </div>
            )}
          </div>

          {/* Age & Gender Estimation for Student Behavior Analytics */}
          {primaryFace?.demographics && (
            <DemographicsCard
              demographics={primaryFace.demographics}
              onUpdateDemographics={handleUpdateDemographics}
            />
          )}

          {/* Configurable Abstention Policy */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Abstention Threshold:</span>
              <span className="font-mono tabular-nums text-cyan-400 font-bold">
                {Math.round(abstentionThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.75"
              step="0.05"
              value={abstentionThreshold}
              onChange={e => setAbstentionThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-1 rounded cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Predictions with maximum probability below this value will trigger an explicit &quot;Uncertain / Abstained&quot; output state.
            </p>
          </div>

          {/* Quality Assessment summary */}
          {currentQuality && (
            <QualityAssessmentCard quality={currentQuality} compact />
          )}
        </div>
      </div>

      {/* FACS Action Unit Explainer Section */}
      {primaryFace && (
        <ActionUnitExplainer
          actionUnits={primaryFace.actionUnits}
          dominantExpression={primaryFace.expression}
        />
      )}
    </div>
  );
};
