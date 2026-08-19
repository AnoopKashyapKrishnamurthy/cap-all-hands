'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EventSection } from '@/lib/types'
import Link from 'next/link'
import { ButtonLoader, Skeleton } from '@/components/loading/LoadingPrimitives'

interface Props {
    eventId: string
}

type ContentItem = {
    id: string
    key: string
    value: string
}

function ContentBuilder({
    items,
    setItems,
}: {
    items: ContentItem[]
    setItems: React.Dispatch<React.SetStateAction<ContentItem[]>>
}) {
    const addItem = () => {
        setItems(prev => [
            ...prev,
            { id: crypto.randomUUID(), key: '', value: '' },
        ])
    }

    const updateItem = (
        id: string,
        field: 'key' | 'value',
        val: string
    ) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: val } : item
            )
        )
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="flex gap-2 items-start">
                    <input
                        value={item.key}
                        onChange={e => updateItem(item.id, 'key', e.target.value)}
                        placeholder="Key (e.g. Description, Speaker 1)"
                        className="w-1/3 border rounded-lg p-2 text-sm mt-1"
                    />
                    {/* Changed to textarea to support paragraphs of text */}
                    <textarea
                        value={item.value}
                        onChange={e => updateItem(item.id, 'value', e.target.value)}
                        placeholder="Value..."
                        rows={2}
                        className="flex-1 border rounded-lg p-2 text-sm mt-1 resize-y min-h-[40px]"
                    />
                    <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-3"
                        title="Remove Item"
                    >
                        ✕
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={addItem}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
                + Add field
            </button>
        </div>
    )
}

export default function EventSectionsManager({ eventId }: Props) {
    // Note: createClient in App Router inside components is generally fine without useMemo, 
    // but useMemo won't hurt here.
    const supabase = useMemo(() => createClient(), [])

    const [sections, setSections] = useState<EventSection[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [sectionType, setSectionType] = useState('')
    const [items, setItems] = useState<ContentItem[]>([])
    const [displayOrder, setDisplayOrder] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    const fetchSections = useCallback(async () => {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
            .from('event_sections')
            .select('*')
            .eq('event_id', eventId)
            .order('display_order', { ascending: true })

        if (error) {
            setError(error.message)
        } else {
            setSections(data ?? [])
            setDisplayOrder(data ? data.length : 0)
        }

        setLoading(false)
    }, [eventId, supabase])

    useEffect(() => {
        fetchSections()
    }, [fetchSections])

    const resetForm = useCallback(() => {
        const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) : -1
        setEditingId(null)
        setTitle('')
        setSectionType('')
        setItems([])
        setDisplayOrder(maxOrder + 1)
        setIsVisible(true)
        setError(null)
    }, [sections])

    const handleEdit = (section: EventSection) => {
        setEditingId(section.id)
        setTitle(section.title ?? '')
        setSectionType(section.section_type)

        const contentItems =
            (section.content as any)?.items?.map((item: any) => ({
                id: crypto.randomUUID(),
                key: item.key || '',
                value: item.value || '',
            })) || []

        setItems(contentItems)
        setDisplayOrder(section.display_order)
        setIsVisible(section.is_visible)
        setError(null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this section?')) return
        if (deletingId) return
        setDeletingId(id)

        const { error } = await supabase
            .from('event_sections')
            .delete()
            .eq('id', id)

        if (error) {
            setError(error.message)
            setDeletingId(null)
            return
        }

        setSections(prev => prev.filter(s => s.id !== id))
        // If they deleted the one they were editing, reset the form
        if (editingId === id) resetForm()
        setDeletingId(null)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (saving) return

        if (!sectionType.trim()) {
            setError('Section type is required.')
            return
        }

        setSaving(true)
        setError(null)

        const payload = {
            event_id: eventId,
            title: title.trim() || null,
            section_type: sectionType.trim().toLowerCase(),
            content: {
                items: items.map(({ key, value }) => ({
                    key: key.trim(),
                    value,
                })),
            },
            display_order: displayOrder,
            is_visible: isVisible,
        }

        const { error } = editingId
            ? await supabase
                .from('event_sections')
                .update(payload)
                .eq('id', editingId)
            : await supabase.from('event_sections').insert(payload)

        setSaving(false)

        if (error) {
            setError(error.message)
            return
        }

        resetForm()
        fetchSections()
    }

    if (loading) {
        return (
            <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading event sections">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <span className="sr-only">Loading event sections</span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sections</h2>
                <p className="text-sm text-gray-500">
                    Add and organize sections like agenda, speakers, FAQs
                </p>
                <span className="text-sm text-gray-500">
                    {sections.length} items
                </span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* List Existing Sections */}
            {sections.length > 0 && (
                <div className="space-y-3">
                    {sections.map(section => (
                        <div
                            key={section.id}
                            className={`border rounded-xl p-4 flex justify-between items-center transition-colors ${editingId === section.id ? 'border-blue-400 bg-blue-50' : 'bg-white'}`}
                        >
                            <div>
                                <p className="font-medium text-gray-900">
                                    {section.title || 'Untitled'}
                                    {!section.is_visible && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Hidden</span>}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {section.section_type} · Order {section.display_order}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleEdit(section)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(section.id)}
                                    disabled={deletingId === section.id}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    {deletingId === section.id ? <ButtonLoader label="Deleting section" /> : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Form */}
            <form
                onSubmit={handleSave}
                className="bg-gray-50/50 border rounded-2xl p-6 space-y-5"
            >
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {editingId ? 'Edit Section' : 'Add New Section'}
                    </h3>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Cancel Editing
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Section Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. About Our Event"
                            className="w-full border p-2 rounded-lg text-sm bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Section Type *</label>
                        <input
                            list="section-types"
                            value={sectionType}
                            onChange={e => setSectionType(e.target.value)}
                            placeholder="e.g. about, agenda, speakers"
                            required
                            className="w-full border p-2 rounded-lg text-sm bg-white"
                        />
                        {/* Adding datalist back so users get autocomplete suggestions */}
                        <datalist id="section-types">
                            <option value="about" />
                            <option value="agenda" />
                            <option value="speakers" />
                            <option value="faq" />
                            <option value="gallery" />
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Display Order</label>
                        <input
                            type="number"
                            value={displayOrder}
                            onChange={e => {
                                const val = Number(e.target.value)
                                setDisplayOrder(isNaN(val) ? 0 : val)
                            }}
                            className="w-full border p-2 rounded-lg text-sm bg-white"
                        />
                    </div>

                    <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={e => setIsVisible(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Visible to Public</span>
                        </label>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Content Data</label>
                    <ContentBuilder items={items} setItems={setItems} />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <ButtonLoader label="Saving section" />
                                Saving…
                            </span>
                        ) : editingId ? 'Update Section' : 'Add Section'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <Link
                href={`/events/${eventId}`}
                className="text-sm text-blue-600 hover:underline"
            >
                ← Back to Event
            </Link>
        </div>
    )
}
