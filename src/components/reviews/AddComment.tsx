'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'


export function AddComment({ reviewId }: { reviewId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id

      if (!userId) {
        setError('You must be signed in to comment.')
        return
      }

      const { error: insertError } = await supabase.from('interactions').insert({
        user_id: userId,
        target_id: reviewId,
        target_type: 'book_reviews',
        interaction_type: 'comment',
        payload: { text: text.trim() },
      })

      if (insertError) throw insertError

      setText('')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to post comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="mt-8 space-y-2">
      <div className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          disabled={loading}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition"
        />

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '…' : 'Post'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 pl-4">{error}</p>
      )}
    </div>
  )
}