import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UserRole = 'user' | 'admin' | 'moderator'

export interface AdminProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
}

/**
 * Get current authenticated user (secure)
 * Contacts Supabase Auth server to validate JWT
 */
export const getCurrentUser = async () => {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Protected route validator
 * Redirects to login if user not authenticated
 */
export const protectRoute = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Server-side authorization boundary for the Admin Control Center.
 * The database profile is authoritative; browser metadata is never used.
 */
export const protectAdminRoute = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, email, display_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Admin authorization profile lookup failed:', error.message)
  }

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return {
    user,
    profile: profile as AdminProfile,
  }
}

/**
 * Sign out user and redirect to login
 */
export const signOutUser = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
