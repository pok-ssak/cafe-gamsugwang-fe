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
  rating: number
  openTime: string
  phoneNumber: string
  lat: number
  lon: number
  description: string
  ratingCount: number
  menu: MenuItem[]
} 