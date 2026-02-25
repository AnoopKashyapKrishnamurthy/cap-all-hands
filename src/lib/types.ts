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