'use client';

import { useState, useEffect } from 'react';
import { supabase, type BlogSettings } from '@/lib/supabase';
import Link from 'next/link';

export default function AboutPage() {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').limit(1).single();
      if (data) setSettings(data);
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  const title = settings?.blog_title || 'My Blog';
  const aboutText = settings?.about_text;
  const profileImage = settings?.profile_image;
  const primaryColor = settings?.primary_color || '#3b82f6';

  return (
    <div>
      <section className="text-center py-12 mb-8">
        {profileImage && (
          <img
            src={profileImage}
            alt={title}
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
          />
        )}
        <h1 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>
          소개
        </h1>
      </section>

      {aboutText ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="prose dark:prose-invert max-w-none">
            {aboutText.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="mb-4">아직 소개글이 없습니다.</p>
          <p>
            관리자 페이지의{' '}
            <Link href="/admin/settings" className="text-blue-600 dark:text-blue-400 hover:underline">
              설정
            </Link>
            에서 소개글을 작성할 수 있습니다.
          </p>
        </div>
      )}

      {/* Social Links */}
      {(settings?.social_github || settings?.social_twitter || settings?.social_youtube || settings?.social_instagram) && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">소셜 미디어</h2>
          <div className="flex space-x-4">
            {settings?.social_github && (
              <a href={settings.social_github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                GitHub
              </a>
            )}
            {settings?.social_twitter && (
              <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Twitter
              </a>
            )}
            {settings?.social_youtube && (
              <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                YouTube
              </a>
            )}
            {settings?.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Instagram
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
