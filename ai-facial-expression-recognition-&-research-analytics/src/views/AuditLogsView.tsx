/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audit Logs & Compliance Trail View.
 * Displays immutable audit events for:
 *  - SECURITY (camera access, auth)
 *  - PRIVACY (data retention, purge, export)
 *  - MODEL (active model changes, threshold adjustments)
 *  - DATA_ACCESS (session creation, deletion)
 */

import React, { useState } from 'react';
import { ScrollText, Search, Download, Filter, ShieldCheck, Lock } from 'lucide-react';
import { AuditLogEntry } from '../types/fer';
import { storageService } from '../services/storageService';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(storageService.getAuditLogs());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesCat = filterCategory === 'all' || log.category === filterCategory;
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userId.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const exportAuditCsv = () => {
    const headers = ['Timestamp', 'Category', 'User', 'Role', 'Action', 'Details', 'IP_Address'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.category,
      l.userId,
      l.userRole,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (cat: AuditLogEntry['category']) => {
    switch (cat) {
      case 'SECURITY': return 'text-purple-400';
      case 'PRIVACY': return 'text-emerald-400';
      case 'MODEL': return 'text-cyan-400';
      case 'DATA_ACCESS': return 'text-blue-400';
      case 'SYSTEM': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            System & Privacy Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of security authorizations, data retention modifications, and model lifecycle events
          </p>
        </div>

        <button
          onClick={exportAuditCsv}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 rounded font-medium flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Audit Trail CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit actions, user IDs, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Category:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Categories</option>
            <option value="SECURITY">Security</option>
            <option value="PRIVACY">Privacy</option>
            <option value="MODEL">Model Lifecycle</option>
            <option value="DATA_ACCESS">Data Access</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-semibold text-slate-200">
            Audit Records ({filteredLogs.length} events logged)
          </span>
          <span className="text-slate-500">
            Tamper-evident client ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">User</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 text-[11px]">
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-semibold ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {log.userId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
