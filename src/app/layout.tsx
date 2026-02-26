import './globals.css'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Navbar user={user} />
        <main className="max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}