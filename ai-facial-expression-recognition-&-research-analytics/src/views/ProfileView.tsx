/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * User Profile & Researcher Account View.
 */

import React, { useState } from 'react';
import { UserCircle2, Shield, CheckCircle2, Key, Building2, Mail } from 'lucide-react';
import { UserAccount, UserRole } from '../types/fer';
import { storageService } from '../services/storageService';

interface ProfileViewProps {
  currentUser: UserAccount;
  onUpdateRole: (role: UserRole) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateRole }) => {
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = () => {
    storageService.setCurrentUserRole(role);
    onUpdateRole(role);
    setNotice('Profile and permissions updated successfully.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <UserCircle2 className="w-5 h-5 text-cyan-400" />
          Researcher Profile & Account Permissions
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          User identification, institutional affiliation, and assigned role entitlements
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-lg space-y-6 text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 text-xl font-bold">
            {currentUser.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">{currentUser.fullName}</h2>
            <p className="text-slate-400">{currentUser.department}</p>
            <span className="font-mono text-cyan-400 text-[11px] capitalize">{currentUser.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email Address:
            </label>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono">
              {currentUser.email}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Department:
            </label>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-200">
              {currentUser.department}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Assigned Access Role:
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 capitalize"
            >
              <option value="administrator">Administrator (Full Access & Retention Control)</option>
              <option value="researcher">Researcher (Pipeline Execution & Evaluation)</option>
              <option value="analyst">Analyst (Review & Reports Export)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded text-xs transition-colors"
          >
            Save Profile & Role Changes
          </button>
        </div>
      </div>
    </div>
  );
};
