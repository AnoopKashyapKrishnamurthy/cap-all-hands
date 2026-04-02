export interface Review {
  id: string
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
}

export type InteractionType = 'like' | 'participant' | 'host' | 'comment'
export type TargetType = 'event' | 'blog' | 'review' // extend as needed

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
  profile?: {
    display_name: string
    avatar_url: string | null
  }
}

export interface Interaction {
  id: string
  user_id: string
  target_id: string
  target_type: TargetType
  interaction_type: InteractionType
  payload: Record<string, unknown>
  created_at: string
}