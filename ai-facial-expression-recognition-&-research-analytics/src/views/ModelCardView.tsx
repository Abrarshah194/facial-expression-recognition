/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module E: Model Card & Scientific Limitations Specification.
 * Following IEEE affective computing ethics and Mitchell et al. (2019) standards.
 */

import React from 'react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Hash,
  Database,
  Cpu,
  EyeOff
} from 'lucide-react';
import { storageService } from '../services/storageService';

export const ModelCardView: React.FC = () => {
  const models = storageService.getModels();
  const activeModel = models.find(m => m.active) || models[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Model Card & Ethical Limitations Specification
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Formal technical documentation of model provenance, input normalization, intended research applications, and strictly prohibited uses
        </p>
      </div>

      {/* Primary Model Overview Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block">
              Active Production Artifact
            </span>
            <h2 className="text-base font-bold text-slate-100">{activeModel.name}</h2>
          </div>
          <span className="font-mono text-xs text-slate-400">
            v{activeModel.version}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Neural Architecture:</span>
              <span className="text-slate-200 font-medium">{activeModel.architecture}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Parameter Count & Weights Footprint:</span>
              <span className="text-slate-200 font-mono">{activeModel.parametersMillions}M parameters ({activeModel.memoryFootprintMb} MB)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cryptographic SHA-256 Checksum:</span>
              <span className="font-mono text-cyan-300 text-[10px] break-all">{activeModel.checksumSha256}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Training Data Provenance:</span>
              <span className="text-slate-200">{activeModel.provenance}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Preprocessing Pipeline:</span>
              <span className="text-slate-200">{activeModel.inputSize}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">License & Research Permissions:</span>
              <span className="text-slate-200">{activeModel.license}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intended Uses vs Strictly Prohibited Uses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Intended Uses */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Intended & Authorized Uses
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span><strong>Affective Computing Research:</strong> Controlled laboratory experiments investigating temporal expression dynamics and micro-expressions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span><strong>Interactive System Usability:</strong> Voluntary participant user-experience feedback during software usability evaluations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span><strong>Educational Demonstrations:</strong> Academic demonstration of computer vision, facial landmarks, and Facial Action Coding System (FACS).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span><strong>Student Behavior Analytics (Research):</strong> Non-invasive age cohort and gender estimation based on cranial bone geometry, jawline contours, and skin texture to study learning engagement and academic demographics.</span>
            </li>
          </ul>
        </div>

        {/* Prohibited Uses */}
        <div className="p-4 bg-slate-900/90 border border-rose-900/40 bg-rose-950/10 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Strictly Prohibited & Out-of-Scope Uses
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✗</span>
              <span><strong>Employment & Candidate Screening:</strong> Evaluating job applicants, interviews, or workplace productivity based on facial estimates.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✗</span>
              <span><strong>Covert Surveillance:</strong> Operating camera streams without explicit participant consent, knowledge, and active indicators.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✗</span>
              <span><strong>Deception or Honesty Detection:</strong> Claiming facial expressions indicate truthfulness, guilt, criminality, or creditworthiness.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✗</span>
              <span><strong>Psychological & Psychiatric Diagnoses:</strong> Using outputs as proxies for clinical depression, anxiety, or neurodivergence.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Input Preprocessing & Output Mapping Specification */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Input Preprocessing & Output Category Mapping
        </h3>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>1. Color Normalization:</strong> Input RGB tensors undergo luminance conversion via standard BT.601 coefficients followed by local Contrast-Limited Adaptive Histogram Equalization (CLAHE) to mitigate uneven lighting.
          </p>
          <p>
            <strong>2. Crop & Alignment:</strong> Detected faces are centered using an affine transformation aligned to inter-pupillary coordinates, cropped to 224x224 pixels, and zero-mean scaled to [-1.0, 1.0].
          </p>
          <p>
            <strong>3. Softmax Distribution:</strong> Output logits are converted to a 7-class probability simplex. If the top class probability is below the configured abstention cutoff (default 0.42) or if Laplacian variance indicates severe blur (&lt; 85), the engine returns an explicit &quot;Uncertain / Abstained&quot; output state.
          </p>
        </div>
      </div>
    </div>
  );
};
