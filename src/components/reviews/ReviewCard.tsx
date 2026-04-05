'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

  // ❤️ Like state
  const [liked, setLiked] = useState(false)
  const [loadingLike, setLoadingLike] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const isOwner = currentUserId === review.user_id

  const displayName = review.profile?.display_name || 'Unknown User'
  const avatarUrl = review.profile?.avatar_url
  const initial = displayName.charAt(0).toUpperCase()

  const formattedDate = new Date(review.created_at).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'short', day: 'numeric' }
  )

  const media = review.media_urls ?? []
  const thumbnail = media[0]

  // ✅ Fetch initial like + count
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) return

      // Check if liked
      const { data } = await supabase
        .from('interactions')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('target_id', review.id)
        .eq('target_type', 'book_reviews')
        .eq('interaction_type', 'like')
        .maybeSingle()

      setLiked(!!data)

      // Fetch like count
      const { count } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', review.id)
        .eq('target_type', 'book_reviews')
        .eq('interaction_type', 'like')

      setLikeCount(count || 0)
    }

    fetchData()
  }, [currentUserId, review.id, supabase])

  // ❤️ Toggle Like
  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) return

    setLoadingLike(true)

    try {
      if (liked) {
        // Optimistic UI
        setLiked(false)
        setLikeCount((prev) => Math.max(prev - 1, 0))

        await supabase
          .from('interactions')
          .delete()
          .eq('user_id', currentUserId)
          .eq('target_id', review.id)
          .eq('target_type', 'book_reviews')
          .eq('interaction_type', 'like')
      } else {
        // Optimistic UI
        setLiked(true)
        setLikeCount((prev) => prev + 1)

        const { error } = await supabase
          .from('interactions')
          .insert({
            user_id: currentUserId,
            target_id: review.id,
            target_type: 'book_reviews',
            interaction_type: 'like',
          })

        if (error) throw error
      }
    } catch (err) {
      console.error('Like error:', err)
    } finally {
      setLoadingLike(false)
    }
  }

  // 🗑 Delete
  const handleDelete = async () => {
    if (!isOwner) return

    setDeleting(true)

    const { error } = await supabase
      .from('book_reviews')
      .delete()
      .eq('id', review.id)

    if (error) {
      console.error(error)
      setDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <Link href={`/reviews/${review.id}`} className="block group">
      <div className="flex flex-col md:flex-row gap-6 p-5 border rounded-2xl bg-white hover:shadow-md transition-all duration-300">

        {/* TEXT */}
        <div className="flex-1 space-y-3">

          {/* Author */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                {initial}
              </div>
            )}
            <span>{displayName}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
            {review.review_title}
          </h2>

          {/* Book */}
          <p className="text-sm text-gray-500">
            {review.book_title} · {review.book_author}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3">

            {/* LEFT: Like + Rating */}
            <div className="flex items-center gap-4">

              {/* ❤️ Like Button */}
              <button
                onClick={toggleLike}
                disabled={loadingLike}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all
                  ${liked
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-400'
                  }
                `}
              >
                <span className={`text-lg transition ${liked ? 'scale-110' : ''}`}>
                  {liked ? '❤️' : '🤍'}
                </span>

                <span className="text-sm font-semibold">
                  {likeCount}
                </span>
              </button>

              {/* ⭐ Rating */}
              <div className="text-yellow-400 text-sm">
                {'★'.repeat(review.rating || 0)}
              </div>

            </div>

            {/* RIGHT: Delete */}
            {isOwner && (
              <div className="text-xs text-gray-500 flex gap-3">

                {!confirming ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setConfirming(true)
                    }}
                    className="hover:text-red-500"
                  >
                    Delete
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete()
                      }}
                      className="text-red-600"
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setConfirming(false)
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}

              </div>
            )}
          </div>

        </div>

        {/* Thumbnail */}
        {thumbnail && (
          <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={thumbnail}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>
        )}

      </div>
    </Link>
  )
}