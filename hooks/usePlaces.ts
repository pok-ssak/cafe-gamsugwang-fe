import { useState, useEffect } from 'react'
import { Place } from '@/types/place'
import { useCafeApi } from './useCafeApi'
import { useLocation } from '@/contexts/LocationContext'

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { userLocation, isLoading: isLocationLoading, error: locationError, refreshLocation } = useLocation()
  const { fetchSelfRecommendCafes, fetchNearbyCafes } = useCafeApi()

  const fetchPlaces = async () => {
    if (!userLocation) return

    setIsLoading(true)
    try {
      console.log('Fetching recommended places...')
      const data = await fetchSelfRecommendCafes(userLocation.lat, userLocation.lon)
      console.log('Recommended places fetched:', data)
      setPlaces(data)
    } catch (error) {
      console.error('Failed to fetch recommended places:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNearbyPlaces = async () => {
    if (!userLocation) return

    setIsLoading(true)
    try {
      console.log('Fetching nearby places...')
      const data = await fetchNearbyCafes(userLocation.lat, userLocation.lon)
      console.log('Nearby places fetched:', data)
      setNearbyPlaces(data)
    } catch (error) {
      console.error('Failed to fetch nearby places:', error)
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

  return {
    places,
    nearbyPlaces,
    isLoading: isLoading || isLocationLoading,
    error: locationError,
    refreshPlaces: fetchPlaces,
    refreshNearbyPlaces: fetchNearbyPlaces,
    refreshLocation
  }
} 