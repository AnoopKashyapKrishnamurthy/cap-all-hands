import Link from 'next/link'
import { protectRoute } from '@/lib/auth'
import EventForm from '@/components/events/EventForm'

export const metadata = {
  title: 'Create Event - CAP All-Hands',
}

export default async function NewEventPage() {
  await protectRoute()

  return (
    <section className="max-w-2xl mx-auto space-y-10 py-10 px-6">
      <div className="space-y-2">
        <Link href="/events" className="text-sm text-blue-600 hover:underline">
          ← Back to Events
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Create Event
        </h1>
        <p className="text-gray-600">
          Plan a team event and invite everyone.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">
        <EventForm />
      </div>
    </section>
  )
}