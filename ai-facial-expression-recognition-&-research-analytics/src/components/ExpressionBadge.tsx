/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clean expression display component adhering to Zero-Pill & Metadata discipline.
 * Renders unboxed text with clean typographic separators and accessibility markers.
 */

import React from 'react';
import { ExpressionCategory, UncertaintyStatus } from '../types/fer';
import { EXPRESSION_TRANSLATIONS } from '../utils/translations';

interface ExpressionBadgeProps {
  expression: ExpressionCategory | 'Uncertain';
  confidence: number;
  uncertaintyStatus?: UncertaintyStatus;
  showConfidence?: boolean;
  showUrdu?: boolean;
}

export const ExpressionBadge: React.FC<ExpressionBadgeProps> = ({
  expression,
  confidence,
  uncertaintyStatus = 'Nominal',
  showConfidence = true,
  showUrdu = true
}) => {
  const percent = Math.round(confidence * 100);
  const translation = EXPRESSION_TRANSLATIONS[expression] || EXPRESSION_TRANSLATIONS.Neutral;

  // Intentional semantic color indicator (never hue-only; paired with text)
  const getSemanticColor = () => {
    if (expression === 'Uncertain' || uncertaintyStatus === 'Abstained') {
      return 'text-amber-400';
    }
    switch (expression) {
      case 'Happy':
        return 'text-emerald-400';
      case 'Surprise':
        return 'text-cyan-400';
      case 'Sad':
        return 'text-blue-400';
      case 'Angry':
        return 'text-rose-400';
      case 'Fear':
        return 'text-purple-400';
      case 'Disgust':
        return 'text-amber-500';
      case 'Neutral':
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium">
      {/* Urdu Translation First for Prominence */}
      {showUrdu && (
        <span className={`font-semibold text-sm ${getSemanticColor()}`} dir="rtl">
          {translation.ur}
        </span>
      )}
      {showUrdu && <span className="text-slate-600" aria-hidden="true">·</span>}
      <span className={`font-semibold ${getSemanticColor()}`}>
        {expression === 'Uncertain' ? 'Uncertain / Abstained' : expression}
      </span>
      {showConfidence && (
        <>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-400">
            {percent}% conf
          </span>
        </>
      )}
      {uncertaintyStatus !== 'Nominal' && (
        <>
          <span className="text-slate-600" aria-hidden="true">/</span>
          <span className="text-amber-400/90 text-[11px]">
            {uncertaintyStatus}
          </span>
        </>
      )}
    </div>
  );
};
