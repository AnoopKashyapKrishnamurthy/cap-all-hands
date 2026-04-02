'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  user_id: string
  payload: { text: string }
  created_at: string
  profile?: {
    display_name: string
    avatar_url: string | null
  }
}

interface EventCommentsProps {
  eventId: string
  currentUserId: string
  initialComments: Comment[]
}

export default function EventComments({
  eventId,
  currentUserId,
  initialComments,
}: EventCommentsProps) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('interactions')
      .insert({
        user_id: currentUserId,
        target_id: eventId,
        target_type: 'event',
        interaction_type: 'comment',
        payload: { text: text.trim() },
      })
      .select(`
        id,
        user_id,
        payload,
        created_at,
        profile:user_profiles (
          display_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      setError('Failed to post comment.')
    } else if (data) {
      const normalized = {
        ...data,
        profile: Array.isArray(data.profile) ? data.profile[0] : data.profile,
      }
      setComments((prev) => [...prev, normalized as Comment])
      setText('')
    }

    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    await supabase
      .from('interactions')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUserId)

    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        💬 Comments ({comments.length})
      </h2>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const name = comment.profile?.display_name || 'User'
          const avatar = comment.profile?.avatar_url
          const init = name.charAt(0).toUpperCase()
          const date = new Date(comment.created_at).toLocaleDateString(
            undefined,
            { month: 'short', day: 'numeric', year: 'numeric' }
          )
          const isOwner = comment.user_id === currentUserId

          return (
            <div key={comment.id} className="flex gap-3">
              {avatar ? (
                <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-400 text-white text-sm flex items-center justify-center flex-shrink-0">
                  {init}
                </div>
              )}
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{name}</span>
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.payload.text}
                </p>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 mt-1 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">
            No comments yet. Be the first to say something!
          </p>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="self-end bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? '...' : 'Post'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}