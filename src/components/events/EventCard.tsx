'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  currentUserId: string
  initialLiked: boolean
  initialJoined: boolean
  isPast?: boolean
}

export default function EventCard({
  event,
  currentUserId,
  initialLiked,
  initialJoined,
  isPast = false,
}: EventCardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [liked, setLiked] = useState(initialLiked)
  const [joined, setJoined] = useState(initialJoined)
  const [likeLoading, setLikeLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = currentUserId === event.creator_id
  const displayName = event.profile?.display_name || 'Unknown'
  const avatarUrl = event.profile?.avatar_url
  const initial = displayName.charAt(0).toUpperCase()

  const eventDate = new Date(event.event_date)
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = eventDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (likeLoading || isPast) return
    setLikeLoading(true)

    if (liked) {
      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', currentUserId)
        .eq('target_id', event.id)
        .eq('target_type', 'event')
        .eq('interaction_type', 'like')
      setLiked(false)
    } else {
      await supabase.from('interactions').insert({
        user_id: currentUserId,
        target_id: event.id,
        target_type: 'event',
        interaction_type: 'like',
      })
      setLiked(true)
    }

    setLikeLoading(false)
  }

  const toggleJoin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (joinLoading || isPast) return
    setJoinLoading(true)

    if (joined) {
      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', currentUserId)
        .eq('target_id', event.id)
        .eq('target_type', 'event')
        .eq('interaction_type', 'participant')
      setJoined(false)
    } else {
      await supabase.from('interactions').insert({
        user_id: currentUserId,
        target_id: event.id,
        target_type: 'event',
        interaction_type: 'participant',
      })
      setJoined(true)
    }

    setJoinLoading(false)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    setDeleting(true)
    await supabase.from('events').delete().eq('id', event.id)
    router.refresh()
  }

  return (
    <Link href={`/events/${event.id}`}>
      <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition flex flex-col h-full overflow-hidden ${isPast ? 'grayscale' : ''}`}>

        {/* Image or gradient */}
        <div className="h-40 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white text-xl font-semibold px-4 text-center">
              {event.title}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 space-y-3">

          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Date & Location */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>📅 {formattedDate} · {formattedTime}</p>
            {event.location && <p>📍 {event.location}</p>}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 pt-1">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                {initial}
              </div>
            )}
            <span className="text-xs text-gray-500">{displayName}</span>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-3 pt-2 border-t mt-auto"
            onClick={(e) => e.preventDefault()}
          >
            {/* Like */}
            <button
              onClick={toggleLike}
              disabled={likeLoading || isPast}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition ${
                liked
                  ? 'bg-red-50 text-red-500'
                  : 'text-gray-500 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              {liked ? '❤️' : '🤍'} Like
            </button>

            {/* Join / Leave */}
            {!isPast && (
              <button
                onClick={toggleJoin}
                disabled={joinLoading}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition ${
                  joined
                    ? 'bg-green-50 text-green-600'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                } disabled:opacity-50`}
              >
                {joined ? '✅ Joined' : '+ Join'}
              </button>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="ml-auto flex gap-2">
                <Link
                  href={`/events/edit/${event.id}`}
                  className="text-xs text-gray-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
                {!confirming ? (
                  <button
                    onClick={(e) => { e.preventDefault(); setConfirming(true) }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs text-red-600 font-medium"
                  >
                    {deleting ? 'Deleting...' : 'Confirm'}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </Link>
  )
}