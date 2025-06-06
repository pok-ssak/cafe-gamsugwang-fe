export interface MenuItem {
  id: number
  name: string
  menuImageUrl: string
  price: number
}

export interface Place {
  id: number
  title: string
  address: string
  imageUrl: string
  rate: number
  openTime: string
  phoneNumber: string
  lat: number
  lon: number
  description: string
  reviewCount: number
  isBookmarked?: boolean
  keywordList?: { keyword: string }[]
  menu?: MenuItem[]
  profileImageUrl?: string | null
} 