import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { protectRoute } from "@/lib/auth"
import BlogCard from "@/components/blogs/BlogCard"
import { Blog } from "@/lib/types"

export const revalidate = 60

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
  const transform = (blog: any): Blog => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    cover_image: blog.cover_image,
    created_at: blog.created_at,
    author_id: blog.author_id,
    published: blog.published,
    profile: Array.isArray(blog.profile)
      ? blog.profile[0]
      : blog.profile ?? undefined,
  })

  const publishedBlogs: Blog[] =
    (publishedData ?? []).map(transform)

  const draftBlogs: Blog[] =
    (draftData ?? []).map(transform)

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">

      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            CAP All-Hands Blog
          </h1>
          <p className="mt-3 text-gray-500">
            Insights, updates, and community stories.
          </p>
        </div>

        <Link
          href="/blogs/new"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
        >
          + Create Blog
        </Link>
      </div>

      {/* Drafts */}
      {draftBlogs.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">
            📝 My Drafts
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {draftBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                currentUserId={user.id}
                isDraft
              />
            ))}
          </div>
        </div>
      )}

      {/* Published */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">
          📖 Published Blogs
        </h2>

        {publishedBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                currentUserId={user.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No published blogs yet.
          </p>
        )}
      </div>

    </div>
  )
}