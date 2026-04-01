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
      {/* bg-gray-50 provides a clean backdrop for your white cards */}
      <body className="bg-gray-50 text-gray-900 min-h-screen selection:bg-primary-100 selection:text-primary-900">
        {/* Animated background  */}
        <AnimatedBackground />
        <Navbar user={user} profile={profile} />
        {/* Increased vertical padding (py-16) for a more spacious, premium feel */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          {children}
        </main>
      </body>
    </html>
  )
}