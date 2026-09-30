'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Film, Lock, Mail, User, AlertCircle } from 'lucide-react';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(name, email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
      {/* Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-violet-500 to-cyan-400 blur-[1px]" />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
          <Film className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Create Your Account
        </h1>
        <p className="text-xs text-slate-400">
          Unlock AI movie discovery, smart watchlists, and dual-channel digests.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Cinephile"
              className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
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

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Password (Min 8 Characters)
          </label>
          <div className="relative flex items-center">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 mt-2"
        >
          {loading ? 'Creating Account...' : 'Get Started Free'}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
        Already have an account?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="font-bold text-cyan-400 hover:text-cyan-300 ml-1"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
