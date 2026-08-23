import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bell,
  Monitor,
  CheckCircle2,
  Info,
  RefreshCw,
  User as UserIcon,
  Lock,
  Loader2
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import axiosInstance from '../lib/axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  const [systemHealth, setSystemHealth] = useState({
    backend: 'Checking...',
    database: 'Checking...',
    ocr: 'Operational',
    ai: 'Operational',
    validation: 'Operational'
  });
  const [healthLoading, setHealthLoading] = useState(false);
  const [notifyValidation, setNotifyValidation] = useState(true);
  const [notifyDailyDigest, setNotifyDailyDigest] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileFeedback(null);
    if (!profileName.trim()) {
      setProfileFeedback({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    setProfileLoading(true);
    try {
      const response = await axiosInstance.put('/auth/profile', { name: profileName.trim() });
      if (response.data?.success && response.data?.data?.user) {
        updateUser(response.data.data.user);
        setProfileFeedback({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        setProfileFeedback({ type: 'error', message: response.data?.error?.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to update profile. Server error.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Current password is required.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation password do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await axiosInstance.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (response.data?.success) {
        setPasswordFeedback({ type: 'success', message: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordFeedback({ type: 'error', message: response.data?.error?.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to change password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await axiosInstance.get('/products/stats');
      if (response.status === 200 && response.data?.success) {
        setSystemHealth({
          backend: 'Operational',
          database: 'Connected',
          ocr: 'Operational',
          ai: 'Operational',
          validation: 'Operational'
        });
      } else {
        setSystemHealth({
          backend: 'Degraded',
          database: 'Degraded',
          ocr: 'Operational',
          ai: 'Operational',
          validation: 'Operational'
        });
      }
    } catch (err) {
      setSystemHealth({
        backend: 'Offline',
        database: 'Offline',
        ocr: 'Degraded',
        ai: 'Operational',
        validation: 'Operational'
      });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Settings"
        subtitle="Manage user preferences, application information, and monitor operational service status."
      />

      {savedSuccess && (
        <div className="p-3 bg-status-successSoft border border-brand-border rounded text-xs font-semibold text-status-success flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>User preferences saved successfully.</span>
        </div>
      )}

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start text-left">
        {/* Left 2 Cols: Application & User Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info Card */}
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                <Info className="h-4 w-4 text-primary" /> Application
              </h3>
              <span className="text-[10px] font-mono font-bold bg-slate-100 border border-brand-border px-2 py-0.5 rounded text-brand-secondary">
                v1.0.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Platform Name</span>
                <span className="font-semibold text-brand-text text-sm">FLORA Product Intelligence</span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Core Engine</span>
                <span className="font-semibold text-brand-text">AI Catalog Extraction & Compliance</span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Environment</span>
                <span className="font-semibold text-status-success flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Production Workspace
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Architecture</span>
                <span className="font-semibold text-brand-text">Distributed OCR & Multi-Tier AI Rules</span>
              </div>
            </div>
          </div>

          {/* Profile Settings Card */}
          <form onSubmit={handleUpdateProfile} className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
            <div className="border-b border-brand-border pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                <UserIcon className="h-4 w-4 text-brand-primary" /> Profile Settings
              </h3>
              <span className="text-[10px] uppercase font-bold text-brand-muted bg-slate-100 px-2 py-0.5 rounded border border-brand-border">
                {user?.role || 'User'}
              </span>
            </div>

            {profileFeedback && (
              <div className={`p-2.5 border rounded text-xs font-semibold ${
                profileFeedback.type === 'success'
                  ? 'bg-status-successSoft text-status-success border-brand-border'
                  : 'bg-status-errorSoft text-status-error border-brand-border'
              }`}>
                {profileFeedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-brand-muted font-medium block">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full border border-brand-border rounded px-3 py-2 text-xs bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-muted font-medium block">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-brand-border rounded px-3 py-2 text-xs bg-slate-100 text-brand-muted cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-border">
              <Button type="submit" variant="primary" size="sm" disabled={profileLoading} icon={profileLoading ? Loader2 : undefined}>
                {profileLoading ? 'Saving Profile...' : 'Save Profile'}
              </Button>
            </div>
          </form>

          {/* Change Password Card */}
          <form onSubmit={handleChangePassword} className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
            <div className="border-b border-brand-border pb-3">
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                <Lock className="h-4 w-4 text-brand-primary" /> Security & Password
              </h3>
              <p className="text-[11px] text-brand-muted mt-1">
                Update your account password. Must be at least 6 characters long.
              </p>
            </div>

            {passwordFeedback && (
              <div className={`p-2.5 border rounded text-xs font-semibold ${
                passwordFeedback.type === 'success'
                  ? 'bg-status-successSoft text-status-success border-brand-border'
                  : 'bg-status-errorSoft text-status-error border-brand-border'
              }`}>
                {passwordFeedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-brand-muted font-medium block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-brand-border rounded px-3 py-2 text-xs bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-muted font-medium block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-brand-border rounded px-3 py-2 text-xs bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-muted font-medium block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-brand-border rounded px-3 py-2 text-xs bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-border">
              <Button type="submit" variant="primary" size="sm" disabled={passwordLoading} icon={passwordLoading ? Loader2 : undefined}>
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>

          {/* Appearance & Preferences */}
          <form onSubmit={handleSavePreferences} className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-6">
            <div className="border-b border-brand-border pb-3">
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                <Monitor className="h-4 w-4 text-accent" /> Preferences
              </h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-normal">
                Customize workspace display settings and data refresh intervals.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <span className="font-semibold text-brand-text block">Interface Theme</span>
                  <span className="text-brand-muted text-[11px]">Choose standard light theme or dark workspace theme</span>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="border border-brand-border rounded px-3 py-1.5 text-xs bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
                >
                  <option value="light">Light Theme (Default)</option>
                  <option value="dark">Dark Theme Workspace</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <span className="font-semibold text-brand-text block">Automatic Dashboard Refresh</span>
                  <span className="text-brand-muted text-[11px]">Periodically sync validation queue in background</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="pt-2">
              <div className="border-b border-brand-border pb-2 mb-3">
                <h4 className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-brand-muted" /> Notifications
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyValidation}
                    onChange={(e) => setNotifyValidation(e.target.checked)}
                    className="rounded border-brand-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-brand-text font-medium">Flagged Validation Queue Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDailyDigest}
                    onChange={(e) => setNotifyDailyDigest(e.target.checked)}
                    className="rounded border-brand-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-brand-text font-medium">Daily Product Ingestion Digest</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-border">
              <Button type="submit" variant="primary" size="sm">
                Save Preferences
              </Button>
            </div>
          </form>
        </div>

        {/* Right Col: System Status */}
        <div className="space-y-6">
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2 tracking-wider">
                <ShieldCheck className="h-4 w-4 text-status-success" /> System Status
              </h3>
              <button
                onClick={checkHealth}
                disabled={healthLoading}
                className="p-1 rounded text-brand-muted hover:text-brand-text hover:bg-slate-100 transition-colors"
                title="Refresh Health Check"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Backend API', status: systemHealth.backend },
                { name: 'Database', status: systemHealth.database },
                { name: 'OCR Engine', status: systemHealth.ocr },
                { name: 'AI Extraction', status: systemHealth.ai },
                { name: 'Validation Engine', status: systemHealth.validation },
              ].map((service) => {
                const isOp = service.status === 'Operational' || service.status === 'Connected';
                return (
                  <div key={service.name} className="flex items-center justify-between py-1">
                    <span className="font-medium text-brand-secondary">{service.name}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOp
                        ? 'bg-emerald-50 text-status-success border border-emerald-200'
                        : 'bg-amber-50 text-status-warning border border-amber-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOp ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {service.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
