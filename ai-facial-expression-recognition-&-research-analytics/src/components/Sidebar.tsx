/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Research platform sidebar navigation.
 * High-density, accessible layout grouping all 21 system modules.
 */

import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Film,
  Image,
  Activity,
  CheckCircle2,
  Cpu,
  Boxes,
  SplitSquareVertical,
  Gauge,
  ListOrdered,
  FileCheck2,
  History,
  FileSpreadsheet,
  ShieldAlert,
  FileText,
  ScrollText,
  HeartPulse,
  Users,
  HelpCircle,
  UserCircle2,
  UserPlus
} from 'lucide-react';
import { UserAccount } from '../types/fer';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  activeJobCount: number;
  isAuthenticated?: boolean;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  activeJobCount,
  isAuthenticated = true,
  onOpenAuth,
  onLogout
}) => {
  const navSections: NavSection[] = [
    {
      title: 'PRIMARY CAPTURE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'camera', label: 'Live Camera', icon: Camera },
        { id: 'video', label: 'Video Analysis', icon: Film },
        { id: 'image', label: 'Image Analysis', icon: Image }
      ]
    },
    {
      title: 'ADVANCED ANALYTICS',
      items: [
        { id: 'timeline', label: 'Expression Timeline', icon: Activity },
        { id: 'quality', label: 'Analysis Quality', icon: CheckCircle2 },
        { id: 'evaluation-lab', label: 'Model Evaluation Lab', icon: Cpu },
        { id: 'models', label: 'Model Registry', icon: Boxes },
        { id: 'comparison', label: 'Video Comparison', icon: SplitSquareVertical },
        { id: 'resources', label: 'Resource Monitor', icon: Gauge },
        { id: 'queue', label: 'Job Queue', icon: ListOrdered, badge: activeJobCount > 0 ? activeJobCount : undefined },
        { id: 'testing', label: 'Automated Testing', icon: FileCheck2 }
      ]
    },
    {
      title: 'ARCHIVE & AUDIT',
      items: [
        { id: 'history', label: 'Analysis History', icon: History },
        { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
        { id: 'privacy', label: 'Privacy Center', icon: ShieldAlert },
        { id: 'model-card', label: 'Model Card & Limits', icon: FileText },
        { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
        { id: 'system-health', label: 'System Health', icon: HeartPulse }
      ]
    },
    {
      title: 'PLATFORM MANAGEMENT',
      items: [
        { id: 'auth-page', label: 'Smart Login / Register', icon: UserPlus },
        { id: 'admin', label: 'Administration', icon: Users },
        { id: 'profile', label: 'User Profile', icon: UserCircle2 },
        { id: 'help', label: 'Documentation', icon: HelpCircle }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col h-[calc(100vh-53px)] sticky top-[53px] overflow-y-auto">
      <div className="p-4 space-y-6 flex-1">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-1.5">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User profile compact footer with secure auth actions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        {isAuthenticated ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="truncate flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  {currentUser.fullName.slice(0, 1).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="font-medium text-slate-200 truncate leading-tight text-[11px]">{currentUser.fullName}</div>
                  <div className="text-[10px] text-cyan-400 font-mono capitalize leading-tight">{currentUser.role}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
              <button
                onClick={() => onNavigate('profile')}
                className="text-slate-400 hover:text-cyan-300 transition-colors"
              >
                Profile & RBAC
              </button>
              <button
                onClick={onLogout}
                className="text-rose-400/90 hover:text-rose-300 transition-colors"
                title="Sign out of research session"
              >
                Lock / Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Session Locked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="flex-1 py-1 px-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded text-[11px] font-bold text-center transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth?.('register')}
                className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold text-center transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
