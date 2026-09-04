const API_BASE = process.env.NEXT_PUBLIC_BKEND_API_URL || 'https://api.bkend.ai/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_BKEND_PROJECT_ID!;

async function bkendFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bkend_access_token') : null;
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-project-id': PROJECT_ID,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API request failed');
  }

  return res.json();
}

export const bkend = {
  auth: {
    signup: (body: { email: string; password: string; name: string }) =>
      bkendFetch('/auth/email/signup', { method: 'POST', body: JSON.stringify(body) }),
    signin: (body: { email: string; password: string }) =>
      bkendFetch('/auth/email/signin', { method: 'POST', body: JSON.stringify(body) }),
    me: () => bkendFetch('/auth/me'),
    signout: () => bkendFetch('/auth/signout', { method: 'POST' }),
    refresh: (refreshToken: string) =>
      bkendFetch('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
  },
  data: {
    list: (table: string, params?: Record<string, string>) => {
      const queryString = params ? `?${new URLSearchParams(params)}` : '';
      return bkendFetch(`/data/${table}${queryString}`);
    },
    get: (table: string, id: string) => bkendFetch(`/data/${table}/${id}`),
    create: (table: string, body: unknown) =>
      bkendFetch(`/data/${table}`, { method: 'POST', body: JSON.stringify(body) }),
    update: (table: string, id: string, body: unknown) =>
      bkendFetch(`/data/${table}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (table: string, id: string) =>
      bkendFetch(`/data/${table}/${id}`, { method: 'DELETE' }),
  },
};

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
