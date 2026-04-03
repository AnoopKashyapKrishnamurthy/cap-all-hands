'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EventSection } from '@/lib/types'

interface Props {
    eventId: string
}



export default function EventSectionsManager({ eventId }: Props) {
    const supabase = createClient()
    const [sections, setSections] = useState<EventSection[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [sectionType, setSectionType] = useState('')
    const [contentJson, setContentJson] = useState('{}')
    const [displayOrder, setDisplayOrder] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        fetchSections()
    }, [])

    const fetchSections = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('event_sections')
            .select('*')
            .eq('event_id', eventId)
            .order('display_order', { ascending: true })

        if (data) setSections(data)
        setLoading(false)
    }

    const resetForm = () => {
        setEditingId(null)
        setTitle('')
        setSectionType('about')
        setContentJson('{}')
        setDisplayOrder(sections.length)
        setIsVisible(true)
    }

    const handleEdit = (section: EventSection) => {
        setEditingId(section.id)
        setTitle(section.title || '')
        setSectionType(section.section_type)
        setContentJson(section.content ? JSON.stringify(section.content, null, 2) : '{}')
        setDisplayOrder(section.display_order)
        setIsVisible(section.is_visible)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return
        await supabase.from('event_sections').delete().eq('id', id)
        fetchSections()
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        let parsedContent = null
        try {
            parsedContent = JSON.parse(contentJson)
        } catch (err) {
            alert('Invalid JSON in content field. Please fix before saving.')
            return
        }

        const payload = {
            event_id: eventId,
            title: title || null,
            section_type: sectionType,
            content: parsedContent,
            display_order: displayOrder,
            is_visible: isVisible,
        }

        if (editingId) {
            await supabase.from('event_sections').update(payload).eq('id', editingId)
        } else {
            await supabase.from('event_sections').insert(payload)
        }

        resetForm()
        fetchSections()
    }

    if (loading) return <div>Loading sections...</div>

    return (
        <div className="space-y-8 mt-10 border-t pt-10">
            <h2 className="text-2xl font-bold">Manage Event Sections</h2>

            {/* List Existing Sections */}
            <div className="space-y-4">
                {sections.map((section) => (
                    <div key={section.id} className="border p-4 rounded-xl flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-semibold">{section.title || 'Untitled'} <span className="text-sm font-normal text-gray-500">({section.section_type})</span></p>
                            <p className="text-xs text-gray-500">Order: {section.display_order} | Visible: {section.is_visible ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="space-x-3">
                            <button onClick={() => handleEdit(section)} className="text-blue-600 hover:underline text-sm">Edit</button>
                            <button onClick={() => handleDelete(section.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add / Edit Form */}
            <form onSubmit={handleSave} className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Section' : 'Add New Section'}</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded p-2" placeholder="Section Title" />
                    </div>
                    <div>
                        <div>
                            <label className="block text-sm mb-1">Type *</label>

                            <input
                                type="text"
                                list="section-types"
                                value={sectionType}
                                onChange={(e) => setSectionType(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="e.g., about, Quiz, rules"
                                required
                            />
                        </div>

                    </div>
                    <div>
                        <label className="block text-sm mb-1">Display Order</label>
                        <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value))} className="w-full border rounded p-2" required />
                    </div>
                    <div className="flex items-center mt-6">
                        <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="mr-2" id="visible-check" />
                        <label htmlFor="visible-check">Is Visible</label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-1">Content (Valid JSON) *</label>
                    <textarea
                        value={contentJson}
                        onChange={(e) => setContentJson(e.target.value)}
                        rows={5}
                        className="w-full border rounded p-2 font-mono text-sm"
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        {editingId ? 'Update Section' : 'Add Section'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                    )}
                </div>
            </form>
        </div>
    )
}