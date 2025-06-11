"use client"

import { ChevronRight, Star, Heart, MapPin, X } from "lucide-react"
import { useRef, useState, useEffect } from "react"
// import { useAuth } from "@/hooks/useAuth"
import { useAuth } from "@/contexts/AuthContext"
import { Place } from "@/types/place"
import { PlaceDetailModal } from "@/components/place-detail-modal"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import { LocationProvider, useLocation } from '@/contexts/LocationContext'
import { PlaceCard } from "@/components/place-card"
import axiosInstance from "@/lib/axios"
import { SelfRecommendProvider, useSelfRecommendContext } from "@/contexts/SelfRecommendContext"
import { KeywordRecommendProvider, useKeywordRecommendContext } from "@/contexts/KeywordRecommendContext"
import { LocationRecommendProvider, useLocationRecommendContext } from "@/contexts/LocationRecommendContext"
import { KeywordRankProvider, useKeywordRankContext } from "@/contexts/KeywordRankContext"
import { ThemeProvider } from "@/components/theme-provider"
import BottomNavigation from "@/components/bottom-navigation"

const CAFE_KEYWORDS = [
  { id: 1, name: "디저트 카페", color: "bg-blue-100" },
  { id: 2, name: "브런치 카페", color: "bg-green-100" },
  { id: 3, name: "북카페", color: "bg-yellow-100" },
  { id: 4, name: "테마 카페", color: "bg-purple-100" },
  { id: 5, name: "공부 카페", color: "bg-orange-100" },
  { id: 6, name: "청귤", color: "bg-orange-100" },
  { id: 7, name: "우도", color: "bg-orange-100" },
  { id: 8, name: "오션뷰", color: "bg-orange-100" },
  { id: 9, name: "바다", color: "bg-orange-100" },
]

const RANKING_BADGES = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

const POPULAR_KEYWORDS = [
  { id: 1, name: "디저트", count: 156 },
  { id: 2, name: "브런치", count: 142 },
  { id: 3, name: "북카페", count: 128 },
  { id: 4, name: "테마", count: 115 },
  { id: 5, name: "공부", count: 98 },
]

export default function Explore() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <SelfRecommendProvider>
          <KeywordRecommendProvider>
            <LocationRecommendProvider>
              <KeywordRankProvider>
                <div className="relative overflow-y-auto h-[calc(100vh-4rem)]">
                  <ExploreContent />
                </div>
                <BottomNavigation />
              </KeywordRankProvider>
            </LocationRecommendProvider>
          </KeywordRecommendProvider>
        </SelfRecommendProvider>
    </ThemeProvider>
  )
}

function ExploreContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const nearbyScrollRef = useRef<HTMLDivElement>(null)
  const recommendedScrollRef = useRef<HTMLDivElement>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(CAFE_KEYWORDS.map(keyword => keyword.name))
  const [activeTab, setActiveTab] = useState<'recommended' | 'keywords' | 'nearby' | 'ranking'>('ranking')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [currentAddress, setCurrentAddress] = useState<string>("위치 정보를 가져오는 중...")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const { userLocation, refreshLocation } = useLocation()
  const { places: selfRecommendPlaces = [], isLoading: isSelfRecommendLoading, hasMore: hasMoreSelfRecommend, isLoadingMore: isLoadingMoreSelfRecommend, fetchPlaces: fetchSelfRecommendPlaces, loadMore: loadMoreSelfRecommend } = useSelfRecommendContext()
  const { places: keywordPlaces = [], isLoading: isKeywordLoading, fetchPlaces: fetchKeywordPlaces } = useKeywordRecommendContext()
  const { places: nearbyPlaces = [], isLoading: isNearbyLoading, hasMore: hasMoreNearby, isLoadingMore: isLoadingMoreNearby, fetchPlaces: fetchNearbyPlaces, loadMore: loadMoreNearby } = useLocationRecommendContext()
  const { keywords: popularKeywords = [], isLoading: isLoadingKeywords } = useKeywordRankContext()

  // 좌표를 주소로 변환하는 함수
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    if (!window.kakao || !window.kakao.maps) return "위치 정보를 가져오는 중...";
    
    return new Promise((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const roadAddress = result[0].road_address?.address_name;
          const address = result[0].address.address_name;
          // 도로명주소에서 시/도 부분 제거
          const cleanAddress = (roadAddress || address).replace(/^[가-힣]+(시|도)\s+/, '');
          resolve(cleanAddress);
        } else {
          resolve("위치 정보를 가져오는 중...");
        }
      });
    });
  };

  // 위치 정보가 변경될 때마다 주소 업데이트
  useEffect(() => {
    if (userLocation) {
      getAddressFromCoords(userLocation.lat, userLocation.lon)
        .then((address: string) => setCurrentAddress(address))
    }
  }, [userLocation])

  // 맞춤 추천 탭의 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMoreSelfRecommend && !isLoadingMoreSelfRecommend && activeTab === 'recommended' && userLocation) {
          await loadMoreSelfRecommend(userLocation.lat, userLocation.lon)
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMoreSelfRecommend, isLoadingMoreSelfRecommend, activeTab, userLocation])

  const handleKeywordClick = async (keyword: string) => {
    // 이미 선택된 키워드면 제거, 아니면 추가
    const newKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword]
    
    setSelectedKeywords(newKeywords)
    
    // 선택된 키워드가 있으면 API 호출
    if (newKeywords.length > 0) {
      await fetchKeywordPlaces(newKeywords)
    }
  }

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowScrollTop(scrollY > 300) // 300px 이상 스크롤되면 버튼 표시
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 스크롤 최상단으로 이동하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // 위치가 변경될 때 근처 카페 가져오기
  useEffect(() => {
    if (userLocation) {
      console.log('근처 카페 API 호출:', {
        coordinates: {
          lat: userLocation.lat,
          lon: userLocation.lon
        },
        address: currentAddress
      })
      fetchNearbyPlaces(userLocation.lat, userLocation.lon)
    }
  }, [userLocation])

  // 근처 카페 탭의 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMoreNearby && !isLoadingMoreNearby && activeTab === 'nearby' && userLocation) {
          console.log('근처 카페 추가 로드:', {
            coordinates: {
              lat: userLocation.lat,
              lon: userLocation.lon
            },
            address: currentAddress,
            page: '추가 로드'
          })
          await loadMoreNearby(userLocation.lat, userLocation.lon)
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMoreNearby, isLoadingMoreNearby, activeTab, userLocation])

  const handleTabChange = (tab: 'recommended' | 'keywords' | 'nearby' | 'ranking') => {
    setActiveTab(tab)
    // 키워드 탭으로 변경 시 선택된 키워드가 있으면 API 호출
    if (tab === 'keywords' && selectedKeywords.length > 0) {
      fetchKeywordPlaces(selectedKeywords)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white">
      {/* 헤더 */}
      <div className="bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">탐색</h1>
        </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex space-x-8">
              <button
              onClick={() => handleTabChange('ranking')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ranking'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              랭킹
            </button>
            <button
              onClick={() => handleTabChange('recommended')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommended'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                맞춤 추천
              </button>
              <button
              onClick={() => handleTabChange('keywords')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keywords'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                테마
              </button>
              <button
              onClick={() => handleTabChange('nearby')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'nearby'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                근처 카페
              </button>
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* 랭킹 탭 */}
        {activeTab === 'ranking' && (
          <div className="space-y-8">
            {/* 키워드 인기 순위 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">키워드 인기 순위</h2>
                <span className="text-sm text-gray-500">2025.06.11</span>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="space-y-3">
                  {isLoadingKeywords ? (
                    <div className="text-center py-4 text-gray-500">로딩 중...</div>
                  ) : popularKeywords?.length > 0 ? (
                    popularKeywords.map((keyword: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-600">
                            {index + 1}
                          </div>
                          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
                            {keyword}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 font-medium">{156 - (index * 10)}</span>
                          <span className="text-gray-400 text-sm">회</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">인기 키워드가 없습니다</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 맞춤 추천 탭 */}
        {activeTab === 'recommended' && (
          <div className="space-y-4">
            {isSelfRecommendLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : selfRecommendPlaces?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {selfRecommendPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
                <div ref={observerTarget} className="h-10 flex items-center justify-center col-span-2">
                  {isLoadingMoreSelfRecommend && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                추천 카페가 없습니다
              </div>
            )}
          </div>
        )}

        {/* 키워드 탭 */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {CAFE_KEYWORDS.map((keyword) => (
                <button
                  key={keyword.id}
                  onClick={() => handleKeywordClick(keyword.name)}
                  className={`${keyword.color} px-3 py-1.5 rounded-full text-xs text-gray-700 hover:shadow-md transition-shadow ${
                    selectedKeywords.includes(keyword.name) ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  {keyword.name}
                </button>
              ))}
            </div>
            
            {selectedKeywords.length > 0 && (
              <div>
                {isKeywordLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : keywordPlaces?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    해당 키워드의 카페가 없어요!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {keywordPlaces.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        onClick={() => setSelectedPlace(place)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 근처 카페 탭 */}
        {activeTab === 'nearby' && (
          <div className="space-y-4">
            {/* 현재 위치 표시 */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700 font-medium">
                  {currentAddress}
                </span>
              </div>
              <button
                onClick={async () => {
                  await refreshLocation();
                  if (userLocation) {
                    const address = await getAddressFromCoords(userLocation.lat, userLocation.lon);
                    setCurrentAddress(address);
                  }
                }}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                위치 새로고침
              </button>
            </div>

            {isNearbyLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : nearbyPlaces?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                근처에 10km이내 카페가 없어요!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {nearbyPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
                <div ref={observerTarget} className="h-10 flex items-center justify-center col-span-2">
                  {isLoadingMoreNearby && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 카페 상세 모달 */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
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
