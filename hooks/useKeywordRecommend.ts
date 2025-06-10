import { useState } from 'react'
import { Place } from '@/types/place'
import axiosInstance from '@/lib/axios'

export function useKeywordRecommend() {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaces = async (keywords: string[]) => {
    if (keywords.length === 0) {
      setPlaces([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get('/api/v1/cafes/recommend', {
        params: { 
          option: "keyword",
          keyword: keywords.join(',') 
        }
      })
      setPlaces(response.data.data.content)
      console.log('Successfully fetched keyword-based places:', response.data.data.content.length, 'items for keywords:', keywords)
    } catch (error) {
      console.error('Failed to fetch keyword-based places:', error)
      setError('키워드 기반 카페를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    keywordRecommend: {
      places,
      isLoading,
      error,
      fetchPlaces
    }
  }
} 