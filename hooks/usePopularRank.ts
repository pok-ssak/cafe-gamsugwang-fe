import { useState } from 'react'
import { Place } from '@/types/place'
import { useSelfRecommend } from './useSelfRecommend'

export function usePopularRank() {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchPopularPlaces = async (latitude: number, longitude: number, page: number = 1) => {
    if (page === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const response = await fetch(`/api/v2/cafes/self-recommend?lat=${latitude}&lon=${longitude}&page=${page}`)
      const data = await response.json()
      
      if (page === 1) {
        setPlaces(data.data.content)
      } else {
        setPlaces(prev => [...prev, ...data.data.content])
      }
      
      setHasMore(!data.data.last)
      setPage(page)
    } catch (error) {
      console.error('Failed to fetch popular places:', error)
      setError('인기 카페를 불러오는데 실패했습니다.')
    } finally {
      if (page === 1) {
        setIsLoading(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }

  const loadMore = async (latitude: number, longitude: number) => {
    if (!hasMore || isLoadingMore) return
    await fetchPopularPlaces(latitude, longitude, page + 1)
  }

  const refresh = async (latitude: number, longitude: number) => {
    setPage(1)
    setHasMore(true)
    await fetchPopularPlaces(latitude, longitude)
  }

  return {
    places,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    fetchPopularPlaces,
    loadMore,
    refresh
  }
} 