"use client"

import { useEffect, useState } from "react"
import { Place } from "@/types/place"
import axios from "axios"
import { Star, Heart, MapPin, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import { useRouter } from "next/navigation"

export default function Bookmarks() {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          router.push("/login")
          return
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_HOST}/users/my/bookmarks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            withCredentials: true
          }
        )
        if (response.data) {
          setPlaces(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error)
        setPlaces([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [router])

  const handleBookmarkToggle = async (placeId: number, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        if (confirm("북마크를 추가하려면 로그인이 필요합니다. 로그인하시겠습니까?")) {
          router.push("/login")
        }
        return
      }

      const place = places.find(p => p.id === placeId)
      if (!place) return

      if (place.isBookmarked) {
        // 북마크 삭제
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_HOST}/bookmarks/${placeId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            withCredentials: true
          }
        )
        // 북마크 목록에서 제거
        setPlaces(prevPlaces => prevPlaces.filter(p => p.id !== placeId))
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">북마크를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold ml-4">북마크</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {places.length > 0 ? (
          <div className="space-y-4">
            {places.map((place) => (
              <div 
                key={place.id} 
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/explore?place=${place.id}`)}
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={place.imageUrl || FALLBACK_IMAGE_URL}
                      alt={place.title || "장소 이미지"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-lg font-bold truncate">{place.title || "제목 없음"}</h2>
                        {place.rate && (
                          <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-orange-600 text-sm">{place.rate}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={(e) => handleBookmarkToggle(place.id, e)}
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    {place.address && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{place.address}</span>
                      </div>
                    )}
                    {place.keywordList && place.keywordList.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {place.keywordList.map((keyword, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {keyword.keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            북마크한 장소가 없습니다
          </div>
        )}
      </div>
    </div>
  )
} 