/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Module H: Advanced Processing Queue.
 * Background video processing queue:
 *  - Job progress tracking and frame counts
 *  - Cancellation & retry policies
 *  - Error diagnostics and temporary buffer cleanup
 *  - Persistent queue status
 */

import React, { useState } from 'react';
import {
  ListOrdered,
  Play,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Plus
} from 'lucide-react';
import { ProcessingJob } from '../types/fer';
import { storageService } from '../services/storageService';

export const JobQueueView: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>(storageService.getJobs());
  const [maxConcurrency, setMaxConcurrency] = useState<number>(2);

  const refreshJobs = () => {
    setJobs(storageService.getJobs());
  };

  const handleCancel = (id: string) => {
    storageService.cancelJob(id);
    refreshJobs();
  };

  const handleRetry = (id: string) => {
    storageService.retryJob(id);
    refreshJobs();
  };

  const handleClearCompleted = () => {
    storageService.clearCompletedJobs();
    refreshJobs();
  };

  const createSimulatedJob = () => {
    storageService.createJob({
      title: `Batch Video Analysis #${Math.floor(Math.random() * 900 + 100)}`,
      mediaType: 'video',
      fileName: `research_trial_${Date.now()}.mp4`,
      fileSizeMb: Math.round((Math.random() * 15 + 4) * 10) / 10,
      totalFrames: 80,
      samplingIntervalMs: 250,
      etaSeconds: 12
    });
    refreshJobs();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-cyan-400" />
            Background Processing Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Asynchronous job scheduler for high-volume video processing with error retry and cleanup policies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={createSimulatedJob}
            className="px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enqueue Test Job</span>
          </button>

          <button
            onClick={handleClearCompleted}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed</span>
          </button>
        </div>
      </div>

      {/* Queue Configuration Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400">Total In Queue:</span>
            <span className="ml-1.5 font-bold text-slate-200 font-mono">
              {jobs.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Active:</span>
            <span className="ml-1.5 font-bold text-cyan-400 font-mono">
              {jobs.filter(j => j.status === 'processing').length}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Failed / Cancelled:</span>
            <span className="ml-1.5 font-bold text-rose-400 font-mono">
              {jobs.filter(j => j.status === 'failed' || j.status === 'cancelled').length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Max Concurrent Jobs:</span>
          <select
            value={maxConcurrency}
            onChange={e => setMaxConcurrency(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200"
          >
            <option value={1}>1 (Single thread)</option>
            <option value={2}>2 (Balanced)</option>
            <option value={4}>4 (High throughput)</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Job Queue Registry
        </h3>

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-600" />
            <p>Queue is currently empty. Enqueue a video or test job to view progress.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Job Title & File</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Progress</th>
                  <th className="py-2.5 px-3 font-semibold">Frames</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <div>{job.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {job.fileName} · {job.fileSizeMb}MB · {new Date(job.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 font-medium capitalize text-xs ${
                        job.status === 'completed' ? 'text-emerald-400' :
                        job.status === 'processing' ? 'text-cyan-400' :
                        job.status === 'failed' ? 'text-rose-400' :
                        job.status === 'cancelled' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {job.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {job.status === 'failed' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 w-40">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>{job.progress}%</span>
                          {job.etaSeconds > 0 && <span>ETA: {job.etaSeconds}s</span>}
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              job.status === 'completed' ? 'bg-emerald-400' :
                              job.status === 'failed' ? 'bg-rose-500' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      {job.currentFrame} / {job.totalFrames}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {job.status === 'processing' || job.status === 'queued' ? (
                        <button
                          onClick={() => handleCancel(job.id)}
                          className="text-rose-400 hover:text-rose-300 font-medium"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRetry(job.id)}
                          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
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
