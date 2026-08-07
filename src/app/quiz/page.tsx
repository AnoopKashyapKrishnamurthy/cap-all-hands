import QuizGame from '@/components/quiz/QuizGame'
import type { SpinnerParticipant } from '@/components/people/useParticipantSpinner'
import { protectRoute } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Quiz - CAP All-Hands',
}

export default async function QuizPage() {
  await protectRoute()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, bio')
    .order('display_name', { ascending: true })

  if (error) {
    return (
      <section className="max-w-6xl mx-auto py-8">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium">Unable to load the quiz</p>
          <p className="text-sm text-gray-500 mt-2">Please try again in a moment.</p>
        </div>
      </section>
    )
  }

  const participants = (data ?? []) as SpinnerParticipant[]

  return (
    <section className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Team Quiz</h1>
        <p className="text-gray-600 mt-2">
          Spin for a participant, answer the question, and keep the round moving.
        </p>
      </div>

      <QuizGame participants={participants} />
    </section>
  )
}
