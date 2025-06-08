import { useState, useEffect } from 'react'
import { Place } from '@/types/place'
import { useCafeApi } from './useCafeApi'
import { useLocation } from '@/contexts/LocationContext'

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nearbyPage, setNearbyPage] = useState(1)
  const [hasMoreNearby, setHasMoreNearby] = useState(true)
  const [isLoadingMoreNearby, setIsLoadingMoreNearby] = useState(false)
  
  const { fetchSelfRecommendCafes, fetchNearbyCafes } = useCafeApi()
  const { userLocation, isLoading: isLocationLoading, error: locationError } = useLocation()

  const fetchPlaces = async () => {
    if (!userLocation) return

    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching recommended places...')
      const data = await fetchSelfRecommendCafes(userLocation.lat, userLocation.lon)
      console.log('Recommended places fetched:', data)
      setPlaces(data.content)
    } catch (err) {
      console.error('Error fetching recommended places:', err)
      setError('추천 카페를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNearbyPlaces = async (page: number = 1) => {
    if (!userLocation) return

    if (page === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMoreNearby(true)
    }
    
    setError(null)
    try {
      console.log('Fetching nearby places...')
      const data = await fetchNearbyCafes(userLocation.lat, userLocation.lon, page)
      console.log('Nearby places fetched:', data)
      
      if (page === 1) {
        setNearbyPlaces(data.content)
      } else {
        setNearbyPlaces(prev => [...prev, ...data.content])
      }
      
      setHasMoreNearby(!data.last)
      setNearbyPage(page)
    } catch (err) {
      console.error('Error fetching nearby places:', err)
      setError('근처 카페를 불러오는데 실패했습니다.')
    } finally {
      if (page === 1) {
        setIsLoading(false)
      } else {
        setIsLoadingMoreNearby(false)
      }
    }
  }

  const loadMoreNearbyPlaces = async () => {
    if (!hasMoreNearby || isLoadingMoreNearby) return
    await fetchNearbyPlaces(nearbyPage + 1)
  }

  useEffect(() => {
    if (userLocation) {
      fetchPlaces()
      fetchNearbyPlaces(1)
    }
  }, [userLocation])

  const refreshPlaces = () => {
    fetchPlaces()
  }

  const refreshNearbyPlaces = () => {
    setNearbyPage(1)
    setHasMoreNearby(true)
    fetchNearbyPlaces(1)
  }

  return {
    places,
    nearbyPlaces,
    isLoading,
    error,
    hasMoreNearby,
    isLoadingMoreNearby,
    loadMoreNearbyPlaces,
    refreshPlaces,
    refreshNearbyPlaces
  }
} 