"use client"

import { useEffect, useState } from "react"
import { Review } from "@/types/review"
import axiosInstance from "@/lib/axios"
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
        const response = await axiosInstance.get('/api/v1/users/my/reviews')
        setReviews(response.data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyReviews()
  }, [])

  const handleLikeToggle = async (reviewId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        if (confirm("좋아요를 누르려면 로그인이 필요합니다. 로그인하시겠습니까?")) {
          router.push("/login")
        }
        return
      }

      // 현재 리뷰 찾기
      const currentReview = reviews.find(review => review.id === reviewId)
      if (!currentReview) return

      // 낙관적 업데이트: UI를 먼저 업데이트
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? {
                ...review,
                likedByUser: !review.likedByUser,
                likeCount: review.likedByUser ? review.likeCount - 1 : review.likeCount + 1
              }
            : review
        )
      )

      const response = await axiosInstance.post(`/api/v1/reviews/${reviewId}/like-toggle`)

      // API 응답으로 받은 데이터로 상태 업데이트
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? {
                ...review,
                likedByUser: response.data.data.likedByUser,
                likeCount: response.data.data.likeCount
              }
            : review
        )
      )

    } catch (error) {
      console.error('Failed to toggle like:', error)
      // 실패 시 원래 상태로 되돌리기
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? {
                ...review,
                likedByUser: !review.likedByUser,
                likeCount: review.likedByUser ? review.likeCount + 1 : review.likeCount - 1
              }
            : review
        )
      )
    }
  }

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
                      {review.profileImageUrl ? (
                        <Image
                          src={review.profileImageUrl}
                          alt={review.nickname}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_IMAGE_URL;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium truncate">{review.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleLikeToggle(review.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        review.likedByUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
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
                <p className="text-sm text-gray-600 line-clamp-2">
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