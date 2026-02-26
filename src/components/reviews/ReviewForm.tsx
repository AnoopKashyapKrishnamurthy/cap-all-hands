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
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get logged in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const selectedFiles = Array.from(e.target.files)

    // Optional: limit to 5 images
    if (files.length + selectedFiles.length > 5) {
      setError('Maximum 5 images allowed.')
      return
    }

    setFiles((prev) => [...prev, ...selectedFiles])
  }

  // Remove file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userId) {
      setError('You must be logged in to post a review.')
      return
    }

    if (!title.trim() || !author.trim() || !text.trim()) {
      setError('All required fields must be filled.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const mediaUrls: string[] = []

      // Upload images
      for (const file of files) {
        const path = `user-${userId}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('book-review-media')
          .upload(path, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('book-review-media')
          .getPublicUrl(path)

        mediaUrls.push(data.publicUrl)
      }

      // Insert review
      const { error: insertError } = await supabase
        .from('book_reviews')
        .insert({
          book_title: title.trim(),
          book_author: author.trim(),
          rating,
          review_text: text.trim(),
          media_urls: mediaUrls,
          user_id: userId,
        })

      if (insertError) throw insertError

      router.push('/reviews')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Book Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          placeholder="Ex : Atomic Habits"
          required
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          placeholder="Ex : James Clear"
          required
        />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Rating
        </label>
        <div className="flex gap-2 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`transition ${
                rating >= n
                  ? 'text-yellow-400 scale-110'
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
        <label className="block text-sm font-medium mb-2">
          Review
        </label>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition resize-none"
          placeholder="Write your thoughts about the book..."
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          {text.length} characters
        </p>
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Media (optional)
        </label>

        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-gray-500 text-sm">
          Click to upload or drag images
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {files.map((file, index) => {
              const previewUrl = URL.createObjectURL(file)

              return (
                <div
                  key={index}
                  className="relative group rounded-2xl overflow-hidden border bg-gray-100"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-40 object-contain bg-white"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving Review...' : 'Post Review'}
      </button>

    </form>
  )
}