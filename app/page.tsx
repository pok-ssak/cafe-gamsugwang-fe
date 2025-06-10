"use client"

import { useEffect, useRef, useState } from "react"
import { Star, ChevronLeft, ChevronRight, MapPin, Heart, Compass, List, Navigation, ChevronUp, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import { Place } from "@/types/place"
import { PlaceDetailModal } from "@/components/place-detail-modal"
import axiosInstance from "@/lib/axios"
import { FALLBACK_IMAGE_URL } from "./constants"
import { usePlaces } from "@/contexts/PlacesContext"
import { useLocation } from "@/contexts/LocationContext"
import { Map } from "@/components/map"
import { SearchBar } from "@/components/search-bar"
import { PlaceCard } from "@/components/place-card"
import { useAuth } from "@/contexts/AuthContext"
import { useKeywordRecommend } from "@/hooks/useKeywordRecommend"

declare global {
  interface Window {
    kakao: any
  }
}

export default function Home() {
  const isMobile = useMobile()
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showModal, setShowModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)
  const router = useRouter()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const listViewRef = useRef<HTMLDivElement>(null)
  const [currentAddress, setCurrentAddress] = useState("제주특별자치도 제주시 중앙로 1")
  const { places, setPlaces, isLoading, setIsLoading, keywordList, setKeywordList } = usePlaces()
  const { userLocation, refreshLocation, setManualLocation } = useLocation()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [expandedKeywords, setExpandedKeywords] = useState<{ [key: number]: boolean }>({})
  const [isBookmarked, setIsBookmarked] = useState<{ [key: number]: boolean }>({})
  const [isBookmarkLoading, setIsBookmarkLoading] = useState<{ [key: number]: boolean }>({})
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [isKeywordLoading, setIsKeywordLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<{
    totalElements: number;
    totalPages: number;
    number: number;
  } | null>(null)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined)
  const [isResultsMinimized, setIsResultsMinimized] = useState(false)
  const keywordScrollRef = useRef<HTMLDivElement>(null)
  const [showLeftKeywordScroll, setShowLeftKeywordScroll] = useState(false)
  const [showRightKeywordScroll, setShowRightKeywordScroll] = useState(false)
  const { isAuthenticated } = useAuth()
  const { keywordRecommend } = useKeywordRecommend()

  // 마우스 휠 이벤트 핸들러
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollAmount = e.deltaY
    container.scrollLeft += scrollAmount
    e.preventDefault()
  }

  // 인기 카페 목록 가져오기
  const fetchPopularPlaces = async () => {
    try {
      // LocationContext를 통해 현재 위치 가져오기
      await refreshLocation()
      
      if (!userLocation) {
        throw new Error('위치 정보를 가져올 수 없습니다.')
      }

      const response = await axiosInstance.get(`/api/v1/cafes/self-recommend`, {
        params: {
          lat: userLocation.lat,
          lon: userLocation.lon
        }
      })
      console.log(response.data.data)
      setPlaces(response.data.data)
      
      // 키워드 리스트 업데이트
      const keywords = response.data.data.flatMap((place: Place) => 
        (place.keywordList || []).map(k => k.keyword)
      )
      setKeywordList(Array.from(new Set(keywords)))
    } catch (error) {
      console.error('Failed to fetch popular places:', error)
      // 위치 정보를 가져오는데 실패한 경우 기본 좌표(제주시청) 사용
      const response = await axiosInstance.get(`/api/v1/cafes/self-recommend`, {
        params: {
          lat: 33.4996213,
          lon: 126.5311884
        }
      })
      console.log(response.data.data)
      setPlaces(response.data.data)
      
      // 키워드 리스트 업데이트
      const keywords = response.data.data.flatMap((place: Place) => 
        (place.keywordList || []).map(k => k.keyword)
      )
      setKeywordList(Array.from(new Set(keywords)))
    } finally {
      setIsLoading(false)
    }
  }

  // 카페 목록 가져오기
  const fetchPlaces = async (keyword: string) => {
    try {
      const response = await axiosInstance.get(`/api/v2/cafes/search`, {
        params: {
          query: keyword
        }
      })
      console.log(response.data.data);
      setPlaces(response.data.data.content)
      setSearchResult({
        totalElements: response.data.data.totalElements,
        totalPages: response.data.data.totalPages,
        number: response.data.data.number
      })
      setIsSearchFocused(false)

      // 검색 결과가 있더라도 자동으로 첫 번째 카드 선택하지 않음
        setSelectedPlace(null)

      // 키워드 리스트 업데이트
      const keywords = response.data.data.content.flatMap((place: Place) => 
        (place.keywordList || []).map(k => k.keyword)
      )
      setKeywordList(Array.from(new Set(keywords)))
    } catch (error) {
      console.error('Failed to fetch places:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`
    script.async = true

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsKakaoLoaded(true)
      })
  }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
        if (places.length === 0) {
          fetchPopularPlaces()
    }
  }, [])

  // ESC 키 이벤트 핸들러
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isSearchFocused) {
      setIsSearchFocused(false)
      // 검색창 비활성화를 위해 input 요소의 blur 이벤트를 트리거
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      if (searchInput) {
        searchInput.blur()
      }
    }
  }

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchFocused])

  const scrollKeywordsLeft = () => {
    if (keywordScrollRef.current) {
      keywordScrollRef.current.scrollTo({
        left: keywordScrollRef.current.scrollLeft - 300,
        behavior: 'smooth'
      });
    }
  }

  const scrollKeywordsRight = () => {
    if (keywordScrollRef.current) {
      keywordScrollRef.current.scrollTo({
        left: keywordScrollRef.current.scrollLeft + 300,
        behavior: 'smooth'
      });
    }
  }

  // 키워드 스크롤 버튼 가시성 관리
  useEffect(() => {
    const handleScroll = () => {
      if (keywordScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = keywordScrollRef.current
        setShowLeftKeywordScroll(scrollLeft > 0)
        setShowRightKeywordScroll(scrollLeft < scrollWidth - clientWidth - 1) // -1은 부동 소수점 오차 방지
      }
    }

    if (keywordScrollRef.current) {
      keywordScrollRef.current.addEventListener('scroll', handleScroll)
      handleScroll() // 초기 로드 시 가시성 설정
    }

    return () => {
      if (keywordScrollRef.current) {
        keywordScrollRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [keywordList])

  // 키워드 클릭 핸들러
  const handleKeywordClick = async (keyword: string) => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.')
      return
    }

    try {
      await keywordRecommend.fetchPlaces([keyword])
      if (keywordRecommend.places) {
        setPlaces(keywordRecommend.places)
        // 키워드 리스트 업데이트
        const keywords = keywordRecommend.places.flatMap((place: Place) => 
          (place.keywordList || []).map(k => k.keyword)
        )
        setKeywordList(Array.from(new Set(keywords)))
      }
    } catch (error) {
      console.error('Failed to fetch keyword recommendations:', error)
      alert('키워드 추천을 불러오는데 실패했습니다.')
    }
  }

  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        {!isKakaoLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">지도를 불러오는 중...</span>
            </div>
          </div>
        ) : (
          <Map
            places={places}
            onPlaceSelect={setSelectedPlace}
            onMapClick={(lat, lng) => {
              setManualLocation({
                lat,
                lon: lng
              })

              // 클릭한 위치의 주소 가져오기
    const geocoder = new window.kakao.maps.services.Geocoder()
              geocoder.coord2Address(lng, lat, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const roadAddress = result[0].road_address?.address_name
        const address = result[0].address.address_name
        // 도로명주소에서 시/도 부분 제거
        const cleanAddress = (roadAddress || address).replace(/^[가-힣]+(시|도)\s+/, '')
        setCurrentAddress(cleanAddress)
      }
    })
            }}
            center={mapCenter}
            level={6}
            className="w-full h-full"
            initialPlace={places.length > 0 ? places[0] : undefined}
          />
        )}
      </div>

      {/* 검색 오버레이 */}
      {isSearchFocused && (
        <div 
          className="absolute inset-0 bg-black/50 z-10" 
          onClick={() => setIsSearchFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
                setIsSearchFocused(false)
            }
          }}
          tabIndex={0}
        />
          )}

      {/* 검색창 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-20">
        <SearchBar
          onSearch={fetchPlaces}
          onFocusChange={setIsSearchFocused}
        />
          </div>

      {/* 현재 주소 표시 */}
      <div className=" absolute top-20 left-1/2 -translate-x-1/2 z-[15]">
        <div 
          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-[0.8rem] text-gray-700 flex items-center gap-2 max-w-[80vw] cursor-pointer hover:bg-white/95 transition-colors"
                  onClick={() => {
            if (userLocation) {
              setManualLocation({
                lat: userLocation.lat,
                lon: userLocation.lon
              })
              // 지도 중심 이동을 위해 Map 컴포넌트의 center prop 업데이트
              const mapCenter = {
                lat: userLocation.lat,
                lng: userLocation.lon
              }
              setMapCenter(mapCenter)
            }
          }}
        >
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="truncate">{currentAddress}</span>
        </div>
      </div>

      {/* 키워드 목록 */}
      {keywordList.length > 0 && (
        <div className={`absolute max-w-6xl mx-auto left-0 right-0 z-10 transition-all duration-300 ${isResultsMinimized ? 'bottom-[60px]' : 'bottom-[290px]'}`}>
          <div className="max-w-2xl mx-auto relative">
            <div className="mx-4 pb-2 bg-transparent rounded-lg shadow-lg">
              <div className="px-4 py-3">
                <div 
                  ref={keywordScrollRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {keywordList.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-orange-50 text-gray-600 text-sm rounded-full flex-shrink-0 shadow-md cursor-pointer hover:bg-orange-100 transition-colors"
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              {showLeftKeywordScroll && (
                <button 
                  onClick={scrollKeywordsLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-1 rounded-full shadow-md"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {showRightKeywordScroll && (
                <button 
                  onClick={scrollKeywordsRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-1 rounded-full shadow-md"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 장소 목록 */}
      {places.length > 0 && (
        <div className={`absolute max-w-6xl mx-auto bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-10 transition-all duration-300 ${isResultsMinimized ? 'h-[60px]' : 'h-auto'}`}>
          <div 
            className="flex items-center justify-between p-3 border-b cursor-pointer"
            onClick={() => setIsResultsMinimized(!isResultsMinimized)}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">검색 결과</h2>
              <span className="text-sm text-gray-500">({places.length}개)</span>
            </div>
            <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${isResultsMinimized ? '' : 'rotate-180'}`} />
          </div>

          <div className={`transition-all duration-300 ${isResultsMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="flex gap-4 px-4 pb-3 overflow-x-auto scrollbar-hide" ref={scrollRef}>
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={setSelectedPlace}
                  variant="scroll"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 장소 상세 모달 */}
      {selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)}
          onBookmarkChange={(placeId: number, isBookmarked: boolean) => {
            setIsBookmarked(prev => ({
              ...prev,
              [placeId]: isBookmarked
            }))
          }}
        />
      )}
    </div>
  )
}
