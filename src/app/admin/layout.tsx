import type { ReactNode } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { protectAdminRoute } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await protectAdminRoute()
  return <AdminShell adminName={profile.display_name || profile.email}>{children}</AdminShell>
}

