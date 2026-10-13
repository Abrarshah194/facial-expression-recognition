/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Analysis History View.
 * Searchable, filterable list of all local analysis sessions with:
 *  - Search by title or tag
 *  - Filter by mode (camera, video, image, demo)
 *  - Filter by dominant expression category
 *  - Detailed drilldown inspection
 *  - Granular session deletion with audit trail
 *  - CSV / JSON export
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { AnalysisSession, ALL_EXPRESSIONS, ExpressionCategory } from '../types/fer';
import { ExpressionBadge } from '../components/ExpressionBadge';
import { storageService } from '../services/storageService';

interface AnalysisHistoryViewProps {
  sessions: AnalysisSession[];
  onSelectSession: (sessionId: string) => void;
  onRefreshSessions: () => void;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  sessions,
  onSelectSession,
  onRefreshSessions
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMode = modeFilter === 'all' || session.mode === modeFilter;
    const matchesCat = categoryFilter === 'all' || session.dominantCategory === categoryFilter;
    return matchesSearch && matchesMode && matchesCat;
  });

  const handleDelete = (id: string) => {
    storageService.deleteSession(id);
    setDeleteConfirmId(null);
    onRefreshSessions();
  };

  const exportAllHistoryCsv = () => {
    const headers = ['ID', 'Title', 'Mode', 'Date', 'Dominant Expression', 'Confidence %', 'Quality Score', 'Model'];
    const rows = filteredSessions.map(s => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      s.mode,
      new Date(s.timestamp).toLocaleDateString(),
      s.dominantCategory,
      Math.round(s.averageConfidence * 100),
      s.averageQualityScore,
      `"${s.modelVersion.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fer_history_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Analysis History & Session Archive
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally stored session records subject to user-defined data retention rules
          </p>
        </div>

        <button
          onClick={exportAllHistoryCsv}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 rounded font-medium flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export History CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by session title or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Mode Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Mode:</span>
          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Modes</option>
            <option value="live_camera">Live Camera</option>
            <option value="video_upload">Video Upload</option>
            <option value="image_upload">Image Upload</option>
            <option value="demo_sample">Synthetic Demo</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Dominant:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Categories</option>
            {ALL_EXPRESSIONS.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-semibold text-slate-200">
            Recorded Sessions ({filteredSessions.length} total)
          </span>
          <span className="text-slate-500">
            Auto-purges older than retention window
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No matching analysis sessions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Title</th>
                  <th className="py-2.5 px-3 font-semibold">Mode</th>
                  <th className="py-2.5 px-3 font-semibold">Date & Model</th>
                  <th className="py-2.5 px-3 font-semibold">Dominant</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Confidence</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Quality</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-medium text-slate-200 max-w-[240px] truncate">
                      <div>{session.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {session.tags.map(t => (
                          <span key={t} className="text-[10px] text-slate-400 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 capitalize text-slate-400">
                      {session.mode.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      <div>{new Date(session.timestamp).toLocaleDateString()}</div>
                      <div className="text-slate-500">{session.modelVersion.split(' ')[0]}</div>
                    </td>

                    <td className="py-3 px-3">
                      <ExpressionBadge
                        expression={session.dominantCategory}
                        confidence={session.averageConfidence}
                        showConfidence={false}
                      />
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                      {Math.round(session.averageConfidence * 100)}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-cyan-400">
                      {session.averageQualityScore}/100
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectSession(session.id)}
                          className="px-2 py-1 text-cyan-400 hover:text-cyan-300 font-medium"
                          title="Inspect Session"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {deleteConfirmId === session.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1 text-slate-400 hover:text-slate-200 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(session.id)}
                            className="px-2 py-1 text-slate-500 hover:text-rose-400"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
