"use client"

import { useEffect, useState } from "react"
import { Place } from "@/types/place"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { PlaceHorizontalCard } from "@/components/place-horizontal-card"

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
          `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/users/my/bookmarks`,
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

  const handlePlaceClick = (place: Place) => {
    router.push(`/explore?place=${place.id}`)
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
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold ml-4">북마크</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        {places.length > 0 ? (
          <div className="space-y-4">
            {places.map((place) => (
              <PlaceHorizontalCard
                key={place.id}
                place={place}
                // onClick={handlePlaceClick}
              />
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