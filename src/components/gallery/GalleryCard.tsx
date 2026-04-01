'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GalleryItem } from '@/lib/types'

interface GalleryCardProps {
  item: GalleryItem
  currentUserId: string
}

export default function GalleryCard({ item, currentUserId }: GalleryCardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isOwner = currentUserId === item.uploaded_by
  const displayName = item.profile?.display_name || 'Unknown User'
  const avatarUrl = item.profile?.avatar_url
  const initial = displayName.charAt(0).toUpperCase()

  const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const handleDelete = async () => {
    if (!isOwner) return
    setDeleting(true)

    // Extract storage path from URL
    const url = new URL(item.image_url)
    const pathParts = url.pathname.split('/gallery-media/')
    if (pathParts[1]) {
      await supabase.storage.from('gallery-media').remove([pathParts[1]])
    }

    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      console.error('Delete failed:', error)
      setDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <>
      <div className="break-inside-avoid bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden">
        <div
          className="cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full object-cover"
          />
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                  {initial}
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-400">{formattedDate}</p>
              </div>
            </div>

            {isOwner && (
              <div className="text-xs flex items-center gap-2">
                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-red-600 font-medium"
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      className="text-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full max-h-[85vh] object-contain rounded-2xl"
            />
            <p className="text-white text-center mt-4 font-medium">{item.title}</p>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}