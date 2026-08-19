'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Blog } from '@/lib/types'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'
import FadeInImage from '@/components/loading/FadeInImage'
import { startRouteTransition } from '@/components/loading/RouteLoadingIndicator'

interface BlogCardProps {
  blog: Blog
  currentUserId: string
  isDraft?: boolean
}

export default function BlogCard({
  blog,
  currentUserId,
  isDraft = false,
}: BlogCardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const isOwner = currentUserId === blog.author_id

  const displayName = blog.profile?.display_name || 'Unknown User'
  const avatarUrl = blog.profile?.avatar_url
  const initial = displayName.charAt(0).toUpperCase()

  const formattedDate = new Date(blog.created_at).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  )

  const goToBlog = () => {
    startRouteTransition()
    router.push(`/blogs/${blog.slug}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOwner || deleting) return

    setDeleting(true)

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blog.id)

    if (error) {
      console.error(error)
      setDeleting(false)
      return
    }

    router.refresh()
  }
  const getPreviewText = (content: string) => {
    return content
      // Remove markdown syntax
      .replace(/[#_*>\-\[\]\(\)`]/g, '')
      // Remove multiple newlines
      .replace(/\n+/g, ' ')
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      .trim()
  }

  return (
    <div
      onClick={goToBlog}
      className={`
        group cursor-pointer rounded-xl border bg-white
        transition-all duration-300 overflow-hidden flex flex-col h-full
        hover:shadow-lg hover:-translate-y-[2px]
        ${isDraft ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200'}
      `}
    >

      {/* IMAGE */}
      <div className="h-44 w-full overflow-hidden bg-slate-100 relative">

        {blog.cover_image ? (
          <FadeInImage
            src={blog.cover_image}
            alt={blog.title}
            containerClassName="h-full w-full"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-slate-100 flex items-center justify-center px-6">
            <h3 className="text-base font-semibold text-slate-700 text-center line-clamp-2">
              {blog.title}
            </h3>
          </div>
        )}

        {/* Draft Badge */}
        {isDraft && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            Draft
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 p-5">

        {/* TITLE */}
        {blog.cover_image && (
          <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
            {blog.title}
          </h3>
        )}

        {/* CONTENT PREVIEW */}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {getPreviewText(blog.content)}
        </p>

        {/* FOOTER */}
        <div className="mt-auto pt-5 border-t border-slate-100">

          {/* AUTHOR */}
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                {initial}
              </div>
            )}

            <div className="text-xs">
              <p className="font-medium text-slate-800 leading-tight">
                {displayName}
              </p>
              <p className="text-slate-400">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div
            className="flex justify-between items-center text-sm"
            onClick={(e) => e.stopPropagation()}
          >

            {/* View CTA */}
            <span className="text-slate-500 group-hover:text-blue-600 transition">
              Read →
            </span>

            {/* OWNER ACTIONS */}
            {isOwner && (
              <div className="flex gap-3 text-xs">

                <button
                  onClick={() => {
                    startRouteTransition()
                    router.push(`/blogs/edit/${blog.id}`)
                  }}
                  className="text-slate-500 hover:text-slate-900"
                >
                  Edit
                </button>

                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 font-medium"
                  >
                    {deleting ? (
                      <span className="flex items-center gap-1.5">
                        <ButtonLoader label="Deleting blog" />
                        Deleting...
                      </span>
                    ) : 'Confirm'}
                  </button>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
