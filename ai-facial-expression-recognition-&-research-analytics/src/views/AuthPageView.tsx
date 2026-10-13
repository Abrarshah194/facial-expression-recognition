/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Authentication Page (Smart Shop Style):
 * Features:
 *  - Full dedicated login & registration screen like modern e-commerce / smart shop portals
 *  - Tabbed switch between "Sign In (لاگ ان)" and "Create Account (نیا اکاؤنٹ بنائیں)"
 *  - Quick 1-Click Demo Accounts (Admin, Researcher, Analyst)
 *  - Floating features overview (Student Analytics, Facial Emotion AI, Age & Gender Estimation)
 *  - Local-first zero telemetry security compliance
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
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Cpu,
  Smile,
  Users2,
  Check
} from 'lucide-react';
import { storageService, DEFAULT_USERS } from '../services/storageService';
import { UserAccount, UserRole } from '../types/fer';

interface AuthPageViewProps {
  onAuthSuccess: (user: UserAccount) => void;
  onNavigateHome?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthPageView: React.FC<AuthPageViewProps> = ({
  onAuthSuccess,
  onNavigateHome,
  initialMode = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('abrarshah2134896@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('researcher');
  const [regDepartment, setRegDepartment] = useState('Computer Vision & AI Division');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storageService.login(loginIdentifier, loginPassword);
      setIsSubmitting(false);
      if (res.success && res.user) {
        setSuccessMsg(`خوش آمدید! Welcome, ${res.user.fullName}! Logged in as ${res.user.role}.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 600);
      } else {
        setErrorMsg(res.error || 'لاگ ان ناکام۔ صارف نام یا پاس ورڈ کی تصدیق کریں۔');
      }
    }, 250);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('پاس ورڈز آپس میں میل نہیں کھاتے (Passwords do not match).');
      return;
    }

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
        setSuccessMsg(`اکاؤنٹ بن گیا! Welcome, ${res.user.fullName}! Logging in...`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 800);
      } else {
        setErrorMsg(res.error || 'رجسٹریشن مکمل نہ ہو سکی۔ دوبارہ کوشش کریں۔');
      }
    }, 300);
  };

  const handleQuickDemoSelect = (user: UserAccount) => {
    setLoginIdentifier(user.email);
    setLoginPassword('password123');
    setErrorMsg(null);
    setSuccessMsg(`منتخب شدہ ڈیمو اکاؤنٹ: ${user.fullName} (${user.role})`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] w-full py-8 px-4 flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-slate-950">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Smart Shop & AI Platform Showcase */}
        <div className="lg:col-span-5 space-y-6 text-slate-200 order-2 lg:order-1">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-full text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Portal · ResNet-FER+ v2.4.1</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Affective Vision Lab & Smart Analytics
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              ریسرچ گریڈ فیشل اینالیٹکس، عمر اور جنس کی جدید سائنسی جانچ، اور ریئل ٹائم طلبہ رویہ اینالیٹکس پورٹل۔
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 transition-colors hover:border-slate-700">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  عمر اور جنس کی درست تفریق (Gender & Age AI)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  داڑھی، مونچھیں، کلین شیو مردانہ فیچرز، اور خواتین کے نفیس خد و خال کی فوری درست شناخت۔
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 transition-colors hover:border-slate-700">
              <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  فیشل ایکسپریشن تجزیہ (FER+ Analytics)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  FACS Action Units (AUs)، خوشی، غم، غصہ اور حیرت کے درست امکانی گراف۔
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3 transition-colors hover:border-slate-700">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  محفوظ اور نجی (Zero Raw-Media Retention)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% لوکل براؤزر پروسیسنگ اور مکمل رول بیسڈ پرمشنز (RBAC) تحفظ۔
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80">
            <span>© 2026 Affective Vision Research Lab</span>
            <span>Version 2.4.1</span>
          </div>
        </div>

        {/* Right Side: Tabbed Smart Authentication Box */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur space-y-6">
            
            {/* Tab Header: Login vs Register */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 shadow-md shadow-cyan-900/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>لاگ ان (Sign In)</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 shadow-md shadow-emerald-900/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>نیا اکاؤنٹ (Register)</span>
              </button>
            </div>

            {/* Error or Success notification banners */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ای میل یا صارف نام (Email or Username)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">لازمی</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. abrarshah2134896@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>پاس ورڈ (Password)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Demo: password123</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-900/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>تصدیق ہو رہی ہے...</span>
                  ) : (
                    <>
                      <span>سسٹم میں داخل ہوں (Sign In to Laboratory)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 1-Click Quick Demo Login Tiers */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">ایک کلک پر فوری ڈیمو اکاؤنٹس (One-Click Demo):</span>
                    <span>منتخب کریں</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {DEFAULT_USERS.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickDemoSelect(u)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          loginIdentifier.toLowerCase() === u.email.toLowerCase()
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate leading-tight">{u.fullName}</div>
                        <div className="text-[10px] text-cyan-400 capitalize font-mono">{u.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مکمل نام (Full Name)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="e.g. Dr. Abrar Shah"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>صارف نام (Username)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      placeholder="e.g. ashah.lead"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ای میل پتہ (Institutional Email)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>پاس ورڈ (Password)</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="کم از کم 6 حروف"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>پاس ورڈ کی تصدیق (Confirm)</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="دوبارہ درج کریں"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>شعبہ (Department)</span>
                    </label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={e => setRegDepartment(e.target.value)}
                      placeholder="Computer Vision Lab"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>کردار (User Role)</span>
                    </label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="researcher">Researcher (محقق - Full Analysis Access)</option>
                      <option value="analyst">Analyst (تجزیہ کار - Reports & Reviews)</option>
                      <option value="administrator">Administrator (منتظم - Full Control)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>اکاؤنٹ بنایا جا رہا ہے...</span>
                  ) : (
                    <>
                      <span>نیا اکاؤنٹ بنائیں (Complete Registration)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Privacy footnote */}
            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                <span>تمام معلومات لوکل براؤزر سٹوریج میں محفوظ ہیں، کوئی بیرونی ڈیٹا ٹریکنگ نہیں کی جاتی۔</span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
