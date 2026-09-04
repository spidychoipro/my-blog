'use client';

import Link from 'next/link';
import { useTheme } from '@/stores/theme-store';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                {process.env.NEXT_PUBLIC_BLOG_TITLE || 'My Blog'}
              </Link>
              <nav className="flex items-center space-x-6">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                  홈
                </Link>
                <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400">
                  카테고리
                </Link>
                <Link href="/search" className="hover:text-blue-600 dark:hover:text-blue-400">
                  검색
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            {process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || '© 2024 My Blog'}
          </div>
        </footer>
      </div>
    </div>
  );
}
