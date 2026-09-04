'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/stores/theme-store';
import { supabase, type BlogSettings } from '@/lib/supabase';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<BlogSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').limit(1).single();
      if (data) setSettings(data);
    } catch {
      // Use defaults
    }
  };

  const title = settings?.blog_title || process.env.NEXT_PUBLIC_BLOG_TITLE || 'My Blog';
  const description = settings?.blog_description || process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || '';
  const footerText = settings?.footer_text || '© 2024 My Blog. All rights reserved.';
  const primaryColor = settings?.primary_color || '#3b82f6';

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Custom Header HTML */}
        {settings?.header_html && (
          <div dangerouslySetInnerHTML={{ __html: settings.header_html }} />
        )}

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt={title} className="h-8" />
                ) : settings?.profile_image ? (
                  <img src={settings.profile_image} alt={title} className="h-8 w-8 rounded-full object-cover" />
                ) : null}
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {title}
                </span>
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
                {settings?.about_text && (
                  <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">
                    소개
                  </Link>
                )}
                <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  관리
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
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Social Links */}
              <div className="flex space-x-4">
                {settings?.social_github && (
                  <a href={settings.social_github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    GitHub
                  </a>
                )}
                {settings?.social_twitter && (
                  <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Twitter
                  </a>
                )}
                {settings?.social_youtube && (
                  <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    YouTube
                  </a>
                )}
                {settings?.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Instagram
                  </a>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {footerText}
              </p>
            </div>
          </div>
        </footer>

        {/* Custom Footer HTML */}
        {settings?.footer_html && (
          <div dangerouslySetInnerHTML={{ __html: settings.footer_html }} />
        )}

        {/* Custom CSS */}
        {settings?.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />
        )}
      </div>
    </div>
  );
}
