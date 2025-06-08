import { useState, useEffect } from 'react'
import { Place } from '@/types/place'
import { useCafeApi } from './useCafeApi'
import { useLocation } from '@/contexts/LocationContext'

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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

  const fetchNearbyPlaces = async () => {
    if (!userLocation) return

    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching nearby places...')
      const data = await fetchNearbyCafes(userLocation.lat, userLocation.lon)
      console.log('Nearby places fetched:', data)
      setNearbyPlaces(data.content)
    } catch (err) {
      console.error('Error fetching nearby places:', err)
      setError('근처 카페를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userLocation) {
      fetchPlaces()
      fetchNearbyPlaces()
    }
  }, [userLocation])

  const refreshPlaces = () => {
    fetchPlaces()
  }

  const refreshNearbyPlaces = () => {
    fetchNearbyPlaces()
  }

  return {
    places,
    nearbyPlaces,
    isLoading: isLoading || isLocationLoading,
    error: error || locationError,
    refreshPlaces,
    refreshNearbyPlaces
  }
} 