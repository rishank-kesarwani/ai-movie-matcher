import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a12',
        foreground: '#f8fafc',
        surface: {
          50: '#1e293b',
          100: '#161e2e',
          200: '#0f172a',
          300: '#0b1120',
          card: 'rgba(15, 23, 42, 0.75)',
          hover: 'rgba(30, 41, 59, 0.85)',
        },
        brand: {
          primary: '#06b6d4', // Cyan
          secondary: '#8b5cf6', // Purple/Violet
          accent: '#f59e0b', // Amber/Gold
          danger: '#ef4444',
          success: '#10b981',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.15), transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
