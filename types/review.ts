export interface Review {
  id: number
  userId: number
  nickname: string
  rating: number
  reviewCount: number
  content: string
  createdAt: string
  imageUrl?: string
  likedByUser: boolean
  likeCount: number
} 