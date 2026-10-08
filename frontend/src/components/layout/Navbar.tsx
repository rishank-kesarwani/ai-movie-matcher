'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Sparkles,
  Compass,
  Search,
  Bookmark,
  CheckCircle2,
  Heart,
  Bot,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Discover', icon: Compass },
    { href: '/movies', label: 'Movies', icon: Film },
    { href: '/search', label: 'Search', icon: Search },
    {
      href: '/recommendations',
      label: 'AI Matcher',
      icon: Sparkles,
      highlight: true,
    },
    { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  ];

  const protectedLinks = [
    { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
    { href: '/watched', label: 'Watched', icon: CheckCircle2 },
    { href: '/favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                CineMatch AI
              </span>
              <span className="text-[9px] sm:text-[10px] text-cyan-400 font-semibold tracking-wider uppercase -mt-0.5 whitespace-nowrap">
                AI Movie Matcher
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2 shrink min-w-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 xl:px-3 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 ${
                    isActive
                      ? link.highlight
                        ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-800 text-white'
                      : link.highlight
                      ? 'text-cyan-400 hover:bg-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${link.highlight ? 'text-cyan-400 animate-pulse' : ''}`} />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1 shrink-0 hidden lg:block" />
                {protectedLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 xl:px-3 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="whitespace-nowrap">{link.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Auth & Profile Actions */}
          <div className="hidden md:flex items-center space-x-2 xl:space-x-3 shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 py-1 px-2 sm:px-2.5 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 transition-colors shrink-0"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[85px] lg:max-w-[110px] xl:max-w-[140px] truncate whitespace-nowrap">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 py-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 z-50 text-xs divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5">
                      <p className="font-semibold text-slate-100 truncate">{user?.name || 'My Account'}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                    </div>

                    {/* Quick Library Links */}
                    <div className="py-1.5">
                      <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        My Cinema Library
                      </div>
                      <Link
                        href="/watchlist"
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        <span>Watchlist</span>
                      </Link>
                      <Link
                        href="/watched"
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Watched Movies</span>
                      </Link>
                      <Link
                        href="/favorites"
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-slate-400" />
                        <span>Favorites</span>
                      </Link>
                    </div>

                    {/* Preferences & Settings */}
                    <div className="py-1.5">
                      <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        AI & Account
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Taste Profile & Memory</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Notification Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1.5 pb-0.5">
                      <button
                        onClick={() => logout()}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-rose-400 hover:bg-rose-500/10 text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-500/20 transition-all duration-200 whitespace-nowrap shrink-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAuthenticated ? (
            <>
              <div className="border-t border-slate-800 my-2 pt-2">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  My Cinema Library
                </div>
                {protectedLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-slate-800 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-1">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Account & Settings
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Taste Profile & Memory</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                  <span>Notification Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800 rounded-xl"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
