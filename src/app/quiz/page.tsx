import QuizGame from '@/components/quiz/QuizGame'
import { protectRoute } from '@/lib/auth'

export const metadata = {
  title: 'Spin the Stack - CAP All-Hands',
}

export default async function QuizPage() {
  await protectRoute()

  return (
    <section className="mx-auto max-w-6xl space-y-8 py-2 sm:py-4">
      <header className="mx-auto max-w-3xl text-center">
        <p className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-orange-700">
          All-Hands Warm-Up
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Spin the Stack
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Forty riddles about the words we all say in meetings. Give it a spin, read it out, and let the room guess.
        </p>
      </header>

      <QuizGame />
    </section>
  )
}
