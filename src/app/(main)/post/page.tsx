'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, type Post, type Category, type Comment } from '@/lib/supabase';

function PostContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    body: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .limit(1);

      if (!posts || posts.length === 0) {
        setLoading(false);
        return;
      }

      const foundPost = posts[0];
      setPost(foundPost);

      if (foundPost.category_id) {
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', foundPost.category_id)
          .single();
        setCategory(catData);
      }

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', foundPost.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      setComments(commentsData || []);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSubmitting(true);
    setSubmitMessage('');

    try {
      await supabase.from('comments').insert({
        post_id: post.id,
        ...commentForm,
        status: 'pending',
      });
      setCommentForm({ author_name: '', author_email: '', body: '' });
      setSubmitMessage('댓글이 등록되었습니다. 승인 후 게시됩니다.');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setSubmitMessage('댓글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">글을 찾을 수 없습니다</h1>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          홈으로 돌아가기 →
        </Link>
      </div>
    );
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-500 dark:text-gray-400 space-x-4">
          {category && (
            <Link
              href={`/category?slug=${category.slug}`}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {category.name}
            </Link>
          )}
          <time>{new Date(post.created_at).toLocaleDateString('ko-KR')}</time>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-blue-600 dark:text-blue-400 text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
        <div className="prose dark:prose-invert max-w-none">
          {post.body.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4 whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">
          댓글 ({comments.length})
        </h2>

        <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 *
              </label>
              <input
                type="text"
                value={commentForm.author_name}
                onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일 *
              </label>
              <input
                type="email"
                value={commentForm.author_email}
                onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              댓글 *
            </label>
            <textarea
              value={commentForm.body}
              onChange={(e) => setCommentForm({ ...commentForm, body: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
          {submitMessage && (
            <p className={`text-sm ${
              submitMessage.includes('실패') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {submitMessage}
            </p>
          )}
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.author_name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-gray-500 dark:text-gray-400">로딩 중...</div></div>}>
      <PostContent />
    </Suspense>
  );
}
