"use client"

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
  setManualLocation: (location: Location) => void
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

  const generateRandomJejuLocation = () => {
    const minLat = 33.1
    const maxLat = 33.6
    const minLon = 126.1
    const maxLon = 126.9

    const lat = minLat + Math.random() * (maxLat - minLat)
    const lon = minLon + Math.random() * (maxLon - minLon)

    return { lat, lon }
  }

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
        () => {
          setError('위치 정보를 가져오는데 실패했습니다.')
          setIsLoading(false)
        }
      )
    } else {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다.')
      setIsLoading(false)
    }
  }

  const setManualLocation = (location: Location) => {
    setUserLocation(location)
  }

  useEffect(() => {
    getUserLocation()
  }, [])

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
        refreshLocation: getUserLocation,
        setManualLocation
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