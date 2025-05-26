"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Star, ChevronLeft, ChevronRight, MapPin, Heart, Compass, List, Navigation, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import { Place } from "@/types/place"
import { PlaceDetailModal } from "@/components/place-detail-modal"
import { Button } from "@/components/ui/button"
import axios from "axios"

declare global {
  interface Window {
    kakao: any
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
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 카페 목록 가져오기
  const fetchPlaces = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes`, {
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/recommend?keyword=&option=location&lat=33.4996213&lon=126.5311884`, {
        withCredentials: true
      })
      console.log(response.data.data.content);
      setPlaces(response.data.data.content)
    } catch (error) {
      console.error('Failed to fetch places:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaces()
  }, [])

  useEffect(() => {
    const kakaoMapScript = document.createElement("script")
    kakaoMapScript.async = true
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`
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

          // 지도 클릭 이벤트 추가
          window.kakao.maps.event.addListener(newMap, 'click', function(mouseEvent: any) {
            const latlng = mouseEvent.latLng
            
            // 이전 클릭 마커 제거
            if (clickedMarkerRef.current) {
              clickedMarkerRef.current.setMap(null)
              clickedMarkerRef.current = null
            }

            // 새로운 마커 생성
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

            // 클릭한 위치의 주소 가져오기
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const roadAddress = result[0].road_address?.address_name
                const address = result[0].address.address_name
                setCurrentAddress(roadAddress || address)
              }
            })
          })

          const markerImage = new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new window.kakao.maps.Size(24, 35)
          )

          // 모든 장소에 마커 생성
          places.forEach(place => {
            console.log(place)
            const position = new window.kakao.maps.LatLng(place.lat, place.lon)
            
            const marker = new window.kakao.maps.Marker({
              position: position,
              map: newMap,
              image: markerImage
            })

            // 커스텀 오버레이 생성
            const overlayContent = document.createElement('div')
            overlayContent.className = 'bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium mb-4'
            overlayContent.textContent = place.title

            const overlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: overlayContent,
              zIndex: 3
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

          // 마커 생성
          const newMarkers = places.map(place => {
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(place.lat, place.lon),
              title: place.title
            })

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', () => {
              setSelectedPlace(place)
            })

            return marker
          })

          setMarkers(newMarkers)
        }
      })
    }

    kakaoMapScript.addEventListener("load", onLoadKakaoAPI)

    return () => {
      kakaoMapScript.removeEventListener("load", onLoadKakaoAPI)
    }
  }, [places]) // places가 변경될 때마다 지도 업데이트

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
    if (!map) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const locPosition = new window.kakao.maps.LatLng(lat, lng)
          
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
          geocoder.coord2Address(lng, lat, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const roadAddress = result[0].road_address?.address_name
              const address = result[0].address.address_name
              setCurrentAddress(roadAddress || address)
            }
          })
        },
        (error) => {
          console.error(error)
          alert('위치 정보를 가져오는데 실패했습니다.')
        }
      )
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    }
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

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 right-4 z-30">
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

      {/* 현재 위치 버튼 */}
      {!isList && (
        <div className="absolute top-32 left-4 right-4 z-30 flex items-center justify-between">
          <div className="bg-gray-100/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
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
                        src={place.imageUrl} 
                        alt={place.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{place.title}</h3>
                          <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-orange-600">{place.rating}</span>
                          </div>
                          <span className="text-gray-500 text-sm">({place.ratingCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{place.address}</span>
                      </div>
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
            <div className="h-full flex flex-col">
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
                              src={place.imageUrl} 
                              alt={place.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{place.title}</h3>
                                <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-orange-600">{place.rating}</span>
                                </div>
                                <span className="text-gray-500 text-sm">({place.ratingCount})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{place.address}</span>
                            </div>
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
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                      <Heart className="w-6 h-6 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-orange-600 text-sm">{selectedPlace?.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm flex-shrink-0">({selectedPlace?.ratingCount})</span>
                  </div>
                  <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-2">{selectedPlace?.description}</p>
                </div>
                {/* 오른쪽 이미지 영역 */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedPlace?.imageUrl} 
                    alt={selectedPlace?.title}
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
        </>
      )}

      {showModal && selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => {
            setShowModal(false)
            setSelectedPlace(null)
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
    </div>
  )
}
