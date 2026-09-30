import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/providers/Providers';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'CineMatch AI — Intelligent Movie Matcher & Recommender',
  description:
    'Discover films you will genuinely love with state-of-the-art hybrid AI matching, vector semantic search, explainable recommendations, and conversational movie intelligence.',
  keywords: [
    'AI Movie Matcher',
    'Movie Recommendations',
    'Semantic Movie Search',
    'Film Recommender System',
    'TMDB',
    'Personalized Movies',
  ],
  authors: [{ name: 'Rishank Kesarwani' }],
  openGraph: {
    title: 'CineMatch AI — Intelligent Movie Matcher & Recommender',
    description:
      'Discover films with hybrid AI recommendation scoring and conversational film assistant.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
