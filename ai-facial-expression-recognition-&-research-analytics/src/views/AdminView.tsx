/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Administration & Role-Based Access Control (RBAC) View.
 * Allows role management:
 *  - Administrator: Full system configuration and retention management
 *  - Researcher: Session capture, model evaluation, and export rights
 *  - Analyst: Read-only analytics and reporting rights
 */

import React, { useState } from 'react';
import { Users, Shield, Key, CheckCircle2, UserPlus, Lock } from 'lucide-react';
import { UserAccount, UserRole } from '../types/fer';
import { storageService } from '../services/storageService';

interface AdminViewProps {
  currentUser: UserAccount;
  onRoleChanged: (role: UserRole) => void;
}

const SAMPLE_USERS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'research.lead',
    email: 'abrarshah2134896@gmail.com',
    fullName: 'Dr. A. Shah',
    role: 'administrator',
    department: 'Computer Vision & Affective Analytics Laboratory',
    createdAt: '2026-01-10T08:00:00Z',
    lastLogin: 'Just now'
  },
  {
    id: 'usr-research-02',
    username: 'e.turner',
    email: 'turner.e@affective-lab.org',
    fullName: 'Dr. Elena Turner',
    role: 'researcher',
    department: 'Cognitive Computing Division',
    createdAt: '2026-01-15T10:30:00Z',
    lastLogin: '2 hours ago'
  },
  {
    id: 'usr-analyst-03',
    username: 'm.chen',
    email: 'chen.m@affective-lab.org',
    fullName: 'Marcus Chen',
    role: 'analyst',
    department: 'Data Quality & Validation',
    createdAt: '2026-02-01T14:15:00Z',
    lastLogin: 'Yesterday'
  }
];

export const AdminView: React.FC<AdminViewProps> = ({ currentUser, onRoleChanged }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole>(currentUser.role);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedUserRole(role);
    storageService.setCurrentUserRole(role);
    onRoleChanged(role);
    refreshUsers();
    setNotice(`Active user role updated to ${role.toUpperCase()}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Administration & Role-Based Access Control
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Role assignments, credential policies, and system access boundaries
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Role Switcher Sandbox Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Active User Role Switcher
            </h3>
            <p className="text-xs text-slate-400">
              Switch role permissions to inspect authorization enforcement across administrator, researcher, and analyst tiers:
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['administrator', 'researcher', 'analyst'] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-all border ${
                  currentUser.role === r
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Role Permission Entitlement Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Permission Capability</th>
                <th className="py-2.5 px-3 font-semibold text-center">Administrator</th>
                <th className="py-2.5 px-3 font-semibold text-center">Researcher</th>
                <th className="py-2.5 px-3 font-semibold text-center">Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-slate-200">Start Camera & Capture Streams</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-slate-200">Video & Image Upload Analysis</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-slate-200">Switch Active Model in Registry</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-slate-200">Configure Data Retention & Auto-Purge</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-slate-200">Execute Right-to-Erasure &quot;Purge All Data&quot;</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-slate-200">Inspect Full Audit Logs</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-600">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorized Accounts Directory */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Authorized Platform Accounts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">User</th>
                <th className="py-2 px-3 font-semibold">Email</th>
                <th className="py-2 px-3 font-semibold">Department</th>
                <th className="py-2 px-3 font-semibold">Role</th>
                <th className="py-2 px-3 font-semibold text-right">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-200">{u.fullName}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{u.email}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.department}</td>
                  <td className="py-2.5 px-3">
                    <span className="capitalize font-semibold text-cyan-400">{u.role}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 font-mono">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
