import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import ReviewCard from '@/components/reviews/ReviewCard'

export const revalidate = 0

export default async function ReviewsPage() {
  const user = await protectRoute()
  const currentUserId = user.id

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('book_reviews')
    .select(`
      *,
      profile:user_profiles!book_reviews_user_id_fkey (
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium mb-2">
            Unable to load reviews
          </p>
          <p className="text-sm text-gray-500">
            Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            📚 Book Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            See what your team is reading and reviewing.
          </p>
        </div>

        <Link
          href="/reviews/new"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium text-center"
        >
          + Write Review
        </Link>
      </div>

      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-700 text-lg font-medium mb-2">
            No reviews yet
          </p>
          <p className="text-gray-500 mb-6">
            Be the first to share your thoughts with the team ✨
          </p>
          <Link
            href="/reviews/new"
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
          >
            Write the First Review
          </Link>
        </div>
      )}

    </section>
  )
}