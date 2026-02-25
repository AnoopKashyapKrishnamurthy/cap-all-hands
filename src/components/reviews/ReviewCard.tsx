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

  const isOwner = currentUserId === review.user_id

  const displayName = review.profile?.display_name || 'Unknown User'
  const avatarUrl = review.profile?.avatar_url
  const initial = displayName.charAt(0).toUpperCase()

  const handleDelete = async () => {
    if (!isOwner) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this review?'
    )
    if (!confirmDelete) return

    setDeleting(true)

    const { error } = await supabase
      .from('book_reviews')
      .delete()
      .eq('id', review.id)

    if (error) {
      console.error('Delete error:', error)
      setDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {review.book_title}
          </h2>
          <p className="text-sm text-gray-500">
            by {review.book_author}
          </p>
        </div>

        {/* Rating */}
        <div className="flex gap-1 text-yellow-400 text-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>
              {i < review.rating ? '★' : '☆'}
            </span>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
        {review.review_text}
      </p>

      {/* Media Section */}
      {review.media_urls && review.media_urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {review.media_urls.map((url) => (
            <div
              key={url}
              className="overflow-hidden rounded-xl border bg-gray-50"
            >
              <img
                src={url}
                alt="Review media"
                className="object-cover w-full h-32 hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">

        {/* Author Info */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-800">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}