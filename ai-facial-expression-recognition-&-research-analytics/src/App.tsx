/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Main Application Orchestrator.
 * Facial Expression Recognition and Research Analytics Platform.
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { LiveCameraView } from './views/LiveCameraView';
import { VideoAnalysisView } from './views/VideoAnalysisView';
import { ImageAnalysisView } from './views/ImageAnalysisView';
import { ExpressionTimelineView } from './views/ExpressionTimelineView';
import { AnalysisQualityView } from './views/AnalysisQualityView';
import { ModelEvaluationLabView } from './views/ModelEvaluationLabView';
import { ModelRegistryView } from './views/ModelRegistryView';
import { VideoComparisonView } from './views/VideoComparisonView';
import { ResourceMonitorView } from './views/ResourceMonitorView';
import { JobQueueView } from './views/JobQueueView';
import { PrivacyCenterView } from './views/PrivacyCenterView';
import { ModelCardView } from './views/ModelCardView';
import { AutomatedTestingView } from './views/AutomatedTestingView';
import { AnalysisHistoryView } from './views/AnalysisHistoryView';
import { ReportsView } from './views/ReportsView';
import { AdminView } from './views/AdminView';
import { AuditLogsView } from './views/AuditLogsView';
import { SystemHealthView } from './views/SystemHealthView';
import { ProfileView } from './views/ProfileView';
import { HelpView } from './views/HelpView';
import { AuthPageView } from './views/AuthPageView';
import { AuthModal } from './components/AuthModal';
import { storageService } from './services/storageService';
import { AnalysisSession, UserAccount, UserRole, ModelInfo } from './types/fer';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<AnalysisSession[]>(storageService.getSessions());
  const [currentUser, setCurrentUser] = useState<UserAccount>(storageService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(storageService.isAuthenticated());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [models, setModels] = useState<ModelInfo[]>(storageService.getModels());
  const [activeJobCount, setActiveJobCount] = useState<number>(0);

  const activeModel = models.find(m => m.active) || models[0];

  const refreshSessions = () => {
    setSessions(storageService.getSessions());
  };

  const handleNavigate = (view: string, sessionId?: string) => {
    setCurrentView(view);
    if (sessionId) {
      setSelectedSessionId(sessionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSessionCreated = (session: AnalysisSession) => {
    refreshSessions();
    setSelectedSessionId(session.id);
  };

  const handleRoleChanged = (role: UserRole) => {
    setCurrentUser(storageService.getCurrentUser());
  };

  const handleModelChanged = (model: ModelInfo) => {
    setModels(storageService.getModels());
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setCurrentView('auth-page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    storageService.logout();
    setIsAuthenticated(false);
    setCurrentView('auth-page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const updateJobCount = () => {
      const active = storageService.getJobs().filter(j => j.status === 'processing' || j.status === 'queued').length;
      setActiveJobCount(active);
    };
    updateJobCount();
    const interval = setInterval(updateJobCount, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Strict Top Bar Contract Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Lock state warning banner if logged out */}
      {!isAuthenticated && (
        <div className="bg-amber-950/70 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>
              <strong>تحقیقی لیب لاک ہے (Session Locked):</strong> براہ کرم محفوظ کام کے لیے لاگ ان کریں یا نیا اکاؤنٹ بنائیں۔
            </span>
          </div>
          <button
            onClick={() => handleOpenAuth('login')}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] transition-colors"
          >
            لاگ ان کریں (Sign In)
          </button>
        </div>
      )}

      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          activeJobCount={activeJobCount}
          isAuthenticated={isAuthenticated}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />

        {/* Primary Viewport Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              sessions={sessions}
              onNavigate={handleNavigate}
              activeModelName={activeModel.name}
            />
          )}

          {currentView === 'camera' && (
            <LiveCameraView
              onSessionRecorded={handleSessionCreated}
              activeModelName={activeModel.name}
            />
          )}

          {currentView === 'video' && (
            <VideoAnalysisView
              onSessionCreated={handleSessionCreated}
              activeModelName={activeModel.name}
            />
          )}

          {currentView === 'image' && (
            <ImageAnalysisView
              onSessionCreated={handleSessionCreated}
              activeModelName={activeModel.name}
            />
          )}

          {currentView === 'timeline' && (
            <ExpressionTimelineView
              sessions={sessions}
              initialSessionId={selectedSessionId}
            />
          )}

          {currentView === 'quality' && (
            <AnalysisQualityView />
          )}

          {currentView === 'evaluation-lab' && (
            <ModelEvaluationLabView />
          )}

          {currentView === 'models' && (
            <ModelRegistryView
              onModelChanged={handleModelChanged}
            />
          )}

          {currentView === 'comparison' && (
            <VideoComparisonView
              sessions={sessions}
            />
          )}

          {currentView === 'resources' && (
            <ResourceMonitorView />
          )}

          {currentView === 'queue' && (
            <JobQueueView />
          )}

          {currentView === 'testing' && (
            <AutomatedTestingView />
          )}

          {currentView === 'history' && (
            <AnalysisHistoryView
              sessions={sessions}
              onSelectSession={id => handleNavigate('timeline', id)}
              onRefreshSessions={refreshSessions}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              sessions={sessions}
            />
          )}

          {currentView === 'privacy' && (
            <PrivacyCenterView />
          )}

          {currentView === 'model-card' && (
            <ModelCardView />
          )}

          {currentView === 'audit-logs' && (
            <AuditLogsView />
          )}

          {currentView === 'system-health' && (
            <SystemHealthView />
          )}

          {currentView === 'admin' && (
            <AdminView
              currentUser={currentUser}
              onRoleChanged={handleRoleChanged}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onUpdateRole={handleRoleChanged}
            />
          )}

          {currentView === 'help' && (
            <HelpView />
          )}

          {currentView === 'auth-page' && (
            <AuthPageView
              initialMode={authModalMode}
              onAuthSuccess={user => {
                handleAuthSuccess(user);
                setCurrentView('dashboard');
              }}
              onNavigateHome={() => setCurrentView('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Secure Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        canClose={isAuthenticated}
      />
    </div>
  );
}
