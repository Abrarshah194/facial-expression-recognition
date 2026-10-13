/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pre-packaged demonstration assets and synthetic benchmark evaluation profiles.
 * 
 * Ethical & Transparency Safeguard:
 * All assets in this file are clearly marked as synthetic demonstration profiles.
 * They are provided to enable offline demonstration, verification of UI controls,
 * and deterministic regression testing without requiring an active physical camera.
 * 
 * Never presented as live model predictions or verified human emotional states.
 */

import {
  ExpressionCategory,
  FramePrediction,
  FaceDetection,
  ActionUnit,
  QualityAssessment,
  AnalysisSession
} from '../types/fer';
import { computeActionUnits, estimateLandmarks, predictExpressionFromAUs, DEFAULT_CV_OPTIONS } from './cvEngine';

export interface DemoSampleItem {
  id: string;
  name: string;
  description: string;
  categoryHint: ExpressionCategory;
  svgDataUri: string;
  qualityProfile: {
    blurScore: number;
    lightingStatus: 'Optimal' | 'Underexposed' | 'Overexposed';
    isBlurry: boolean;
  };
}

/**
 * Creates an inline SVG vector face portrait for deterministic, offline testing
 * with distinct facial features corresponding to facial expressions.
 */
function createSyntheticFaceSvg(
  expression: ExpressionCategory,
  skinTone: string = '#F3D2B8',
  bgColor: string = '#1E293B'
): string {
  let mouthPath = 'M 60 145 Q 100 165 140 145'; // neutral smile
  let browLeftY = 85;
  let browRightY = 85;
  let browLeftAngle = 0;
  let browRightAngle = 0;
  let eyeLeftR = 7;
  let eyeRightR = 7;
  let mouthOpen = false;

  if (expression === 'Happy') {
    mouthPath = 'M 55 135 Q 100 180 145 135 Z'; // wide smile
    browLeftY = 80;
    browRightY = 80;
  } else if (expression === 'Surprise') {
    mouthPath = 'M 85 135 A 15 22 0 1 0 115 135 A 15 22 0 1 0 85 135'; // open oval mouth
    browLeftY = 70;
    browRightY = 70;
    eyeLeftR = 10;
    eyeRightR = 10;
    mouthOpen = true;
  } else if (expression === 'Sad') {
    mouthPath = 'M 65 155 Q 100 135 135 155'; // downturned mouth
    browLeftY = 82;
    browRightY = 82;
    browLeftAngle = -10;
    browRightAngle = 10;
  } else if (expression === 'Angry') {
    mouthPath = 'M 70 145 L 130 145'; // flat tight mouth
    browLeftY = 92;
    browRightY = 92;
    browLeftAngle = 18;
    browRightAngle = -18;
  } else if (expression === 'Fear') {
    mouthPath = 'M 65 142 Q 100 155 135 142'; // stretched lips
    browLeftY = 72;
    browRightY = 72;
    eyeLeftR = 9;
    eyeRightR = 9;
  } else if (expression === 'Disgust') {
    mouthPath = 'M 68 148 Q 95 132 132 152'; // asymmetric curled lip
    browLeftY = 88;
    browRightY = 88;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="400" height="440">
    <rect width="200" height="220" fill="${bgColor}" />
    <!-- Head Oval -->
    <ellipse cx="100" cy="115" rx="65" ry="85" fill="${skinTone}" stroke="#C69C7E" stroke-width="2" />
    <!-- Hair -->
    <path d="M 35 105 C 35 45, 165 45, 165 105 C 145 60, 55 60, 35 105 Z" fill="#2D3748" />
    <!-- Left Eyebrow -->
    <line x1="50" y1="${browLeftY + browLeftAngle}" x2="85" y2="${browLeftY - browLeftAngle}" stroke="#2D3748" stroke-width="4.5" stroke-linecap="round" />
    <!-- Right Eyebrow -->
    <line x1="115" y1="${browRightY - browRightAngle}" x2="150" y2="${browRightY + browRightAngle}" stroke="#2D3748" stroke-width="4.5" stroke-linecap="round" />
    <!-- Left Eye -->
    <ellipse cx="68" cy="100" rx="${eyeLeftR}" ry="${eyeLeftR}" fill="#2D3748" />
    <!-- Right Eye -->
    <ellipse cx="132" cy="100" rx="${eyeRightR}" ry="${eyeRightR}" fill="#2D3748" />
    <!-- Nose Bridge -->
    <path d="M 100 102 L 95 125 L 105 125" fill="none" stroke="#C69C7E" stroke-width="2.5" stroke-linecap="round" />
    <!-- Mouth -->
    <path d="${mouthPath}" fill="${mouthOpen ? '#742A2A' : (expression === 'Happy' ? '#9B2C2C' : 'none')}" stroke="#742A2A" stroke-width="3.5" stroke-linecap="round" />
    <!-- Synthetic watermark banner -->
    <rect x="0" y="200" width="200" height="20" fill="rgba(15,23,42,0.85)" />
    <text x="100" y="214" fill="#94A3B8" font-size="8.5" font-family="monospace" text-anchor="middle">SYNTHETIC BENCHMARK ASSET</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SYNTHETIC_IMAGE_SAMPLES: DemoSampleItem[] = [
  {
    id: 'demo-sample-happy',
    name: 'Sample 01 · Elevated Zygomaticus (Happy)',
    description: 'Bilateral lip corner puller (AU12) and cheek raise (AU6). Sharp illumination.',
    categoryHint: 'Happy',
    svgDataUri: createSyntheticFaceSvg('Happy', '#F7D6B9', '#0F172A'),
    qualityProfile: { blurScore: 94, lightingStatus: 'Optimal', isBlurry: false }
  },
  {
    id: 'demo-sample-surprise',
    name: 'Sample 02 · Eyebrow Elevation (Surprise)',
    description: 'Inner brow raise (AU1), outer brow raise (AU2), and jaw drop (AU26).',
    categoryHint: 'Surprise',
    svgDataUri: createSyntheticFaceSvg('Surprise', '#E9BA97', '#1E293B'),
    qualityProfile: { blurScore: 92, lightingStatus: 'Optimal', isBlurry: false }
  },
  {
    id: 'demo-sample-sad',
    name: 'Sample 03 · Lip Corner Depression (Sad)',
    description: 'Depressor anguli oris activation (AU15) and inner brow raiser (AU1).',
    categoryHint: 'Sad',
    svgDataUri: createSyntheticFaceSvg('Sad', '#D69E74', '#0F172A'),
    qualityProfile: { blurScore: 88, lightingStatus: 'Optimal', isBlurry: false }
  },
  {
    id: 'demo-sample-angry',
    name: 'Sample 04 · Corrugator Contraction (Angry)',
    description: 'Brow lowerer (AU4) with compressed lip margin. Sharp contrast.',
    categoryHint: 'Angry',
    svgDataUri: createSyntheticFaceSvg('Angry', '#F2C79E', '#1E293B'),
    qualityProfile: { blurScore: 90, lightingStatus: 'Optimal', isBlurry: false }
  },
  {
    id: 'demo-sample-disgust',
    name: 'Sample 05 · Levator Wrinkle (Disgust)',
    description: 'Nose wrinkler (AU9) and upper lip raiser (AU10) with brow lowering.',
    categoryHint: 'Disgust',
    svgDataUri: createSyntheticFaceSvg('Disgust', '#E4B38A', '#0F172A'),
    qualityProfile: { blurScore: 86, lightingStatus: 'Optimal', isBlurry: false }
  },
  {
    id: 'demo-sample-fear',
    name: 'Sample 06 · Upper Eyelid Retraction (Fear)',
    description: 'Combination of AU1, AU2, AU4 and AU25 with widened aperture.',
    categoryHint: 'Fear',
    svgDataUri: createSyntheticFaceSvg('Fear', '#C98D5F', '#1E293B'),
    qualityProfile: { blurScore: 85, lightingStatus: 'Optimal', isBlurry: false }
  },
  {
    id: 'demo-sample-neutral',
    name: 'Sample 07 · Resting Baseline (Neutral)',
    description: 'Unactivated resting facial state without significant muscle displacement.',
    categoryHint: 'Neutral',
    svgDataUri: createSyntheticFaceSvg('Neutral', '#F5CDA8', '#0F172A'),
    qualityProfile: { blurScore: 95, lightingStatus: 'Optimal', isBlurry: false }
  }
];

/**
 * Generates synthetic temporal sequence frames for demonstration and testing
 */
export function generateSyntheticTemporalSequence(
  sequenceName: 'interview_reaction' | 'usability_study',
  durationSeconds: number = 10,
  samplingIntervalMs: number = 250
): FramePrediction[] {
  const totalFrames = Math.floor((durationSeconds * 1000) / samplingIntervalMs);
  const frames: FramePrediction[] = [];

  const box = { x: 80, y: 40, width: 240, height: 320 };
  const landmarks = estimateLandmarks(box);

  for (let i = 0; i < totalFrames; i++) {
    const t = (i * samplingIntervalMs) / 1000;
    let hint: ExpressionCategory = 'Neutral';

    // Simulated sequence phases
    if (sequenceName === 'interview_reaction') {
      if (t < 2.0) hint = 'Neutral';
      else if (t < 4.5) hint = 'Surprise';
      else if (t < 7.5) hint = 'Happy';
      else if (t < 9.0) hint = 'Neutral';
      else hint = 'Sad';
    } else {
      // Usability study: Neutral -> Angry/Frustrated -> Neutral -> Happy
      if (t < 2.5) hint = 'Neutral';
      else if (t < 5.5) hint = 'Angry';
      else if (t < 7.5) hint = 'Neutral';
      else hint = 'Happy';
    }

    // Occasional simulated missing frame (e.g. at frame 14 user turned head away)
    const isMissing = i === 14 || i === 29;

    if (isMissing) {
      frames.push({
        frameIndex: i,
        timestampSeconds: Math.round(t * 100) / 100,
        faceDetections: [],
        missingData: true,
        processingTimeMs: 4
      });
      continue;
    }

    // Create realistic AU set for the hint
    let browRaise = 0.1;
    let browLower = 0.1;
    let cheekRaise = 0.1;
    let lipCornerPull = 0.1;
    let lipCornerDepress = 0.1;
    let noseWrinkle = 0.05;
    let jawDrop = 0.1;

    let ear = 0.28;
    let corrAngle = 0.0;

    if (hint === 'Happy') {
      cheekRaise = 0.85;
      lipCornerPull = 0.90;
      ear = 0.27;
      corrAngle = 0.0;
    } else if (hint === 'Surprise') {
      browRaise = 0.92;
      jawDrop = 0.88;
      ear = 0.40;
      corrAngle = -2.0;
    } else if (hint === 'Sad') {
      browRaise = 0.60;
      browLower = 0.35;
      lipCornerDepress = 0.82;
      ear = 0.24;
      corrAngle = -11.0;
    } else if (hint === 'Angry') {
      browLower = 0.90;
      noseWrinkle = 0.55;
      ear = 0.24;
      corrAngle = 14.5;
    }

    const actionUnits = computeActionUnits({
      browRaise, browLower, cheekRaise, lipCornerPull, lipCornerDepress, noseWrinkle, jawDrop
    });

    const pred = predictExpressionFromAUs(actionUnits, DEFAULT_CV_OPTIONS, {
      eyeAspectRatio: ear,
      corrugatorAngle: corrAngle
    });

    const qualityFlags: QualityAssessment = {
      overallScore: 92,
      blurScore: 94,
      isBlurry: false,
      laplacianVariance: 320,
      meanLuminance: 128,
      lightingStatus: 'Optimal',
      faceDimensionPx: { width: 240, height: 320 },
      isLowResolution: false,
      occlusionRatio: 0.04,
      isPartiallyOccluded: false,
      formatValid: true,
      usableFrame: true,
      actionableRecommendations: ['Optimal quality']
    };

    const faceDetection: FaceDetection = {
      id: 1,
      boundingBox: box,
      detectionConfidence: 0.96,
      landmarks,
      expression: pred.expression,
      confidence: pred.confidence,
      classProbabilities: pred.classProbabilities,
      actionUnits,
      uncertaintyStatus: pred.uncertaintyStatus,
      qualityFlags,
      inferenceLatencyMs: 14,
      modelVersion: 'ResNet-FER+ (v2.4.1)',
      demographics: {
        age: {
          estimatedAge: 20,
          ageRange: '18-22 years',
          confidence: 0.91,
          biometricIndicators: {
            jawlineFirmness: 0.88,
            skinTextureSmoothness: 0.92,
            nasolabialFoldDepth: 0.15,
            periorbitalWrinkleIndex: 0.12
          }
        },
        gender: {
          gender: 'Female',
          genderUrdu: 'خاتون',
          confidence: 0.89,
          probabilities: { male: 0.11, female: 0.89 },
          morphologicalIndicators: {
            browRidgeProminence: 0.38,
            jawlineCheekboneRatio: 1.42,
            chinSquareness: 0.62,
            interOcularProportion: 0.36
          }
        },
        academicCohortGroup: 'Undergraduate (18-22)',
        researchNotes: 'Demonstration sequence calibrated for Student Behavior Analytics (ResNet-FER+ v2.4.1).'
      }
    };

    frames.push({
      frameIndex: i,
      timestampSeconds: Math.round(t * 100) / 100,
      faceDetections: [faceDetection],
      missingData: false,
      processingTimeMs: 16
    });
  }

  return frames;
}

/**
 * Creates a pre-populated analysis session for immediate demonstration
 */
export function createSampleDemoSession(
  sampleType: 'video_interview' | 'video_usability'
): AnalysisSession {
  const frames = generateSyntheticTemporalSequence(
    sampleType === 'video_interview' ? 'interview_reaction' : 'usability_study',
    10,
    250
  );

  const categoryFrequencies = {
    Happy: 0,
    Sad: 0,
    Angry: 0,
    Surprise: 0,
    Fear: 0,
    Disgust: 0,
    Neutral: 0
  };

  let totalConf = 0;
  let countFaces = 0;

  frames.forEach(f => {
    if (!f.missingData && f.faceDetections.length > 0) {
      const exp = f.faceDetections[0].expression;
      if (exp !== 'Uncertain') {
        categoryFrequencies[exp]++;
      }
      totalConf += f.faceDetections[0].confidence;
      countFaces++;
    }
  });

  return {
    id: `demo-${sampleType}-${Date.now()}`,
    title: sampleType === 'video_interview'
      ? 'Demo Sample: Qualitative Interview Expression Dynamics (10.0s)'
      : 'Demo Sample: Task Usability Interaction Sequence (10.0s)',
    mode: 'demo_sample',
    timestamp: new Date().toISOString(),
    durationSeconds: 10,
    modelVersion: 'ResNet-FER+ (v2.4.1)',
    samplingIntervalMs: 250,
    faceCountMax: 1,
    categoryFrequencies,
    dominantCategory: sampleType === 'video_interview' ? 'Happy' : 'Neutral',
    averageConfidence: countFaces > 0 ? Math.round((totalConf / countFaces) * 1000) / 1000 : 0.85,
    averageQualityScore: 92,
    uncertaintyAbstentionCount: 2,
    status: 'completed',
    frames,
    isSyntheticDemo: true,
    tags: ['Synthetic Benchmark', 'Temporal Analysis', 'Demonstration Mode']
  };
}
