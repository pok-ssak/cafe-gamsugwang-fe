import { Place } from "@/types/place"
import axios from 'axios'

export const useCafeApi = () => {
  const fetchKeywordRecommendCafes = async (keywords: string[]): Promise<Place[]> => {
    try {
      const response = await axios.post('/api/cafes/recommend', 
        { keywords },
        { params: { option: 'keyword' } }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching keyword recommended cafes:', error)
      throw error
    }
  }

  const fetchSelfRecommendCafes = async (latitude: number, longitude: number): Promise<Place[]> => {
    try {
      const response = await axios.get('/api/cafes/self-recommend', {
        params: {
          option: 'location',
          latitude,
          longitude
        }
      })
    
      return response.data
    } catch (error) {
      console.error('Error fetching self recommended cafes:', error)
      throw error
    }
  }

  const fetchNearbyCafes = async (latitude: number, longitude: number): Promise<Place[]> => {
    try {
      const response = await axios.get('/api/cafes/recommend', {
        params: {
          option: 'location',
          latitude,
          longitude
        }
      })
      return response.data
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
