'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase, type Post } from '@/lib/supabase';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      setResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">검색</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>

      {searched && (
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            &apos;{query}&apos; 검색 결과: {results.length}개
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((post) => (
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
      )}
    </div>
  );
}
