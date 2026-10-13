/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Strict Top Bar Contract implementation:
 * [Brand title, one line] — [4-5 nav links, 1-2 word labels, single-line] — [1 primary action]
 */

import React from 'react';
import { Camera, Shield, LogIn, LogOut, UserCircle } from 'lucide-react';
import { UserAccount } from '../types/fer';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  isAuthenticated?: boolean;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  isAuthenticated = true,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur border-b border-slate-800/80 px-6 py-2.5">
      <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-base font-bold tracking-tight text-slate-100 hover:text-white transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Affective Vision Lab</span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              currentView === 'dashboard' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('camera')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              currentView === 'camera' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Live Camera
          </button>
          <button
            onClick={() => onNavigate('video')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              currentView === 'video' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Video Analysis
          </button>
          <button
            onClick={() => onNavigate('image')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              currentView === 'image' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Image Analysis
          </button>
          <button
            onClick={() => onNavigate('evaluation-lab')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              currentView === 'evaluation-lab' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Evaluation Lab
          </button>
          <button
            onClick={() => onNavigate('privacy')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              currentView === 'privacy' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Privacy Center
          </button>
        </nav>

        {/* Zone 3: Authentication & primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-700/80 hover:border-cyan-500/80 rounded-md text-xs text-slate-200 transition-colors"
                title="View Researcher Profile & Permissions"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700/70 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.fullName.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-[11px] leading-tight truncate max-w-[110px]">{currentUser.fullName}</div>
                  <div className="text-[9px] text-cyan-400 capitalize font-mono leading-tight">{currentUser.role}</div>
                </div>
              </button>
              
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 rounded transition-colors"
                title="Lock Session / Sign Out (لاگ آؤٹ)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-semibold text-slate-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In (لاگ ان)</span>
              </button>
              <button
                onClick={() => onOpenAuth?.('register')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded text-xs font-semibold text-cyan-300 transition-colors"
              >
                <span>Register (رجسٹریشن)</span>
              </button>
            </div>
          )}

          <button
            onClick={() => onNavigate('camera')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Feed</span>
          </button>
        </div>
      </div>
    </header>
  );
};
