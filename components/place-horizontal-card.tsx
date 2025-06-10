import { Star, MapPin, Heart } from "lucide-react"
import { Place } from "@/types/place"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import Image from "next/image"
import { useState } from "react"
import axiosInstance from "@/lib/axios"
import { useRouter } from "next/navigation"

interface PlaceHorizontalCardProps {
  place: Place
  onClick?: () => void
  onBookmarkChange?: (placeId: number, isBookmarked: boolean) => void
}

export function PlaceHorizontalCard({ place, onClick, onBookmarkChange }: PlaceHorizontalCardProps) {
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
      className="flex bg-white rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow relative"
      onClick={onClick}
    >
      <button 
        className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors z-10"
        onClick={handleBookmarkToggle}
        disabled={isBookmarkLoading}
      >
        <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
      </button>
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={place.imageUrl || FALLBACK_IMAGE_URL}
          alt={place.title}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = FALLBACK_IMAGE_URL;
          }}
        />
      </div>
      <div className="flex-1 p-2">
        <h3 className="font-medium text-sm line-clamp-1">{place.title}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{place.rate}</span>
          <span className="text-gray-400">({place.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{place.address}</span>
        </div>
        {place.keywordList && place.keywordList.length > 0 && (
          <div className="mt-1 h-5 overflow-hidden">
            <div className="flex flex-wrap gap-1">
              {place.keywordList.slice(0, 5).map((keyword, index) => (
                <span 
                  key={index}
                  className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded-full"
                >
                  {keyword.keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 