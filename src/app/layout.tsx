export const dynamic = 'force-dynamic'

import AnimatedBackground from '@/components/AnimatedBackground'
import './globals.css'
import Navbar from '@/components/Navbar'
import RouteLoadingIndicator from '@/components/loading/RouteLoadingIndicator'
import { getCurrentUser } from '@/lib/auth'
import { DEFAULT_SECTION_STATE, getSiteSectionSettings, hasLoginAccess, sectionStateFromSettings } from '@/lib/access-control'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  let navigationUser = user
  let profile = null
  let sections = DEFAULT_SECTION_STATE

  if (user) {
    const supabase = await createClient()
    const { allowed } = await hasLoginAccess(supabase)

    if (allowed) {
      const [profileResult, sectionResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('display_name, avatar_url, role')
          .eq('id', user.id)
          .maybeSingle(),
        getSiteSectionSettings(supabase),
      ])

      profile = profileResult.data
      if (!sectionResult.error) sections = sectionStateFromSettings(sectionResult.settings)
    } else {
      navigationUser = null
    }
  }

  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <RouteLoadingIndicator />
        </Suspense>
        <AnimatedBackground />
        <Navbar user={navigationUser} profile={profile} sections={sections} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          {children}
        </main>
      </body>
    </html>
  )
}
