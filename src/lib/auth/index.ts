import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
 * Sign out user and redirect to login
 */
export const signOutUser = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}