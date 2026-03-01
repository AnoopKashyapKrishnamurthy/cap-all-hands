'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Blog } from '@/lib/types'

interface BlogFormProps {
  blog?: Blog
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const isEditMode = !!blog

  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState(blog?.title || '')
  const [slug, setSlug] = useState(blog?.slug || '')
  const [content, setContent] = useState(blog?.content || '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(
    blog?.cover_image || null
  )
  const [published, setPublished] = useState(blog?.published || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEditMode) {
      setSlug(generateSlug(value))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const generateTimestamp = () => {
    const now = new Date()
    return now
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userId) {
      setError('You must be logged in.')
      return
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let coverImageUrl = blog?.cover_image || null

      // Upload new cover if replaced
      if (coverFile) {
        const path = `blog-${userId}-${Date.now()}-${coverFile.name}`

        const { error: uploadError } = await supabase.storage
          .from('blog-media')
          .upload(path, coverFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('blog-media')
          .getPublicUrl(path)

        coverImageUrl = data.publicUrl
      }

      if (isEditMode) {
        // UPDATE
        const { error: updateError } = await supabase
          .from('blogs')
          .update({
            title: title.trim(),
            content: content.trim(),
            cover_image: coverImageUrl,
            published,
          })
          .eq('id', blog.id)

        if (updateError) throw updateError

        router.push(`/blogs/${blog.slug}`)
      } else {
        // CREATE
        const baseSlug = generateSlug(title)

        const { data: existing } = await supabase
          .from('blogs')
          .select('id')
          .eq('slug', baseSlug)

        let finalSlug = baseSlug

        if (existing && existing.length > 0) {
          finalSlug = `${baseSlug}-${generateTimestamp()}`
        }

        const { error: insertError } = await supabase
          .from('blogs')
          .insert({
            title: title.trim(),
            slug: finalSlug,
            content: content.trim(),
            cover_image: coverImageUrl,
            author_id: userId,
            published,
          })

        if (insertError) throw insertError

        router.push(`/blogs/${finalSlug}`)
      }

      router.refresh()

    } catch (err) {
      console.error(err)
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const wordCount =
    content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Blog Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          required
        />
      </div>

      {/* Slug */}
      {!isEditMode && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            readOnly
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-500"
          />
        </div>
      )}

      {/* Cover */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Cover Image
        </label>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-gray-500 text-sm">
          Click to upload / replace cover
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {coverPreview && (
          <div className="mt-4 rounded-2xl overflow-hidden border">
            <img
              src={coverPreview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Blog Content
        </label>

        <textarea
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 rounded-2xl px-4 py-4 outline-none"
          required
        />

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{content.length} characters</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
        <div>
          <p className="font-medium">Publish?</p>
          <p className="text-sm text-gray-500">
            Toggle blog visibility
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPublished(!published)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition ${
            published ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
              published ? 'translate-x-6' : ''
            }`}
          />
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
      >
        {loading
          ? isEditMode
            ? 'Updating...'
            : 'Publishing...'
          : isEditMode
          ? 'Update Blog'
          : 'Create Blog'}
      </button>

    </form>
  )
}