import Link from 'next/link'
import ReviewForm from '@/components/reviews/ReviewForm'
import { protectRoute } from '@/lib/auth'

export const metadata = {
  title: 'Write Review - CAP All-Hands',
}

export default async function NewReviewPage() {
  await protectRoute()

  return (
    <section className="max-w-3xl mx-auto space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/reviews"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Reviews
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Write a Book Review
        </h1>

        <p className="text-gray-600">
          Share your thoughts with the team.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">
        <ReviewForm />
      </div>

    </section>
  )
}