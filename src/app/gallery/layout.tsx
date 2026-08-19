import type { ReactNode } from 'react'
import { protectSectionRoute } from '@/lib/auth'

export default async function GalleryLayout({ children }: { children: ReactNode }) {
  await protectSectionRoute('gallery')
  return children
}
