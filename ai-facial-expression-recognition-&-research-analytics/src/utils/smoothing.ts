/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Time-series smoothing filters for facial expression temporal sequences.
 * 
 * Technical Justification:
 * Facial micro-expressions occur over 200-500ms intervals, whereas camera sensor
 * jitter, auto-exposure hunting, and compression artifacts can produce high-frequency
 * noise on single frames.
 * 
 * We provide:
 * 1. Exponential Moving Average (EMA): Fast causal filter for real-time streaming feeds.
 * 2. Savitzky-Golay (5-point quadratic): Non-causal polynomial filter that smooths noise
 *    while preserving sharp peak transient expressions without temporal phase lag.
 * 
 * IMPORTANT: Raw frame values are always preserved in frame-level records; smoothing
 * is applied only to continuous trend visualizations and aggregate time-series curves.
 */

import { FramePrediction, ExpressionCategory, ALL_EXPRESSIONS } from '../types/fer';

export type SmoothingMethod = 'none' | 'exponential' | 'savitzky_golay';

/**
 * Applies Exponential Moving Average (EMA) to frame probability distributions
 * @param frames Array of frame predictions
 * @param alpha Smoothing factor (0.0 < alpha <= 1.0). Default 0.35
 */
export function applyExponentialSmoothing(
  frames: FramePrediction[],
  alpha: number = 0.35
): FramePrediction[] {
  if (frames.length === 0) return [];

  const smoothed: FramePrediction[] = [];
  let prevProbabilities: Record<ExpressionCategory, number> | null = null;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (frame.missingData || frame.faceDetections.length === 0) {
      smoothed.push(frame);
      prevProbabilities = null; // Reset filter across missing data gaps
      continue;
    }

    const face = frame.faceDetections[0];
    const currentProbs = face.classProbabilities;

    let newProbs: Record<ExpressionCategory, number>;
    if (!prevProbabilities) {
      newProbs = { ...currentProbs };
    } else {
      newProbs = {} as Record<ExpressionCategory, number>;
      ALL_EXPRESSIONS.forEach(exp => {
        newProbs[exp] = alpha * currentProbs[exp] + (1 - alpha) * prevProbabilities![exp];
      });
    }

    prevProbabilities = newProbs;

    // Recalculate dominant smoothed category
    let maxProb = 0;
    let topExp: ExpressionCategory = 'Neutral';
    ALL_EXPRESSIONS.forEach(exp => {
      if (newProbs[exp] > maxProb) {
        maxProb = newProbs[exp];
        topExp = exp;
      }
    });

    smoothed.push({
      ...frame,
      faceDetections: [
        {
          ...face,
          confidence: Math.round(maxProb * 1000) / 1000,
          expression: topExp,
          classProbabilities: newProbs
        }
      ]
    });
  }

  return smoothed;
}

/**
 * 5-point Savitzky-Golay filter coefficients for quadratic polynomial:
 * Convolution window: [-2, -1, 0, 1, 2]
 * Weights: [-3, 12, 17, 12, -3] / 35
 */
export function applySavitzkyGolaySmoothing(
  frames: FramePrediction[]
): FramePrediction[] {
  if (frames.length < 5) {
    return applyExponentialSmoothing(frames, 0.4);
  }

  const weights = [-3, 12, 17, 12, -3];
  const norm = 35;

  return frames.map((frame, idx) => {
    if (frame.missingData || frame.faceDetections.length === 0) {
      return frame;
    }

    // Boundary conditions: use available window or fallback
    if (idx < 2 || idx >= frames.length - 2) {
      return frame;
    }

    // Check if any frame in window is missing
    const windowFrames = frames.slice(idx - 2, idx + 3);
    if (windowFrames.some(f => f.missingData || f.faceDetections.length === 0)) {
      return frame;
    }

    const face = frame.faceDetections[0];
    const newProbs: Record<ExpressionCategory, number> = {} as any;

    ALL_EXPRESSIONS.forEach(exp => {
      let weightedSum = 0;
      for (let w = 0; w < 5; w++) {
        const p = windowFrames[w].faceDetections[0].classProbabilities[exp];
        weightedSum += weights[w] * p;
      }
      newProbs[exp] = Math.max(0.01, Math.min(0.99, weightedSum / norm));
    });

    // Re-normalize sum to 1.0
    const sum = ALL_EXPRESSIONS.reduce((acc, exp) => acc + newProbs[exp], 0);
    ALL_EXPRESSIONS.forEach(exp => {
      newProbs[exp] = Math.round((newProbs[exp] / sum) * 1000) / 1000;
    });

    let maxProb = 0;
    let topExp: ExpressionCategory = 'Neutral';
    ALL_EXPRESSIONS.forEach(exp => {
      if (newProbs[exp] > maxProb) {
        maxProb = newProbs[exp];
        topExp = exp;
      }
    });

    return {
      ...frame,
      faceDetections: [
        {
          ...face,
          confidence: maxProb,
          expression: topExp,
          classProbabilities: newProbs
        }
      ]
    };
  });
}
