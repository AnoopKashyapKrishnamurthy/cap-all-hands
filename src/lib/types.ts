export interface Review {
  id: string
  review_title: string
  book_title: string
  book_author: string
  rating: number
  review_text: string
  media_urls: string[] | null
  user_id: string
  created_at: string
  profile?: {
    display_name: string
    avatar_url: string | null
  }
}


export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  cover_image: string | null
  created_at: string
  author_id: string
  published: boolean
  profile?: {
    display_name: string
    avatar_url: string | null
  }
}

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  image_url: string
  uploaded_by: string
  created_at: string
  profile?: {
    display_name: string
    avatar_url: string | null
  }
  interactions: Interaction[]
}

export type InteractionType = 'like' | 'participant' | 'host' | 'comment'
export type TargetType = 'events' | 'blog' | 'review' | 'gallery'// extend as needed



export interface Interaction {
  id: string
  user_id: string
  target_id: string
  target_type: TargetType
  interaction_type: InteractionType
  payload: {
    text?: string
    [key: string]: unknown
  }
  created_at: string


  profile?: {
    display_name: string
    avatar_url: string | null
  }
}


export interface EventSection {
  id: string
  event_id: string
  section_type: string
  title: string | null
  content: any | null // Represents the JSONB content
  display_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

// Update your existing Event interface to optionally include sections
export interface Event {
  id: string
  creator_id: string
  title: string
  description: string | null
  event_date: string
  location: string | null
  image_url: string | null
  image_storage_path: string | null
  created_at: string
  updated_at: string
  presentation_url: string | null
  profile?: {
    display_name: string
    avatar_url: string | null
  }
  event_sections?: EventSection[] // Added this line
}