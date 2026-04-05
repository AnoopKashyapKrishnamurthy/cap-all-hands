'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AddComment({ reviewId }: { reviewId: string }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!text.trim()) return

    setLoading(true)

    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id

    await supabase.from('interactions').insert({
      user_id: userId,
      target_id: reviewId,
      target_type: 'book_reviews',
      interaction_type: 'comment',
      payload: { text },
    })

    setText('')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="mt-8 flex gap-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 border rounded-full px-4 py-2 text-sm"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
      >
        Post
      </button>
    </div>
  )
}