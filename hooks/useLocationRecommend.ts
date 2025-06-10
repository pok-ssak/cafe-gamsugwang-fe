import { useState } from 'react'
import { Place } from '@/types/place'
import axiosInstance from '@/lib/axios'

export function useLocationRecommend() {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchPlaces = async (latitude: number, longitude: number, page: number = 1) => {
    if (page === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const response = await axiosInstance.get('/api/v2/cafes/recommend', {
        params: { 
          option: "location",
          lat: latitude, 
          lon: longitude,
          page: page,
          keyword: ""
        }
      })
      
      if (page === 1) {
        setPlaces(response.data.data.content)
      } else {
        setPlaces(prev => [...prev, ...response.data.data.content])
      }
      
      setHasMore(!response.data.data.last)
      setPage(page)
      console.log('Successfully fetched nearby places:', response.data.data.content.length, 'items')
    } catch (error) {
      console.error('Failed to fetch nearby places:', error)
      setError('근처 카페를 불러오는데 실패했습니다.')
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
    await fetchPlaces(latitude, longitude, page + 1)
  }

  const refresh = async (latitude: number, longitude: number) => {
    setPage(1)
    setHasMore(true)
    await fetchPlaces(latitude, longitude)
  }

  return {
    locationRecommend: {
      places,
      isLoading,
      error,
      hasMore,
      isLoadingMore,
      fetchPlaces,
      loadMore,
      refresh
    }
  }
} 