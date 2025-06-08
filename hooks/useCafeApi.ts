import { Place } from "@/types/place"
import axiosInstance from "@/lib/axios"

export const useCafeApi = () => {
  const fetchKeywordRecommendCafes = async (keywords: string[], page: number = 1): Promise<{ content: Place[], last: boolean }> => {
    const test = keywords.join(" ")
    console.log(test)
    try {
      const response = await axiosInstance.get('/api/v2/cafes/recommend', {
        params: {
          option: "keyword",
          keyword: test,
          page: page
        },        
      })
      return {
        content: response.data.data.content,
        last: response.data.data.last
      }
    } catch (error) {
      console.error('Error fetching keyword recommended cafes:', error)
      throw error
    }
  }

  const fetchSelfRecommendCafes = async (latitude: number, longitude: number, page: number = 1): Promise<{ content: Place[], last: boolean }> => {
    try {
      const response = await axiosInstance.get('/api/v2/cafes/self-recommend', {
        params: { 
          option: "location",
          lat: latitude, 
          lon: longitude,
          page: page
        }})
      return {
        content: response.data.data.content,
        last: response.data.data.last
      }
    } catch (error) {
      console.error('Error fetching self recommended cafes:', error)
      throw error
    }
  }

  const fetchNearbyCafes = async (latitude: number, longitude: number, page: number = 1): Promise<{ content: Place[], last: boolean }> => {
    console.log(latitude, longitude)
    try {
      const response = await axiosInstance.get(`/api/v2/cafes/recommend`, {
        params: { 
          option: "location",
          lat: latitude,
          lon: longitude,
          keyword: " ",
          page: page
        }
      })
      return {
        content: response.data.data.content,
        last: response.data.data.last
      }
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
