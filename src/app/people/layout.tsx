import type { ReactNode } from 'react'
import { protectSectionRoute } from '@/lib/auth'

export default async function PeopleLayout({ children }: { children: ReactNode }) {
  await protectSectionRoute('people')
  return children
}
