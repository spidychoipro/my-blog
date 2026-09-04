'use client';

import { useRequireAdmin } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user, isLoading } = useRequireAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        대시보드
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="전체 글" value="0" icon="📝" />
        <StatCard title="카테고리" value="0" icon="📁" />
        <StatCard title="댓글" value="0" icon="💬" />
        <StatCard title="승인 대기" value="0" icon="⏳" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            최근 글
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            아직 작성된 글이 없습니다. 글을 작성해보세요!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            최근 댓글
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            아직 댓글이 없습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
