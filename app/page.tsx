"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Star, ChevronLeft, ChevronRight, MapPin, Heart, Compass } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    kakao: any
  }
}

interface Place {
  id: string
  name: string
  lat: number
  lng: number
  description: string  // 장소 설명
  rating: number      // 평점
  reviewCount: number // 리뷰 수
  imageUrl?: string
  address: string
  phone: string
  businessHours: string
}

const PLACES: Place[] = [
  {
    id: "jeju-city-hall",
    name: "제주시청",
    lat: 33.4996213,
    lng: 126.5311884,
    description: "제주시청은 제주시의 중심지입니다.",
    rating: 4.5,
    reviewCount: 100,
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
    address: "제주특별자치도 제주시 광양9길 10",
    phone: "064-728-2114",
    businessHours: "09:00 - 18:00"
  },
  {
    name: "용두암",
    lat: 33.5159423,
    lng: 126.5129876,
    description: "용두암은 제주시의 중심지입니다.",
    rating: 4.5,
    reviewCount: 100
  }
]

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const isMobile = useMobile()
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const kakaoMapScript = document.createElement("script")
    kakaoMapScript.async = true
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
    document.head.appendChild(kakaoMapScript)

    const onLoadKakaoAPI = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(33.4996213, 126.5311884), // 제주시청
            level: 6,
          }
          const newMap = new window.kakao.maps.Map(mapRef.current, options)
          setMap(newMap)

          const markerImage = new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new window.kakao.maps.Size(24, 35)
          )

          // 모든 장소에 마커 생성
          PLACES.forEach(place => {
            const position = new window.kakao.maps.LatLng(place.lat, place.lng)
            
            const marker = new window.kakao.maps.Marker({
              position: position,
              map: newMap,
              image: markerImage
            })

            // 커스텀 오버레이 생성
            const overlayContent = document.createElement('div')
            overlayContent.className = 'bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium mb-4'
            overlayContent.textContent = place.name

            const overlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: overlayContent,
              yAnchor: 1.5,  // 마커 위에 표시
              zIndex: 3      // 다른 요소들 위에 표시
            })

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', function() {
              // 마커 위치로 지도 중심 이동
              newMap.panTo(position)
              // 줌 레벨 조정
              newMap.setLevel(3)
              // 오버레이 표시
              overlay.setMap(newMap)
              setSelectedPlace(place)
            })

            // 다른 마커 클릭 시 현재 오버레이 숨기기
            window.kakao.maps.event.addListener(newMap, 'click', function() {
              overlay.setMap(null)
            })
          })
        }
      })
    }

    kakaoMapScript.addEventListener("load", onLoadKakaoAPI)

    return () => {
      kakaoMapScript.removeEventListener("load", onLoadKakaoAPI)
    }
  }, [])

  const handlePlaceChange = (direction: 'prev' | 'next') => {
    if (selectedPlace && PLACES.length > 1) {
      const currentIndex = PLACES.indexOf(selectedPlace)
      let newIndex

      if (direction === 'prev') {
        newIndex = (currentIndex - 1 + PLACES.length) % PLACES.length
      } else {
        newIndex = (currentIndex + 1) % PLACES.length
      }

      const newPlace = PLACES[newIndex]
      setSelectedPlace(newPlace)

      if (map) {
        const position = new window.kakao.maps.LatLng(newPlace.lat, newPlace.lng)
        map.panTo(position)
        map.setLevel(3)
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
    router.push(`/places/${place.id}`)
  }

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <Input className="pl-10 pr-4 py-2 bg-white rounded-full shadow-lg" placeholder="검색어를 입력하세요" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
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
            className="flex overflow-x-auto scrollbar-hide px-4 py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm">카페</button>
            <button className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm">맛집</button>
            <button className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm">관광지</button>
            <button className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm">숙소</button>
            <button className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm">쇼핑</button>
            <button className="flex-shrink-0 px-4 py-2 mx-1 bg-orange-50 rounded-full shadow-lg text-sm">액티비티</button>
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
      <div ref={mapRef} className="w-full h-full" />
      <div className="pb-16" /> {/* Space for bottom navigation */}
      {selectedPlace && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-10">
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
            className="bg-white rounded-2xl shadow-lg px-10 py-4 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* 왼쪽 컨텐츠 영역 */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedPlace?.name}</h2>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Heart className="w-6 h-6 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-medium text-lg">{selectedPlace?.rating}</span>
                  </div>
                  <span className="text-gray-500">({selectedPlace?.reviewCount}개의 리뷰)</span>
                </div>
                <p className="text-gray-600 text-base mb-4 leading-relaxed">{selectedPlace?.description}</p>
              </div>
              {/* 오른쪽 이미지 영역 */}
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={selectedPlace?.imageUrl} 
                  alt={selectedPlace?.name}
                  className="w-full h-full object-cover"
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
      )}
    </div>
  )
}
