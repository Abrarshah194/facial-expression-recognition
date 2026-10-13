/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module E: Explainability & Model Transparency - Facial Action Coding System (FACS).
 * Provides grounded explainability by decomposing estimated expressions into
 * physiological Action Units (AUs) without inventing ungrounded psychological narratives.
 */

import React from 'react';
import { ActionUnit, ExpressionCategory } from '../types/fer';
import { Activity, Info } from 'lucide-react';
import { ACTION_UNIT_TRANSLATIONS_UR, EXPRESSION_TRANSLATIONS } from '../utils/translations';

interface ActionUnitExplainerProps {
  actionUnits: ActionUnit[];
  dominantExpression: ExpressionCategory | 'Uncertain';
}

export const ActionUnitExplainer: React.FC<ActionUnitExplainerProps> = ({
  actionUnits,
  dominantExpression
}) => {
  const trans = EXPRESSION_TRANSLATIONS[dominantExpression] || EXPRESSION_TRANSLATIONS.Neutral;

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>FACS Action Unit (AU) Physiological Decomposition</span>
            <span className="text-slate-500 font-normal">/ چہرے کے عضلاتی پٹھوں کا تجزیہ</span>
          </h3>
          <p className="text-xs text-slate-400">
            Ekman & Friesen Facial Action Coding System muscle activations underlying current estimate
          </p>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>Target:</span>
          <strong className="text-cyan-400 text-sm" dir="rtl">{trans.ur}</strong>
          <span className="text-slate-600">·</span>
          <strong className="text-cyan-400">{dominantExpression}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actionUnits.map(au => {
          const isActive = au.active;
          const pct = Math.round(au.score * 100);
          const urduAU = ACTION_UNIT_TRANSLATIONS_UR[au.id];

          return (
            <div
              key={au.id}
              className={`p-3 rounded border transition-all text-xs space-y-2 ${
                isActive
                  ? 'bg-slate-950 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-200 block">
                    {au.id} · {au.name}
                  </span>
                  {urduAU && (
                    <span className="text-[11px] text-cyan-400 block font-medium mt-0.5" dir="rtl">
                      {urduAU.nameUr}
                    </span>
                  )}
                </div>
                <span className={`font-mono tabular-nums font-semibold ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {pct}%
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {au.description}
              </p>

              {/* Activation Bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isActive ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Threshold: 35%</span>
                <span className={isActive ? 'text-emerald-400 font-medium' : 'text-slate-600'}>
                  {isActive ? 'Active / متحرک' : 'Resting / ساکن'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded text-[11px] text-slate-500 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-400">Scientific Transparency Note:</strong> Action Units describe visible muscular contraction patterns (e.g. Zygomaticus Major pulling lip corners obliquely). This system does not invent psychological explanations for why a muscle contracted.
        </p>
      </div>
    </div>
  );
};
