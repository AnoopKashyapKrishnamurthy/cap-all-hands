import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Get current session from Supabase
 * Used in server components for session validation
 */
export const getSession = async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

/**
 * Get current user from Supabase
 * Used in protected routes
 */
export const getCurrentUser = async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session.user;
};

/**
 * Protected route validator
 * Redirects to login if no session found
 * @throws Redirects to /login if not authenticated
 */
export const protectRoute = async () => {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
};

/**
 * Sign out user and redirect to login
 */
export const signOutUser = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
};
