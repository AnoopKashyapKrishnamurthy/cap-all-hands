'use client'

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Play, Pause, ArrowLeft } from "lucide-react"
import { PiHandsClapping } from "react-icons/pi"
import FadeInImage from '@/components/loading/FadeInImage'
import { ButtonLoader, InlineLoader } from '@/components/loading/LoadingPrimitives'
import { DetailSkeleton } from '@/components/loading/PageSkeletons'
import { startRouteTransition } from '@/components/loading/RouteLoadingIndicator'

/* TYPES */
interface Profile {
  display_name: string
  avatar_url?: string
}

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  cover_image?: string
  created_at: string
  published?: boolean
  author_id?: string
  profile?: Profile
}

interface Comment {
  id: string
  user_id: string
  payload: { text: string }
  user?: Profile
  created_at: string
}

interface ClapEntry {
  user_id: string
  count: number
  display_name?: string
  avatar_url?: string
}

/* HELPERS */
const cleanText = (text: string) =>
  text
    .replace(/[#_*>\-\[\]\(\)`]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')

const readingTime = (text: string) =>
  Math.max(1, Math.ceil(text.split(/\s+/).length / 200))

export default function BlogPage() {
  const { slug } = useParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [blog, setBlog] = useState<Blog | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [claps, setClaps] = useState(0)
  const [myClaps, setMyClaps] = useState(0)
  const [clapAnim, setClapAnim] = useState(false)
  const [showClapTooltip, setShowClapTooltip] = useState(false)

  // Clap detail modal
  const [showClapModal, setShowClapModal] = useState(false)
  const [clapEntries, setClapEntries] = useState<ClapEntry[]>([])
  const [loadingClaps, setLoadingClaps] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const [listening, setListening] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const [publishing, setPublishing] = useState(false)

  /* LOAD */
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id || null
      setUserId(uid)

      const { data: blogData } = await supabase
        .from("blogs")
        .select(`*, profile:user_profiles(display_name, avatar_url)`)
        .eq("slug", slug)
        .single()

      if (!blogData) {
        setInitialLoading(false)
        return
      }

      setBlog(blogData)
      setProfile(Array.isArray(blogData.profile) ? blogData.profile[0] : blogData.profile)

      /* CLAPS */
      const { data: clapData } = await supabase
        .from("interactions")
        .select("payload, user_id")
        .eq("target_id", blogData.id)
        .eq("target_type", "blogs")
        .eq("interaction_type", "like")

      const totalClaps =
        clapData?.reduce((sum, row) => sum + (row.payload?.count || 0), 0) || 0
      setClaps(totalClaps)

      if (uid) {
        const mine = clapData?.find((r) => r.user_id === uid)
        setMyClaps(mine?.payload?.count || 0)
      }


      if (!blogData.published && uid !== blogData.author_id) {
        startRouteTransition()
        router.push("/blogs")
        return
      }

      /* COMMENTS */
      if (blogData.published) {
        const { data: commentsData } = await supabase
          .from("interactions")
          .select(`*, user:user_profiles(display_name, avatar_url)`)
          .eq("target_id", blogData.id)
          .eq("target_type", "blogs")
          .eq("interaction_type", "comment")
          .order("created_at", { ascending: true })

        setComments(
          (commentsData || []).map((c: any) => ({
            ...c,
            user: Array.isArray(c.user) ? c.user[0] : c.user,
          }))
        )
      }

      setInitialLoading(false)
    }

    init()
  }, [router, slug, supabase])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") speechSynthesis.cancel()
    }
  }, [])

  /* 👏 CLAP */
  const handleClap = async () => {
    if (!userId || !blog) return

    setClaps((c) => c + 1)
    setMyClaps((c) => c + 1)
    setClapAnim(true)
    setTimeout(() => setClapAnim(false), 200)

    const { data: existing } = await supabase
      .from("interactions")
      .select("id, payload")
      .eq("user_id", userId)
      .eq("target_id", blog.id)
      .eq("target_type", "blogs")
      .eq("interaction_type", "like")
      .maybeSingle()

    if (existing) {
      const newCount = (existing.payload?.count || 0) + 1
      await supabase
        .from("interactions")
        .update({ payload: { count: newCount } })
        .eq("id", existing.id)
    } else {
      const { error } = await supabase.from("interactions").insert({
        user_id: userId,
        target_id: blog.id,
        target_type: "blogs",
        interaction_type: "like",
        payload: { count: 1 },
      })
      if (error) console.error("Clap update failed:", error)
    }
  }

  /* 👁 VIEW CLAPS MODAL */
  const openClapModal = async () => {
    if (!blog) return
    setShowClapModal(true)
    setLoadingClaps(true)

    const { data: clapData } = await supabase
      .from("interactions")
      .select(`payload, user_id, user:user_profiles(display_name, avatar_url)`)
      .eq("target_id", blog.id)
      .eq("target_type", "blogs")
      .eq("interaction_type", "like")

    const entries: ClapEntry[] = (clapData || []).map((r: any) => {
      const u = Array.isArray(r.user) ? r.user[0] : r.user
      return {
        user_id: r.user_id,
        count: r.payload?.count || 0,
        display_name: u?.display_name,
        avatar_url: u?.avatar_url,
      }
    }).sort((a, b) => b.count - a.count)

    setClapEntries(entries)
    setLoadingClaps(false)
  }

  /* 🔊 LISTEN */
  const toggleListen = () => {
    if (!blog) return

    if (listening) {
      speechSynthesis.cancel()
      setListening(false)
      return
    }

    // Wait for voices to load
    const speak = () => {
      const voices = speechSynthesis.getVoices()

      const preferred =
        voices.find(v => v.name === "Google UK English Female") ||
        voices.find(v => v.name === "Google US English") ||
        voices.find(v => v.lang === "en-GB") ||
        voices.find(v => v.lang.startsWith("en"))

      const utter = new SpeechSynthesisUtterance(cleanText(blog.content))
      if (preferred) utter.voice = preferred
      utter.rate = 0.92
      utter.pitch = 1.05
      utter.volume = 1
      utter.onend = () => setListening(false)

      speechRef.current = utter
      speechSynthesis.speak(utter)
      setListening(true)
    }

    // Voices may not be loaded yet on first call
    if (speechSynthesis.getVoices().length) {
      speak()
    } else {
      speechSynthesis.onvoiceschanged = speak
    }
  }

  /* 💬 ADD COMMENT */
  const addComment = async () => {
    if (!userId || !blog || !commentText.trim() || commentLoading) return
    setCommentLoading(true)

    try {
      const { data, error } = await supabase
        .from("interactions")
        .insert({
          user_id: userId,
          target_id: blog.id,
          target_type: "blogs",
          interaction_type: "comment",
          payload: { text: commentText.trim() },
        })
        .select(`*, user:user_profiles(display_name, avatar_url)`)
        .single()

      if (error || !data) return

      setComments((prev) => [
        ...prev,
        { ...data, user: Array.isArray(data.user) ? data.user[0] : data.user },
      ])
      setCommentText("")
    } finally {
      setCommentLoading(false)
    }
  }

  /* 💬 DELETE COMMENT */
  const deleteComment = async (id: string) => {
    if (deletingCommentId) return
    setDeletingCommentId(id)
    setComments((prev) => prev.filter((c) => c.id !== id))
    await supabase.from("interactions").delete().eq("id", id)
    setDeletingCommentId(null)
  }

  /* 📢 PUBLISH */

  const handlePublish = async () => {
    if (!blog) return
    setPublishing(true)
    const { error } = await supabase
      .from("blogs")
      .update({ published: true })
      .eq("id", blog.id)

    if (!error) setBlog((b) => b ? { ...b, published: true } : b)
    setPublishing(false)
  }

  if (initialLoading) return <DetailSkeleton />

  if (!blog) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-10 text-center">
        <p className="font-medium text-slate-700">Unable to load this blog.</p>
      </div>
    )
  }

  const isOwner = userId === blog.author_id
  const isDraft = !blog.published

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      {/* BACK */}
      <button
        onClick={() => {
          startRouteTransition()
          router.push("/blogs")
        }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        All blogs
      </button>

      {/* DRAFT BANNER + PUBLISH */}
      {isDraft && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
          <span>This post is a draft — only you can see it.</span>
          {isOwner && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="ml-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
            >
              {publishing ? (
                <span className="flex items-center gap-1.5">
                  <ButtonLoader label="Publishing blog" />
                  Publishing…
                </span>
              ) : "Publish"}
            </button>
          )}
        </div>
      )}

      <h1 className="text-4xl font-bold">{blog.title}</h1>

      {/* AUTHOR */}
      <div className="flex items-center gap-3 mt-6 text-sm text-gray-500">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
            {profile?.display_name?.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{profile?.display_name}</p>
          <p>{formattedDate} · {readingTime(blog.content)} min read</p>
        </div>
      </div>

      {/* ACTIONS */}
      {blog.published && (
        <div className="flex justify-between border-y py-4 mt-8">

          {/* CLAP BUTTON + COUNT */}
          <div className="flex items-center gap-3">

            {/* Clap button with "your clap count" tooltip */}
            <div className="relative">
              <button
                onClick={handleClap}
                onMouseEnter={() => setShowClapTooltip(true)}
                onMouseLeave={() => setShowClapTooltip(false)}
                className={`flex items-center gap-2 transition-transform ${clapAnim ? 'scale-125' : 'scale-100'}`}
              >
                <PiHandsClapping className="w-6 h-6" />
              </button>

              {/* Tooltip: your clap count */}
              {showClapTooltip && userId && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none">
                  {myClaps > 0 ? `You clapped ${myClaps}×` : "Clap for this"}
                </div>
              )}
            </div>

            {/* Total clap count with "View claps" tooltip */}
            <div className="relative group/count">
              <button
                onClick={openClapModal}
                className="font-medium text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                {claps}
              </button>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none opacity-0 group-hover/count:opacity-100 transition-opacity">
                View claps
              </div>
            </div>

          </div>

          {/* LISTEN */}
          <button
            onClick={toggleListen}
            className="flex items-center gap-2 text-sm"
          >
            {listening ? <Pause size={18} /> : <Play size={18} />}
            {listening ? 'Pause' : 'Listen'}
          </button>
        </div>
      )}

      {blog.cover_image && (
        <FadeInImage
          src={blog.cover_image}
          alt={blog.title}
          containerClassName="mt-10 aspect-video w-full rounded-xl"
          className="h-full w-full object-cover"
        />
      )}

      <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 mt-12">
        <article className="
    prose 
    prose-stone 
    max-w-none 
    sm:prose-lg 
    lg:prose-xl 
    prose-headings:font-serif 
    prose-headings:font-bold 
    prose-headings:tracking-tight 
    prose-p:font-serif 
    prose-p:text-gray-800 
    prose-p:leading-relaxed 
    prose-a:text-green-700 
    prose-a:no-underline 
    hover:prose-a:underline 
    prose-img:rounded-sm
    prose-blockquote:border-l-black 
    prose-blockquote:italic
    selection:bg-green-100
  ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blog.content}
          </ReactMarkdown>
        </article>
      </div>
      {/* COMMENTS */}
      {blog.published && (
        <div className="mt-16 space-y-6">
          <h3 className="font-semibold">Responses ({comments.length})</h3>

          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              {c.user?.avatar_url ? (
                <img src={c.user.avatar_url} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {c.user?.display_name?.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">{c.user?.display_name}</p>
                  {userId === c.user_id && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      disabled={deletingCommentId === c.id}
                      className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deletingCommentId === c.id ? <ButtonLoader label="Deleting comment" /> : 'Delete'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</p>
                <p className="text-sm mt-1">{c.payload.text}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-3 mt-6">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              disabled={commentLoading}
              placeholder="Write a response..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              onClick={addComment}
              disabled={commentLoading || !commentText.trim()}
              className="bg-black text-white px-4 py-2 rounded-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentLoading ? <ButtonLoader label="Posting comment" /> : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* CLAP MODAL */}
      {showClapModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowClapModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Claps</h2>
              <button
                onClick={() => setShowClapModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {loadingClaps ? (
              <div className="flex justify-center py-8"><InlineLoader label="Loading claps…" /></div>
            ) : clapEntries.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No claps yet.</div>
            ) : (
              <ul className="space-y-3 max-h-72 overflow-y-auto">
                {clapEntries.map((e) => (
                  <li key={e.user_id} className="flex items-center gap-3">
                    {e.avatar_url ? (
                      <img src={e.avatar_url} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {e.display_name?.charAt(0)}
                      </div>
                    )}
                    <span className="flex-1 text-sm font-medium">{e.display_name}</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <PiHandsClapping className="w-4 h-4" />
                      {e.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
