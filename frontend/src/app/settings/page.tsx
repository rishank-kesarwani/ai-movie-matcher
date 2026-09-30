'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Bell, Cpu, Save, Check, Lock, ShieldCheck, Mail, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [movieReleases, setMovieReleases] = useState(true);
  const [recommendationAlerts, setRecommendationAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch Notification Preferences
  const { data: prefData, isLoading: isPrefsLoading } = useQuery<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    movieReleases: boolean;
    recommendationAlerts: boolean;
  }>({
    queryKey: ['notifications', 'preferences', user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get('/users/notifications/preferences');
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  // Fetch AI Cost & Usage Observability Summary
  const { data: aiUsageData } = useQuery<{
    totalRequests: number;
    totalTokens: number;
    totalEstimatedCostUsd: number;
    averageLatencyMs: number;
  }>({
    queryKey: ['ai', 'usage', user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get('/ai/usage');
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (prefData) {
      setEmailNotifications(prefData.emailNotifications ?? true);
      setPushNotifications(prefData.pushNotifications ?? true);
      setWeeklyDigest(prefData.weeklyDigest ?? true);
      setMovieReleases(prefData.movieReleases ?? true);
      setRecommendationAlerts(prefData.recommendationAlerts ?? true);
    }
  }, [prefData]);

  // Update Preferences Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put('/users/notifications/preferences', {
        emailNotifications,
        pushNotifications,
        weeklyDigest,
        movieReleases,
        recommendationAlerts,
      });
    },
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // Test Notification Trigger
  const testNotifMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/test');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Settings Require Login</h2>
        <p className="text-xs text-slate-400">
          Sign in to configure notification channels and view AI platform usage.
        </p>
        <button
          onClick={() => requireAuth(() => {}, 'Log in to manage settings.')}
          className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
        >
          Log In
        </button>
      </div>
    );
  }

  if (isPrefsLoading) {
    return <LoadingSpinner message="Loading your preferences..." />;
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">
          <Bell className="w-4 h-4" />
          <span>System Settings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Notifications & AI Observability
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage dual-channel notifications and monitor real-time AI token usage.
        </p>
      </div>

      {/* AI Platform Observability Stats */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-violet-400 uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>AI Platform Observability</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Total AI Requests</span>
            <strong className="text-xl font-bold text-white">
              {aiUsageData?.totalRequests ?? 0}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Tokens Processed</span>
            <strong className="text-xl font-bold text-cyan-400">
              {(aiUsageData?.totalTokens ?? 0).toLocaleString()}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Estimated Cost</span>
            <strong className="text-xl font-bold text-emerald-400">
              ${(aiUsageData?.totalEstimatedCostUsd ?? 0).toFixed(4)}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Avg Latency</span>
            <strong className="text-xl font-bold text-amber-400">
              {aiUsageData?.averageLatencyMs ?? 0}ms
            </strong>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Dual-Channel Delivery Channels</span>
          </div>

          <button
            onClick={() => testNotifMutation.mutate()}
            disabled={testNotifMutation.isPending}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200"
          >
            {testNotifMutation.isPending ? 'Sending...' : 'Send Test Notification'}
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Email Channel</h4>
                <p className="text-[11px] text-slate-400">
                  Receive personalized recommendation digests and password resets via Email
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 rounded accent-cyan-500"
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-violet-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Push Notifications</h4>
                <p className="text-[11px] text-slate-400">
                  Receive real-time alerts when a watchlisted movie is released
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="w-5 h-5 rounded accent-violet-500"
            />
          </div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white">Weekly AI Recommendation Digest</h4>
              <p className="text-[11px] text-slate-400">
                Curated digest of top matching films delivered weekly
              </p>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-5 h-5 rounded accent-cyan-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex items-center justify-between">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Notification settings saved!</span>
            </span>
          )}

          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="ml-auto flex items-center space-x-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
