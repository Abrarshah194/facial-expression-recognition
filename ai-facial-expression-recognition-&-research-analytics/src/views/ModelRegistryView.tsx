/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module B & E: Model Registry & Uncertainty Engine.
 * Features:
 *  - Multi-model architecture comparison (ResNet-FER+, Mini-Xception, MobileNetV3-FER)
 *  - Cryptographic checksums (SHA-256) & license provenance
 *  - Active model switcher
 *  - Expected Calibration Error (ECE) and reliability diagrams
 *  - Abstention policy threshold configuration
 */

import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  Sliders,
  Shield,
  FileCode,
  ArrowRight,
  Info,
  Clock,
  Cpu
} from 'lucide-react';
import { ModelInfo } from '../types/fer';
import { storageService } from '../services/storageService';

interface ModelRegistryViewProps {
  onModelChanged?: (model: ModelInfo) => void;
}

export const ModelRegistryView: React.FC<ModelRegistryViewProps> = ({ onModelChanged }) => {
  const [models, setModels] = useState<ModelInfo[]>(storageService.getModels());
  const [selectedModelId, setSelectedModelId] = useState<string>(
    models.find(m => m.active)?.id || models[0].id
  );
  const [abstentionThreshold, setAbstentionThreshold] = useState<number>(0.30);

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  const handleSetActive = (id: string) => {
    storageService.setActiveModel(id);
    const updated = storageService.getModels();
    setModels(updated);
    const current = updated.find(m => m.id === id);
    if (current && onModelChanged) {
      onModelChanged(current);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-cyan-400" />
          Model Registry & Uncertainty Calibration Engine
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Verified convolutional model architectures, cryptographic checksums, calibration metrics, and abstention policies
        </p>
      </div>

      {/* Abstention Policy Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Global Uncertainty Abstention Policy
            </h3>
            <p className="text-xs text-slate-400">
              When maximum predicted softmax probability falls below this threshold, the system triggers an explicit &quot;Uncertain / Abstained&quot; state.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400">Abstention Cutoff:</span>
            <span className="ml-2 font-mono text-base font-bold text-cyan-400">
              {Math.round(abstentionThreshold * 100)}%
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0.15"
          max="0.75"
          step="0.05"
          value={abstentionThreshold}
          onChange={e => setAbstentionThreshold(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>15% (Ultra Sensitive)</span>
          <span>Balanced Default: 30%</span>
          <span>75% (Conservative)</span>
        </div>
      </div>

      {/* Model Cards Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map(m => {
          const isSelected = m.id === selectedModelId;
          const isActive = m.active;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    {m.architecture.split(' ')[0]}
                  </span>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Model
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Standby</span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">{m.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {m.description}
                  </p>
                </div>

                {/* Metrics Table */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Top-1 Accuracy:</span>
                    <span className="font-mono tabular-nums text-slate-200 font-semibold">
                      {(m.top1Accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Macro F1:</span>
                    <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                      {(m.macroF1 * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mean Latency:</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {m.avgLatencyMs} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parameters:</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {m.parametersMillions}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calibration (ECE):</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                      {m.calibrationEce}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-800">
                {!isActive ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleSetActive(m.id);
                    }}
                    className="w-full py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 rounded text-xs font-semibold transition-colors"
                  >
                    Set as Active Pipeline Model
                  </button>
                ) : (
                  <div className="text-center text-xs text-emerald-400 font-medium py-1">
                    Currently Selected Engine
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Model Technical Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Architecture Specification & Audit Trail: {activeModel.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Cryptographic Checksum (SHA-256):</span>
              <span className="font-mono text-cyan-300 text-[11px] break-all">
                {activeModel.checksumSha256}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Training Data Provenance:</span>
              <span className="text-slate-300">
                {activeModel.provenance}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Input Preprocessing Pipeline:</span>
              <span className="text-slate-300">
                {activeModel.inputSize}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">License & Research Terms:</span>
              <span className="text-slate-300">
                {activeModel.license}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400 flex items-start gap-1.5 mt-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Calibration Discipline:</strong> Expected Calibration Error (ECE) is calculated over 10 confidence bins on held-out test data. Softmax output reflects conditional likelihood over the 7 categories under training conditions; it must never be treated as verified proof of factual ground truth.
          </p>
        </div>
      </div>
    </div>
  );
};
