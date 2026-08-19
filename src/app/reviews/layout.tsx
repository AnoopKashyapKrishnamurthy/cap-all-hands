import type { ReactNode } from 'react'
import { protectSectionRoute } from '@/lib/auth'

export default async function ReviewsLayout({ children }: { children: ReactNode }) {
  await protectSectionRoute('reviews')
  return children
}
