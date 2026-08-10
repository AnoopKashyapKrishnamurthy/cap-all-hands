'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import FadeInImage from '@/components/loading/FadeInImage'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'
import { DetailSkeleton } from '@/components/loading/PageSkeletons'

export default function ReviewDetailPage() {
  const supabase = useMemo(() => createClient(), [])

  const params = useParams()
  const reviewId = params.id as string

  const [userId, setUserId] = useState<string | null>(null)
  const [review, setReview] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  // 🔹 Initial Load
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || null
      setUserId(uid)

      const { data: reviewData } = await supabase
        .from('book_reviews')
        .select(`
          *,
          profile:user_profiles(display_name, avatar_url)
        `)
        .eq('id', reviewId)
        .single()

      if (!reviewData) {
        setInitialLoading(false)
        return
      }

      setReview(reviewData)

      const p = Array.isArray(reviewData.profile)
        ? reviewData.profile[0]
        : reviewData.profile

      setProfile(p)

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
      setInitialLoading(false)
    }

    init()
  }, [reviewId, supabase])

  // ❤️ Toggle Like (safe)
  const toggleLike = async () => {
    if (!userId) return

    if (liked) {
      setLiked(false)
      setLikeCount((c) => Math.max(c - 1, 0))

      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('user_id', userId)
        .eq('target_id', reviewId)
        .eq('target_type', 'book_reviews')
        .eq('interaction_type', 'like')

      if (error) {
        console.error(error)
        setLiked(true)
        setLikeCount((c) => c + 1)
      }

    } else {
      setLiked(true)
      setLikeCount((c) => c + 1)

      const { error } = await supabase.from('interactions').insert({
        user_id: userId,
        target_id: reviewId,
        target_type: 'book_reviews',
        interaction_type: 'like',
      })

      if (error) {
        console.error(error)
        setLiked(false)
        setLikeCount((c) => Math.max(c - 1, 0))
      }
    }
  }

  // 💬 Add Comment (PRODUCTION SAFE)
  const addComment = async () => {
    if (!commentText.trim() || !userId || commentLoading) return
    setCommentLoading(true)

    const text = commentText

    const { data: userData } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single()

    const tempId = crypto.randomUUID()

    const newComment = {
      id: tempId,
      user_id: userId,
      payload: { text },
      user: userData,
      created_at: new Date().toISOString(),
    }

    setComments((prev) => [...prev, newComment])
    setCommentText('')

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        user_id: userId,
        target_id: reviewId,
        target_type: 'book_reviews',
        interaction_type: 'comment',
        payload: { text },
      })
      .select(`
        *,
        user:user_profiles(display_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error(error)
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      setCommentLoading(false)
      return
    }

    setComments((prev) =>
      prev.map((c) =>
        c.id === tempId
          ? {
            ...data,
            user: Array.isArray(data.user) ? data.user[0] : data.user,
          }
          : c
      )
    )
    setCommentLoading(false)
  }

  // 🗑 Delete Comment
  const deleteComment = async (id: string) => {
    if (deletingCommentId) return
    setDeletingCommentId(id)
    await supabase.from('interactions').delete().eq('id', id)
    setComments((prev) => prev.filter((c) => c.id !== id))
    setDeletingCommentId(null)
  }

  if (initialLoading) return <DetailSkeleton />

  if (!review) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-10 text-center">
        <p className="font-medium text-slate-700">Unable to load this review.</p>
      </div>
    )
  }

  const formattedDate = new Date(review.created_at).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <div className="min-h-screen">

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* HEADER */}
        <div className="space-y-6">

          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
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

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {review.review_title}
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mt-2">
              {review.book_title} · {review.book_author}
            </p>
          </div>

          <div className="text-yellow-400 text-lg">
            {'★'.repeat(review.rating || 0)}
          </div>

        </div>

        {/* CONTENT */}
        <div className="bg-white border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">

          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {review.review_text}
            </ReactMarkdown>
          </div>

          {review.media_urls?.length > 0 && (
            <div className="mt-6 space-y-4">
              {review.media_urls.map((url: string) => (
                <FadeInImage
                  key={url}
                  src={url}
                  alt={`${review.review_title} media`}
                  containerClassName="aspect-video w-full rounded-xl border bg-slate-50"
                  className="h-full w-full object-contain"
                />
              ))}
            </div>
          )}

        </div>

        {/* INTERACTIONS */}
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

        {/* COMMENTS */}
        <div className="bg-white border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm space-y-6">

          <h3 className="text-lg font-semibold text-gray-900">
            Comments
          </h3>

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
                          disabled={deletingCommentId === c.id}
                          className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          {deletingCommentId === c.id ? <ButtonLoader label="Deleting comment" /> : 'Delete'}
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

          <div className="flex gap-2 sm:gap-3 pt-4 border-t">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={commentLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  addComment()
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addComment}
              disabled={commentLoading || !commentText.trim()}
              className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentLoading ? <ButtonLoader label="Posting comment" /> : 'Post'}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
