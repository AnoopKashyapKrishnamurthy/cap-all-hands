import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import EventInteractions from '@/components/events/EventInteractions'
import EventComments from '@/components/events/EventComments'
import EventSections from '@/components/events/EventSections'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const user = await protectRoute()
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      profile:user_profiles (
        display_name,
        avatar_url
      ),
      event_sections (*)
    `)
    .eq('id', id)
    .single()

  if (error || !event) notFound()

  const { count: likesCount } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true })
    .eq('target_id', id)
    .eq('target_type', 'events')
    .eq('interaction_type', 'like')

  const { data: participantsData } = await supabase
    .from('interactions')
    .select(`
      id,
      user_id,
      profile:user_profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('target_id', id)
    .eq('target_type', 'events')
    .eq('interaction_type', 'participant')

  const participants = (participantsData ?? []).map((p: any) => ({
    ...p,
    profile: Array.isArray(p.profile) ? p.profile[0] : p.profile,
  }))

  const { data: hostsData } = await supabase
    .from('interactions')
    .select(`
      id,
      user_id,
      profile:user_profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('target_id', id)
    .eq('target_type', 'events')
    .eq('interaction_type', 'host')

  const hosts = (hostsData ?? []).map((h: any) => ({
    ...h,
    profile: Array.isArray(h.profile) ? h.profile[0] : h.profile,
  }))

  const { data: commentsData } = await supabase
    .from('interactions')
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
    .eq('target_id', id)
    .eq('target_type', 'events')
    .eq('interaction_type', 'comment')
    .order('created_at', { ascending: true })

  const comments = (commentsData ?? []).map((c: any) => ({
    ...c,
    profile: Array.isArray(c.profile) ? c.profile[0] : c.profile,
  }))

  const { data: myInteractions } = await supabase
    .from('interactions')
    .select('interaction_type')
    .eq('user_id', user.id)
    .eq('target_id', id)
    .eq('target_type', 'events')
    .in('interaction_type', ['like', 'participant'])

  const initialLiked =
    myInteractions?.some((i) => i.interaction_type === 'like') ?? false

  const initialJoined =
    myInteractions?.some((i) => i.interaction_type === 'participant') ?? false

  const activeSections = (event.event_sections || [])
    .filter((sec: any) => sec.is_visible)
    .sort((a: any, b: any) => a.display_order - b.display_order)

  const isPast = new Date(event.event_date) < new Date()

  const eventDate = new Date(event.event_date)
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = eventDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="text-sm text-gray-600 hover:text-black transition"
        >
          ← Back
        </Link>

        {/* Edit button moved here */}
        {event.creator_id === user.id && (
          <Link
            href={`/events/edit/${event.id}`}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Edit Event
          </Link>
        )}
      </div>

      {/* Cover */}
      {event.image_url && (
        <div className="relative rounded-3xl overflow-hidden shadow-md">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Title */}
      <div>
        {isPast && (
          <span className="inline-flex bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full mb-3">
            ⏳ Past Event
          </span>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {event.title}
        </h1>
      </div>

      {/* Meta */}
      <div className="bg-white border rounded-2xl p-6 text-sm shadow-sm space-y-2">
        <p>📅 <strong>{formattedDate}</strong> · {formattedTime}</p>
        <p>📍 {event.location || 'Online / TBD'}</p>
        <p className="text-gray-600">
          ❤️ {likesCount ?? 0} · 👥 {participants.length} attending
        </p>
      </div>

      {hosts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">🎤 Hosts</h2>

          <div className="flex flex-wrap gap-3">
            {hosts.map((h) => {
              const name = h.profile?.display_name || 'User'
              const avatar = h.profile?.avatar_url
              const initial = name?.[0]?.toUpperCase() || 'U'

              return (
                <Link
                  href={`/people/${h.user_id}`}
                  key={h.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border 
                       hover:border-purple-300 hover:shadow-sm 
                       transition group"
                >
                  {/* Avatar */}
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center 
                           text-white text-xs font-semibold
                           bg-gradient-to-br from-purple-400 to-indigo-400"
                    >
                      {initial}
                    </div>
                  )}

                  {/* Name */}
                  <span className="text-sm text-gray-800 group-hover:text-purple-600 transition">
                    {name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
      {/* Description */}
      {event.description && (
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
          {event.description}
        </p>
      )}

      {/* Sections */}
      <EventSections sections={activeSections} />

      {/* Interactions */}
      <EventInteractions
        eventId={event.id}
        currentUserId={user.id}
        initialLiked={initialLiked}
        initialJoined={initialJoined}
        isPast={isPast}
      />

      {/* Participants */}
      {participants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            👥 {participants.length} Attenting
          </h2>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <Link
                key={p.id}
                href={`/people/${p.user_id}`}
                className="bg-white border px-3 py-1 rounded-full text-sm shadow-sm"
              >
                {p.profile?.display_name || 'User'}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <EventComments
        eventId={event.id}
        currentUserId={user.id}
        initialComments={comments}
      />

    </article>
  )
}