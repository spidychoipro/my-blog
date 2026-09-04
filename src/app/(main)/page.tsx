'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, type Post, type Category } from '@/lib/supabase';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsData, categoriesData] = await Promise.all([
        supabase.from('posts').select('*').eq('status', 'published').order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
      ]);
      setPosts(postsData.data || []);
      setCategories(categoriesData.data || []);
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

  return (
    <div>
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {process.env.NEXT_PUBLIC_BLOG_TITLE || 'My Blog'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || 'Welcome to my blog'}
        </p>
      </section>

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

      <section>
        <h2 className="text-lg font-semibold mb-4">최근 글</h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            아직 발행된 글이 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <Link href={`/post?slug=${post.slug}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                    {post.title}
                  </h3>
                </Link>
                {post.excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                  {post.category_id && (
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                      {getCategoryName(post.category_id)}
                    </span>
                  )}
                  <time>{new Date(post.created_at).toLocaleDateString('ko-KR')}</time>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex space-x-2">
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
