'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ReviewForm() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(3)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userId) {
      setError('You must be logged in to post a review')
      return
    }

    if (!title || !author || !text) {
      setError('All fields except media are required')
      return
    }

    setLoading(true)
    setError(null)

    const mediaUrls: string[] = []

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const path = `user-${userId}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('book-review-media')
          .upload(path, file)

        if (uploadError) {
          setError('Failed to upload files')
          setLoading(false)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('book-review-media').getPublicUrl(path)

        mediaUrls.push(publicUrl)
      }
    }

    const { error: insertError } = await supabase.from('book_reviews').insert({
      book_title: title,
      book_author: author,
      rating,
      review_text: text,
      media_urls: mediaUrls,
      user_id: userId,
    })

    if (insertError) {
      setError('Unable to save review')
      setLoading(false)
      return
    }

    router.push('/reviews')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 sm:p-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ✍️ Write a Review
        </h2>
        <p className="text-gray-500 mb-8">
          Share your thoughts with the community
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg p-3 transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg p-3 transition"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl transition ${
                    rating >= n
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review
            </label>
            <textarea
              rows={5}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg p-3 transition resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (optional)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition text-gray-500 text-sm">
              Click to upload or drag files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Saving...' : 'Post Review'}
          </button>
        </form>
      </div>
    </div>
  )
}