export interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
}

export interface Place {
  id: number
  name: string
  address: string
  imageUrl: string
  rating: number
  businessHours: string
  phone: string
  latitude: number
  longitude: number
  description: string
  reviewCount: number
  menu: MenuItem[]
} 