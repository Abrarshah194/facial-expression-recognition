/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module I: Local-First Privacy Architecture & Governance Center.
 * Implements:
 *  - Strict zero raw-video retention by default
 *  - Configurable retention period (1, 7, 30 days) with auto-purge
 *  - Frame-level data minimization options
 *  - One-click GDPR "Purge All Data"
 *  - Machine-readable privacy export
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  HardDrive,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { PrivacySettings } from '../types/fer';
import { storageService } from '../services/storageService';

export const PrivacyCenterView: React.FC = () => {
  const [privacy, setPrivacy] = useState<PrivacySettings>(storageService.getPrivacySettings());
  const [showPurgeConfirm, setShowPurgeConfirm] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleUpdate = (updates: Partial<PrivacySettings>) => {
    const updated = storageService.updatePrivacySettings(updates);
    setPrivacy(updated);
    setSaveNotice('Privacy preferences saved locally.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handlePurgeAll = () => {
    storageService.purgeAllData();
    setShowPurgeConfirm(false);
    setSaveNotice('All user sessions and jobs have been permanently purged.');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const exportGdprPackage = () => {
    const data = {
      privacySettings: privacy,
      sessions: storageService.getSessions(),
      jobs: storageService.getJobs(),
      auditLogs: storageService.getAuditLogs()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdpr_privacy_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            Local-First Privacy Architecture & Governance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict client-side execution boundaries, zero raw-video retention, and user-controlled data lifecycles
          </p>
        </div>

        <button
          onClick={exportGdprPackage}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 rounded font-medium flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export GDPR Data Package</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Core Privacy Principles Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Privacy-by-Design Technical Guarantees
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-1">
            <span className="font-semibold text-slate-200">1. Zero Cloud Upload</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Computer vision inference runs strictly in-memory on your local device. Video streams and camera feeds are never transmitted to third-party endpoints.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-1">
            <span className="font-semibold text-slate-200">2. No Raw Video Retention</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Raw frames are discarded immediately after feature extraction. Only statistical category frequencies are stored unless explicitly overridden.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-1">
            <span className="font-semibold text-slate-200">3. Ephemeral Biometrics</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Temporary bounding box indices (Face #1) exist only within the current frame. No persistent identity graphs or biometric signatures are created.
            </p>
          </div>
        </div>
      </div>

      {/* Retention and Storage Settings Form */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Configurable Data Retention & Minimization Policies
        </h3>

        <div className="space-y-4 divide-y divide-slate-800/60 text-xs">
          {/* Retention Period Setting */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-medium text-slate-200 block">
                Automatic Session Data Retention Window
              </span>
              <span className="text-slate-400 text-[11px]">
                Analysis sessions older than this duration are automatically purged on startup.
              </span>
            </div>
            <select
              value={privacy.dataRetentionPeriodDays}
              onChange={e => handleUpdate({ dataRetentionPeriodDays: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
            >
              <option value={1}>1 Day (Strict Minimization)</option>
              <option value={7}>7 Days (Default Research)</option>
              <option value={30}>30 Days (Extended Review)</option>
            </select>
          </div>

          {/* Raw Media Retention Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-medium text-slate-200 block">
                Retain Raw Video Files
              </span>
              <span className="text-slate-400 text-[11px]">
                Default is disabled. Enabling temporarily caches raw video files in IndexedDB storage.
              </span>
            </div>
            <button
              onClick={() => handleUpdate({ retainRawMedia: !privacy.retainRawMedia })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                privacy.retainRawMedia ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  privacy.retainRawMedia ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Frame-Level Data Minimization */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-medium text-slate-200 block">
                Persist Frame-Level Time-Series Points
              </span>
              <span className="text-slate-400 text-[11px]">
                When disabled, only high-level summary percentages are stored, dropping all frame arrays.
              </span>
            </div>
            <button
              onClick={() => handleUpdate({ retainFrameLevelData: !privacy.retainFrameLevelData })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                privacy.retainFrameLevelData ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  privacy.retainFrameLevelData ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Anonymize Titles */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-medium text-slate-200 block">
                Anonymize Uploaded File Names in Session Titles
              </span>
              <span className="text-slate-400 text-[11px]">
                Replaces personal file paths with generic identifiers (e.g. Session #1042).
              </span>
            </div>
            <button
              onClick={() => handleUpdate({ anonymizeSessionTitles: !privacy.anonymizeSessionTitles })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                privacy.anonymizeSessionTitles ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  privacy.anonymizeSessionTitles ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Purge All Data */}
      <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Right to Erasure / Immediate Data Purge
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently purges all stored analysis sessions, video job records, and temporary frame caches from this browser.
            </p>
          </div>

          {showPurgeConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs"
              >
                Confirm Permanent Purge
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Local Records</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
