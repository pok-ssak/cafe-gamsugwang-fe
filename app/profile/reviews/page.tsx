"use client"

import { useEffect, useState } from "react"
import { Review } from "@/types/review"
import axios from "axios"
import { Star, ThumbsUp, User, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import { useRouter } from "next/navigation"

export default function MyReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_HOST}/reviews/my`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            },
            withCredentials: true
          }
        )
        setReviews(response.data.data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyReviews()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">리뷰를 불러오는 중...</div>
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
          <h1 className="text-xl font-bold ml-4">내 리뷰</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {review.imageUrl ? (
                        <Image
                          src={review.imageUrl}
                          alt={review.nickname}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{review.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-gray-500">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs">{review.likeCount}</span>
                    </button>
                    <span className="text-xs text-gray-500">{review.createdAt}</span>
                  </div>
                </div>
                {review.imageUrl && (
                  <div className="relative w-full h-40 mb-2 rounded-lg overflow-hidden">
                    <Image
                      src={review.imageUrl}
                      alt="리뷰 이미지"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1 mr-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-700">{review.rating}</span>
                  </span>
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            작성한 리뷰가 없습니다
          </div>
        )}
      </div>
    </div>
  )
} 