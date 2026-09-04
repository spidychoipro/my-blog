-- Supabase SQL 스키마
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. profiles 테이블 (관리자 정보)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. categories 테이블 (카테고리) - posts보다 먼저 생성
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. posts 테이블 (블로그 글)
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES profiles(id),
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. comments 테이블 (댓글)
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. settings 테이블 (블로그 설정)
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_title TEXT DEFAULT 'My Blog',
  blog_description TEXT DEFAULT '개인 블로그',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#10b981',
  footer_text TEXT DEFAULT '© 2024 My Blog. All rights reserved.',
  posts_per_page INTEGER DEFAULT 10,
  enable_comments BOOLEAN DEFAULT true,
  enable_dark_mode BOOLEAN DEFAULT true
);

-- 인덱스 생성
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_status ON comments(status);

-- RLS (Row Level Security) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 작업 가능
CREATE POLICY "Admins can do everything" ON profiles
  FOR ALL USING (role = 'admin');

CREATE POLICY "Admins can manage posts" ON posts
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Anyone can read approved comments" ON comments
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage comments" ON comments
  FOR ALL USING (true);

CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (true);

-- 초기 관리자 계정 생성 (Supabase Auth에서 직접 만드세요)
-- 그 후에 이 SQL을 실행하여 profiles에 추가하세요:
-- INSERT INTO profiles (id, email, name, role) 
-- VALUES ('your-user-id', 'your-email@example.com', 'Admin', 'admin');
