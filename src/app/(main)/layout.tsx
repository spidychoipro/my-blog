'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/stores/theme-store';
import { supabase, type BlogSettings } from '@/lib/supabase';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/categories', label: '카테고리' },
    { href: '/search', label: '검색' },
    ...(settings?.about_text ? [{ href: '/about', label: '소개' }] : []),
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className="min-h-screen text-gray-900 dark:text-white transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#111827' : settings?.background_color || '#f9fafb',
          color: isDark ? '#f9fafb' : settings?.text_color || '#1f2937',
          fontFamily: settings?.font_family || 'system-ui, sans-serif',
          colorScheme: isDark ? 'dark' : 'light',
        }}
      >
        {/* Custom Header HTML */}
        {settings?.header_html && (
          <div dangerouslySetInnerHTML={{ __html: settings.header_html }} />
        )}

        {/* Scroll to top button */}
        {settings?.enable_scroll_top && <ScrollTopButton />}

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 min-w-0">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt={title} className="h-7 w-7" />
                ) : settings?.profile_image ? (
                  <img src={settings.profile_image} alt={title} className="h-7 w-7 rounded-full object-cover" />
                ) : null}
                <span className="text-xl lg:text-2xl font-bold truncate" style={{ color: primaryColor }}>
                  {title}
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="다크모드 토글"
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </nav>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="다크모드 토글"
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="메뉴"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {menuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <nav className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="max-w-4xl mx-auto px-4 py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="block px-3 py-3 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  관리
                </Link>
              </div>
            </nav>
          )}
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
              <div className="flex flex-wrap justify-center gap-3">
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
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
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

function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full shadow-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="맨 위로"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
