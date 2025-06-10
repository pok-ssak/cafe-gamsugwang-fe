import { useState } from 'react'
import axiosInstance from '@/lib/axios'

export function useKeywordRank() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPopularKeywords = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axiosInstance.get('/api/v2/cafes/top-searches')
      setKeywords(response.data.data)
      console.log('Successfully fetched popular keywords:', response.data.data.length, 'items')
    } catch (error) {
      console.error('Failed to fetch popular keywords:', error)
      setError('인기 키워드를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    keywords,
    isLoading,
    error,
    fetchPopularKeywords
  }
} 