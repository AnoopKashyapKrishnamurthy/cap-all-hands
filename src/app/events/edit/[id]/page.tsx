import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import EventForm from '@/components/events/EventForm'

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
    <section className="max-w-2xl mx-auto space-y-10 py-10 px-6">
      <div className="space-y-2">
        <Link href={`/events/${event.id}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">
        <EventForm event={event} />
      </div>
    </section>
  )
}