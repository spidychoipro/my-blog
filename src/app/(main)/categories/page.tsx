'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, type Category } from '@/lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">카테고리</h1>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          아직 카테고리가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category?slug=${category.slug}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
              </div>
              {category.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
