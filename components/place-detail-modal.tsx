"use client"

import { X, Star, Heart, MapPin, Clock, Phone, Navigation, MessageSquare, ArrowUp, ChevronUp, Camera, ChevronLeft, ChevronRight, User } from "lucide-react"
import Image from "next/image"
import { Place } from "@/types/place"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface PlaceDetailModalProps {
  place: Place | null
  onClose: () => void
}

interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  imageUrl?: string
}

interface Review {
  id: number
  userId: number
  userName: string
  rating: number
  content: string
  createdAt: string
  imageUrl?: string
}

export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([
    { id: 1, userId: 1, userName: "사용자 1", rating: 4.5, content: "카페 분위기가 정말 좋았어요. 커피도 맛있고 직원분들도 친절하셨어요. 다음에 또 방문하고 싶은 곳이에요.", createdAt: "2024.03.01" },
    { id: 2, userId: 2, userName: "사용자 2", rating: 4.0, content: "분위기가 좋고 커피도 맛있어요. 특히 아메리카노가 인상적이었습니다.", createdAt: "2024.03.02" },
    { id: 3, userId: 3, userName: "사용자 3", rating: 5.0, content: "최고의 카페입니다. 매번 방문할 때마다 만족스러워요.", createdAt: "2024.03.03" },
    { id: 4, userId: 4, userName: "사용자 4", rating: 4.8, content: "좋은 분위기와 맛있는 커피가 조화롭네요.", createdAt: "2024.03.04" },
  ])
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: "",
    images: [] as File[]
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const modalRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 더미 메뉴 데이터 생성
  const generateDummyMenu = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `메뉴 ${i + 1}`,
      price: 5000 + Math.floor(Math.random() * 10000),
      description: "맛있는 메뉴입니다. 신선한 재료로 만든 시그니처 메뉴입니다.",
      imageUrl: `/menu-${i + 1}.jpg`
    }))
  }

  // 메뉴 데이터 로드
  useEffect(() => {
    const menuData = generateDummyMenu()
    setMenuItems(menuData)
  }, [])

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (modalRef.current) {
        const scrollTop = modalRef.current.scrollTop
        setShowScrollTop(scrollTop > 100)
      }
    }

    const modalElement = modalRef.current
    if (modalElement) {
      modalElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // 스크롤을 최상단으로 이동
  const scrollToTop = () => {
    if (modalRef.current) {
      modalRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const handleGetDirections = () => {
    if (!place) return
    
    // 카카오맵 길찾기 URL 생성 (위도,경도 형식)
    const url = `https://map.kakao.com/link/to/${place.latitude},${place.longitude}`
    window.open(url, '_blank')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 1) {
      alert("이미지는 1개만 업로드할 수 있습니다.")
      return
    }

    setNewReview(prev => ({
      ...prev,
      images: [files[0]] // 기존 이미지를 새 이미지로 교체
    }))

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview([reader.result as string])
    }
    reader.readAsDataURL(files[0])
  }

  const handleRemoveImage = () => {
    setNewReview(prev => ({
      ...prev,
      images: []
    }))
    setImagePreview([])
  }

  const handleSubmitReview = async () => {
    try {
      const formData = new FormData()
      formData.append('rating', newReview.rating.toString())
      formData.append('content', newReview.content)
      if (newReview.images[0]) {
        formData.append('image', newReview.images[0])
      }
      if (place) {
        formData.append('placeId', place.id.toString())
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/reviews`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const newReviewData = await response.json()
        
        // 새 리뷰를 목록 앞에 추가
        setReviews(prevReviews => [{
          id: newReviewData.id,
          userId: newReviewData.userId,
          userName: newReviewData.userName,
          rating: newReview.rating,
          content: newReview.content,
          createdAt: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\. /g, '.').replace('.', ''),
          imageUrl: newReviewData.imageUrl
        }, ...prevReviews])

        // 모달 닫기 및 상태 초기화
        setShowReviewModal(false)
        setNewReview({ rating: 5, content: "", images: [] })
        setImagePreview([])
      } else {
        throw new Error('리뷰 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Review submission failed:', error)
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleReviewClick = () => {
    // TODO: 실제 로그인 상태 체크 로직으로 대체
    const isLoggedIn = true // 임시로 true로 설정

    if (!isLoggedIn) {
      if (confirm("리뷰를 작성하려면 로그인이 필요합니다. 로그인하시겠습니까?")) {
        router.push("/login")
      }
      return
    }

    setShowReviewModal(true)
  }

  if (!place) return null

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // 모달 내부 클릭은 무시
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg h-[720px] flex flex-col relative">
        {/* 고정된 버튼 */}
        <button
          onClick={showScrollTop ? scrollToTop : onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors z-10"
        >
          {showScrollTop ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>

        {/* 컨텐츠 - 스크롤 */}
        <div ref={modalRef} className="flex-1 overflow-y-auto modal-scroll">
          {/* 헤더 */}
          <div className="relative">
            <div className="relative h-48 w-full">
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                className="object-cover rounded-t-2xl"
              />
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{place.name}</h2>
                  <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-orange-600">{place.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({place.reviewCount})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{place.address}</span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock className="w-4 h-4" />
                <span>영업시간: 09:00 - 22:00</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4" />
                <span>064-123-4567</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
              {place.description}
            </p>

            {/* 액션 버튼 */}
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1 text-sm h-9 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleGetDirections}
              >
                <MapPin className="w-4 h-4 mr-1" />
                길찾기
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-sm h-9"
                onClick={handleReviewClick}
              >
                <Star className="w-4 h-4 mr-1" />
                리뷰 작성
              </Button>
            </div>

            {/* 리뷰 섹션 */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">리뷰</h3>
              </div>
              {reviews.length > 0 ? (
                <div className="relative">
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                    {reviews.map((review, index) => (
                      <div key={index} className="flex-shrink-0 w-[280px] bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium truncate">{review.userName}</span>
                          </div>
                          <span className="text-xs text-gray-500">{review.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 리뷰가 없습니다
                </div>
              )}
            </div>

            {/* 메뉴 섹션 */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-4">메뉴</h3>
              {place.menu && place.menu.length > 0 ? (
                <div className="space-y-4">
                  {place.menu.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <span className="font-medium">{item.price.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  메뉴 정보가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">리뷰 작성</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 별점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  별점
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div>
                <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰 내용
                </label>
                <Textarea
                  id="review-content"
                  value={newReview.content}
                  onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="리뷰를 작성해주세요"
                  className="min-h-[120px]"
                />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 첨부 (선택사항)
                </label>
                <div className="flex gap-2">
                  {imagePreview.length > 0 ? (
                    <div className="relative aspect-square w-24">
                      <Image
                        src={imagePreview[0]}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400"
                    >
                      <Camera className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 제출 버튼 */}
              <Button
                onClick={handleSubmitReview}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                리뷰 등록
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 