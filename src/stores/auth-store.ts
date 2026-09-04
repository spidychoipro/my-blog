import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type User } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          set({ 
            user: profile || { 
              id: data.user.id, 
              email: data.user.email || '', 
              name: data.user.user_metadata?.name || 'Admin',
              role: 'admin',
              created_at: data.user.created_at
            }, 
            isLoading: false 
          });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Login failed', 
            isLoading: false 
          });
          throw err;
        }
      },
      logout: () => {
        supabase.auth.signOut();
        set({ user: null });
      },
      clearError: () => set({ error: null }),
    }),
    { 
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
