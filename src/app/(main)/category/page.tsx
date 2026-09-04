'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, type Post, type Category } from '@/lib/supabase';

function CategoryContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchCategory();
  }, [slug]);

  const fetchCategory = async () => {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .limit(1);

      if (!categories || categories.length === 0) {
        setLoading(false);
        return;
      }

      const foundCategory = categories[0];
      setCategory(foundCategory);

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('category_id', foundCategory.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      setPosts(postsData || []);
    } catch (error) {
      console.error('Failed to fetch category:', error);
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

  if (!category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">카테고리를 찾을 수 없습니다</h1>
        <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
          카테고리 목록으로 돌아가기 →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color || '#3b82f6' }}
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        )}
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          이 카테고리에 아직 글이 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <Link href={`/post?slug=${post.slug}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                  {post.title}
                </h2>
              </Link>
              {post.excerpt && (
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
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
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-gray-500 dark:text-gray-400">로딩 중...</div></div>}>
      <CategoryContent />
    </Suspense>
  );
}
