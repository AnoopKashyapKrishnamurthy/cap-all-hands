import type { SupabaseClient } from '@supabase/supabase-js'

export const SITE_SECTIONS = [
  {
    key: 'events',
    label: 'Events',
    description: 'Team events, attendance, comments, and event content.',
    href: '/events',
  },
  {
    key: 'reviews',
    label: 'Book Reviews',
    description: 'Community book reviews, ratings, and comments.',
    href: '/reviews',
  },
  {
    key: 'blogs',
    label: 'Blogs',
    description: 'Published posts, drafts, reactions, and comments.',
    href: '/blogs',
  },
  {
    key: 'people',
    label: 'People',
    description: 'The team directory and public member profiles.',
    href: '/people',
  },
  {
    key: 'quiz',
    label: 'Quiz',
    description: 'The interactive all-hands quiz experience.',
    href: '/quiz',
  },
  {
    key: 'gallery',
    label: 'Gallery',
    description: 'Shared photos, reactions, and comments.',
    href: '/gallery',
  },
] as const

export type SiteSectionKey = (typeof SITE_SECTIONS)[number]['key']

export type SiteSectionSetting = {
  key: SiteSectionKey
  label: string
  description: string
  enabled: boolean
  updated_at?: string
  updated_by?: string | null
}

export type SiteSectionState = Record<SiteSectionKey, boolean>

export const DEFAULT_SECTION_STATE: SiteSectionState = SITE_SECTIONS.reduce(
  (state, section) => ({ ...state, [section.key]: true }),
  {} as SiteSectionState
)

export function isSiteSectionKey(value: string): value is SiteSectionKey {
  return SITE_SECTIONS.some((section) => section.key === value)
}

export async function hasLoginAccess(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('is_user_login_enabled')
  return { allowed: !error && data === true, error }
}

export async function getSiteSectionSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('site_sections')
    .select('key, label, description, enabled, updated_at, updated_by')
    .order('label')

  const byKey = new Map(
    (data ?? [])
      .filter((setting) => isSiteSectionKey(setting.key))
      .map((setting) => [setting.key as SiteSectionKey, setting])
  )

  const settings: SiteSectionSetting[] = SITE_SECTIONS.map((section) => {
    const stored = byKey.get(section.key)
    return {
      ...section,
      enabled: stored?.enabled ?? true,
      updated_at: stored?.updated_at,
      updated_by: stored?.updated_by,
    }
  })

  return { settings, error }
}

export function sectionStateFromSettings(settings: SiteSectionSetting[]): SiteSectionState {
  return settings.reduce(
    (state, setting) => ({ ...state, [setting.key]: setting.enabled }),
    { ...DEFAULT_SECTION_STATE }
  )
}
