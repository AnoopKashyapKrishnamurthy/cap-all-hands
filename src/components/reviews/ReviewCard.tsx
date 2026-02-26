'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Review } from '@/lib/types'

interface ReviewCardProps {
  review: Review
  currentUserId: string | null
}

export default function ReviewCard({
  review,
  currentUserId,
}: ReviewCardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const isOwner = currentUserId === review.user_id

  const displayName = review.profile?.display_name || 'Unknown User'
  const avatarUrl = review.profile?.avatar_url
  const initial = displayName.charAt(0).toUpperCase()

  const formattedDate = new Date(review.created_at).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'short', day: 'numeric' }
  )

  // ✅ SAFE ARRAY NORMALIZATION (fixes TS warning)
  const media = review.media_urls ?? []

  const handleDelete = async () => {
    if (!isOwner) return

    setDeleting(true)

    const { error } = await supabase
      .from('book_reviews')
      .delete()
      .eq('id', review.id)

    if (error) {
      console.error('Delete failed:', error)
      setDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-6 space-y-5">

      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {review.book_title}
          </h2>
          <p className="text-sm text-gray-500">
            by {review.book_author}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-400 text-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>
              {i < review.rating ? '★' : '☆'}
            </span>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {review.review_text}
      </p>

      {/* Media Section */}
      {media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {media.map((url) => (
            <div
              key={url}
              className="flex items-center justify-center bg-gray-100 rounded-2xl p-3 border"
            >
              <img
                src={url}
                alt="Review media"
                className="max-h-72 w-auto object-contain rounded-xl transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t">

        {/* Author */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
          )}

          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex items-center gap-4 text-sm">



            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-600 font-medium"
                >
                  {deleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}