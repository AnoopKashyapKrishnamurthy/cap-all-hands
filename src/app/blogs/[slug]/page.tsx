import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPage({ params }: BlogPageProps) {
  // ✅ Next.js 15: await params
  const { slug } = await params

  const supabase = await createClient()

  // Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch blog by slug (NO published filter here)
  const { data: blog, error } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      content,
      cover_image,
      created_at,
      author_id,
      published
    `)
    .eq("slug", slug)
    .single()

  if (error || !blog) {
    notFound()
  }

  // 🚨 If draft and not author → block
  if (!blog.published && blog.author_id !== user?.id) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto py-16 px-6">

      {/* Draft Banner */}
      {!blog.published && (
        <div className="mb-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-sm">
          Draft Preview – Only visible to you
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight leading-tight">
        {blog.title}
      </h1>

      <p className="mt-4 text-sm text-gray-400">
        Published on {new Date(blog.created_at).toDateString()}
      </p>

      {/* Cover Image */}
      {blog.cover_image && (
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="mt-8 rounded-2xl w-full object-cover max-h-[400px]"
        />
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mt-10"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <div className="my-12 border-t" />

      {/* Engagement Section */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition">
          ❤️ Like
        </button>

        <span className="text-sm text-gray-400">
          Comments coming soon
        </span>
      </div>

      {/* Comments Placeholder */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Discussion</h3>

        <div className="border rounded-xl p-6 text-gray-500 text-sm">
          Comments system will be added here.
        </div>
      </div>

    </article>
  )
}