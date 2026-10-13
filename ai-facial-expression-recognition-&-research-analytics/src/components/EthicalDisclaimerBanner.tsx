/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ethical Disclaimer & Scientific Scope Banner.
 * In accordance with IEEE/ACM affective computing ethics guidelines,
 * clearly informs users that facial movement estimates do not equate to internal emotion.
 */

import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface EthicalDisclaimerBannerProps {
  compact?: boolean;
}

export const EthicalDisclaimerBanner: React.FC<EthicalDisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-900/90 border border-slate-800 text-xs text-slate-400 rounded-md">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">
          Estimates reflect visible facial muscle displacements (FACS), not verified internal emotional states or intent.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-slate-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">
            Affective Computing Research Ethics & Scientific Boundary
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            This platform estimates observable facial muscle movement patterns mapped to the 7 canonical Facial Action Coding System (FACS) categories.
            <strong className="text-slate-300 font-medium"> Facial expressions do not reliably reveal a person&apos;s true internal feelings, honesty, personality, or mental health.</strong> This system is strictly for voluntary research, usability evaluation, and controlled demonstration. Prohibited for employment screening, proctoring, credit evaluation, or punitive decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
