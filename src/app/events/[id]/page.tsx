import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import EventInteractions from '@/components/events/EventInteractions'
import EventComments from '@/components/events/EventComments'

interface EventPageProps {
    params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
    const { id } = await params
    const user = await protectRoute()
    const supabase = await createClient()

    // =========================
    // EVENT
    // =========================
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

    const profile = Array.isArray(event.profile)
        ? event.profile[0]
        : event.profile ?? undefined

    // =========================
    // LIKES COUNT
    // =========================
    const { count: likesCount } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', id)
        .eq('target_type', 'events')
        .eq('interaction_type', 'like')

    // =========================
    // PARTICIPANTS
    // =========================
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

    // =========================
    // HOSTS
    // =========================
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

    // =========================
    // COMMENTS
    // =========================
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

    // =========================
    // CURRENT USER STATE
    // =========================
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

    // =========================
    // UI HELPERS
    // =========================

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

    const displayName = profile?.display_name || 'Unknown'
    const avatarUrl = profile?.avatar_url
    const initial = displayName.charAt(0).toUpperCase()

    // =========================
    // UI
    // =========================
    return (
        <article className="max-w-3xl mx-auto py-12 px-6 space-y-10">

            <Link href="/events" className="text-sm text-blue-600 hover:underline">
                ← Back to Events
            </Link>

            {/* Cover */}
            {event.image_url && (
                <div className="rounded-2xl overflow-hidden">
                    <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-72 object-cover"
                    />
                </div>
            )}

            {/* Title */}
            <div>
                {isPast && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full mb-3">
                        Past Event
                    </span>
                )}
                <h1 className="text-3xl font-bold">{event.title}</h1>
            </div>

            {/* Meta */}
            <div className="bg-gray-50 rounded-2xl p-6 text-sm">
                <p>📅 <strong>{formattedDate}</strong> at {formattedTime}</p>
                {event.location && <p>📍 {event.location}</p>}
                <p>❤️ {likesCount ?? 0} · 👥 {participants.length} going</p>
            </div>

            {/* Description */}
            {event.description && (
                <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description}
                </p>
            )}

            {/* Organizer */}
            <div className="flex items-center gap-3 border-t pt-6">
                {avatarUrl ? (
                    <img src={avatarUrl} className="h-10 w-10 rounded-full" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                        {initial}
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-gray-500">Organizer</p>
                </div>

                {event.creator_id === user.id && (
                    <Link href={`/events/edit/${event.id}`} className="ml-auto text-sm text-blue-600">
                        Edit
                    </Link>
                )}
            </div>

            {/* Hosts */}
            {hosts.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3">🎤 Hosts</h2>

                    <div className="flex flex-wrap gap-3">
                        {hosts.map((h) => {
                            const name = h.profile?.display_name || 'User'
                            const avatar = h.profile?.avatar_url
                            const initial = name.charAt(0).toUpperCase()

                            return (
                                <div
                                    key={h.id}
                                    className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl"
                                >
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={name}
                                            className="h-7 w-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-7 w-7 rounded-full bg-purple-400 text-white text-xs flex items-center justify-center font-semibold">
                                            {initial}
                                        </div>
                                    )}

                                    <span className="text-sm text-gray-800 font-medium">
                                        {name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Dynamic Event Sections */}
            {/* Dynamic Event Sections */}
            {activeSections.length > 0 && (
                <div className="space-y-8 mt-10">
                    {activeSections.map((section: any) => {
                        // Determine how to render content based on what's inside the JSON
                        const hasTextContent = section.content?.text;
                        const hasHtmlContent = section.content?.html;
                        const isArrayContent = Array.isArray(section.content);

                        return (
                            <div key={section.id} className="bg-white rounded-2xl p-6 border shadow-sm">
                                {section.title && (
                                    <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                                )}

                                {/* 1. Render Known/Standard Formats First */}
                                {section.section_type === 'agenda' && isArrayContent ? (
                                    <div className="space-y-3">
                                        {section.content.map((item: any, idx: number) => (
                                            <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1">
                                                <p className="font-semibold">{item.time} - {item.title}</p>
                                                {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : hasTextContent ? (
                                    /* 2. Generic Text Content Fallback */
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {section.content.text}
                                    </div>
                                ) : hasHtmlContent ? (
                                    /* 3. Generic HTML Content Fallback (Ensure you trust the input or sanitize it!) */
                                    <div
                                        className="text-gray-700 prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: section.content.html }}
                                    />
                                ) : (
                                    /* 4. Ultimate Fallback for Custom/Unknown JSON types */
                                    <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-auto text-gray-800">
                                        {JSON.stringify(section.content, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

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
                        👥 {participants.length} Going
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {participants.map((p) => (
                            <span key={p.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {p.profile?.display_name || 'User'}
                            </span>
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