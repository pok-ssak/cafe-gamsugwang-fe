"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { usePlaces } from "@/contexts/PlacesContext"
import axios from "axios"
import { Place } from "@/types/place"
import { PlaceDetailModal } from "@/components/place-detail-modal"
import { useState } from "react"
import { Heart } from "lucide-react"

export default function Reviews() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { places, setPlaces, isLoading: isPlacesLoading, setIsLoading: setPlacesLoading } = usePlaces()
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_HOST}/users/my/reviews`,

          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            withCredentials: true
          }
        )
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_HOST}/bookmarks/${placeId}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            withCredentials: true
          }
        )

        setReviews(response.data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }

      setPlaces(prevPlaces => 
        prevPlaces.map(p => 
          p.id === placeId 
            ? { ...p, isBookmarked: !p.isBookmarked } 
            : p
        )
      )

      if (selectedPlace?.id === placeId) {
        setSelectedPlace(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">내 리뷰</h1>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isPlacesLoading ? (
          <div className="text-center py-8 text-gray-500">
            리뷰 목록을 불러오는 중...
          </div>
        ) : places.length > 0 ? (
          <div className="space-y-4">
            {places.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  setSelectedPlace(place)
                  setShowModal(true)
                }}
                className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={place.imageUrl} 
                      alt={place.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold truncate">{place.title}</h2>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={(e) => handleCardBookmarkToggle(place.id, e)}
                      >
                        <Heart className={`w-5 h-5 ${place.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="truncate">{place.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            작성한 리뷰가 없습니다
          </div>
        )}
      </div>

      {showModal && selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => {
            setShowModal(false)
          }}
          onBookmarkChange={(placeId, isBookmarked) => {
            setPlaces(prevPlaces => 
              prevPlaces.map(place => 
                place.id === placeId 
                  ? { ...place, isBookmarked } 
                  : place
              )
            )
          }}
        />
      )}
    </div>
  )
} 