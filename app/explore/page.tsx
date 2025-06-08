"use client"

import { ChevronRight, Star, Heart, MapPin } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Place } from "@/types/place"
import { PlaceDetailModal } from "@/components/place-detail-modal"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import { usePlaces } from "@/hooks/usePlaces"
import { useCafeApi } from "@/hooks/useCafeApi"
import { LocationProvider, useLocation } from '@/contexts/LocationContext'
import { PlaceCard } from "@/components/place-card"

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

export default function Explore() {
  return <ExploreContent />
}

function ExploreContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const nearbyScrollRef = useRef<HTMLDivElement>(null)
  const recommendedScrollRef = useRef<HTMLDivElement>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(CAFE_KEYWORDS.map(keyword => keyword.name))
  const [keywordPlaces, setKeywordPlaces] = useState<Place[]>([])
  const [isKeywordLoading, setIsKeywordLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'recommended' | 'keywords' | 'nearby' | 'ranking'>('ranking')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([])
  const [isPopularLoading, setIsPopularLoading] = useState(false)
  const [hasMorePopular, setHasMorePopular] = useState(true)
  const [popularPage, setPopularPage] = useState(1)
  const [isLoadingMorePopular, setIsLoadingMorePopular] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<string>("위치 정보를 가져오는 중...")
  
  const {
    places: placesFromPlacesHook,
    nearbyPlaces,
    isLoading: isPlacesLoading,
    hasMoreNearby,
    isLoadingMoreNearby,
    loadMoreNearbyPlaces,
    refreshPlaces,
    refreshNearbyPlaces
  } = usePlaces()

  const { fetchKeywordRecommendCafes, fetchSelfRecommendCafes } = useCafeApi()
  const { isTestMode, setIsTestMode, userLocation, refreshLocation } = useLocation()

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
        .then((address: string) => setCurrentAddress(address));
    }
  }, [userLocation]);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (isTestMode) {
        // 테스트 모드일 때는 제주시청 좌표 반환
        resolve({
          coords: {
            latitude: 33.4996213,
            longitude: 126.5311884,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition)
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      }
    })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && activeTab === 'recommended') {
          try {
            setIsLoadingMore(true)
            const position = await getCurrentPosition()
            const nextPage = page + 1
            const result = await fetchSelfRecommendCafes(position.coords.latitude, position.coords.longitude, nextPage)
            setPlaces((prev: Place[]) => [...prev, ...result.content])
            setHasMore(!result.last)
            setPage(nextPage)
          } catch (error) {
            console.error('Failed to fetch more places:', error)
          } finally {
            setIsLoadingMore(false)
          }
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
  }, [hasMore, isLoadingMore, page, activeTab])

  const handleKeywordClick = async (keyword: string) => {
    setIsKeywordLoading(true)
    try {
      // 이미 선택된 키워드면 제거, 아니면 추가
      const newKeywords = selectedKeywords.includes(keyword)
        ? selectedKeywords.filter(k => k !== keyword)
        : [...selectedKeywords, keyword]
      
      setSelectedKeywords(newKeywords)

      // 선택된 키워드가 있으면 검색, 없으면 빈 배열로 초기화
      if (newKeywords.length > 0) {
        const data = await fetchKeywordRecommendCafes(newKeywords)
        setPlaces(data.content)
      } else {
        setPlaces([])
      }
    } catch (error) {
      console.error('Failed to fetch keyword places:', error)
    } finally {
      setIsKeywordLoading(false)
    }
  }

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 200
      const currentScroll = ref.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      ref.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
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

  // 근처 카페 탭의 무한 스크롤을 위한 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMoreNearby && !isLoadingMoreNearby && activeTab === 'nearby') {
          await loadMoreNearbyPlaces()
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
  }, [hasMoreNearby, isLoadingMoreNearby, activeTab])

  // 인기 카페 목록 가져오기
  const fetchPopularPlaces = async (page: number = 1) => {
    if (page === 1) {
      setIsPopularLoading(true)
    } else {
      setIsLoadingMorePopular(true)
    }

    try {
      const position = await getCurrentPosition()
      const data = await fetchSelfRecommendCafes(position.coords.latitude, position.coords.longitude, page)
      
      if (page === 1) {
        setPopularPlaces(data.content)
      } else {
        setPopularPlaces(prev => [...prev, ...data.content])
      }
      
      setHasMorePopular(!data.last)
      setPopularPage(page)
    } catch (error) {
      console.error('Failed to fetch popular places:', error)
    } finally {
      if (page === 1) {
        setIsPopularLoading(false)
      } else {
        setIsLoadingMorePopular(false)
      }
    }
  }

  // 인기 카페 탭의 무한 스크롤을 위한 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMorePopular && !isLoadingMorePopular && activeTab === 'ranking') {
          await fetchPopularPlaces(popularPage + 1)
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
  }, [hasMorePopular, isLoadingMorePopular, popularPage, activeTab])

  const handleTabChange = (tab: 'recommended' | 'keywords' | 'nearby' | 'ranking') => {
    setActiveTab(tab)
    if (tab === 'keywords' && selectedKeywords.length > 0) {
      handleKeywordClick(selectedKeywords[0])
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
          <div className="space-y-6">
            {/* 상위 랭킹 섹션 */}
            {popularPlaces.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">이번 주 인기 카페</h2>
                <div className="grid grid-cols-1 gap-4">
                  {popularPlaces.slice(0, 3).map((place, index) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onClick={() => setSelectedPlace(place)}
                      rank={index + 1}
                      variant="ranking"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 전체 랭킹 목록 */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">전체 랭킹</h2>
              {isPopularLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : popularPlaces.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  추천 카페가 없어요!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {popularPlaces.map((place, index) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onClick={() => setSelectedPlace(place)}
                      rank={index + 1}
                    />
                  ))}
                  <div ref={observerTarget} className="h-10 flex items-center justify-center col-span-2">
                    {isLoadingMorePopular && (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 맞춤 추천 탭 */}
        {activeTab === 'recommended' && (
          <div className="space-y-4">
            {isPlacesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
                <div ref={observerTarget} className="h-10 flex items-center justify-center col-span-2">
                  {isLoadingMore && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  )}
                </div>
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
                ) : places.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    해당 키워드의 카페가 없어요!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {places.map((place) => (
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

            {isPlacesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : nearbyPlaces.length === 0 ? (
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
    </div>
  )
}
