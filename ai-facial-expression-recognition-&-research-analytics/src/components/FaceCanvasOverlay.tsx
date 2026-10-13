/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Face Detection Canvas Overlay.
 * Renders bounding boxes, facial landmark keypoints, Action Unit activations,
 * and optional Saliency Heatmap (Class Activation Map simulation).
 */

import React, { useRef, useEffect } from 'react';
import { FaceDetection } from '../types/fer';
import { EXPRESSION_TRANSLATIONS } from '../utils/translations';

interface FaceCanvasOverlayProps {
  width: number;
  height: number;
  detections: FaceDetection[];
  showLandmarks?: boolean;
  showAUs?: boolean;
  showSaliencyMap?: boolean;
}

export const FaceCanvasOverlay: React.FC<FaceCanvasOverlayProps> = ({
  width,
  height,
  detections,
  showLandmarks = true,
  showAUs = true,
  showSaliencyMap = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    detections.forEach(det => {
      const { x, y, width: bw, height: bh } = det.boundingBox;

      // Optional Saliency Heatmap (Class Activation Map over facial regions)
      if (showSaliencyMap) {
        const gradient = ctx.createRadialGradient(
          x + bw * 0.5, y + bh * 0.6, bw * 0.1,
          x + bw * 0.5, y + bh * 0.6, bw * 0.6
        );
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)'); // Red peak
        gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.25)'); // Yellow
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');  // Transparent edge
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, bw, bh);
      }

      // Bounding Box (hairline, high-contrast)
      ctx.strokeStyle = det.expression === 'Uncertain' ? '#F59E0B' : '#06B6D4';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, bw, bh);

      // Corner brackets for research aesthetic
      const bracketLen = 14;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(x, y + bracketLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + bracketLen, y);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(x + bw - bracketLen, y);
      ctx.lineTo(x + bw, y);
      ctx.lineTo(x + bw, y + bracketLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(x, y + bh - bracketLen);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x + bracketLen, y + bh);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(x + bw - bracketLen, y + bh);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x + bw, y + bh - bracketLen);
      ctx.stroke();

      // Top Header Label: Face Index & Observable Expression
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.fillRect(x, Math.max(0, y - 26), bw, 24);

      ctx.fillStyle = det.expression === 'Uncertain' ? '#FBBF24' : '#22D3EE';
      ctx.font = '600 11px system-ui, sans-serif';
      const urdu = EXPRESSION_TRANSLATIONS[det.expression]?.ur || '';
      const labelText = `Face #${det.id} · ${urdu} (${det.expression}) ${Math.round(det.confidence * 100)}%`;
      ctx.fillText(labelText, x + 6, Math.max(16, y - 9));

      // Bottom Sub-Banner: Age & Gender Estimation (Student Behavior Analytics)
      if (det.demographics) {
        const demo = det.demographics;
        const bannerH = 22;
        const bannerY = Math.min(height - bannerH, y + bh + 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(x, bannerY, bw, bannerH);

        // Gender & Age text with distinct male (cyan) vs female (pink) indicator
        const isMale = demo.gender.gender === 'Male';
        ctx.fillStyle = isMale ? '#38BDF8' : '#F472B6';
        ctx.font = '600 10px system-ui, sans-serif';
        const traitSnippet = demo.gender.facialHairTraits
          ? (demo.gender.facialHairTraits.hasBeard ? ' [داڑھی]' :
             demo.gender.facialHairTraits.hasMustache ? ' [مونچھیں]' :
             demo.gender.facialHairTraits.isCleanShaveMale ? ' [کلین شیو]' : '')
          : '';
        const demoText = `${isMale ? '♂ Male' : '♀ Female'}${traitSnippet} (${demo.gender.genderUrdu}) · 🎂 ~${demo.age.estimatedAge} yrs`;
        ctx.fillText(demoText, x + 6, bannerY + 15);
      }

      // Landmarks
      if (showLandmarks && det.landmarks) {
        ctx.fillStyle = '#38BDF8';
        const lm = det.landmarks;
        const points = [
          lm.leftEye,
          lm.rightEye,
          lm.noseBridge,
          lm.mouthLeft,
          lm.mouthRight,
          lm.mouthCenter,
          lm.chin
        ];

        points.forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Inter-pupillary reference line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lm.leftEye[0], lm.leftEye[1]);
        ctx.lineTo(lm.rightEye[0], lm.rightEye[1]);
        ctx.stroke();
      }

      // Action Units list next to bounding box
      if (showAUs && det.actionUnits) {
        const activeAUs = det.actionUnits.filter(au => au.active);
        if (activeAUs.length > 0) {
          const auX = Math.min(width - 120, x + bw + 8);
          let auY = y + 16;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(auX - 4, y, 114, activeAUs.length * 18 + 8);

          activeAUs.forEach(au => {
            ctx.fillStyle = '#94A3B8';
            ctx.font = '500 10px monospace';
            ctx.fillText(`${au.id} (${Math.round(au.score * 100)}%)`, auX, auY);
            auY += 18;
          });
        }
      }
    });
  }, [width, height, detections, showLandmarks, showAUs, showSaliencyMap]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full object-contain"
    />
  );
};
