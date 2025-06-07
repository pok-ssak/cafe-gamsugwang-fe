import { Place } from "@/types/place"

export const useCafeApi = () => {
  const fetchKeywordRecommendCafes = async (keywords: string[]): Promise<Place[]> => {
    try {
      const response = await fetch('/api/cafes/keyword-recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch keyword recommended cafes')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching keyword recommended cafes:', error)
      throw error
    }
  }

  const fetchSelfRecommendCafes = async (): Promise<Place[]> => {
    try {
      const response = await fetch('/api/cafes/self-recommend')

      if (!response.ok) {
        throw new Error('Failed to fetch self recommended cafes')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching self recommended cafes:', error)
      throw error
    }
  }

  const fetchNearbyCafes = async (latitude: number, longitude: number): Promise<Place[]> => {
    try {
      const response = await fetch(`/api/cafes/nearby?latitude=${latitude}&longitude=${longitude}`)

      if (!response.ok) {
        throw new Error('Failed to fetch nearby cafes')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching nearby cafes:', error)
      throw error
    }
  }

  return {
    fetchKeywordRecommendCafes,
    fetchSelfRecommendCafes,
    fetchNearbyCafes,
  }
}
