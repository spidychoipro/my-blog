'use client';

import { useState, useEffect } from 'react';
import { useRequireAdmin } from '@/hooks/useAuth';
import { supabase, type Post } from '@/lib/supabase';
import Link from 'next/link';

export default function PostsPage() {
  const { user, isLoading } = useRequireAdmin();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await supabase.from('posts').delete().eq('id', id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await supabase.from('posts').update({ status: newStatus }).eq('id', post.id);
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          글 관리
        </h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
        >
          + 새 글 작성
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4 w-fit">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {f === 'all' ? '전체' : f === 'published' ? '발행' : '초안'}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            아직 작성된 글이 없습니다.
          </p>
          <Link
            href="/admin/posts/new"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            첫 번째 글을 작성해보세요 →
          </Link>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'published' ? '발행된 글이 없습니다.' : '초안이 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(post)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {post.status === 'published' ? '발행' : '초안'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {post.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      /{post.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStatus(post)}
                    className={`ml-2 px-2 py-1 text-xs rounded-full shrink-0 ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {post.status === 'published' ? '발행' : '초안'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </p>
                <div className="flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <button
                    onClick={() => toggleStatus(post)}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    {post.status === 'published' ? '초안으로' : '발행하기'}
                  </button>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-xs text-blue-600 dark:text-blue-400"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
