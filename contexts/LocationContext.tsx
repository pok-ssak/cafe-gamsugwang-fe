import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Location {
  lat: number
  lon: number
}

interface LocationContextType {
  userLocation: Location | null
  isLoading: boolean
  error: string | null
  isTestMode: boolean
  setIsTestMode: (isTestMode: boolean) => void
  refreshLocation: () => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

interface LocationProviderProps {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)

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
    setIsLoading(true)
    setError(null)

    if (isTestMode) {
      const randomLocation = generateRandomJejuLocation()
      setUserLocation(randomLocation)
      setIsLoading(false)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setIsLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('위치 정보를 가져오는데 실패했습니다.')
          setIsLoading(false)
        }
      )
    } else {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다.')
      setIsLoading(false)
    }
  }

  // 초기 위치 설정
  useEffect(() => {
    getUserLocation()
  }, [])

  // 테스트 모드 변경 시 위치 새로고침
  useEffect(() => {
    getUserLocation()
  }, [isTestMode])

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLoading,
        error,
        isTestMode,
        setIsTestMode,
        refreshLocation: getUserLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
} 