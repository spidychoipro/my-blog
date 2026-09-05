'use client';

import { useState, useEffect } from 'react';
import { useRequireAdmin } from '@/hooks/useAuth';
import { supabase, type Comment } from '@/lib/supabase';

export default function CommentsPage() {
  const { user, isLoading } = useRequireAdmin();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      fetchComments();
    }
  }, [user]);

  const fetchComments = async () => {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });
      setComments(data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await supabase.from('comments').update({ status }).eq('id', id);
      setComments(comments.map(c => 
        c.id === id ? { ...c, status } : c
      ));
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await supabase.from('comments').delete().eq('id', id);
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const filteredComments = comments.filter(c => 
    filter === 'all' || c.status === filter
  );

  const pendingCount = comments.filter(c => c.status === 'pending').length;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          댓글 관리
          {pendingCount > 0 && (
            <span className="ml-2 lg:ml-3 text-xs lg:text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
              {pendingCount}개 대기
            </span>
          )}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {status === 'all' && '전체'}
            {status === 'pending' && '대기'}
            {status === 'approved' && '승인'}
            {status === 'rejected' && '거부'}
          </button>
        ))}
      </div>

      {filteredComments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' ? '아직 댓글이 없습니다.' : `${filter} 댓글이 없습니다.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.author_name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.author_email}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      comment.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : comment.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {comment.status === 'approved' && '승인'}
                      {comment.status === 'rejected' && '거부'}
                      {comment.status === 'pending' && '대기'}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.body}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(comment.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {comment.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'approved')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    승인
                  </button>
                )}
                {comment.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'rejected')}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    거부
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
