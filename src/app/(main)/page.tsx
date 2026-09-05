'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/stores/theme-store';
import { supabase, type Post, type Category, type BlogSettings } from '@/lib/supabase';

export default function HomePage() {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsData, categoriesData, settingsData] = await Promise.all([
        supabase.from('posts').select('*').eq('status', 'published').order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('settings').select('*').limit(1).single(),
      ]);
      setPosts(postsData.data || []);
      setCategories(categoriesData.data || []);
      if (settingsData.data) setSettings(settingsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  const title = settings?.blog_title || process.env.NEXT_PUBLIC_BLOG_TITLE || 'My Blog';
  const description = settings?.blog_description || process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || 'Welcome to my blog';
  const heroText = settings?.hero_text;
  const primaryColor = settings?.primary_color || '#3b82f6';
  const radius = settings?.border_radius || '0.5rem';
  const cardBg = settings?.card_background || '#ffffff';
  const heroStyle = settings?.hero_style || 'centered';
  const cardStyle = settings?.post_card_style || 'default';

  const heroAlign = heroStyle === 'left' ? 'text-left' : heroStyle === 'banner' ? 'text-center' : 'text-center';

  return (
    <div>
      {/* Hero Section */}
      <section
        className={`py-12 mb-8 overflow-hidden relative ${heroAlign}`}
        style={
          heroStyle === 'banner'
            ? {
                backgroundImage: settings?.hero_image ? `url(${settings.hero_image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: radius,
              }
            : { borderRadius: radius }
        }
      >
        {heroStyle === 'banner' && settings?.hero_image && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative z-10">
          <div className={heroStyle === 'left' ? 'px-4' : 'px-4'}>
            {settings?.profile_image && (
              <img
                src={settings.profile_image}
                alt={title}
                className={`w-24 h-24 rounded-full mb-4 object-cover ${
                  heroAlign === 'text-center' ? 'mx-auto' : ''
                }`}
              />
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: primaryColor }}>
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              {heroText || description}
            </p>
            {heroText && description && (
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      {settings?.about_text && (
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">소개</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {settings.about_text}
          </p>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category?slug=${category.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                style={{ borderColor: category.color || undefined }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Posts */}
      <section>
        <h2 className="text-lg font-semibold mb-4">최근 글</h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            아직 발행된 글이 없습니다.
          </div>
        ) : (
          <div className={cardStyle === 'boxed' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-6'}>
            {posts.map((post) => (
              <article
                key={post.id}
                className={
                  cardStyle === 'minimal'
                    ? 'border-b border-gray-200 dark:border-gray-700 py-5 first:pt-0'
                    : 'rounded-lg shadow p-6 hover:shadow-md transition-shadow'
                }
                style={cardStyle !== 'minimal' ? { backgroundColor: isDark ? '#1f2937' : cardBg, borderRadius: radius } : undefined}
              >
                <Link href={`/post?slug=${post.slug}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400" style={{ color: isDark ? undefined : settings?.text_color }}>
                    {post.title}
                  </h3>
                </Link>
                {post.excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" style={{ color: isDark ? undefined : settings?.text_color }}>
                    {post.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-1">
                  {(settings?.show_category_badge ?? true) && post.category_id && (
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                      {getCategoryName(post.category_id)}
                    </span>
                  )}
                  <time>{new Date(post.created_at).toLocaleDateString('ko-KR')}</time>
                  {(settings?.show_tags ?? true) && post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-blue-600 dark:text-blue-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
