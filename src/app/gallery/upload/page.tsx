import Link from 'next/link'
import { protectRoute } from '@/lib/auth'
import GalleryUploadForm from '@/components/gallery/GalleryUploadForm'

export const metadata = {
  title: 'Upload Photo - CAP All-Hands',
}

export default async function GalleryUploadPage() {
  await protectRoute()

  return (
    <section className="max-w-2xl mx-auto space-y-10 py-16 px-6">
      <div className="space-y-3">
        <Link href="/gallery" className="text-sm text-blue-600 hover:underline">
          ← Back to Gallery
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Upload Photo
        </h1>
        <p className="text-gray-600">Share an image with the team.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">
        <GalleryUploadForm />
      </div>
    </section>
  )
}