/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Demographic & Student Behavior Analytics Card:
 * Displays Age & Gender estimation metrics derived from facial bone structure,
 * jawline-to-cheekbone ratios, chin morphology, eyebrow density, and dermal skin texture.
 * Calibrated specifically for Student Behavior Analytics in academic research.
 */

import React from 'react';
import { User, Calendar, Activity, ShieldCheck, Check, SlidersHorizontal } from 'lucide-react';
import { DemographicAnalysis } from '../types/fer';

interface DemographicsCardProps {
  demographics: DemographicAnalysis;
  onUpdateDemographics?: (updated: DemographicAnalysis) => void;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  demographics,
  onUpdateDemographics
}) => {
  const { age, gender, academicCohortGroup } = demographics;

  const handleGenderSelect = (selectedGender: 'Male' | 'Female') => {
    if (!onUpdateDemographics) return;
    const isMale = selectedGender === 'Male';
    const updated: DemographicAnalysis = {
      ...demographics,
      gender: {
        ...gender,
        gender: selectedGender,
        genderUrdu: isMale ? 'مرد' : 'خاتون',
        confidence: 0.94,
        probabilities: {
          male: isMale ? 0.92 : 0.08,
          female: isMale ? 0.08 : 0.92
        }
      }
    };
    onUpdateDemographics(updated);
  };

  const handleAgeChange = (newAge: number) => {
    if (!onUpdateDemographics) return;
    const clampedAge = Math.max(10, Math.min(65, newAge));
    let cohort: 'School / Junior Student (10-17)' | 'Undergraduate (18-22)' | 'Postgraduate (23-27)' | 'Senior Scholar (28+)';
    let range = '18-22 years';

    if (clampedAge <= 17) {
      cohort = 'School / Junior Student (10-17)';
      range = `${Math.max(10, clampedAge - 2)}-${clampedAge + 2} years`;
    } else if (clampedAge <= 22) {
      cohort = 'Undergraduate (18-22)';
      range = '18-22 years';
    } else if (clampedAge <= 27) {
      cohort = 'Postgraduate (23-27)';
      range = '23-27 years';
    } else {
      cohort = 'Senior Scholar (28+)';
      range = '28+ years';
    }

    const updated: DemographicAnalysis = {
      ...demographics,
      age: {
        ...age,
        estimatedAge: clampedAge,
        ageRange: range,
        confidence: 0.95
      },
      academicCohortGroup: cohort
    };
    onUpdateDemographics(updated);
  };

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Age & Gender Estimation</span>
            <span className="text-slate-500 font-normal">/ عمر اور جنس کا تخمینہ</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Student Behavior Analytics · Facial Bone Structure & Skin Texture
          </p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-[10px] font-mono font-semibold">
          ResNet-FER+ v2.4.1
        </span>
      </div>

      {/* Main Indicators: Gender & Age Highlights */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gender Block */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gender / جنس</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-300 font-semibold">
              {Math.round(gender.confidence * 100)}% conf
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className={gender.gender === 'Male' ? 'text-cyan-400' : 'text-pink-400'}>
                {gender.gender}
              </span>
              <span className="text-sm text-slate-400 font-normal" dir="rtl">
                ({gender.genderUrdu})
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">
              {gender.gender === 'Male' ? '♂ Male' : '♀ Female'}
            </span>
          </div>

          {/* Detected Facial Trait Badge (داڑھی، مونچھیں، کلین شیو، یا نسوانی خد و خال) */}
          {gender.facialHairTraits && (
            <div className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between">
              <span className="text-slate-400">شناخت فیچر:</span>
              <span className={`font-medium ${gender.gender === 'Male' ? 'text-cyan-300' : 'text-pink-300'}`}>
                {gender.facialHairTraits.detectedTraitUrdu}
              </span>
            </div>
          )}

          {/* Interactive Gender Selector */}
          <div className="pt-1">
            <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
              <span>Classifier Override:</span>
              <span className="text-[9px] text-slate-500">1-click switch</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleGenderSelect('Male')}
                className={`py-1 px-2 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                  gender.gender === 'Male'
                    ? 'bg-cyan-600/30 border border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {gender.gender === 'Male' && <Check className="w-3 h-3 text-cyan-400" />}
                <span>♂ Male (مرد)</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('Female')}
                className={`py-1 px-2 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                  gender.gender === 'Female'
                    ? 'bg-pink-600/30 border border-pink-500 text-pink-200 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {gender.gender === 'Female' && <Check className="w-3 h-3 text-pink-400" />}
                <span>♀ Female (خاتون)</span>
              </button>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Male: {Math.round(gender.probabilities.male * 100)}%</span>
              <span>Female: {Math.round(gender.probabilities.female * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-cyan-500 h-full transition-all"
                style={{ width: `${Math.round(gender.probabilities.male * 100)}%` }}
              />
              <div
                className="bg-pink-500 h-full transition-all"
                style={{ width: `${Math.round(gender.probabilities.female * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Age Block */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approx. Age / تخمینہ عمر</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-300 font-semibold">
              {Math.round(age.confidence * 100)}% conf
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg font-bold text-slate-100">
              ~{age.estimatedAge} <span className="text-xs font-normal text-slate-400">years / سال</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-medium">
              {age.ageRange}
            </span>
          </div>

          {/* Age Fine-Tuning Controls */}
          <div className="pt-1">
            <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
              <span>Adjust Age:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleAgeChange(age.estimatedAge - 1)}
                  className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 hover:border-slate-700"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleAgeChange(age.estimatedAge + 1)}
                  className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 hover:border-slate-700"
                >
                  +1
                </button>
              </div>
            </div>
            <div className="flex gap-1">
              {[12, 18, 20, 25].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAgeChange(preset)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono transition-all ${
                    age.estimatedAge === preset
                      ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}y
                </button>
              ))}
            </div>
          </div>

          {/* Academic Cohort */}
          <div className="pt-0.5">
            <span className="text-[10px] text-slate-500 block">Student Cohort:</span>
            <span className="text-[11px] font-semibold text-emerald-300 truncate block">
              🎓 {academicCohortGroup}
            </span>
          </div>
        </div>
      </div>

      {/* Biometric & Bone Structure Breakdown */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Biometric Indicators (Bone Structure & Skin Texture)</span>
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Skin Texture Smoothness */}
          <div className="p-2 bg-slate-950/50 rounded border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Skin Smoothness:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {Math.round(age.biometricIndicators.skinTextureSmoothness * 100)}%
            </span>
          </div>

          {/* Jawline Firmness */}
          <div className="p-2 bg-slate-950/50 rounded border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Jawline Firmness:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {Math.round(age.biometricIndicators.jawlineFirmness * 100)}%
            </span>
          </div>

          {/* Brow Ridge Prominence */}
          <div className="p-2 bg-slate-950/50 rounded border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Brow Ridge Bone:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {Math.round(gender.morphologicalIndicators.browRidgeProminence * 100)}%
            </span>
          </div>

          {/* Nasolabial Fold Depth */}
          <div className="p-2 bg-slate-950/50 rounded border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Nasolabial Fold:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {Math.round(age.biometricIndicators.nasolabialFoldDepth * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Research & Compliance Notice */}
      <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded text-[10px] text-slate-400 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Research Disclaimer:</strong> Gender and age estimation is calculated via non-invasive facial morphology and local texture metrics under ResNet-FER+ v2.4.1 for Student Behavior Analytics.
        </span>
      </div>
    </div>
  );
};
