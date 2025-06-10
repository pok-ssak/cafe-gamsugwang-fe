import { useEffect, useRef, useState } from "react"
import { Place } from "@/types/place"

interface MapProps {
  places: Place[]
  onPlaceSelect?: (place: Place) => void
  onMapClick?: (lat: number, lng: number) => void
  center?: { lat: number; lng: number }
  level?: number
  className?: string
  initialPlace?: Place
}

export function Map({ 
  places, 
  onPlaceSelect, 
  onMapClick,
  center,
  level = 3,
  className = "w-full h-full",
  initialPlace
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Determine initial center position
    let initialCenter
    if (places.length > 0 && places[0].lat && places[0].lon) {
      // Use first place's coordinates if available
      initialCenter = new window.kakao.maps.LatLng(places[0].lat, places[0].lon)
    } else if (center) {
      // Use provided center if no places
      initialCenter = new window.kakao.maps.LatLng(center.lat, center.lng)
    } else {
      // Default to Jeju City Hall
      initialCenter = new window.kakao.maps.LatLng(33.4996213, 126.5311884)
    }

    const options = {
      center: initialCenter,
      level: level
    }

    const newMap = new window.kakao.maps.Map(mapRef.current, options)
    setMap(newMap)

    // Add click event listener
    window.kakao.maps.event.addListener(newMap, 'click', function(mouseEvent: any) {
      const latlng = mouseEvent.latLng
      onMapClick?.(latlng.getLat(), latlng.getLng())
    })

    return () => {
      // Cleanup markers when component unmounts
      markers.forEach(marker => {
        if (marker.marker) {
          marker.marker.setMap(null)
        }
        if (marker.overlay) {
          marker.overlay.setMap(null)
        }
      })
    }
  }, [places, center]) // Add places and center as dependencies

  // 마커 생성 함수
  const createMarker = (place: Place) => {
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(place.lat, place.lon),
      map: map
      })

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      setSelectedPlace(place)
      })

    return marker
  }

  // 마커 생성 및 관리
  useEffect(() => {
    if (!map || !places) return

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
        
    // 새로운 마커 생성
    const newMarkers = places.map(place => createMarker(place))
    setMarkers(newMarkers)

    return () => {
      newMarkers.forEach(marker => marker.setMap(null))
    }
  }, [map, places])

  // Update map center when center prop changes
  useEffect(() => {
    if (!map || !center) return
    const position = new window.kakao.maps.LatLng(center.lat, center.lng)
    map.setCenter(position)
    map.setLevel(level)
  }, [map, center, level])

  // 현재 위치 마커 생성
  useEffect(() => {
    if (!map || !center) return

    // 현재 위치 마커 이미지 생성
    const currentLocationImage = new window.kakao.maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
      new window.kakao.maps.Size(24, 35)
    )

    // 현재 위치 마커 생성
    const currentLocationMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(center.lat, center.lng),
      image: currentLocationImage,
      zIndex: 4
    })

    // 마커를 지도에 표시
    currentLocationMarker.setMap(map)

    // 마커 클릭 이벤트 추가
    window.kakao.maps.event.addListener(currentLocationMarker, 'click', function() {
      // 현재 위치로 지도 중심 이동
      map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng))
      map.setLevel(level)
    })

    return () => {
      currentLocationMarker.setMap(null)
    }
  }, [map, center, level])

  return <div ref={mapRef} className={className} />
} 