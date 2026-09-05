'use client';

import { useState, useEffect, useRef } from 'react';
import { useRequireAdmin } from '@/hooks/useAuth';
import { supabase, type Category } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function EditPostPage() {
  const { user, isLoading } = useRequireAdmin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const statusRef = useRef<'draft' | 'published'>('draft');

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    body: '',
    excerpt: '',
    category_id: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    featured_image: '',
  });

  useEffect(() => {
    if (user && postId) {
      fetchPost();
      fetchCategories();
    } else if (user && !postId) {
      setLoading(false);
      setNotFound(true);
    }
  }, [user, postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();
      if (error || !data) {
        setNotFound(true);
        return;
      }
      setForm({
        title: data.title,
        slug: data.slug,
        body: data.body,
        excerpt: data.excerpt || '',
        category_id: data.category_id || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        status: data.status,
        featured_image: data.featured_image || '',
      });
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postId) return;

    setSaving(true);
    try {
      const postData = {
        title: form.title,
        slug: form.slug,
        body: form.body,
        excerpt: form.excerpt,
        category_id: form.category_id || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        featured_image: form.featured_image || null,
      };
      await supabase
        .from('posts')
        .update({
          ...postData,
          status: statusRef.current,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);
      router.push('/admin/posts');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('글 수정에 실패했습니다.');
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

  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">글을 찾을 수 없습니다.</p>
        <Link href="/admin/posts" className="text-blue-600 dark:text-blue-400 hover:underline">
          글 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 lg:mb-8">
        글 수정
      </h1>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                제목 *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="글 제목을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  슬러그 (URL)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="URL 주소"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  카테고리
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                대표 이미지 URL
              </label>
              <input
                type="url"
                value={form.featured_image}
                onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                요약
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="글 요약을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                본문 * (Markdown 지원)
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder="글 본문을 입력하세요 (Markdown 문법 지원)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                태그 (쉼표 구분)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="예: JavaScript, React, 개발"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            취소
          </button>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              onClick={() => { statusRef.current = 'draft'; }}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '초안으로 저장'}
            </button>
            <button
              type="submit"
              onClick={() => { statusRef.current = 'published'; }}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '발행 중...' : '발행'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}