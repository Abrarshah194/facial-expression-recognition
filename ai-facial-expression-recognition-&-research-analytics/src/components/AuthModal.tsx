/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Secure Authentication & Registration Modal.
 * Implements:
 *  - Login (لاگ ان) with Username or Institutional Email + Password
 *  - Registration (رجسٹریشن) with Full Name, Department, and Role Assignment
 *  - 1-Click Quick Demo Sign-In for Admin, Researcher, and Analyst tiers
 *  - Urdu and English bilingual interface and accessibility markers
 *  - Local-first zero-telemetry security compliance
 */

import React, { useState } from 'react';
import {
  Lock,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { storageService, DEFAULT_USERS } from '../services/storageService';
import { UserAccount, UserRole } from '../types/fer';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  canClose = true
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('abrarshah2134896@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('researcher');
  const [regDepartment, setRegDepartment] = useState('Computer Vision & AI Division');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storageService.login(loginIdentifier, loginPassword);
      setIsSubmitting(false);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome, ${res.user.fullName}! Authenticated as ${res.user.role}.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          if (onClose) onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storageService.register({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment
      });
      setIsSubmitting(false);
      if (res.success && res.user) {
        setSuccessMsg(`Account registered successfully! Welcome, ${res.user.fullName}.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          if (onClose) onClose();
        }, 700);
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your inputs.');
      }
    }, 250);
  };

  const handleQuickDemoSelect = (user: UserAccount) => {
    setLoginIdentifier(user.email);
    setLoginPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header with Urdu Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Affective Vision Lab Authentication
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Institutional access to Affective Computing & Temporal Analytics Engine
            </p>
            {/* Urdu subtitle badge */}
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-cyan-300/90" dir="rtl">
              <span>محفوظ لاگ ان اور رجسٹریشن برائے تصدیق شدہ صارفین</span>
            </div>
          </div>

          {canClose && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'login'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In (لاگ ان)</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'register'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register (رجسٹریشن)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Username or Institutional Email:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">لاگ ان ای میل یا یوزرنیم</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. abrarshah2134896@gmail.com or research.lead"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    Password:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">پاس ورڈ درج کریں</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter workstation password"
                    className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Quick Demo Sign-In Switcher */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Quick Demo Accounts (تیز رفتار ٹیسٹنگ کے لیے):
                  </span>
                  <span className="text-[10px] text-slate-500">پاس ورڈ: password123</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_USERS.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoSelect(u)}
                      className={`p-2 rounded border text-left transition-all ${
                        loginIdentifier === u.email || loginIdentifier === u.username
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                          : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="font-semibold truncate text-[11px]">{u.fullName}</div>
                      <div className="text-[10px] text-cyan-400/90 capitalize font-mono truncate">{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-cyan-950/50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Laboratory (محفوظ لاگ ان)'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Full Name (پورا نام):
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="e.g. Dr. Abrar Shah"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Username (یوزرنیم):
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. abrar.shah"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Institutional Email (سرکاری / لیب ای میل):
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="e.g. abrar.shah@university.edu"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    Password (کم از کم 6 ہندسے):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-1.5 pr-8 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Assigned Role (اختیارات کا لیول):
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 capitalize focus:outline-none focus:border-cyan-400"
                  >
                    <option value="administrator">Administrator (مکمل اختیارات)</option>
                    <option value="researcher">Researcher (ماڈل ٹیسٹنگ اور ریسرچ)</option>
                    <option value="analyst">Analyst (رپورٹس اور ریویو)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Department / Laboratory Affiliation (شعبہ / لیبارٹری):
                </label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value)}
                  placeholder="e.g. Computer Vision & Affective Analytics Laboratory"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-emerald-950/50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Create Secure Account (نیا اکاؤنٹ بنائیں)'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Security & Compliance Footer */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local-First Cryptographic Storage</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              IEEE / ACM Research Standard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
