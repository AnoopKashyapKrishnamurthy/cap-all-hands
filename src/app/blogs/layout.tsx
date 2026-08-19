import type { ReactNode } from 'react'
import { protectSectionRoute } from '@/lib/auth'

export default async function BlogsLayout({ children }: { children: ReactNode }) {
  await protectSectionRoute('blogs')
  return children
}
