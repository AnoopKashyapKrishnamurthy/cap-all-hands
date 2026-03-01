'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Blog } from '@/lib/types'

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
    { year: 'numeric', month: 'short', day: 'numeric' }
  )

  const goToBlog = () => {
    router.push(`/blogs/${blog.slug}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOwner) return

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

  return (
    <div
      onClick={goToBlog}
      className={`group cursor-pointer rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isDraft ? 'border-yellow-300 bg-yellow-50' : ''
      }`}
    >

      {/* HEADER (ALWAYS SAME HEIGHT) */}
      <div className="h-48 w-full overflow-hidden flex-shrink-0 bg-gray-100">
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center px-6 text-white text-center">
            <h3 className="text-lg font-semibold line-clamp-2">
              {blog.title}
            </h3>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="flex flex-col flex-1 p-6">

        {/* Title (only if image exists) */}
        {blog.cover_image && (
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {blog.title}
          </h3>
        )}

        {/* Preview */}
        <p className="text-gray-600 text-sm line-clamp-3">
          {blog.content.replace(/<[^>]+>/g, '')}
        </p>

        {/* PUSH FOOTER TO BOTTOM */}
        <div className="mt-auto pt-6 border-t">

          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex justify-between items-center text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-blue-600 font-medium">
              View →
            </span>

            {isOwner && (
              <div className="flex gap-3">

                <button
                  onClick={() =>
                    router.push(`/blogs/edit/${blog.id}`)
                  }
                  className="text-gray-600 hover:underline"
                >
                  Edit
                </button>

                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 font-medium"
                  >
                    {deleting ? 'Deleting...' : 'Confirm'}
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