'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'
import { startRouteTransition } from '@/components/loading/RouteLoadingIndicator'

export default function GalleryUploadForm() {
    const router = useRouter()
    const supabase = createClient()


    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (!selected) return

        if (!selected.type.startsWith('image/')) {
            setError('Please select an image file.')
            return
        }

        if (preview) URL.revokeObjectURL(preview)
        setFile(selected)
        setPreview(URL.createObjectURL(selected))
        setError(null)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError(null)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error('You must be logged in.')
            if (!file) throw new Error('Please select an image.')
            if (!title.trim()) throw new Error('Title is required.')

            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
            const path = `${user.id}/${Date.now()}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('gallery-media')
                .upload(path, file)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('gallery-media')
                .getPublicUrl(path)

            const { error: insertError } = await supabase
                .from('gallery_items')
                .insert({
                    title: title.trim(),
                    description: description.trim() || null,
                    image_url: urlData.publicUrl,
                    uploaded_by: user.id,
                })

            if (insertError) throw insertError

            startRouteTransition()
            router.push('/gallery')
            router.refresh()
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6" aria-busy={loading}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm" role="alert">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Team Offsite 2025"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    placeholder="Add some context..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Photo</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-gray-500 text-sm">
                    Click to select an image
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>

                {preview && (
                    <div className="mt-4 rounded-xl overflow-hidden border">
                        <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <ButtonLoader label="Uploading photo" />
                        Uploading photo...
                    </span>
                ) : 'Upload Photo'}
            </button>
        </form>
    )
}
