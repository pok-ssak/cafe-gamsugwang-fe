import { useState } from 'react'
import { Place } from '@/types/place'
import { useSelfRecommendContext } from '@/contexts/SelfRecommendContext'
import { useLocationRecommendContext } from '@/contexts/LocationRecommendContext'

export function usePlaces() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { fetchPlaces: fetchSelfRecommendPlaces, loadMore: loadMoreSelfRecommend } = useSelfRecommendContext()
  const { fetchPlaces: fetchNearbyPlaces, loadMore: loadMoreNearby } = useLocationRecommendContext()

  return {
    places,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    page,
    setPlaces,
    setIsLoading,
    setError,
    setHasMore,
    setPage,
    setIsLoadingMore,
    fetchSelfRecommendPlaces,
    loadMoreSelfRecommend,
    fetchNearbyPlaces,
    loadMoreNearby
  }
} 