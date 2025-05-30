export interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
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
  menu: MenuItem[]
  keywordList?: string[]
} 