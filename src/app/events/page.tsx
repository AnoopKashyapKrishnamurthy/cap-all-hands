import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import EventCard from '@/components/events/EventCard'

export const revalidate = 0

export default async function EventsPage() {
  const user = await protectRoute()
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data: upcomingData, error: upcomingError } = await supabase
    .from('events')
    .select(`
      *,
      profile:user_profiles (
        display_name,
        avatar_url
      )
    `)
    .gte('event_date', now)
    .order('event_date', { ascending: true })

  const { data: pastData, error: pastError } = await supabase
    .from('events')
    .select(`
      *,
      profile:user_profiles (
        display_name,
        avatar_url
      )
    `)
    .lt('event_date', now)
    .order('event_date', { ascending: false })
    .limit(6)

  if (upcomingError || pastError) {
    console.error(upcomingError || pastError)
  }

  // Fetch current user's interactions for all events (likes + participant)
  const allEventIds = [
    ...(upcomingData ?? []),
    ...(pastData ?? []),
  ].map((e) => e.id)

  let userInteractions: { target_id: string; interaction_type: string }[] = []

  if (allEventIds.length > 0) {
    const { data: interactionsData } = await supabase
      .from('interactions')
      .select('target_id, interaction_type')
      .eq('user_id', user.id)
      .eq('target_type', 'events')
      .in('target_id', allEventIds)

    userInteractions = interactionsData ?? []
  }

  const normalize = (event: any) => {
    const profile = Array.isArray(event.profile)
      ? event.profile[0]
      : event.profile ?? undefined
    return { ...event, profile }
  }

  const upcomingEvents = (upcomingData ?? []).map(normalize)
  const pastEvents = (pastData ?? []).map(normalize)

  return (
    <section className="max-w-6xl mx-auto space-y-12 py-10 px-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            🗓️ Events
          </h1>
          <p className="text-gray-600 mt-2">
            Upcoming team events and activities.
          </p>
        </div>

        <Link
          href="/events/new"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium text-center"
        >
          + Create Event
        </Link>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>

        {upcomingEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const liked = userInteractions.some(
                (i) => i.target_id === event.id && i.interaction_type === 'like'
              )
              const joined = userInteractions.some(
                (i) => i.target_id === event.id && i.interaction_type === 'participant'
              )
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUserId={user.id}
                  initialLiked={liked}
                  initialJoined={joined}
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed rounded-2xl p-12 text-center">
            <p className="text-gray-600 font-medium mb-2">No upcoming events</p>
            <p className="text-gray-500 text-sm mb-6">
              Be the first to create one!
            </p>
            <Link
              href="/events/new"
              className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
            >
              Create Event
            </Link>
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-gray-500">Past Events</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-70">
            {pastEvents.map((event) => {
              const liked = userInteractions.some(
                (i) => i.target_id === event.id && i.interaction_type === 'like'
              )
              const joined = userInteractions.some(
                (i) => i.target_id === event.id && i.interaction_type === 'participant'
              )
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUserId={user.id}
                  initialLiked={liked}
                  initialJoined={joined}
                  isPast
                />
              )
            })}
          </div>
        </div>
      )}

    </section>
  )
}