import { redirect } from 'next/navigation'
import { hasLoginAccess, type SiteSectionKey } from '@/lib/access-control'
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

  const supabase = await createClient()
  const { allowed, error } = await hasLoginAccess(supabase)

  if (error) {
    console.error('Login access lookup failed:', error.message)
  }

  if (!allowed) {
    await supabase.auth.signOut()
    redirect('/login?error=Your account access has been disabled. Contact an administrator.')
  }

  return user
}

/**
 * Protect every route nested under a user-facing site section.
 * The database function also grants active administrators an explicit bypass.
 */
export const protectSectionRoute = async (section: SiteSectionKey) => {
  const user = await protectRoute()
  const supabase = await createClient()
  const { data: allowed, error } = await supabase.rpc('can_access_section', {
    section_key: section,
  })

  if (error) {
    console.error(`Section access lookup failed for ${section}:`, error.message)
  }

  if (error || allowed !== true) {
    redirect(`/dashboard?notice=section-disabled&section=${encodeURIComponent(section)}`)
  }

  return user
}

/**
 * Server-side authorization boundary for the Admin Control Center.
 * The database profile is authoritative; browser metadata is never used.
 */
export const protectAdminRoute = async () => {
  const user = await protectRoute()

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
