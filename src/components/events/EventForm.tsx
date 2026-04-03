'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'

interface EventFormProps {
    event?: Event
}

export default function EventForm({ event }: EventFormProps) {
    const [hosts, setHosts] = useState<string[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])
    const router = useRouter()
    const supabase = createClient()
    const isEditMode = !!event

    const [userId, setUserId] = useState<string | null>(null)
    const [title, setTitle] = useState(event?.title || '')
    const [description, setDescription] = useState(event?.description || '')
    const [eventDate, setEventDate] = useState(
        event?.event_date
            ? new Date(event.event_date).toISOString().slice(0, 16)
            : ''
    )
    const [location, setLocation] = useState(event?.location || '')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(
        event?.image_url || null
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        // 1. Get Current User
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null)
        })

        // 2. Fetch all users for the host dropdown
        supabase
            .from('user_profiles')
            .select('id, display_name')
            .then(({ data }) => {
                setAllUsers(data || [])
            })

        // 3. Fetch existing hosts if in Edit Mode
        if (isEditMode && event?.id) {
            supabase
                .from('interactions')
                .select('user_id')
                .eq('target_id', event.id)
                .eq('target_type', 'events') // Make sure this matches your enum
                .eq('interaction_type', 'host')
                .then(({ data }) => {
                    if (data) {
                        setHosts(data.map(interaction => interaction.user_id))
                    }
                })
        }
    }, [supabase, isEditMode, event?.id])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!userId) {
            setError('You must be logged in.')
            return
        }

        if (!title.trim() || !eventDate) {
            setError('Title and event date are required.')
            return
        }

        if (!isEditMode && new Date(eventDate) <= new Date()) {
            setError('Event date must be in the future.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            let imageUrl = event?.image_url ?? null
            let imageStoragePath = event?.image_storage_path ?? null

            // Image Upload Logic remains the same
            if (imageFile) {
                const ext = imageFile.name.split('.').pop()
                const path = `${userId}/events/${Date.now()}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('event-media')
                    .upload(path, imageFile, { upsert: true })

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('event-media')
                    .getPublicUrl(path)

                imageUrl = urlData.publicUrl
                imageStoragePath = path
            }

            if (isEditMode) {
                // Update Event
                const { error: updateError } = await supabase
                    .from('events')
                    .update({
                        title: title.trim(),
                        description: description.trim() || null,
                        event_date: new Date(eventDate).toISOString(),
                        location: location.trim() || null,
                        image_url: imageUrl,
                        image_storage_path: imageStoragePath,
                    })
                    .eq('id', event!.id)

                if (updateError) throw updateError

                



                const {  error: deletehostsError } = await supabase
                    .from('interactions')
                    .delete()
                    .eq('target_id', event!.id)
                    .eq('target_type', 'events')
                    .eq('interaction_type', 'host')
                if (deletehostsError) throw deletehostsError

                // STEP 2: INSERT FRESH HOSTS
                if (hosts.length > 0) {
                    const uniqueHosts = Array.from(
                        new Map(hosts.map(h => [h, h])).values()
                    )



                    const hostRows = uniqueHosts.map((hostId) => ({
                        user_id: hostId,
                        target_id: event!.id,
                        target_type: 'events',
                        interaction_type: 'host'
                    }))

                    const { error: insertError } = await supabase
                        .from('interactions')
                        .insert(hostRows)

                    if (insertError) throw insertError
                }
                router.push(`/events/${event!.id}`)
            } else {
                // Insert New Event
                const { data: eventData, error: insertError } = await supabase
                    .from('events')
                    .insert({
                        creator_id: userId,
                        title: title.trim(),
                        description: description.trim() || null,
                        event_date: new Date(eventDate).toISOString(),
                        location: location.trim() || null,
                        image_url: imageUrl,
                        image_storage_path: imageStoragePath,
                    })
                    .select()
                    .single()

                if (insertError) throw insertError

                // Insert Hosts
                if (hosts.length > 0) {
                    const uniqueHosts = [...new Set(hosts)]

                    const hostRows = uniqueHosts.map((hostId) => ({
                        user_id: hostId,
                        target_id: eventData.id,
                        target_type: 'events',
                        interaction_type: 'host'
                    }))

                    const { error: hostInsertError } = await supabase
                        .from('interactions')
                        .insert(hostRows)

                    if (hostInsertError) throw hostInsertError
                }
            }

            router.refresh()

        } catch (err: any) {

            if (err?.message) {
                console.error('MESSAGE:', err.message)
            }

            if (err?.error_description) {
                console.error('DESC:', err.error_description)
            }

            setError(err?.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }


    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Q2 Team Offsite"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Date & Time *</label>
                <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Alpha / Nilgiri / Virtual"
                />
            </div>

            {/* Host */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Hosts
                </label>

                {/* Selected Hosts (Chips) */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {hosts.map((hostId) => {
                        const user = allUsers.find(u => u.id === hostId)
                        return (
                            <div
                                key={hostId}
                                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                                {user?.display_name || hostId}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setHosts(hosts.filter(id => id !== hostId))
                                    }
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    ✕
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2"
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Dropdown */}
                <div className="border rounded-xl max-h-40 overflow-y-auto">
                    {allUsers
                        .filter(user =>
                            (user.display_name || '')
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        )
                        .map((user) => {
                            const isSelected = hosts.includes(user.id)

                            return (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        if (isSelected) {
                                            setHosts(hosts.filter(id => id !== user.id))
                                        } else {
                                            setHosts(prev => {
                                                if (prev.includes(user.id)) {
                                                    return prev.filter(id => id !== user.id)
                                                }
                                                return [...new Set([...prev, user.id])]
                                            })
                                        }
                                    }}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between ${isSelected ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <span>{user.display_name || user.id}</span>
                                    {isSelected && <span>✓</span>}
                                </div>
                            )
                        })}
                </div>
            </div>



            <div>
                <label className="block text-sm font-medium mb-3">Cover Image</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:bg-blue-50 transition">
                    <span className="text-gray-500">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                    <div className="mt-4 rounded-xl overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
                {loading ? 'Processing...' : isEditMode ? 'Update Event' : 'Create Event'}
            </button>
        </form>
    )
}