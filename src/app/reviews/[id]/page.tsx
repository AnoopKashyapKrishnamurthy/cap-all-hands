'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ReviewDetailPage() {
  const supabase = createClient()

  const params = useParams()

  const reviewId = params.id as string

  const [userId, setUserId] = useState<string | null>(null)
  const [review, setReview] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')

  // 🔹 Initial Load
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || null
      setUserId(uid)

      // Review
      const { data: reviewData } = await supabase
        .from('book_reviews')
        .select(`
          *,
          profile:user_profiles(display_name, avatar_url)
        `)
        .eq('id', reviewId)
        .single()

      if (!reviewData) return

      setReview(reviewData)

      const p = Array.isArray(reviewData.profile)
        ? reviewData.profile[0]
        : reviewData.profile

      setProfile(p)

      // Likes
      const { count } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', reviewId)
        .eq('target_type', 'book_reviews')
        .eq('interaction_type', 'like')

      setLikeCount(count || 0)

      if (uid) {
        const { data } = await supabase
          .from('interactions')
          .select('id')
          .eq('user_id', uid)
          .eq('target_id', reviewId)
          .eq('target_type', 'book_reviews')
          .eq('interaction_type', 'like')
          .maybeSingle()

        setLiked(!!data)
      }

      // Comments
      const { data: commentData } = await supabase
        .from('interactions')
        .select(`
          *,
          user:user_profiles(display_name, avatar_url)
        `)
        .eq('target_id', reviewId)
        .eq('target_type', 'book_reviews')
        .eq('interaction_type', 'comment')
        .order('created_at', { ascending: true })

      setComments(commentData || [])
    }

    init()
  }, [reviewId, supabase])

  // ❤️ Toggle Like
  const toggleLike = async () => {
    if (!userId) return

    if (liked) {
      setLiked(false)
      setLikeCount((c) => Math.max(c - 1, 0))

      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', userId)
        .eq('target_id', reviewId)
        .eq('target_type', 'book_reviews')
        .eq('interaction_type', 'like')
    } else {
      setLiked(true)
      setLikeCount((c) => c + 1)

      await supabase.from('interactions').insert({
        user_id: userId,
        target_id: reviewId,
        target_type: 'book_reviews',
        interaction_type: 'like',
      })
    }
  }

  // 💬 Add Comment
  const addComment = async () => {
    if (!commentText.trim() || !userId) return

    // 🔹 Get current user profile (for UI)
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single()

    // 🔹 Create temp comment (optimistic UI)
    const newComment = {
      id: crypto.randomUUID(), // temp id
      user_id: userId,
      payload: { text: commentText },
      user: userData,
    }

    // ✅ Update UI instantly
    setComments((prev) => [...prev, newComment])
    setCommentText('')

    // 🔹 Save to DB
    const { error } = await supabase.from('interactions').insert({
      user_id: userId,
      target_id: reviewId,
      target_type: 'book_reviews',
      interaction_type: 'comment',
      payload: { text: newComment.payload.text },
    })

    if (error) {
      console.error(error)
      // ❌ rollback if failed
      setComments((prev) => prev.filter((c) => c.id !== newComment.id))
    }
  }

  // 🗑 Delete Comment
  const deleteComment = async (id: string) => {
    await supabase
      .from('interactions')
      .delete()
      .eq('id', id)

    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  if (!review) return null

  const formattedDate = new Date(review.created_at).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <div className="min-h-screen">

      {/* CONTAINER */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* HEADER (NO CARD) */}
        <div className="space-y-6">

          {/* Author */}
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {profile?.display_name?.charAt(0)}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-900">
                {profile?.display_name}
              </p>
              <p className="text-xs text-gray-500">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {review.review_title}
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {review.book_title} · {review.book_author}
            </p>
          </div>

          {/* Rating */}
          <div className="text-yellow-400 text-lg">
            {'★'.repeat(review.rating || 0)}
          </div>

        </div>

        {/* 📖 REVIEW CONTENT (ONLY THIS HAS BG) */}
        <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm">

          <div className="prose prose-lg max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {review.review_text}
            </ReactMarkdown>
          </div>

          {/* Images */}
          {review.media_urls?.length > 0 && (
            <div className="mt-8 space-y-5">
              {review.media_urls.map((url: string) => (
                <img
                  key={url}
                  src={url}
                  className="w-full rounded-xl border"
                />
              ))}
            </div>
          )}

        </div>

        {/* ❤️ INTERACTIONS */}
        <div className="flex items-center justify-between border-t pt-6">

          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition
            ${liked
                ? 'bg-red-50 text-red-500 border-red-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-400'
              }`}
          >
            <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
            <span className="font-semibold">{likeCount}</span>
          </button>

          <span className="text-sm text-gray-500">
            {comments.length} comments
          </span>

        </div>

        {/* 💬 COMMENTS SECTION */}
        <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

          <h3 className="text-lg font-semibold text-gray-900">
            Comments
          </h3>

          {/* Comment List */}
          <div className="space-y-6">
            {comments.map((c) => {
              const u = Array.isArray(c.user) ? c.user[0] : c.user
              const isOwner = userId === c.user_id

              return (
                <div key={c.id} className="flex gap-3 group">

                  {u?.avatar_url ? (
                    <img src={u.avatar_url} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {u?.display_name?.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {u?.display_name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {new Date(c.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      {isOwner && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                      {c.payload?.text}
                    </p>
                  </div>

                </div>
              )
            })}
          </div>

          {/* Add Comment */}
          <div className="flex gap-3 pt-4 border-t">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addComment}
              className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
            >
              Post
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}