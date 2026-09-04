import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  status: 'draft' | 'published';
  category_id: string;
  author_id: string;
  featured_image?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type BlogSettings = {
  id: string;
  blog_title: string;
  blog_description: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  posts_per_page: number;
  enable_comments: boolean;
  enable_dark_mode: boolean;
};
