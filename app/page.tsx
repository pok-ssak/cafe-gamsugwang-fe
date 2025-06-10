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
  const [isList, setList] = useState(false)
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

  // 인기 카페 목록 가져오기
  const fetchPopularPlaces = async () => {
    try {
      // LocationContext를 통해 현재 위치 가져오기
      await refreshLocation()
      
      if (!userLocation) {
        throw new Error('위치 정보를 가져올 수 없습니다.')
      }

      const response = await axiosInstance.get(`/cafes/self-recommend`, {
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

      // 검색 결과가 있으면 첫 번째 카드 선택
      if (response.data.data.content.length > 0) {
        setSelectedPlace(response.data.data.content[0])
      } else {
        setSelectedPlace(null)
      }

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
    }
  }

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchFocused])

  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        {isKakaoLoaded && (
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
            center={userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : undefined}
            level={3}
            className="w-full h-full"
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

      {/* 장소 목록 */}
      {places.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-10">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">검색 결과</h2>
            <button
              onClick={() => setList(!isList)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              {isList ? <Compass className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-4">
            <div className="flex gap-4 overflow-x-auto pb-4" ref={scrollRef}>
              {places.map((place) => (
                <div
                  key={place.id}
                  className="flex-none w-64 bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPlace(place)}
                >
                  <div className="relative h-40">
                    <img 
                      src={place.imageUrl || FALLBACK_IMAGE_URL} 
                      alt={place.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{place.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{place.rate}</span>
                      <span>({place.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{place.address}</span>
                    </div>
                  </div>
                </div>
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
