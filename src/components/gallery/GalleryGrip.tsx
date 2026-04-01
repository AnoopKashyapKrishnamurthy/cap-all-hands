'use client'

import { GalleryItem } from '@/lib/types'
import GalleryCard from './GalleryCard'

interface GalleryGridProps {
  items: GalleryItem[]
  currentUserId: string
}

export default function GalleryGrid({ items, currentUserId }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed rounded-2xl p-16 text-center">
        <p className="text-gray-700 text-lg font-medium mb-2">No photos yet</p>
        <p className="text-gray-500 mb-6">Be the first to share something with the team ✨</p>
      </div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} currentUserId={currentUserId} />
      ))}
    </div>
  )
}