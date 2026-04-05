export const dynamic = 'force-dynamic'

import AnimatedBackground from '@/components/AnimatedBackground'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  let profile = null

  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    profile = data
  }

  return (
    <html lang="en">
      <body>
        <AnimatedBackground />
        <Navbar user={user} profile={profile} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          {children}
        </main>
      </body>
    </html>
  )
}