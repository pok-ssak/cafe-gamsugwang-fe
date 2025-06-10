"use client"

import { useEffect, useState } from "react"
import { Review } from "@/types/review"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReviewCard } from "@/components/review-card"

export default function MyReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          router.push("/login")
          return
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/users/my/reviews`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            withCredentials: true
          }
        )
        if (response.data) {
          setReviews(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [router])

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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/reviews/${reviewId}/like-toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          withCredentials: true
        }
      )

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
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold ml-4">내 리뷰</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onLikeToggle={handleLikeToggle}
                variant="list"
              />
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