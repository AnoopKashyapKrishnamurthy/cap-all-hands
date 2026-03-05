'use client'

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Blog } from '@/lib/types'
import { Bold, Italic, Heading, Link as LinkIcon, List, Quote } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  const [coverPreview, setCoverPreview] = useState<string | null>(blog?.cover_image || null)
  const [published, setPublished] = useState(blog?.published || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])

  const generateSlug = (value: string) =>
    value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEditMode) setSlug(generateSlug(value))
  }

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

    setTimeout(() => {
      textarea.focus()
    }, 0)
  }, [content])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return

      if (e.key === 'b') {
        e.preventDefault()
        insertFormatting('**', '**')
      }

      if (e.key === 'i') {
        e.preventDefault()
        insertFormatting('*', '*')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [insertFormatting])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const generateTimestamp = () => {
    return new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
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
        const { error } = await supabase
          .from('blogs')
          .update({
            title: title.trim(),
            content: content.trim(),
            cover_image: coverImageUrl,
            published,
          })
          .eq('id', blog!.id)

        if (error) throw error

        router.push(`/blogs/${blog!.slug}`)
      } else {
        const baseSlug = generateSlug(title)
        const { data: existing } = await supabase
          .from('blogs')
          .select('id')
          .eq('slug', baseSlug)

        let finalSlug = baseSlug
        if (existing && existing.length > 0) {
          finalSlug = `${baseSlug}-${generateTimestamp()}`
        }

        const { error } = await supabase
          .from('blogs')
          .insert({
            title: title.trim(),
            slug: finalSlug,
            content: content.trim(),
            cover_image: coverImageUrl,
            author_id: userId,
            published,
          })

        if (error) throw error

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

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readTime = Math.ceil(wordCount / 200)

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Blog Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
          required
        />
      </div>

      {/* Slug */}
      {!isEditMode && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            URL Slug
          </label>

          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <span className="px-4 py-3 text-sm text-gray-400 border-r border-gray-200 bg-gray-100 whitespace-nowrap">
              /blogs/
            </span>

            <input
              type="text"
              value={slug}
              readOnly
              className="flex-1 px-4 py-3 bg-transparent text-gray-700 outline-none"
            />

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`/blogs/${slug}`)}
              className="px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition"
            >
              Copy
            </button>
          </div>

          <p className="text-xs text-gray-400">
            This will be your blog’s public URL.
          </p>
        </div>
      )}

      {/* Cover Upload */}
      <div>
        <label className="block text-sm font-medium mb-3">Cover Image</label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-gray-500 text-sm">
          Click to upload / replace cover
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>

        {coverPreview && (
          <div className="mt-4 rounded-xl overflow-hidden border">
            <img src={coverPreview} alt="Preview" className="w-full h-64 object-cover" />
          </div>
        )}
      </div>

      {/* Markdown Editor */}
      <div>
        <label className="block text-sm font-medium mb-3">Blog Content</label>

        <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
          <div className="flex bg-gray-50 border-b px-4 pt-3 gap-2">
            <TabButton active={activeTab === 'write'} onClick={() => setActiveTab('write')}>Write</TabButton>
            <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>Preview</TabButton>
          </div>

          {activeTab === 'write' && (
            <div className="flex flex-wrap gap-1 p-2 border-b bg-white">
              <ToolbarButton onClick={() => insertFormatting('**', '**')} icon={<Bold size={18} />} />
              <ToolbarButton onClick={() => insertFormatting('*', '*')} icon={<Italic size={18} />} />
              <ToolbarButton onClick={() => insertFormatting('### ')} icon={<Heading size={18} />} />
              <ToolbarButton onClick={() => insertFormatting('- ')} icon={<List size={18} />} />
              <ToolbarButton onClick={() => insertFormatting('> ')} icon={<Quote size={18} />} />
              <ToolbarButton onClick={() => insertFormatting('[', ']')} icon={<LinkIcon size={18} />} />
            </div>
          )}

          {activeTab === 'write' ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-5 py-4 resize-y min-h-[350px] outline-none"
              placeholder="Write your blog in Markdown..."
              required
            />
          ) : (
            <div className="px-8 py-8 min-h-[350px] prose prose-blue prose-lg max-w-none">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
          <span>{content.length} characters</span>
          <span>{wordCount} words • {readTime} min read</span>
        </div>
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
        <div>
          <p className="font-medium">Publish?</p>
          <p className="text-sm text-gray-500">Toggle blog visibility</p>
        </div>

        <button
          type="button"
          onClick={() => setPublished(!published)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition ${published ? 'bg-blue-600' : 'bg-gray-300'
            }`}
        >
          <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${published ? 'translate-x-6' : ''
            }`} />
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
      >
        {loading ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Blog' : 'Create Blog')}
      </button>

    </form>
  )
}

function ToolbarButton({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
    >
      {icon}
    </button>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${active
          ? 'bg-white border border-gray-200 border-b-white text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {children}
    </button>
  )
}