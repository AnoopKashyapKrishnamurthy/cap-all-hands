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
      <body className="bg-gray-50 text-gray-900">

        <Navbar user={user} profile={profile} />

        <main className="max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>

      </body>
    </html>
  )
}