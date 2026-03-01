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