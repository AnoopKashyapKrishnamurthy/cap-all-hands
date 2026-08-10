'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { GalleryItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import GalleryModal from './GalleryModal'
import { ButtonLoader } from '@/components/loading/LoadingPrimitives'

interface GalleryCardProps {
  item: GalleryItem
  currentUserId: string
  onDelete?: (id: string) => void
}

export default function GalleryCard({ item, currentUserId, onDelete }: GalleryCardProps) {
  const supabase = createClient()

  const isOwner = item.uploaded_by === currentUserId

  const likes = item.interactions.filter((i) => i.interaction_type === 'like')
  const comments = item.interactions.filter((i) => i.interaction_type === 'comment')

  const [liked, setLiked] = useState(likes.some((l) => l.user_id === currentUserId))
  const [likeCount, setLikeCount] = useState(likes.length)
  const [likeLoading, setLikeLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)

    if (liked) {
      await supabase.from('interactions').delete()
        .eq('user_id', currentUserId)
        .eq('target_id', item.id)
        .eq('target_type', 'gallery')
        .eq('interaction_type', 'like')

      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('interactions').insert({
        user_id: currentUserId,
        target_id: item.id,
        target_type: 'gallery',
        interaction_type: 'like',
        payload: {},
      })

      setLiked(true)
      setLikeCount((c) => c + 1)
    }

    setLikeLoading(false)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)

    // 🔥 Optimistic UI update (instant removal)
    onDelete?.(item.id)

    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      console.error('Delete failed:', error.message)
      alert('Failed to delete post') // you can replace with toast later
    }

    setDeleting(false)
  }

  return (
    <>
      <div
        className="relative group aspect-square overflow-hidden rounded-sm cursor-pointer bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">

          {/* Like */}
          <button
            onClick={toggleLike}
            disabled={likeLoading}
            className="flex items-center gap-1.5 text-white font-semibold text-sm disabled:opacity-50"
          >
            {likeLoading ? (
              <ButtonLoader label="Updating like" />
            ) : (
              <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 stroke-red-500' : 'fill-white stroke-white'}`} />
            )}
            <span>{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true) }}
            className="flex items-center gap-1.5 text-white font-semibold text-sm"
          >
            <MessageCircle className="w-6 h-6 fill-white stroke-white" />
            <span>{comments.length}</span>
          </button>

          {/* Delete */}
          {isOwner && !confirmingDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfirmingDelete(true)
              }}
              className="flex items-center gap-1.5 text-white font-semibold text-sm"
            >
              <Trash2 className="w-6 h-6 text-red-400" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* 🔥 Inline Confirm UI */}
        {confirmingDelete && (
          <div
            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-sm font-semibold">
              Delete this post?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded"
              >
                {deleting ? (
                  <span className="flex items-center gap-1.5">
                    <ButtonLoader label="Deleting gallery post" />
                    Deleting...
                  </span>
                ) : 'Delete'}
              </button>

              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-3 py-1 bg-white text-black text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {open && (
        <GalleryModal
          item={item}
          currentUserId={currentUserId}
          liked={liked}
          likeCount={likeCount}
          onLikeChange={(newLiked, newCount) => {
            setLiked(newLiked)
            setLikeCount(newCount)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
