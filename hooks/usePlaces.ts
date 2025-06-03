import { useState, useEffect } from 'react'
import { Place } from '@/types/place'
import { useCafeApi } from './useCafeApi'
import { useLocation } from '@/contexts/LocationContext'

interface UsePlacesProps {
  isTestMode?: boolean
}

export function usePlaces({ isTestMode = false }: UsePlacesProps = {}) {
  const [places, setPlaces] = useState<Place[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { userLocation, isLoading: isLocationLoading, error: locationError } = useLocation()
  const { fetchSelfRecommendCafes, fetchNearbyCafes, fetchInitialNearbyCafes } = useCafeApi()

  // 제주도 랜덤 위치 생성 함수
  const generateRandomJejuLocation = () => {
    // 제주도 대략적인 경계
    const minLat = 33.1  // 제주도 남쪽 끝
    const maxLat = 33.6  // 제주도 북쪽 끝
    const minLon = 126.1 // 제주도 서쪽 끝
    const maxLon = 126.9 // 제주도 동쪽 끝

    const lat = minLat + Math.random() * (maxLat - minLat)
    const lon = minLon + Math.random() * (maxLon - minLon)

    return { lat, lon }
  }

  // 현재 위치 가져오기
  const getUserLocation = () => {
    if (isTestMode) {
      const randomLocation = generateRandomJejuLocation()
      setUserLocation(randomLocation)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  // 맞춤추천 카페 가져오기
  const fetchPlaces = async () => {
    if (!userLocation) return

    try {
      setIsLoading(true)
      const data = await fetchSelfRecommendCafes(userLocation.lat, userLocation.lon)
      setPlaces(data)
    } catch (error) {
      console.error('Failed to fetch places:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 근처 카페 가져오기
  const fetchNearbyPlaces = async () => {
    if (!userLocation) return

    try {
      const data = await fetchNearbyCafes(userLocation.lat, userLocation.lon)
      setNearbyPlaces(data)
    } catch (error) {
      console.error('Failed to fetch nearby places:', error)
    }
  }

  // 초기 위치 설정 및 데이터 로드
  useEffect(() => {
    getUserLocation()
  }, [])

  // 위치가 변경될 때마다 데이터 새로고침
  useEffect(() => {
    if (userLocation) {
      fetchPlaces()
      fetchNearbyPlaces()
    }
  }, [userLocation])

  // 테스트 모드 변경 시 위치 새로고침
  useEffect(() => {
    getUserLocation()
  }, [isTestMode])

  return {
    places,
    nearbyPlaces,
    isLoading: isLoading || isLocationLoading,
    error: locationError,
    refreshPlaces: fetchPlaces,
    refreshNearbyPlaces: fetchNearbyPlaces
  }
} 