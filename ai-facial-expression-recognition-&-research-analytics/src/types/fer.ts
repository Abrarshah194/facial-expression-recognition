/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Core domain types for AI Facial Expression Recognition and Research Analytics System.
 */

export type ExpressionCategory = 
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Surprise'
  | 'Fear'
  | 'Disgust'
  | 'Neutral';

export const ALL_EXPRESSIONS: ExpressionCategory[] = [
  'Happy',
  'Sad',
  'Angry',
  'Surprise',
  'Fear',
  'Disgust',
  'Neutral'
];

export type ActionUnitId = 
  | 'AU1'  // Inner Brow Raiser
  | 'AU2'  // Outer Brow Raiser
  | 'AU4'  // Brow Lowerer
  | 'AU6'  // Cheek Raiser
  | 'AU9'  // Nose Wrinkler
  | 'AU12' // Lip Corner Puller
  | 'AU15' // Lip Corner Depressor
  | 'AU25' // Lips Part
  | 'AU26';// Jaw Drop

export interface ActionUnit {
  id: ActionUnitId;
  name: string;
  description: string;
  score: number; // 0.0 - 1.0
  active: boolean; // score > 0.40
  primaryCategory: ExpressionCategory;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FacialLandmarks {
  leftEye: [number, number];
  rightEye: [number, number];
  noseBridge: [number, number];
  mouthLeft: [number, number];
  mouthRight: [number, number];
  mouthCenter: [number, number];
  chin: [number, number];
}

export type UncertaintyStatus = 
  | 'Nominal'
  | 'Abstained'
  | 'LowQuality'
  | 'QualityWarning'
  | 'DegradedVisibility';

export interface QualityAssessment {
  overallScore: number; // 0 - 100
  blurScore: number; // 0 - 100
  isBlurry: boolean;
  laplacianVariance: number; // Variance of Laplacian operator
  meanLuminance: number; // 0 - 255
  lightingStatus: 'Optimal' | 'Underexposed' | 'Overexposed' | 'HighContrast';
  faceDimensionPx: { width: number; height: number };
  isLowResolution: boolean;
  occlusionRatio: number; // 0.0 - 1.0
  isPartiallyOccluded: boolean;
  formatValid: boolean;
  usableFrame: boolean;
  actionableRecommendations: string[];
}

export interface AgeEstimation {
  estimatedAge: number; // e.g. 18, 20, 25
  ageRange: string; // e.g. '18-22 years'
  confidence: number; // 0.0 - 1.0
  biometricIndicators: {
    jawlineFirmness: number; // 0.0 - 1.0
    skinTextureSmoothness: number; // 0.0 - 1.0
    nasolabialFoldDepth: number; // 0.0 - 1.0
    periorbitalWrinkleIndex: number; // 0.0 - 1.0
  };
}

export interface GenderEstimation {
  gender: 'Male' | 'Female';
  genderUrdu: 'مرد' | 'خاتون';
  confidence: number; // 0.0 - 1.0
  probabilities: {
    male: number;
    female: number;
  };
  morphologicalIndicators: {
    browRidgeProminence: number; // 0.0 - 1.0
    jawlineCheekboneRatio: number; // 0.0 - 1.0
    chinSquareness: number; // 0.0 - 1.0
    interOcularProportion: number; // 0.0 - 1.0
  };
  facialHairTraits?: {
    hasBeard: boolean;
    hasMustache: boolean;
    isCleanShaveMale: boolean;
    detectedTraitUrdu: string;
    detectedTraitEn: string;
  };
}

export interface DemographicAnalysis {
  age: AgeEstimation;
  gender: GenderEstimation;
  academicCohortGroup: 'School / Junior Student (10-17)' | 'Undergraduate (18-22)' | 'Postgraduate (23-27)' | 'Senior Scholar (28+)';
  researchNotes: string;
}

export interface FaceDetection {
  id: number; // temporary within-frame index (Face 1, Face 2) - NEVER persistent identity
  boundingBox: BoundingBox;
  detectionConfidence: number; // 0.0 - 1.0
  landmarks?: FacialLandmarks;
  expression: ExpressionCategory | 'Uncertain';
  confidence: number; // 0.0 - 1.0 (softmax confidence)
  classProbabilities: Record<ExpressionCategory, number>;
  actionUnits: ActionUnit[];
  uncertaintyStatus: UncertaintyStatus;
  qualityFlags: QualityAssessment;
  inferenceLatencyMs: number;
  modelVersion: string;
  eyeAspectRatio?: number;
  corrugatorAngle?: number;
  demographics?: DemographicAnalysis;
}

export interface FramePrediction {
  frameIndex: number;
  timestampSeconds: number;
  faceDetections: FaceDetection[];
  missingData: boolean; // true if no face detected or frame corrupted
  processingTimeMs: number;
  rawFrameLuminance?: number;
}

export interface TemporalSeries {
  frames: FramePrediction[];
  samplingIntervalMs: number;
  totalFramesProcessed: number;
  framesWithFaces: number;
  categoryFrequencies: Record<ExpressionCategory, number>;
  averageConfidence: number;
  smoothingApplied: 'none' | 'exponential' | 'savitzky_golay';
  videoDurationSeconds: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  architecture: string;
  checksumSha256: string;
  parametersMillions: number;
  top1Accuracy: number;
  macroF1: number;
  avgLatencyMs: number;
  memoryFootprintMb: number;
  license: string;
  provenance: string;
  inputSize: string;
  defaultThreshold: number;
  calibrationEce: number; // Expected Calibration Error (lower is better, e.g. 0.042)
  description: string;
  active: boolean;
}

export interface PerClassMetric {
  precision: number;
  recall: number;
  specificity: number;
  f1Score: number;
  support: number;
}

export interface EvaluationDataset {
  id: string;
  name: string;
  sampleCount: number;
  license: string;
  demographicsNote: string;
  perClassMetrics: Record<ExpressionCategory, PerClassMetric>;
  macroF1: number;
  weightedF1: number;
  accuracy: number;
  confusionMatrix: number[][]; // 7x7 matrix corresponding to ALL_EXPRESSIONS
  latencyP95Ms: number;
  throughputFps: number;
}

export interface AnalysisSession {
  id: string;
  title: string;
  mode: 'live_camera' | 'video_upload' | 'image_upload' | 'demo_sample';
  timestamp: string;
  durationSeconds?: number;
  modelVersion: string;
  samplingIntervalMs?: number;
  faceCountMax: number;
  categoryFrequencies: Record<ExpressionCategory, number>;
  dominantCategory: ExpressionCategory | 'Uncertain';
  averageConfidence: number;
  averageQualityScore: number;
  uncertaintyAbstentionCount: number;
  status: 'completed' | 'processing' | 'failed' | 'cancelled';
  frames?: FramePrediction[];
  summaryNotes?: string;
  isSyntheticDemo?: boolean;
  tags: string[];
}

export interface ProcessingJob {
  id: string;
  title: string;
  mediaType: 'video' | 'image';
  fileName: string;
  fileSizeMb: number;
  createdAt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0 - 100
  currentFrame: number;
  totalFrames: number;
  samplingIntervalMs: number;
  etaSeconds: number;
  retryCount: number;
  maxRetries?: number;
  error?: string;
  resultSessionId?: string;
}

export interface PrivacySettings {
  localProcessingOnly: boolean;
  retainRawMedia: boolean; // default FALSE
  retainFrameLevelData: boolean; // default FALSE
  dataRetentionPeriodDays: number; // default 7
  anonymizeSessionTitles: boolean; // default TRUE
  telemetryConsent: boolean; // default FALSE
  auditLogRetentionDays: number; // default 30
}

export type UserRole = 'administrator' | 'researcher' | 'analyst';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  department: string;
  createdAt: string;
  lastLogin: string;
  password?: string;
  isRegistered?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  category: 'SECURITY' | 'DATA_ACCESS' | 'MODEL' | 'SYSTEM' | 'PRIVACY';
  details: string;
  ipAddress: string;
}

export interface SystemResourceMetrics {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  inferenceQueueLength: number;
  avgLatencyMs: number;
  activeJobs: number;
  failedJobsCount: number;
  modelLoaded: boolean;
  diskCacheUsedMb: number;
  throughputFps: number;
}
