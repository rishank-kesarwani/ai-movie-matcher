'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api-client';
import { Mail, Film, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-cyan-400 to-violet-500 blur-[1px]" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your email to receive a secure single-use password reset link.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an account exists with this email address, a password reset link has been sent via Notification Service.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Account Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cinephile@example.com"
                  className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 mt-2"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Remembered your password?{' '}
          <Link href="/login" className="font-bold text-cyan-400 hover:text-cyan-300 ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
