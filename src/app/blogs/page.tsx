import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { protectRoute } from "@/lib/auth"
import BlogCard from "@/components/blogs/BlogCard"
import { Blog } from "@/lib/types"

export const revalidate = 60

// 🧠 Helper: Strip Markdown
function stripMarkdown(markdown: string) {
  return markdown
    .replace(/[#_*>\-\[\]\(\)`]/g, "")
    .replace(/\n+/g, " ")
    .trim()
}

// 🧠 Helper: Create excerpt
function createExcerpt(content: string, length = 160) {
  const plain = stripMarkdown(content)
  return plain.length > length
    ? plain.slice(0, length) + "..."
    : plain
}

export default async function BlogsPage() {
  const supabase = await createClient()
  const user = await protectRoute()

  /* -------------------- FETCH PUBLISHED -------------------- */
  const { data: publishedData, error: publishedError } = await supabase
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
    .eq("published", true)
    .order("created_at", { ascending: false })

  /* -------------------- FETCH DRAFTS -------------------- */
  const { data: draftData, error: draftError } = await supabase
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
    .eq("author_id", user.id)
    .eq("published", false)
    .order("created_at", { ascending: false })

  if (publishedError || draftError) {
    console.error(publishedError || draftError)
  }

  /* -------------------- NORMALIZE PROFILE SAFELY -------------------- */
  const transform = (blog: any): Blog & {
    excerpt: string
    readTime: number
  } => {
    const profile = Array.isArray(blog.profile)
      ? blog.profile[0]
      : blog.profile ?? undefined

    const wordCount = blog.content?.split(/\s+/).length || 0
    const readTime = Math.ceil(wordCount / 200)

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      cover_image: blog.cover_image,
      created_at: blog.created_at,
      author_id: blog.author_id,
      published: blog.published,
      profile,
      excerpt: createExcerpt(blog.content),
      readTime,
    }
  }

  const publishedBlogs = (publishedData ?? []).map(transform)
  const draftBlogs = (draftData ?? []).map(transform)

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">

      {/* Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            CAP All-Hands Blog
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl">
            Insights, updates, and stories from our team.
          </p>
        </div>

        <Link
          href="/blogs/new"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
        >
          + Create Blog
        </Link>
      </div>

      {/* Drafts Section */}
      {draftBlogs.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">
              📝 My Drafts
            </h2>
            <span className="text-sm text-gray-400">
              {draftBlogs.length} draft{draftBlogs.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {draftBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                currentUserId={user.id}
                isDraft
              />
            ))}
          </div>
        </section>
      )}

      {/* Published Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">
            📖 Published Blogs
          </h2>
          <span className="text-sm text-gray-400">
            {publishedBlogs.length} blog{publishedBlogs.length > 1 ? "s" : ""}
          </span>
        </div>

        {publishedBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {publishedBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                currentUserId={user.id}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed rounded-2xl p-16 text-center bg-gray-50">
            <p className="text-gray-600 text-lg font-medium mb-3">
              No published blogs yet
            </p>
            <p className="text-gray-500 mb-6">
              Be the first to share insights with the team.
            </p>
            <Link
              href="/blogs/new"
              className="inline-flex items-center bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Create First Blog
            </Link>
          </div>
        )}
      </section>

    </div>
  )
}