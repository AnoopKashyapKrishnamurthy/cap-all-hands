'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EventInteractionsProps {
  eventId: string
  currentUserId: string
  initialLiked: boolean
  initialJoined: boolean
  isPast: boolean
}

export default function EventInteractions({
  eventId,
  currentUserId,
  initialLiked,
  initialJoined,
  isPast,
}: EventInteractionsProps) {
  const supabase = createClient()
  const [liked, setLiked] = useState(initialLiked)
  const [joined, setJoined] = useState(initialJoined)
  const [likeLoading, setLikeLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)

  const toggleLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)

    if (liked) {
      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', currentUserId)
        .eq('target_id', eventId)
        .eq('target_type', 'event')
        .eq('interaction_type', 'like')
      setLiked(false)
    } else {
      await supabase.from('interactions').insert({
        user_id: currentUserId,
        target_id: eventId,
        target_type: 'event',
        interaction_type: 'like',
      })
      setLiked(true)
    }
    setLikeLoading(false)
  }

  const toggleJoin = async () => {
    if (joinLoading || isPast) return
    setJoinLoading(true)

    if (joined) {
      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', currentUserId)
        .eq('target_id', eventId)
        .eq('target_type', 'event')
        .eq('interaction_type', 'participant')
      setJoined(false)
    } else {
      await supabase.from('interactions').insert({
        user_id: currentUserId,
        target_id: eventId,
        target_type: 'event',
        interaction_type: 'participant',
      })
      setJoined(true)
    }
    setJoinLoading(false)
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={toggleLike}
        disabled={likeLoading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${
          liked
            ? 'bg-red-50 text-red-500 border border-red-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
      >
        {liked ? '❤️ Liked' : '🤍 Like'}
      </button>

      {!isPast && (
        <button
          onClick={toggleJoin}
          disabled={joinLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${
            joined
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {joined ? '✅ Joined! (Leave?)' : '+ Join Event'}
        </button>
      )}
    </div>
  )
}