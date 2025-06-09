"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Search, Star, ChevronLeft, ChevronRight, MapPin, Heart, Compass, List, Navigation, ChevronUp, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import { Place } from "@/types/place"
import { PlaceDetailModal } from "@/components/place-detail-modal"
import axiosInstance from "@/lib/axios"
import { FALLBACK_IMAGE_URL } from "./constants"
import { usePlaces } from "@/contexts/PlacesContext"
import { useLocation } from "@/contexts/LocationContext"

declare global {
  interface Window {
    kakao: any
  }
}

// kakao.maps 네임스페이스 타입 선언
declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class Map {
    constructor(container: HTMLElement, options: any)
    setCenter(position: LatLng): void
    setLevel(level: number): void
    panTo(position: LatLng): void
  }

  class Marker {
    constructor(options: any)
    setMap(map: Map | null): void
    overlay?: CustomOverlay
  }

  class MarkerImage {
    constructor(src: string, size: Size)
  }

  class Size {
    constructor(width: number, height: number)
  }

  class CustomOverlay {
    constructor(options: any)
    setMap(map: Map | null): void
  }

  namespace event {
    interface MouseEvent {
      latLng: LatLng
    }
  }

  namespace services {
    class Geocoder {
      coord2Address(lng: number, lat: number, callback: (result: any, status: any) => void): void
    }
    namespace Status {
      const OK: string
    }
  }
}

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const isMobile = useMobile()
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showModal, setShowModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)
  const [isList, setList] = useState(false)
  const router = useRouter()
  const [markers, setMarkers] = useState<any[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const listViewRef = useRef<HTMLDivElement>(null)
  const [currentAddress, setCurrentAddress] = useState("제주특별자치도 제주시 중앙로 1")
  const clickedMarkerRef = useRef<any>(null)
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null)
  const { places, setPlaces, isLoading, setIsLoading, keywordList, setKeywordList } = usePlaces()
  const { userLocation, refreshLocation, setManualLocation } = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [autoCompleteResults, setAutoCompleteResults] = useState<{id: number, title: string}[]>([])
  const [isLoadingAutoComplete, setIsLoadingAutoComplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  // 키워드 기반 카페 추천 가져오기
  const fetchKeywordRecommendCafes = async (keywords: string[]) => {
    const response = await axiosInstance.get('/api/v1/cafes/keyword-recommend', {
      params: {
        keywords: keywords.join(',')
      }
    })
    return response.data.data
  }

  // 카페 목록 가져오기
  const fetchPlaces = async (option?: string, keyword?: string) => {
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

      // 검색 결과가 있고 지도가 초기화되어 있다면, 첫 번째 장소로 지도 중심 이동
      if (response.data.data.content.length > 0 && map) {
        const firstPlace = response.data.data.content[0]
        const position = new window.kakao.maps.LatLng(firstPlace.lat, firstPlace.lon)
        map.setCenter(position)
        map.setLevel(3)
      }
    } catch (error) {
      console.error('Failed to fetch places:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 자동완성 검색
  const fetchAutoComplete = async (keyword: string) => {
    if (!keyword.trim()) {
      setAutoCompleteResults([])
      return
    }

    try {
      setIsLoadingAutoComplete(true)
      const response = await axiosInstance.get(`/api/v1/cafes/auto-complete`, {
        params: { keyword }
      })
      console.log(response.data);  
      setAutoCompleteResults(response.data)
    } catch (error) {
      console.error('Failed to fetch auto-complete:', error)
      setAutoCompleteResults([])
    } finally {
      setIsLoadingAutoComplete(false)
    }
  }

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // 이전 타이머가 있다면 제거
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 1초 후에 자동완성 검색 실행
    searchTimeoutRef.current = setTimeout(() => {
      fetchAutoComplete(value)
    }, 1000)
  }

  // 키보드 네비게이션 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchFocused || autoCompleteResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < autoCompleteResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleAutoCompleteSelect(autoCompleteResults[selectedIndex].title)
        } else {
          handleSearch(e)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsSearchFocused(false)
        setAutoCompleteResults([])
        setSelectedIndex(-1)
        break
    }
  }

  // 검색창 포커스 해제 시 선택 인덱스 초기화
  const handleSearchBlur = () => {
    setTimeout(() => {
      setSelectedIndex(-1)
    }, 200)
  }

  // 자동완성 항목 선택
  const handleAutoCompleteSelect = (keyword: string) => {
    setSearchQuery(keyword)
    setAutoCompleteResults([])
    setSelectedIndex(-1)
    handleSearch(new Event('submit') as any)
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPlaces("keyword",searchQuery)
  }

  // 카카오맵 초기화 및 마커 생성
  const initializeMap = useCallback(() => {
    if (!mapRef.current) return

    // 기본 좌표 (제주시청)
    const defaultPosition = new window.kakao.maps.LatLng(33.4996213, 126.5311884)
    
    // places 배열의 첫 번째 요소가 있으면 그 좌표 사용, 없으면 기본 좌표 사용
    const centerPosition = places.length > 0 
      ? new window.kakao.maps.LatLng(places[0].lat, places[0].lon)
      : defaultPosition

    const options = {
      center: centerPosition,
      level: 6,
    }
    const newMap = new window.kakao.maps.Map(mapRef.current, options)
    setMap(newMap)

    // 지도 클릭 이벤트 추가
    window.kakao.maps.event.addListener(newMap, 'click', function(mouseEvent: kakao.maps.event.MouseEvent) {
      const latlng = mouseEvent.latLng
      
      // 이전 클릭 마커 제거
      if (clickedMarkerRef.current) {
        clickedMarkerRef.current.setMap(null)
        clickedMarkerRef.current = null
      }

      // 새로운 마커 생성 (클릭 시에는 별 모양 마커 유지)
      const markerImage = new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new window.kakao.maps.Size(24, 35)
      )

      const marker = new window.kakao.maps.Marker({
        position: latlng,
        image: markerImage,
        zIndex: 3
      })

      marker.setMap(newMap)
      clickedMarkerRef.current = marker

      // 클릭한 위치를 현재 위치로 설정
      setManualLocation({
        lat: latlng.getLat(),
        lon: latlng.getLng()
      })

      // 클릭한 위치의 주소 가져오기
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const roadAddress = result[0].road_address?.address_name
          const address = result[0].address.address_name
          // 도로명주소에서 시/도 부분 제거
          const cleanAddress = (roadAddress || address).replace(/^[가-힣]+(시|도)\s+/, '')
          setCurrentAddress(cleanAddress)
        }
      })
    })

    // 모든 장소에 마커 생성 (기본 파란색 마커 사용)
    const newMarkers = places.map(place => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lon)
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: newMap
      })

      // 커스텀 오버레이 생성
      const overlayContent = document.createElement('div')
      overlayContent.className = 'bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium mb-4'
      overlayContent.textContent = place.title

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: overlayContent,
        zIndex: 3,
        yAnchor: 1.5
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', function() {
        // 이전에 표시된 모든 오버레이 제거
        newMarkers.forEach(m => {
          if (m.overlay) {
            m.overlay.setMap(null)
          }
        })

        // 마커 위치로 지도 중심 이동 (애니메이션 효과 추가)
        newMap.setCenter(position)
        // 줌 레벨 조정
        newMap.setLevel(3)
        // 오버레이 표시
        overlay.setMap(newMap)
        setSelectedPlace(place)
      })

      // 마커에 오버레이 참조 저장
      marker.overlay = overlay

      return marker
    })

    setMarkers(newMarkers)
  }, [places])

  // 카카오맵 스크립트 로드 및 초기화
  useEffect(() => {
    const kakaoMapScript = document.createElement("script")
    kakaoMapScript.async = true
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`
    document.head.appendChild(kakaoMapScript)

    const onLoadKakaoAPI = () => {
      window.kakao.maps.load(() => {
        // place 배열이 비어있을 때만 fetchPopularPlaces 실행
        if (places.length === 0) {
          fetchPopularPlaces()
        }
      })
    }

    kakaoMapScript.addEventListener("load", onLoadKakaoAPI)

    return () => {
      kakaoMapScript.removeEventListener("load", onLoadKakaoAPI)
    }
  }, [])

  // places가 변경될 때마다 지도 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initializeMap()
    }
  }, [initializeMap])

  // 마커 표시/숨김 처리
  useEffect(() => {
    if (!map) return

    markers.forEach(marker => {
      if (isList) {
        marker.setMap(null)
      } else {
        marker.setMap(map)
      }
    })
  }, [isList, map, markers])

  const handlePlaceChange = (direction: 'prev' | 'next') => {
    if (selectedPlace && places.length > 1) {
      const currentIndex = places.indexOf(selectedPlace)
      let newIndex

      if (direction === 'prev') {
        newIndex = (currentIndex - 1 + places.length) % places.length
      } else {
        newIndex = (currentIndex + 1) % places.length
      }

      const newPlace = places[newIndex]
      setSelectedPlace(newPlace)

      if (map) {
        const position = new window.kakao.maps.LatLng(newPlace.lat, newPlace.lon)
        map.panTo(position)
        map.setLevel(3)

        // 이전에 표시된 모든 오버레이 제거
        markers.forEach(marker => {
          if (marker.overlay) {
            marker.overlay.setMap(null)
          }
        })

        // 새로운 장소의 마커 찾기
        const newMarker = markers.find(m => {
          const markerPos = m.getPosition()
          return markerPos.getLat() === newPlace.lat && markerPos.getLng() === newPlace.lon
        })

        // 새로운 마커의 오버레이 표시
        if (newMarker && newMarker.overlay) {
          newMarker.overlay.setMap(map)
        }
      }
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200 // 스크롤할 픽셀 양
      const currentScroll = scrollRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const handleCardClick = (place: Place) => {
    setSelectedPlace(place)
    setShowModal(true)
  }

  const moveToCurrentLocation = () => {
    if (!map || !userLocation) return

    const locPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lon)
    
    map.setCenter(locPosition)
    map.setLevel(3)

    // 이전 현재 위치 마커 제거
    if (currentLocationMarker) {
      currentLocationMarker.setMap(null)
    }

    // 현재 위치 마커 생성
    const markerImage = new window.kakao.maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
      new window.kakao.maps.Size(24, 35)
    )

    const marker = new window.kakao.maps.Marker({
      position: locPosition,
      image: markerImage,
      zIndex: 3
    })

    marker.setMap(map)
    setCurrentLocationMarker(marker)

    // 좌표로 주소 변환
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.coord2Address(userLocation.lon, userLocation.lat, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const roadAddress = result[0].road_address?.address_name
        const address = result[0].address.address_name
        // 도로명주소에서 시/도 부분 제거
        const cleanAddress = (roadAddress || address).replace(/^[가-힣]+(시|도)\s+/, '')
        setCurrentAddress(cleanAddress)
      }
    })
  }

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (listViewRef.current) {
        const scrollTop = listViewRef.current.scrollTop
        setShowScrollTop(scrollTop > 100)
      }
    }

    const listViewElement = listViewRef.current
    if (listViewElement) {
      listViewElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (listViewElement) {
        listViewElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // 스크롤을 최상단으로 이동
  const scrollToTop = () => {
    if (listViewRef.current) {
      listViewRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const toggleKeywords = (placeId: number) => {
    setExpandedKeywords(prev => ({
      ...prev,
      [placeId]: !prev[placeId]
    }))
  }

  const handleCardBookmarkToggle = async (placeId: number, e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지

    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        if (confirm("북마크를 추가하려면 로그인이 필요합니다. 로그인하시겠습니까?")) {
          router.push("/login")
        }
        return
      }

      const place = places.find(p => p.id === placeId)
      if (!place) return

      if (place.isBookmarked) {
        // 북마크 삭제
        await axiosInstance.delete(`/api/v1//bookmarks/${placeId}`)
      } else {
        // 북마크 추가
        await axiosInstance.post(`/api/v1/bookmarks/${placeId}`)
      }

      // places 배열 업데이트
      setPlaces(prev =>
        prev.map((p) =>
          p.id === placeId
            ? { ...p, isBookmarked: !p.isBookmarked }
            : p
        )
      )

      // selectedPlace가 현재 토글한 장소라면 함께 업데이트
      if (selectedPlace?.id === placeId) {
        setSelectedPlace(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  // places 배열이 변경될 때마다 실행
  useEffect(() => {
    console.log("places updated:", places)
  }, [places])

  const handleKeywordClick = async (keyword: string) => {
    setIsKeywordLoading(true)
    try {
      // 이미 선택된 키워드면 제거, 아니면 추가
      const newKeywords = selectedKeywords.includes(keyword)
        ? selectedKeywords.filter(k => k !== keyword)
        : [...selectedKeywords, keyword]
      
      setSelectedKeywords(newKeywords)

      if (newKeywords.length > 0) {
        const data = await fetchKeywordRecommendCafes(newKeywords)
        setPlaces(data.content)
      } else {
        // 키워드가 모두 해제되면 인기 카페 목록으로 복귀
        await fetchPopularPlaces()
      }
    } catch (error) {
      console.error('Failed to fetch keyword places:', error)
    } finally {
      setIsKeywordLoading(false)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* 검색 오버레이 */}
      {isSearchFocused && (
        <div className="fixed inset-0 bg-white z-40" />
      )}
      <div className="absolute top-4 left-4 right-4 z-50">
        <form onSubmit={handleSearch} className="relative">
          <Input 
            className="pl-10 pr-10 py-2 bg-white rounded-full shadow-lg" 
            placeholder="검색어를 입력하세요" 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={handleSearchBlur}
            onKeyDown={handleKeyDown}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {isSearchFocused && (
            <button
              type="button"
              onClick={() => {
                setIsSearchFocused(false)
                setSearchQuery("")
                setAutoCompleteResults([])
                setSelectedIndex(-1)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </form>

        {/* 자동완성 결과 */}
        {isSearchFocused && (searchQuery.trim() || isLoadingAutoComplete) && (
          <div className="absolute left-0 right-0 mt-16 bg-white rounded-xl overflow-hidden">
            {isLoadingAutoComplete ? (
              <div className="p-4 text-center text-gray-500">
                검색 중...
              </div>
            ) : autoCompleteResults.length > 0 ? (
              <div className="overflow-y-auto">
                {autoCompleteResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleAutoCompleteSelect(result.title)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 border-b last:border-b-0 ${
                      index === selectedIndex ? 'bg-gray-50' : ''
                    }`}
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{result.title}</span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-gray-500">
                검색 결과가 없습니다
              </div>
            ) : null}
          </div>
        )}
        <div className="relative my-1">
          {/* 왼쪽 스크롤 버튼 */}
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-20"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* 키워드 버튼 컨테이너 */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide px-4 py-2 justify-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {keywordList.length > 0 ? (
              keywordList.map((keyword, index) => (
                <button 
                  key={index}
                  className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm whitespace-nowrap"
                  onClick={() => {
                    setSearchQuery(keyword)
                    fetchPlaces("keyword", keyword)
                  }}
                >
                  {keyword}
                </button>
              ))
            ) : (
              <>
                
              </>
            )}
          </div>

          {/* 오른쪽 스크롤 버튼 */}
          <button 
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-20"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 현재 위치 버튼 */}
      {!isList && (
        <div className="absolute top-32 left-4 right-4 z-30 flex items-center justify-between">
          <div 
            className="bg-gray-100/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-200/90 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(currentAddress)
                .then(() => {
                  alert('주소가 클립보드에 복사되었습니다.')
                })
                .catch(() => {
                  alert('주소 복사에 실패했습니다.')
                })
            }}
          >
            <span className="text-sm text-gray-700 font-medium truncate max-w-[270px] block">
              {currentAddress}
            </span>
          </div>
          <button 
            onClick={moveToCurrentLocation}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">현재 위치</span>
          </button>
        </div>
      )}

      {/* 지도/리스트 뷰 */}
      {isList ? (
        <div className="pt-24 pb-24 px-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                카페 목록을 불러오는 중...
              </div>
            ) : places.length > 0 ? (
              places.map((place) => (
                <div
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace(place)
                    setShowModal(true)
                  }}
                  className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={place.imageUrl || FALLBACK_IMAGE_URL} 
                        alt={place.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = FALLBACK_IMAGE_URL;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h2 className="text-lg font-bold truncate">{place.title}</h2>
                          <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                            <span className="font-medium text-orange-600 text-sm">{place.rate}</span>
                          </div>
                          <span className="text-gray-500 text-sm flex-shrink-0">({place.reviewCount})</span>
                        </div>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={(e) => handleCardBookmarkToggle(place.id, e)}
                        >
                          <Heart className={`w-5 h-5 ${place.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{place.address}</span>
                      </div>
                      {place.keywordList && place.keywordList.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex-1 flex flex-wrap gap-1">
                            {place.keywordList
                              .slice(0, expandedKeywords[place.id] ? undefined : 5)
                              .map((keyword, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {keyword.keyword}
                                </span>
                              ))}
                          </div>
                          {place.keywordList.length > 5 && (
                            <button
                              onClick={() => toggleKeywords(place.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                            >
                              {expandedKeywords[place.id] ? '접기' : '더보기'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                카페 목록이 없습니다
              </div>
            )}
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full absolute inset-0" />
      )}

      {/* 리스트 뷰 오버레이 */}
      {isList && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20" onClick={() => setList(false)}>
          <div className="absolute top-32 inset-x-0 bottom-0 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="h-[80%] flex flex-col">
              {/* 리스트 헤더 */}
              <div className="px-4 py-2 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">장소 목록</h2>
                <div className="flex bg-white rounded-full shadow-lg p-0.5">
                  <button
                    onClick={() => setList(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      !isList ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">지도</span>
                  </button>
                  <button
                    onClick={() => setList(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      isList ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-xs font-medium">목록</span>
                  </button>
                </div>
              </div>

              {/* 리스트 컨텐츠 */}
              <div className="flex-1 overflow-y-auto px-4 py-2 pb-24">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      카페 목록을 불러오는 중...
                    </div>
                  ) : places.length > 0 ? (
                    places.map((place) => (
                      <div
                        key={place.id}
                        onClick={() => {
                          setSelectedPlace(place)
                          setShowModal(true)
                        }}
                        className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                            <img 
                              src={place.imageUrl || FALLBACK_IMAGE_URL} 
                              alt={place.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = FALLBACK_IMAGE_URL;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <h2 className="text-lg font-bold truncate">{place.title}</h2>
                                <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                                  <span className="font-medium text-orange-600 text-sm">{place.rate}</span>
                                </div>
                                <span className="text-gray-500 text-sm flex-shrink-0">({place.reviewCount})</span>
                              </div>
                              <button 
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={(e) => handleCardBookmarkToggle(place.id, e)}
                              >
                                <Heart className={`w-5 h-5 ${place.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{place.address}</span>
                            </div>
                            {place.keywordList && place.keywordList.length > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="flex-1 flex flex-wrap gap-1">
                                  {place.keywordList
                                    .slice(0, expandedKeywords[place.id] ? undefined : 5)
                                    .map((keyword, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                      >
                                        {keyword.keyword}
                                      </span>
                                    ))}
                                </div>
                                {place.keywordList.length > 5 && (
                                  <button
                                    onClick={() => toggleKeywords(place.id)}
                                    className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                                  >
                                    {expandedKeywords[place.id] ? '접기' : '더보기'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      카페 목록이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPlace && !isList && (
        <>
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-10">
            {/* 토글 버튼 */}
            <div className="absolute -top-12 right-0 flex bg-white rounded-full shadow-lg p-0.5">
              <button
                onClick={() => setList(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                  !isList ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium">지도</span>
              </button>
              <button
                onClick={() => setList(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                  isList ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-xs font-medium">목록</span>
              </button>
            </div>

            {/* 이전 버튼 */}
            <button 
              onClick={() => handlePlaceChange('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-6 bg-gray-100 p-3 rounded-full shadow-lg hover:bg-orange-200 transition-colors z-20"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            {/* 카드 */}
            <div 
              onClick={() => handleCardClick(selectedPlace)}
              className="bg-white rounded-2xl shadow-lg px-10 py-4 cursor-pointer hover:shadow-xl transition-shadow h-[180px]"
            >
              <div className="flex items-center gap-4 h-full">
                {/* 왼쪽 컨텐츠 영역 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold truncate">{selectedPlace?.title}</h2>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardBookmarkToggle(selectedPlace.id, e)
                      }}
                    >
                      <Heart className={`w-6 h-6 ${selectedPlace?.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-orange-600 text-sm">{selectedPlace?.rate}</span>
                    </div>
                    <span className="text-gray-500 text-sm flex-shrink-0">({selectedPlace?.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{selectedPlace?.address}</span>
                  </div>
                </div>
                {/* 오른쪽 이미지 영역 */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedPlace?.imageUrl || FALLBACK_IMAGE_URL} 
                    alt={selectedPlace?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_IMAGE_URL;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 다음 버튼 */}
            <button 
              onClick={() => handlePlaceChange('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-6 bg-gray-100 p-3 rounded-full shadow-lg hover:bg-orange-200 transition-colors z-20"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </>
      )}

      {showModal && selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => {
            setShowModal(false)
          }}
          onBookmarkChange={(placeId, isBookmarked) => {
            setPlaces(prev =>
              prev.map((place) =>
                place.id === placeId
                  ? { ...place, isBookmarked }
                  : place
              )
            )
          }}
        />
      )}

      {/* 최상단 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors z-50"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* 검색 결과 */}
      {places.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              검색 결과 {searchResult?.totalElements || 0}개
            </h2>
            <span className="text-sm text-gray-500">
              {searchResult ? `${searchResult.number + 1} / ${searchResult.totalPages} 페이지` : ''}
            </span>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex-none w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPlace(place)}
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={place.imageUrl || FALLBACK_IMAGE_URL} 
                      alt={place.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-lg font-bold truncate">{place.title}</h2>
                        <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                          <span className="font-medium text-orange-600 text-sm">{place.rate}</span>
                        </div>
                        <span className="text-gray-500 text-sm flex-shrink-0">({place.reviewCount})</span>
                      </div>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={(e) => handleCardBookmarkToggle(place.id, e)}
                      >
                        <Heart className={`w-5 h-5 ${place.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{place.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
