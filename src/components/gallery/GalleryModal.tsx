'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Heart, MessageCircle, Trash2, Send, ArrowLeft } from 'lucide-react'
import { GalleryItem, Interaction } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface GalleryModalProps {
    item: GalleryItem
    currentUserId: string
    liked: boolean
    likeCount: number
    onLikeChange: (liked: boolean, count: number) => void
    onClose: () => void
}

interface LikerProfile {
    user_id: string
    display_name: string
    avatar_url: string | null
}

type PanelView = 'main' | 'likers'

function Avatar({ url, name, size = 8 }: { url?: string | null; name: string; size?: number }) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    const px = size * 4
    if (url) {
        return (
            <Image
                src={url}
                alt={name}
                width={px}
                height={px}
                className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
            />
        )
    }
    return (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
        </div>
    )
}

export default function GalleryModal({
    item,
    currentUserId,
    liked,
    likeCount,
    onLikeChange,
    onClose,
}: GalleryModalProps) {
    const supabase = createClient()

    const [localLiked, setLocalLiked] = useState(liked)
    const [localLikeCount, setLocalLikeCount] = useState(likeCount)
    const [likeLoading, setLikeLoading] = useState(false)

    const initialComments = item.interactions.filter((i) => i.interaction_type === 'comment')
    const [comments, setComments] = useState<Interaction[]>(initialComments)
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)

    // Likers panel
    const [panelView, setPanelView] = useState<PanelView>('main')
    const [likers, setLikers] = useState<LikerProfile[]>([])
    const [likersLoading, setLikersLoading] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const commentsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                if (panelView === 'likers') setPanelView('main')
                else onClose()
            }
        }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
    }, [onClose, panelView])

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments.length])

    const toggleLike = async () => {
        if (likeLoading) return
        setLikeLoading(true)
        if (localLiked) {
            await supabase.from('interactions').delete()
                .eq('user_id', currentUserId).eq('target_id', item.id)
                .eq('target_type', 'gallery').eq('interaction_type', 'like')
            setLocalLiked(false)
            setLocalLikeCount((c) => c - 1)
            onLikeChange(false, localLikeCount - 1)
            // Remove from likers list if visible
            setLikers((prev) => prev.filter((l) => l.user_id !== currentUserId))
        } else {
            await supabase.from('interactions').insert({
                user_id: currentUserId, target_id: item.id,
                target_type: 'gallery', interaction_type: 'like', payload: {},
            })
            setLocalLiked(true)
            setLocalLikeCount((c) => c + 1)
            onLikeChange(true, localLikeCount + 1)
        }
        setLikeLoading(false)
    }

    const openLikers = async () => {
        if (localLikeCount === 0) return
        setPanelView('likers')
        if (likers.length > 0) return // already fetched
        setLikersLoading(true)
        const { data } = await supabase
            .from('interactions')
            .select(`user_id, profile:user_profiles ( display_name, avatar_url )`)
            .eq('target_id', item.id)
            .eq('target_type', 'gallery')
            .eq('interaction_type', 'like')
            .order('created_at', { ascending: false })

        if (data) {
            setLikers(data.map((d: any) => ({
                user_id: d.user_id,
                display_name: (Array.isArray(d.profile) ? d.profile[0] : d.profile)?.display_name ?? 'Team Member',
                avatar_url: (Array.isArray(d.profile) ? d.profile[0] : d.profile)?.avatar_url ?? null,
            })))
        }
        setLikersLoading(false)
    }

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        const text = commentText.trim()
        if (!text || commentLoading) return
        setCommentLoading(true)
        setCommentText('')

        const { data, error } = await supabase
            .from('interactions')
            .insert({
                user_id: currentUserId,
                target_id: item.id,
                target_type: 'gallery',
                interaction_type: 'comment',
                payload: { text },
            })
            .select(`*, profile:user_profiles ( display_name, avatar_url )`)
            .single()

        if (!error && data) {
            setComments((prev) => [...prev, {
                ...data,
                profile: Array.isArray(data.profile) ? data.profile[0] : data.profile ?? undefined,
            }])
        }
        setCommentLoading(false)
    }

    const deleteComment = async (commentId: string) => {
        await supabase.from('interactions').delete()
            .eq('id', commentId).eq('user_id', currentUserId)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
    }

    const uploader = item.profile
    const uploaderName = uploader?.display_name ?? 'Team Member'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 sm:p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
            >
                <X className="w-5 h-5" />
            </button>

            <div
                className="flex flex-col md:flex-row w-full h-full md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── LEFT: Image ─────────────────────────────────────────────── */}
                <div className="relative bg-black flex-shrink-0 w-full md:w-[65%] h-[50vh] md:h-auto md:min-h-[600px]">
                    <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 65vw"
                        priority
                    />
                    {item.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4 pointer-events-none">
                            <p className="text-white font-semibold text-base leading-snug drop-shadow">
                                {item.title}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Panel ─────────────────────────────────────────────── */}
                <div className="flex flex-col w-full md:w-[35%] bg-white md:min-w-[320px] min-h-0 max-h-[50vh] md:max-h-none">

                    {panelView === 'main' ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0">
                                <Avatar url={uploader?.avatar_url} name={uploaderName} size={9} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{uploaderName}</p>
                                    <p className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            {/* Caption + Comments */}
                            <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-5">
                                {item.description && (
                                    <div className="flex gap-3">
                                        <Avatar url={uploader?.avatar_url} name={uploaderName} size={8} />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-sm mr-1.5">{uploaderName}</span>
                                            <span className="text-sm text-gray-700 break-words">{item.description}</span>
                                        </div>
                                    </div>
                                )}

                                {comments.length === 0 && !item.description && (
                                    <p className="text-xs text-gray-400 text-center py-6">No comments yet. Be the first!</p>
                                )}

                                {comments.map((comment) => {
                                    const commenterName = comment.profile?.display_name ?? 'Team Member'
                                    const isOwner = comment.user_id === currentUserId
                                    return (
                                        <div key={comment.id} className="flex gap-3 group">
                                            <Avatar url={comment.profile?.avatar_url} name={commenterName} size={8} />
                                            <div className="flex-1 min-w-0">
                                                <span className="font-semibold text-sm mr-1.5">{commenterName}</span>
                                                <span className="text-sm text-gray-700 break-words">{comment.payload.text}</span>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {isOwner && (
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                                <div ref={commentsEndRef} />
                            </div>

                            {/* Actions bar */}
                            <div className="border-t px-4 pt-3 pb-2 flex-shrink-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <button
                                        onClick={toggleLike}
                                        disabled={likeLoading}
                                        className="transition-transform active:scale-90 disabled:opacity-50"
                                    >
                                        <Heart
                                            className={`w-6 h-6 transition-colors ${
                                                localLiked
                                                    ? 'fill-red-500 stroke-red-500'
                                                    : 'stroke-gray-700 hover:stroke-red-400'
                                            }`}
                                        />
                                    </button>
                                    <button onClick={() => inputRef.current?.focus()}>
                                        <MessageCircle className="w-6 h-6 stroke-gray-700 hover:stroke-blue-400 transition-colors" />
                                    </button>
                                </div>

                                {/* Clickable likes count */}
                                <button
                                    onClick={openLikers}
                                    disabled={localLikeCount === 0}
                                    className="text-sm font-semibold text-gray-900 hover:underline disabled:cursor-default disabled:no-underline"
                                >
                                    {localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}
                                </button>

                                {comments.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                                    </p>
                                )}
                            </div>

                            {/* Comment input */}
                            <form
                                onSubmit={submitComment}
                                className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment…"
                                    className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
                                    maxLength={500}
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || commentLoading}
                                    className="text-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    ) : (
                        /* ── Likers Panel ─────────────────────────────────────── */
                        <>
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0">
                                <button
                                    onClick={() => setPanelView('main')}
                                    className="text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 fill-red-500 stroke-red-500" />
                                    <p className="font-semibold text-sm text-gray-900">
                                        {localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-1">
                                {likersLoading ? (
                                    <div className="flex flex-col gap-3 pt-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                                                <div className="h-3 bg-gray-200 rounded w-32" />
                                            </div>
                                        ))}
                                    </div>
                                ) : likers.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-8">No likes yet</p>
                                ) : (
                                    likers.map((liker) => (
                                        <div key={liker.user_id} className="flex items-center gap-3 py-2 rounded-xl hover:bg-gray-50 transition-colors px-1">
                                            <Avatar url={liker.avatar_url} name={liker.display_name} size={10} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {liker.display_name}
                                                </p>
                                                {liker.user_id === currentUserId && (
                                                    <p className="text-xs text-gray-400">You</p>
                                                )}
                                            </div>
                                            {liker.user_id === currentUserId && (
                                                <Heart className="w-4 h-4 fill-red-400 stroke-red-400 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}