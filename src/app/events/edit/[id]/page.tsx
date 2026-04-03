import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import EventForm from '@/components/events/EventForm'
import EventSectionsManager from '@/components/events/EventSectionsManager'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const user = await protectRoute()
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) notFound()

  // Only creator can edit
  if (event.creator_id !== user.id) notFound()

  return (
    <section className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/events/${event.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Event
          </Link>

          <h1 className="text-3xl font-bold tracking-tight mt-2">
            Edit Event
          </h1>

          <p className="text-sm text-gray-500">
            Update event details and manage sections
          </p>
        </div>
      </div>

      {/* EVENT DETAILS CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">Event Details</h2>
          <p className="text-sm text-gray-500">
            Update title, description, date, and location
          </p>
        </div>

        <EventForm event={event} />
      </div>

      {/* EVENT SECTIONS CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">
        

        <EventSectionsManager eventId={event.id} />
      </div>

    </section>
  )
}