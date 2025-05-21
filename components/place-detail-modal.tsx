"use client"

import { X, Star, Heart, MapPin, Clock, Phone, Navigation, MessageSquare, ArrowUp, ChevronUp, Camera, ChevronLeft, ChevronRight, User } from "lucide-react"
import Image from "next/image"
import { Place } from "@/types/place"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import axios from "axios"

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [newReview, setNewReview] = useState({
    title: "",
    content: "",
    imageUrl: "",
    rate: 5
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const modalRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 리뷰 목록 가져오기
  const fetchReviews = async () => {
    if (!place) return
    
    setIsLoadingReviews(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/reviews`, {
        // params: {
        //   placeId: place.id
        // },
        withCredentials: true
      })
      setReviews(response.data.content) // Page 인터페이스의 content 배열 사용
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // 모달이 열릴 때 리뷰 목록 가져오기
  useEffect(() => {
    if (place) {
      fetchReviews()
    }
  }, [place])

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
    const url = `https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`
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
    fetchReviews() // 리뷰 작성 모달 열 때 리뷰 목록 갱신
  }

  const handleSubmitReview = async () => {
    try {
      if (!place) return
      const payload = {
        title: newReview.title,
        content: newReview.content,
        imageUrl: newReview.imageUrl,
        rate: newReview.rate
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_HOST}/reviews`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      )
      
      setShowReviewModal(false)
      setNewReview({ title: "", content: "", imageUrl: "", rate: 5 })
      fetchReviews() // 리뷰 작성 완료 후 리뷰 목록 갱신
    } catch (error) {
      console.error('Review submission failed:', error)
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.')
    }
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
              {isLoadingReviews ? (
                <div className="text-center py-8 text-gray-500">
                  리뷰를 불러오는 중...
                </div>
              ) : reviews.length > 0 ? (
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
              {/* 제목 입력 */}
              <div>
                <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={newReview.title}
                  onChange={e => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="리뷰 제목을 입력하세요"
                />
              </div>
              {/* 별점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  별점
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rate: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= newReview.rate ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
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
                  onChange={e => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="리뷰를 작성해주세요"
                  className="min-h-[120px]"
                />
              </div>
              {/* 이미지 URL 입력 */}
              <div>
                <label htmlFor="review-image-url" className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 URL (선택사항)
                </label>
                <input
                  id="review-image-url"
                  type="text"
                  value={newReview.imageUrl}
                  onChange={e => setNewReview(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="이미지 URL을 입력하세요"
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