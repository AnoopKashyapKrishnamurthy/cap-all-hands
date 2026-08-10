'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import FadeInImage from '@/components/loading/FadeInImage'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'
import { startRouteTransition } from '@/components/loading/RouteLoadingIndicator'

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

  // Fix: initialize directly from props, no flicker
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

  const [formattedDate, setFormattedDate] = useState('')
  const [formattedTime, setFormattedTime] = useState('')

  useEffect(() => {
    const eventDate = new Date(event.event_date)
    setFormattedDate(
      eventDate.toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      })
    )
    setFormattedTime(
      eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    )
  }, [event.event_date])

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      if (liked) {
        await supabase.from('interactions').delete()
          .eq('user_id', currentUserId).eq('target_id', event.id)
          .eq('target_type', 'events').eq('interaction_type', 'like')
        setLiked(false)
      } else {
        await supabase.from('interactions').insert({
          user_id: currentUserId, target_id: event.id,
          target_type: 'events', interaction_type: 'like',
        })
        setLiked(true)
      }
    } finally {
      setLikeLoading(false)
    }
  }

  const toggleJoin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (joinLoading || isPast) return
    setJoinLoading(true)
    try {
      if (joined) {
        await supabase.from('interactions').delete()
          .eq('user_id', currentUserId).eq('target_id', event.id)
          .eq('target_type', 'events').eq('interaction_type', 'participant')
        setJoined(false)
      } else {
        await supabase.from('interactions').insert({
          user_id: currentUserId, target_id: event.id,
          target_type: 'events', interaction_type: 'participant',
        })
        setJoined(true)
      }
    } finally {
      setJoinLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleting(true)
    try {
      await supabase.from('events').delete().eq('id', event.id)
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      onClick={() => {
        startRouteTransition()
        router.push(`/events/${event.id}`)
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          startRouteTransition()
          router.push(`/events/${event.id}`)
        }
      }}
      className={`cursor-pointer bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden ${isPast ? 'opacity-60' : ''}`}
    >
      <div className="h-44 w-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0">
        {event.image_url ? (
          <FadeInImage src={event.image_url} alt={event.title}
            containerClassName="h-full w-full"
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white text-lg font-semibold px-6 text-center">
            {event.title}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-3">
        {isPast && (
          <span className="inline-block self-start text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Past event
          </span>
        )}

        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="text-sm text-gray-500 space-y-1">
          <p className="flex items-center gap-1.5">
            <span>📅</span>
            <span>{formattedDate || '—'} · {formattedTime}</span>
          </p>
          {event.location && (
            <p className="flex items-center gap-1.5">
              <span>📍</span>
              <span className="truncate">{event.location}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <span className="text-xs text-gray-400 truncate">{displayName}</span>
        </div>

        <div
          className="flex items-center gap-2 pt-3 border-t mt-auto"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <button
            onClick={toggleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              liked
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'text-gray-500 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            {likeLoading ? <ButtonLoader label="Updating like" /> : <>{liked ? '❤️' : '🤍'} Like</>}
          </button>

          {!isPast && (
            <button
              onClick={toggleJoin}
              disabled={joinLoading}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                joined
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              } disabled:opacity-50`}
            >
              {joinLoading ? <ButtonLoader label="Updating attendance" /> : joined ? '✅ Joined' : '+ Join'}
            </button>
          )}

          {isOwner && (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href={`/events/edit/${event.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Edit
              </Link>
              {!confirming ? (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true) }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs text-red-600 font-medium disabled:opacity-50"
                  >
                    {deleting ? (
                      <span className="flex items-center gap-1.5">
                        <ButtonLoader label="Deleting event" />
                        Deleting…
                      </span>
                    ) : 'Confirm'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
                    className="text-xs text-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
