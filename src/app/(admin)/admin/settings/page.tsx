'use client';

import { useState, useEffect } from 'react';
import { useRequireAdmin } from '@/hooks/useAuth';
import { supabase, type BlogSettings } from '@/lib/supabase';

const defaultSettings: Partial<BlogSettings> = {
  blog_title: 'My Blog',
  blog_description: '개인 블로그',
  primary_color: '#3b82f6',
  secondary_color: '#10b981',
  footer_text: '© 2024 My Blog. All rights reserved.',
  posts_per_page: 10,
  enable_comments: true,
  enable_dark_mode: true,
  header_html: '',
  footer_html: '',
  social_github: '',
  social_twitter: '',
  social_youtube: '',
  social_instagram: '',
  about_text: '',
  hero_text: '',
  custom_css: '',
};

export default function SettingsPage() {
  const { user, isLoading } = useRequireAdmin();
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'design' | 'social' | 'advanced'>('basic');

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').limit(1).single();
      if (data) {
        setSettings(data);
      } else {
        setSettings({ id: '', ...defaultSettings } as BlogSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings({ id: '', ...defaultSettings } as BlogSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      if (settings.id) {
        await supabase.from('settings').update(settings).eq('id', settings.id);
      } else {
        const { id, ...rest } = settings;
        const { data } = await supabase.from('settings').insert(rest).select().single();
        if (data) setSettings({ ...settings, id: data.id });
      }
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!settings) return null;

  const tabs = [
    { id: 'basic' as const, label: '기본 정보' },
    { id: 'design' as const, label: '디자인' },
    { id: 'social' as const, label: '소셜 미디어' },
    { id: 'advanced' as const, label: '고급 설정' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        블로그 설정
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              블로그 기본 정보
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                블로그 제목
              </label>
              <input
                type="text"
                value={settings.blog_title}
                onChange={(e) => setSettings({ ...settings, blog_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                블로그 설명
              </label>
              <textarea
                value={settings.blog_description}
                onChange={(e) => setSettings({ ...settings, blog_description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                히어로 문구 (홈 상단)
              </label>
              <input
                type="text"
                value={settings.hero_text || ''}
                onChange={(e) => setSettings({ ...settings, hero_text: e.target.value })}
                placeholder="Welcome to my blog!"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                프로필 이미지 URL
              </label>
              <input
                type="url"
                value={settings.profile_image || ''}
                onChange={(e) => setSettings({ ...settings, profile_image: e.target.value })}
                placeholder="https://example.com/profile.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {settings.profile_image && (
                <img src={settings.profile_image} alt="프로필 미리보기" className="mt-2 w-16 h-16 rounded-full object-cover" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                로고 URL
              </label>
              <input
                type="url"
                value={settings.logo_url || ''}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                푸터 텍스트
              </label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                소개글 (자기소개)
              </label>
              <textarea
                value={settings.about_text || ''}
                onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                rows={4}
                placeholder="자신을 소개하는 글을 작성하세요..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                페이지당 글 수
              </label>
              <input
                type="number"
                value={settings.posts_per_page}
                onChange={(e) => setSettings({ ...settings, posts_per_page: parseInt(e.target.value) || 10 })}
                min={1}
                max={50}
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              디자인 설정
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  기본 색상 (메인)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  보조 색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">미리보기</p>
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: settings.primary_color }} />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: settings.secondary_color }} />
              </div>
            </div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.enable_dark_mode}
                onChange={(e) => setSettings({ ...settings, enable_dark_mode: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">다크 모드 지원</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                커스텀 CSS
              </label>
              <textarea
                value={settings.custom_css || ''}
                onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                rows={6}
                placeholder="/* 여기에 CSS를 작성하세요 */&#10;body { font-family: 'Custom Font', sans-serif; }"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              소셜 미디어 링크
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              각 플레이스의 프로필 URL을 입력하세요. 비워두면 해당 아이콘이 표시되지 않습니다.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub
              </label>
              <input
                type="url"
                value={settings.social_github || ''}
                onChange={(e) => setSettings({ ...settings, social_github: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter / X
              </label>
              <input
                type="url"
                value={settings.social_twitter || ''}
                onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube
              </label>
              <input
                type="url"
                value={settings.social_youtube || ''}
                onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                placeholder="https://youtube.com/@username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={settings.social_instagram || ''}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                placeholder="https://instagram.com/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.enable_comments}
                onChange={(e) => setSettings({ ...settings, enable_comments: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">댓글 기능 활성화</span>
            </label>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              고급 설정
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                헤더 커스텀 HTML
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                &lt;head&gt; 태그에 삽입될 HTML (Google Analytics, 메타 태그 등)
              </p>
              <textarea
                value={settings.header_html || ''}
                onChange={(e) => setSettings({ ...settings, header_html: e.target.value })}
                rows={4}
                placeholder={'<meta name="theme-color" content="#3b82f6" />'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                푸터 커스텀 HTML
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                &lt;body&gt; 끝에 삽입될 HTML (카운터, 채팅 위젯 등)
              </p>
              <textarea
                value={settings.footer_html || ''}
                onChange={(e) => setSettings({ ...settings, footer_html: e.target.value })}
                rows={4}
                placeholder={'<!-- 카운터 코드 등 -->'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                주의: 커스텀 HTML에는 신뢰할 수 있는 코드만 사용하세요. 악성 코드가 삽입될 경우 블로그가 손상될 수 있습니다.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
