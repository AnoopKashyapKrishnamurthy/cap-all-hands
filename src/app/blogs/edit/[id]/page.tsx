import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { protectRoute } from '@/lib/auth'
import BlogForm from '@/components/blogs/BlogForm'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBlogPage({ params }: EditPageProps) {
  const { id } = await params
  const user = await protectRoute()
  const supabase = await createClient()

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !blog) {
    notFound()
  }

  // 🔐 Only author can edit
  if (blog.author_id !== user.id) {
    notFound()
  }

  return (
    <section className="max-w-4xl mx-auto space-y-10 py-16 px-6">

      <div className="space-y-3">
        <Link
          href="/blogs"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Blogs
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Edit Blog
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">
        <BlogForm blog={blog} />
      </div>

    </section>
  )
}