import { useState, useCallback } from 'react'
import { Place } from '@/types/place'
import axiosInstance from '@/lib/axios'

export function useKeywordRecommend() {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaces = useCallback(async (keywords: string[]) => {
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
          keyword: keywords.join(' ') 
        }
      })
      setPlaces(response.data.data)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 에러가 발생했습니다.'
      console.error('[KeywordRecommend] API 호출 실패:', {
        keywords,
        status: error.response?.status,
        message: errorMessage,
        error
      })
      setError('키워드 기반 카페를 불러오는데 실패했습니다.')
      setPlaces([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    keywordRecommend: {
      places,
      isLoading,
      error,
      fetchPlaces
    }
  }
} 