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
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Unable to load reviews.
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📚 Book Reviews
          </h1>
        </div>

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
          <div className="text-center text-gray-500 mt-16">
            No reviews yet. Be the first to write one ✨
          </div>
        )}
      </div>
    </main>
  )
}