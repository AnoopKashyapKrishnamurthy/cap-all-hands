'use client'

import { useState } from 'react'
import { GalleryItem } from '@/lib/types'
import GalleryCard from './GalleryCard'

interface GalleryGridProps {
  items: GalleryItem[]
  currentUserId: string
}

export default function GalleryGrid({ items: initialItems, currentUserId }: GalleryGridProps) {
  const [items, setItems] = useState(initialItems)

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed rounded-2xl p-16 text-center bg-white">
        <p className="text-gray-700 text-lg font-medium mb-2">No photos yet</p>
        <p className="text-gray-500 mb-6">Be the first to share something with the team ✨</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {items.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
          currentUserId={currentUserId}
          onDelete={handleDelete} // 🔥 THIS FIXES YOUR ISSUE
        />
      ))}
    </div>
  )
}