import Link from 'next/link'
import BlogForm from '@/components/blogs/BlogForm'
import { protectRoute } from '@/lib/auth'

export const metadata = {
  title: 'Create Blog - CAP All-Hands',
}

export default async function NewBlogPage() {
  await protectRoute()

  return (
    <section className="max-w-4xl mx-auto space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/blogs"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Blogs
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Create New Blog
        </h1>

        <p className="text-gray-600">
          Share insights, updates, or stories with the community.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">
        <BlogForm />
      </div>

    </section>
  )
}