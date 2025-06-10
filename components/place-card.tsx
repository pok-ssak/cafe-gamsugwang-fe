import { Star, MapPin, Heart } from "lucide-react"
import { Place } from "@/types/place"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import Image from "next/image"
import { useState } from "react"
import axiosInstance from "@/lib/axios"
import { useRouter } from "next/navigation"

interface PlaceCardProps {
  place: Place
  onClick: (place: Place) => void
  variant?: 'scroll' | 'grid'
  onBookmarkChange?: (placeId: number, isBookmarked: boolean) => void
}

export function PlaceCard({ place, onClick, variant = 'grid', onBookmarkChange }: PlaceCardProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(place.isBookmarked || false)
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false)

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // 클릭 이벤트 전파 방지
    
    try {
      setIsBookmarkLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        if (confirm("북마크를 추가하려면 로그인이 필요합니다. 로그인하시겠습니까?")) {
          router.push("/login")
        }
        return
      }

      if (isBookmarked) {
        // 북마크 삭제
        await axiosInstance.delete(`/api/v1/bookmarks/${place.id}`)
      } else {
        // 북마크 추가
        await axiosInstance.post(`/api/v1/bookmarks/${place.id}`)
      }

      const newBookmarkState = !isBookmarked
      setIsBookmarked(newBookmarkState)
      onBookmarkChange?.(place.id, newBookmarkState)
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    } finally {
      setIsBookmarkLoading(false)
    }
  }

  return (
    <div
      className={`flex-none bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
        variant === 'scroll' ? 'w-64' : 'w-full min-w-[140px] max-w-[280px]'
      }`}
      onClick={() => onClick(place)}
    >
      <div className="relative h-32">
        <img 
          src={place.imageUrl || FALLBACK_IMAGE_URL} 
          alt={place.title}
          className="w-full h-full object-cover"
        />
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors"
          onClick={handleBookmarkToggle}
          disabled={isBookmarkLoading}
        >
          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-bold mb-1 text-sm truncate">{place.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{place.rate}</span>
          <span>({place.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{place.address}</span>
        </div>
      </div>
    </div>
  )
} 