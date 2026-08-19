import type { ReactNode } from 'react'
import { protectSectionRoute } from '@/lib/auth'

export default async function EventsLayout({ children }: { children: ReactNode }) {
  await protectSectionRoute('events')
  return children
}
