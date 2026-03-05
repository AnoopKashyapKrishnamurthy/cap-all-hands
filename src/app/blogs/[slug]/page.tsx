import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { protectRoute } from "@/lib/auth"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params

  // 🔒 Require login
  const user = await protectRoute()
  const currentUserId = user.id

  const supabase = await createClient()

  const { data: blog, error } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      slug,
      content,
      cover_image,
      created_at,
      author_id,
      published,
      profile:user_profiles (
        display_name,
        avatar_url
      )
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Blog fetch error:", error)
    notFound()
    return null
  }

  if (!blog) {
    notFound()
    return null
  }

  // Draft protection
  if (!blog.published && blog.author_id !== currentUserId) {
    notFound()
    return null
  }

  // Normalize profile (same pattern as BlogsPage)
  const profile = Array.isArray(blog.profile)
    ? blog.profile[0]
    : blog.profile ?? undefined

  const wordCount = blog.content?.split(/\s+/).length || 0
  const readTime = Math.ceil(wordCount / 200)

  const createdDate = new Date(blog.created_at)
  const formattedDate = createdDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = createdDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <article className="max-w-3xl mx-auto py-16 px-6">

      {!blog.published && (
        <div className="mb-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-sm">
          Draft Preview – Only visible to you
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900">
        {blog.title}
      </h1>

      {/* Author Section */}
      <div className="mt-8 flex items-center gap-4 border-b pb-6">

        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || "Author"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
              {profile?.display_name?.charAt(0) || "A"}
            </div>
          )}
        </div>

        <div>
          <p className="font-medium text-gray-900">
            {profile?.display_name || "Unknown Author"}
          </p>
          <p className="text-sm text-gray-500">
            {formattedDate} · {formattedTime} · {readTime} min read
          </p>
        </div>

        {blog.author_id === currentUserId && (
          <span className="ml-auto text-xs font-medium bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            You are the author
          </span>
        )}
      </div>

      {blog.cover_image && (
        <div className="mt-10">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="rounded-3xl w-full object-cover max-h-[500px] shadow-sm"
          />
        </div>
      )}

      <div className="prose prose-blue prose-lg max-w-none mt-12 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {blog.content}
        </ReactMarkdown>
      </div>

      <div className="my-16 border-t border-gray-200" />

      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition">
          ❤️ Like
        </button>

        <span className="text-sm text-gray-400">
          Comments coming soon
        </span>
      </div>

    </article>
  )
}