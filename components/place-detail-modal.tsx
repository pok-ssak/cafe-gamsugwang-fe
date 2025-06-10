"use client"

import { X, Star, Heart, MapPin, Clock, Phone, Navigation, MessageSquare, ArrowUp, ChevronUp, Camera, ChevronLeft, ChevronRight, User, ThumbsUp, Pencil, Globe, Menu as MenuIcon, Grid, Info, Map } from "lucide-react"
import Image from "next/image"
import { Place, MenuItem } from "@/types/place"
import { Review } from "@/types/review"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { ReviewWriteModal } from "./review-write-modal"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import Script from "next/script"
import { ReviewCard } from "./review-card"

interface PlaceDetailModalProps {
  place: Place | null
  onClose: () => void
  onBookmarkChange?: (placeId: number, isBookmarked: boolean) => void
}

type TabType = 'menu' | 'info' | 'hours' | 'roadmap'

export function PlaceDetailModal({ place: initialPlace, onClose, onBookmarkChange }: PlaceDetailModalProps) {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(initialPlace?.isBookmarked || false)
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false)
  const [place, setPlace] = useState<Place | null>(initialPlace)
  const [isLoading, setIsLoading] = useState(false)
  const [newReview, setNewReview] = useState({
    content: "",
    imageUrl: "",
    rating: 5
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const roadviewRef = useRef<HTMLDivElement>(null)
  const [roadview, setRoadview] = useState<any>(null)
  const [roadviewClient, setRoadviewClient] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const keywordsRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('menu')

  // 카페 상세 정보 가져오기
  const fetchCafeDetails = async () => {
    if (!initialPlace) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/v1/cafes/${initialPlace.id}`);
      const cafeData = response.data.data;
      setPlace(cafeData);
      setIsBookmarked(cafeData.isBookmarked || false);
    } catch (error) {
      console.error('Failed to fetch cafe details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 목록 가져오기
  const fetchReviews = async () => {
    if (!place) return
    
    setIsLoadingReviews(true)
    try {
      const response = await axiosInstance.get(`api/v1/cafes/${place.id}/reviews`)
      setReviews(response.data.data.content)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // 모달이 열릴 때 카페 상세 정보와 리뷰 목록 가져오기
  useEffect(() => {
    if (initialPlace) {
      fetchCafeDetails();
      fetchReviews();
    }
  }, [initialPlace]);

  // place가 변경될 때 북마크 상태 업데이트
  useEffect(() => {
    if (place) {
      setIsBookmarked(place.isBookmarked || false)
    }
  }, [place])

  // 메뉴 데이터 로드
  const fetchMenuItems = async () => {
    if (!place) return;
    
    try {
      const response = await axiosInstance.get(`/api/v1/cafes/${place.id}/menus`);
      setMenuItems(response.data.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  }

  // place가 변경될 때 메뉴 데이터 로드
  useEffect(() => {
    if (place) {
      fetchMenuItems();
    }
  }, [place]);

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
    const url = `https://map.kakao.com/link/to/${place.title},${place.lat},${place.lon}`
    window.open(url, '_blank')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setErrorMessage("")

      const formData = new FormData()
      formData.append("image", file)

      const response = await axiosInstance.post(
        `/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      )

      const imageUrl = response.data.url
      console.log(response)
      setNewReview(prev => ({
        ...prev,
        imageUrl
      }))

      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview([reader.result as string])
      }
      reader.readAsDataURL(file)

    } catch (error: any) {
      console.error('Image upload failed:', error)
      setErrorMessage(error.response?.data?.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setNewReview(prev => ({
      ...prev,
      imageUrl: ""
    }))
    setImagePreview([])
  }

  const handleViewReviews = () => {
    if (!place) return;
    window.open(`https://place.map.kakao.com/${place.id}`, '_blank');
  }

  const handleReviewClick = () => {
    if (!place) return;
    setShowReviewModal(true);
  }

  const handleSubmitReview = async () => {
    try {
      if (!place) return
      setErrorMessage("") // 에러 메시지 초기화
      const payload = {
        cafeId: place.id,
        content: newReview.content,
        imageUrl: newReview.imageUrl,
        rating: newReview.rating
      }
      await axiosInstance.post(`/reviews`, payload)
      
      setShowReviewModal(false)
      fetchReviews()
    } catch (error: any) {
      console.error('Review submission failed:', error)
      setErrorMessage(error.response?.data?.error?.message || '리뷰 등록에 실패했습니다. 다시 시도해주세요.')
    }
  }

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
                likeCount: response.data.data
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

  // 북마크 토글 함수
  const handleBookmarkToggle = async () => {
    if (!place) return

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
      console.log('Modal - onBookmarkChange called with:', { placeId: place.id, isBookmarked: newBookmarkState })
      onBookmarkChange?.(place.id, newBookmarkState)
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    } finally {
      setIsBookmarkLoading(false)
    }
  }

  // 카카오맵 로드뷰 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && place && activeTab === 'roadmap') {
      const roadviewContainer = roadviewRef.current
      if (!roadviewContainer) return

      const newRoadview = new window.kakao.maps.Roadview(roadviewContainer)
      const newRoadviewClient = new window.kakao.maps.RoadviewClient()
      
      setRoadview(newRoadview)
      setRoadviewClient(newRoadviewClient)

      const position = new window.kakao.maps.LatLng(place.lat, place.lon)
      newRoadviewClient.getNearestPanoId(position, 50, (panoId: string) => {
        newRoadview.setPanoId(panoId, position)
      })
    }
  }, [place, activeTab])

  // 키워드 컨테이너의 높이를 체크하여 더보기 버튼 표시 여부 결정
  useEffect(() => {
    if (keywordsRef.current && place?.keywordList) {
      const container = keywordsRef.current;
      const lineHeight = 24; // 키워드 한 줄의 높이 (px)
      const maxHeight = lineHeight * 3; // 3줄 높이
      
      // 컨테이너의 실제 높이 계산
      const actualHeight = container.scrollHeight;
      const shouldShowExpandButton = actualHeight > maxHeight;
      
      setShowExpandButton(shouldShowExpandButton);
      
      // 초기 상태에서는 접혀있도록 설정
      if (!isExpanded) {
        container.style.maxHeight = `${maxHeight}px`;
      } else {
        container.style.maxHeight = 'none';
      }
    }
  }, [place?.keywordList, isExpanded]);

  const parseOpenTime = (openTime: string) => {
    if (!openTime) return null;
    
    const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
    const weekdays: { label: string; time: string }[] = [];
    const holidays: { label: string; time: string }[] = [];
    
    // openTime 문자열을 세미콜론으로 분리
    const timeStrings = openTime.split(';');
    
    timeStrings.forEach((timeStr) => {
      // 첫 번째 : 를 기준으로 분리
      const colonIndex = timeStr.indexOf(':');
      if (colonIndex !== -1) {
        const label = timeStr.substring(0, colonIndex);
        const time = timeStr.substring(colonIndex + 1);
        
        if (dayOrder.includes(label)) {
          weekdays.push({ label, time });
        } else {
          holidays.push({ label, time });
        }
      }
    });

    // 요일 순서대로 정렬
    weekdays.sort((a, b) => {
      const indexA = dayOrder.indexOf(a.label);
      const indexB = dayOrder.indexOf(b.label);
      return indexA - indexB;
    });

    return [...weekdays, ...holidays];
  };

  const tabs = [
    { id: 'menu', label: '메뉴' },
    { id: 'info', label: '정보' },
    { id: 'hours', label: '영업시간' },
    { id: 'roadmap', label: '로드맵' },
  ]

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다.');
    }).catch((err) => {
      console.error('클립보드 복사 실패:', err);
    });
  };

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
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,roadview`}
        strategy="beforeInteractive"
      />
      <div className="bg-white rounded-2xl w-full max-w-[calc(512px+16px)] h-[760px] flex flex-col relative">
        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        )}

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
                src={place.imageUrl || FALLBACK_IMAGE_URL}
                alt={place.title}
                fill
                className="object-cover rounded-t-2xl cursor-pointer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGE_URL;
                }}
                onClick={() => setSelectedImage(place.imageUrl || FALLBACK_IMAGE_URL)}
              />
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{place.title}</h2>
                  <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-orange-600">{place.rate}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({place.reviewCount})</span>
                </div>
                <button 
                  className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isBookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleBookmarkToggle}
                  disabled={isBookmarkLoading}
                >
                  <Heart className={`w-6 h-6 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                <span>{place.address}</span>
              </div>
              {place.keywordList && place.keywordList.length > 0 && (
                <div className="relative mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <div 
                      ref={keywordsRef}
                      className="flex flex-wrap gap-2 transition-all duration-300 overflow-hidden justify-center"
                      style={{ maxHeight: isExpanded ? 'none' : '72px' }}
                    >
                      {place.keywordList.map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-orange-50 text-gray-600 text-xs rounded-full"
                        >
                          {keyword.keyword}
                        </span>
                      ))}
                    </div>
                    {showExpandButton && !isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>
                  {showExpandButton && (
                    <div className="flex justify-end mt-2 relative z-10">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? '접기' : '더보기'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-4 py-4">
              <button
                onClick={handleGetDirections}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>길찾기</span>
              </button>
              <button
                onClick={handleViewReviews}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>후기보기</span>
              </button>
            </div>


            {/* 리뷰 섹션 */}
            <div className="border-t mt-4">
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">감수광 리뷰</h3>
                  <button
                    onClick={handleReviewClick}
                    className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"

                  >
                    <Pencil className="w-4 h-4" />
                    <span>리뷰작성</span>
                  </button>
                </div>
                {isLoadingReviews ? (
                  <div className="text-center py-8 text-gray-500">로딩 중...</div>
                ) : reviews.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onLikeToggle={handleLikeToggle}
                        variant="modal"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    아직 리뷰가 없습니다
                  </div>
                )}
              </div>
            </div>
            
            {/* 탭 네비게이션 */}
            <div className="border-b">
              <div className="flex overflow-x-auto scrollbar-hide justify-center">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex-none py-3 px-6 text-sm font-medium flex items-center justify-center whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-orange-500 border-b-2 border-orange-500'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* 탭 컨텐츠 */}
            <div className="overflow-y-auto max-h-[calc(90vh-300px)]">
              {activeTab === 'menu' && (
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">메뉴</h3>
                    <button
                      className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>수정제안</span>
                    </button>
                  </div>
                  {menuItems && menuItems.length > 0 ? (
                    <div className="space-y-4">
                      {menuItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                            {item.menuImageUrl ? (
                              <Image
                                src={item.menuImageUrl || FALLBACK_IMAGE_URL}
                                alt={item.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = FALLBACK_IMAGE_URL;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="font-medium">{item.price.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      메뉴 정보가 없습니다
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="p-4 space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">주소</h3>
                      <button
                        onClick={() => handleCopyToClipboard(place.address)}
                        className="text-gray-600 hover:text-orange-500 transition-colors text-left w-full"
                      >
                        {place.address}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">전화번호</h3>
                      <button
                        onClick={() => handleCopyToClipboard(place.phoneNumber || '')}
                        className="text-gray-600 hover:text-orange-500 transition-colors text-left w-full"
                      >
                        {place.phoneNumber || "정보가 없습니다"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">영업시간</h3>
                      <p className="text-gray-600">
                        {place.openTime || "정보가 없습니다"}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {place.description}
                  </p>
                </div>
              )}

              {activeTab === 'hours' && (
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    {(() => {
                      const parsedTimes = parseOpenTime(place.openTime || '');
                      if (!parsedTimes || parsedTimes.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            영업시간 정보가 없습니다
                          </div>
                        );
                      }
                      
                      return parsedTimes.map(({ label, time }) => (
                        <div key={label} className="flex justify-between items-center py-1">
                          <span className="text-gray-600 min-w-[80px]">{label}</span>
                          <span className="font-medium text-gray-900">{time}</span>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">
                      * 공휴일 영업시간은 별도로 안내드립니다.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="p-4 space-y-4">
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <div ref={roadviewRef} className="w-full h-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {showReviewModal && place && (
        <ReviewWriteModal
          placeId={place.id}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmit={fetchReviews}
        />
      )}

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="확대된 이미지"
            className="max-w-[90%] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  )
} 