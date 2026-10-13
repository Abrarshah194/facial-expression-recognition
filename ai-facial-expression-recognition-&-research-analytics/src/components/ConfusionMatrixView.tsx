/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module D: Model Evaluation Laboratory - Interactive Confusion Matrix.
 * Renders 7x7 confusion matrix with per-class precision, recall, F1 scores,
 * interactive cell hover diagnostics, and demographic evaluation limitations.
 */

import React, { useState } from 'react';
import { ALL_EXPRESSIONS, ExpressionCategory, EvaluationDataset } from '../types/fer';
import { Info, HelpCircle } from 'lucide-react';

interface ConfusionMatrixViewProps {
  dataset: EvaluationDataset;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({ dataset }) => {
  const [selectedCell, setSelectedCell] = useState<{
    trueClass: ExpressionCategory;
    predClass: ExpressionCategory;
    count: number;
    totalTrue: number;
  } | null>(null);

  const matrix = dataset.confusionMatrix;

  // Maximum value for color intensity scaling
  let maxCellVal = 1;
  matrix.forEach(row => {
    row.forEach(val => {
      if (val > maxCellVal) maxCellVal = val;
    });
  });

  return (
    <div className="space-y-6">
      {/* High-Level Benchmark Metrics KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-0.5">Overall Accuracy</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            {(dataset.accuracy * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Top-1 Correct</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-0.5">Macro F1 Score</span>
          <span className="text-xl font-bold font-mono tabular-nums text-cyan-400">
            {(dataset.macroF1 * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Unweighted mean</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-0.5">Weighted F1 Score</span>
          <span className="text-xl font-bold font-mono tabular-nums text-purple-400">
            {(dataset.weightedF1 * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Class support scaled</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-0.5">Latency (p95)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-200">
            {dataset.latencyP95Ms} ms
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">On standard CPU</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-0.5">Throughput</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-200">
            {dataset.throughputFps} FPS
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Single-thread</span>
        </div>
      </div>

      {/* Main Confusion Matrix Grid */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Normalized Confusion Matrix (7 x 7)
            </h3>
            <p className="text-xs text-slate-400">
              Rows represent True Ground Truth labels; Columns represent Model Predictions
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            N = {dataset.sampleCount.toLocaleString()} held-out samples
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[620px]">
            {/* Column Headers (Predictions) */}
            <div className="grid grid-cols-8 gap-1 mb-1 text-xs">
              <div className="text-[11px] font-semibold text-slate-500 text-right pr-2 pt-1">
                True \ Pred
              </div>
              {ALL_EXPRESSIONS.map(exp => (
                <div
                  key={exp}
                  className="text-center font-medium text-slate-400 truncate text-[11px]"
                  title={exp}
                >
                  {exp.slice(0, 4)}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {ALL_EXPRESSIONS.map((trueExp, rIdx) => {
              const rowSum = matrix[rIdx].reduce((a, b) => a + b, 0);

              return (
                <div key={trueExp} className="grid grid-cols-8 gap-1 mb-1 items-center">
                  {/* Row Label (Ground Truth) */}
                  <div className="text-xs font-medium text-slate-300 text-right pr-2 truncate">
                    {trueExp}
                  </div>

                  {/* Matrix Cells */}
                  {ALL_EXPRESSIONS.map((predExp, cIdx) => {
                    const count = matrix[rIdx][cIdx];
                    const isDiagonal = rIdx === cIdx;
                    const pctOfTrue = rowSum > 0 ? (count / rowSum) * 100 : 0;
                    const intensity = Math.min(1, count / maxCellVal);

                    // Styled background based on true vs false prediction
                    let bgStyle = 'bg-slate-950';
                    let textStyle = 'text-slate-500';

                    if (isDiagonal) {
                      bgStyle = 'bg-cyan-950/70 border border-cyan-800/60';
                      textStyle = 'text-cyan-300 font-semibold';
                    } else if (count > 0) {
                      bgStyle = count > 20 ? 'bg-rose-950/40 border border-rose-900/30' : 'bg-slate-950/80';
                      textStyle = count > 20 ? 'text-rose-400' : 'text-slate-400';
                    }

                    return (
                      <button
                        key={predExp}
                        onClick={() => setSelectedCell({ trueClass: trueExp, predClass: predExp, count, totalTrue: rowSum })}
                        className={`h-11 rounded flex flex-col items-center justify-center p-1 transition-all hover:ring-1 hover:ring-cyan-400 ${bgStyle}`}
                        title={`True: ${trueExp} | Pred: ${predExp} | Count: ${count} (${pctOfTrue.toFixed(1)}%)`}
                      >
                        <span className={`text-xs font-mono tabular-nums ${textStyle}`}>
                          {count}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums text-slate-500">
                          {pctOfTrue.toFixed(0)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Cell Inspection Callout */}
        {selectedCell && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">
                Cell Detail: Ground Truth [{selectedCell.trueClass}] → Predicted [{selectedCell.predClass}]
              </span>
              <div className="text-slate-400">
                Count: <span className="font-mono tabular-nums text-slate-200 font-medium">{selectedCell.count}</span> instances ({((selectedCell.count / selectedCell.totalTrue) * 100).toFixed(1)}% of all true {selectedCell.trueClass} samples).
              </div>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-500 hover:text-slate-300 px-2 py-1"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Per-Class Metrics Table */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Per-Class Precision, Recall, and F1 Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">Expression Category</th>
                <th className="py-2 px-3 font-semibold text-right">Precision</th>
                <th className="py-2 px-3 font-semibold text-right">Recall (Sensitivity)</th>
                <th className="py-2 px-3 font-semibold text-right">Specificity</th>
                <th className="py-2 px-3 font-semibold text-right">F1-Score</th>
                <th className="py-2 px-3 font-semibold text-right">Test Support (N)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ALL_EXPRESSIONS.map(exp => {
                const m = dataset.perClassMetrics[exp];
                return (
                  <tr key={exp} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-slate-200">{exp}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-400">
                      {(m.specificity * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-cyan-400 font-semibold">
                      {(m.f1Score * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-400">
                      {m.support}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographic and Ethical Documentation Notes */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Demographic Evaluation & Dataset Limitation Records</span>
        </div>
        <p className="leading-relaxed">
          {dataset.demographicsNote}
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>License: {dataset.license}</span>
          <span>Held-Out Partition: Strictly isolated from training pipeline (Zero Data Leakage)</span>
        </div>
      </div>
    </div>
  );
};
