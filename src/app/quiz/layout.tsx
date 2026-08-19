import type { ReactNode } from 'react'
import { protectSectionRoute } from '@/lib/auth'

export default async function QuizLayout({ children }: { children: ReactNode }) {
  await protectSectionRoute('quiz')
  return children
}
