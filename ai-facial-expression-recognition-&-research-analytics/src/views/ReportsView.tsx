/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reports & Data Exports Module.
 * Features:
 *  - Comprehensive research report generation
 *  - Formula-escaped CSV exports (mitigating CSV injection vulnerabilities)
 *  - Machine-readable JSON export
 *  - Aggregate category distribution breakdown
 *  - Ethical affective research documentation header
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { AnalysisSession, ALL_EXPRESSIONS, ExpressionCategory } from '../types/fer';
import { storageService } from '../services/storageService';

interface ReportsViewProps {
  sessions: AnalysisSession[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sessions }) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Compute aggregate totals
  const totalSessions = sessions.length;
  let totalFrames = 0;
  const categoryTotals: Record<ExpressionCategory, number> = {
    Happy: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0, Neutral: 0
  };

  sessions.forEach(s => {
    totalFrames += s.frames?.length || (s.durationSeconds ? s.durationSeconds * 4 : 1);
    ALL_EXPRESSIONS.forEach(exp => {
      categoryTotals[exp] += s.categoryFrequencies[exp] || 0;
    });
  });

  const totalPoints = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const downloadReport = () => {
    if (selectedFormat === 'json') {
      const exportObject = {
        meta: {
          platform: 'AI Facial Expression Recognition & Research Analytics System',
          reportGeneratedAt: new Date().toISOString(),
          totalSessionsAnalyzed: totalSessions,
          totalFramesProcessed: totalFrames,
          ethicalDisclaimer: 'Estimates reflect observable facial muscle movements (FACS), not verified internal emotions.'
        },
        aggregateCategoryDistribution: categoryTotals,
        sessions: sessions.map(s => ({
          id: s.id,
          title: s.title,
          mode: s.mode,
          timestamp: s.timestamp,
          durationSeconds: s.durationSeconds,
          modelVersion: s.modelVersion,
          dominantCategory: s.dominantCategory,
          averageConfidence: s.averageConfidence,
          averageQualityScore: s.averageQualityScore,
          categoryFrequencies: s.categoryFrequencies
        }))
      };

      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affective_research_report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV format with formula injection protection
      const headers = ['Session_ID', 'Title', 'Mode', 'Timestamp', 'Duration_s', 'Dominant_Expression', 'Mean_Confidence', 'Quality_Score'];
      
      const rows = sessions.map(s => {
        // Safe escaping against spreadsheet formula injection (=, +, -, @)
        const safeTitle = s.title.replace(/^[=+\-@]/, "'");
        return [
          s.id,
          `"${safeTitle.replace(/"/g, '""')}"`,
          s.mode,
          s.timestamp,
          s.durationSeconds || 0,
          s.dominantCategory,
          Math.round(s.averageConfidence * 100),
          s.averageQualityScore
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affective_research_report_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportNotice(`Report exported successfully as ${selectedFormat.toUpperCase()}.`);
    setTimeout(() => setExportNotice(null), 3000);
    storageService.recordAuditLog('DATA_ACCESS', `Exported research report (${selectedFormat.toUpperCase()})`, `Sessions count: ${totalSessions}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Research Reports & Data Exports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Export structured session logs, aggregate category frequencies, and ethical compliance summaries
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 rounded font-medium flex items-center gap-2 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>Printable Summary</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Export Configuration Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Generate Research Data Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Export File Format:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`flex-1 py-2 rounded font-semibold border transition-all ${
                  selectedFormat === 'csv'
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                CSV (Spreadsheet Safe)
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`flex-1 py-2 rounded font-semibold border transition-all ${
                  selectedFormat === 'json'
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                JSON (Full Object)
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Session Scope:</label>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 font-mono">
              All active sessions ({totalSessions} records)
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={downloadReport}
              className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Research Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Report Summary Sheet */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-lg space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold block">
              Formal Research Report
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Facial Expression Analytics Laboratory Summary
            </h2>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Ethical Safeguard Header in Report */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>Research Statement & Legal Notice:</strong> Data in this export represents observable facial movement estimates mapped to the 7 canonical FACS categories. This report does not assess subjective emotions, psychological suitability, honesty, or personality traits. Formula values are sanitized to protect against spreadsheet execution vulnerabilities.
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Total Sessions</span>
            <span className="text-xl font-bold font-mono text-slate-200">{totalSessions}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Sampled Frame Points</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{totalPoints}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Storage Architecture</span>
            <span className="text-xs font-semibold text-emerald-400 block mt-1">Local-First (No Cloud)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Default Retention</span>
            <span className="text-xs font-semibold text-slate-200 block mt-1">7 Days Auto-Purge</span>
          </div>
        </div>

        {/* Aggregate Frequency Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Aggregate Category Frequency Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Category</th>
                  <th className="py-2 px-3 font-semibold text-right">Observation Count</th>
                  <th className="py-2 px-3 font-semibold text-right">Relative Frequency (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ALL_EXPRESSIONS.map(exp => {
                  const count = categoryTotals[exp] || 0;
                  const pct = totalPoints > 0 ? (count / totalPoints) * 100 : 0;
                  return (
                    <tr key={exp} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{exp}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-400 font-semibold">
                        {pct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
