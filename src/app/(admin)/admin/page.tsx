'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/hooks/useAuth';
import { supabase, type Post, type Comment } from '@/lib/supabase';

export default function AdminDashboard() {
  const { user, isLoading } = useRequireAdmin();
  const [stats, setStats] = useState({ posts: 0, categories: 0, comments: 0, pending: 0 });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [postsRes, categoriesRes, commentsRes] = await Promise.all([
        supabase.from('posts').select('id'),
        supabase.from('categories').select('id'),
        supabase.from('comments').select('id, status'),
      ]);

      const pending = (commentsRes.data || []).filter(c => c.status === 'pending').length;

      setStats({
        posts: postsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        comments: commentsRes.data?.length || 0,
        pending,
      });

      const [recentRes, commentRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setRecentPosts(recentRes.data || []);
      setRecentComments(commentRes.data || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    { title: '전체 글', value: stats.posts.toString(), icon: '📝', href: '/admin/posts' },
    { title: '카테고리', value: stats.categories.toString(), icon: '📁', href: '/admin/categories' },
    { title: '댓글', value: stats.comments.toString(), icon: '💬', href: '/admin/comments' },
    { title: '승인 대기', value: stats.pending.toString(), icon: '⏳', href: '/admin/comments' },
  ];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 lg:mb-8">
        대시보드
      </h1>

      {/* Stats Grid - responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <span className="text-2xl lg:text-3xl">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
              최근 글
            </h2>
            <Link href="/admin/posts/new" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              새 글 작성 →
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">
              아직 작성된 글이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href="/admin/posts"
                  className="block p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')} · {post.status}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
              최근 댓글
            </h2>
            <Link href="/admin/comments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              모두 보기 →
            </Link>
          </div>
          {recentComments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">
              아직 댓글이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {recentComments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">{comment.author_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      comment.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : comment.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {comment.status === 'pending' ? '대기' : comment.status === 'approved' ? '승인' : '거절'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{comment.body}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
