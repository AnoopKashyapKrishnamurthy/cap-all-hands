'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bold, Italic, Heading, Link as LinkIcon, List, Quote } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ReviewForm() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)

  // 🔹 Book Info
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')

  // 🔹 Review Info
  const [reviewTitle, setReviewTitle] = useState('')
  const [rating, setRating] = useState(3)
  const [content, setContent] = useState('')

  // 🔹 UI
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 🔹 Media
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // 🔹 State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])


  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url))
  }, [])

  // ✅ Markdown Formatting (same as blog)
  const insertFormatting = useCallback((before: string, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end)

    let replacement = ''

    if (before === '### ') {
      replacement = `\n### ${selected || 'Heading'}\n`
    } else if (before === '- ') {
      replacement = `\n- ${selected || 'List item'}`
    } else if (before === '> ') {
      replacement = `\n> ${selected || 'Quote'}`
    } else if (before === '[') {
      replacement = `[${selected || 'link text'}](https://)`
    } else {
      replacement = selected
        ? `${before}${selected}${after}`
        : `${before}${after}`
    }

    const newText =
      content.substring(0, start) +
      replacement +
      content.substring(end)

    setContent(newText)
  }, [content])

  // 🔹 File Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    if (files.length + selected.length > 5) {
      setError('Maximum 5 images allowed.')
      return
    }
    const newUrls = selected.map(f => URL.createObjectURL(f))
    setFiles(prev => [...prev, ...selected])
    setPreviewUrls(prev => [...prev, ...newUrls])
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  // 🔹 Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userId) {
      setError('You must be logged in.')
      return
    }

    if (!bookTitle || !bookAuthor || !reviewTitle || !content) {
      setError('All required fields must be filled.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const mediaUrls: string[] = []

      for (const file of files) {
        const path = `review-${userId}-${Date.now()}-${file.name}`

        const { error } = await supabase.storage
          .from('book-review-media')
          .upload(path, file)

        if (error) throw error

        const { data } = supabase.storage
          .from('book-review-media')
          .getPublicUrl(path)

        mediaUrls.push(data.publicUrl)
      }

      const { error } = await supabase
        .from('book_reviews')
        .insert({
          book_title: bookTitle.trim(),
          book_author: bookAuthor.trim(),
          review_title: reviewTitle.trim(),
          review_text: content.trim(),
          rating,
          media_urls: mediaUrls,
          user_id: userId,
        })

      if (error) throw error

      router.push('/reviews')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Failed to post review.')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readTime = Math.ceil(wordCount / 200)

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* 📘 Book Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <input
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="Book Title"
          className="border rounded-xl px-4 py-3"
          required
        />
        <input
          value={bookAuthor}
          onChange={(e) => setBookAuthor(e.target.value)}
          placeholder="Author"
          className="border rounded-xl px-4 py-3"
          required
        />
      </div>

      {/* ✨ Review Title */}
      <input
        value={reviewTitle}
        onChange={(e) => setReviewTitle(e.target.value)}
        placeholder="Review Title"
        className="w-full border rounded-xl px-4 py-3"
        required
      />

      {/* ⭐ Rating */}
      <div className="flex gap-2 text-2xl">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <span className={rating >= n ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          </button>
        ))}
      </div>

      {/* 📝 Markdown Editor */}
      <div>
        <div className="flex bg-gray-50 border rounded-t-xl px-4 pt-3 gap-2">
          <TabButton active={activeTab === 'write'} onClick={() => setActiveTab('write')}>Write</TabButton>
          <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>Preview</TabButton>
        </div>

        {activeTab === 'write' && (
          <div className="flex gap-1 p-2 border bg-white">
            <ToolbarButton onClick={() => insertFormatting('**', '**')} icon={<Bold size={16} />} />
            <ToolbarButton onClick={() => insertFormatting('*', '*')} icon={<Italic size={16} />} />
            <ToolbarButton onClick={() => insertFormatting('### ')} icon={<Heading size={16} />} />
            <ToolbarButton onClick={() => insertFormatting('- ')} icon={<List size={16} />} />
            <ToolbarButton onClick={() => insertFormatting('> ')} icon={<Quote size={16} />} />
            <ToolbarButton onClick={() => insertFormatting('[', ']')} icon={<LinkIcon size={16} />} />
          </div>
        )}

        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-5 py-4 min-h-[300px] border rounded-b-xl outline-none"
            placeholder="Write your review in Markdown..."
            required
          />
        ) : (
          <div className="prose p-6 border rounded-b-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{content.length} chars</span>
          <span>{wordCount} words • {readTime} min read</span>
        </div>
      </div>


      {/* 📷 Media Upload */}
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
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl"
      >
        {loading ? 'Posting...' : 'Post Review'}
      </button>

    </form>
  )
}

function ToolbarButton({ onClick, icon }: any) {
  return <button type="button" onClick={onClick} className="p-2 hover:bg-gray-100 rounded">{icon}</button>
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm ${active ? 'bg-white border rounded-t' : 'text-gray-500'}`}
    >
      {children}
    </button>
  )
}