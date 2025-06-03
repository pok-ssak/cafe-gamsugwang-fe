import axios from 'axios'
import { Place } from '@/types/place'

const DEFAULT_LOCATION = {
  lat: 33.4996213,
  lon: 126.5311884
}

export function useCafeApi() {
  // 맞춤 추천 카페 가져오기
  const fetchSelfRecommendCafes = async (lat: number, lon: number) => {
    console.log('[useCafeApi] fetchSelfRecommendCafes called with:', { lat, lon })
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/self-recommend`, {
        params: {
          lat,
          lon
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        withCredentials: true
      })
      console.log('[useCafeApi] fetchSelfRecommendCafes response:', response.data.data)
      return response.data.data as Place[]
    } catch (error) {
      console.error('[useCafeApi] Failed to fetch self recommend cafes:', error)
      // 위치 정보를 가져오는데 실패한 경우 기본 좌표(제주시청) 사용
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/self-recommend`, {
        params: {
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        withCredentials: true
      })
      console.log('[useCafeApi] fetchSelfRecommendCafes fallback response:', response.data.data)
      return response.data.data as Place[]
    }
  }

  // 근처 카페 가져오기
  const fetchNearbyCafes = async (lat: number, lon: number) => {
    console.log('[useCafeApi] fetchNearbyCafes called with:', { lat, lon })
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/recommend`, {
        params: {
          option: "location",
          lat,
          lon,
          keyword: " "
        },
        withCredentials: true
      })
      console.log('[useCafeApi] fetchNearbyCafes response:', response.data.data)
      return response.data.data as Place[]
    } catch (error) {
      console.error('[useCafeApi] Failed to fetch nearby cafes:', error)
      return []
    }
  }

  // 근처 카페 최초 1회 가져오기
  const fetchInitialNearbyCafes = async (lat: number, lon: number) => {
    console.log('[useCafeApi] fetchInitialNearbyCafes called with:', { lat, lon })
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/recommend`, {
        params: {
          option: "location",
          lat,
          lon,
          keyword: " ",
          isInitial: true  // 최초 1회 요청임을 표시
        },
        withCredentials: true
      })
      console.log('[useCafeApi] fetchInitialNearbyCafes response:', response.data.data)
      return response.data.data as Place[]
    } catch (error) {
      console.error('[useCafeApi] Failed to fetch initial nearby cafes:', error)
      return []
    }
  }

  // 카페 검색
  const searchCafes = async (keyword: string, page: number = 1, size: number = 10) => {
    console.log('[useCafeApi] searchCafes called with:', { keyword, page, size })
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/search`, {
        params: {
          keyword,
          page,
          size
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        withCredentials: true
      })
      console.log('[useCafeApi] searchCafes response:', response.data.data)
      return response.data.data as Place[]
    } catch (error) {
      console.error('[useCafeApi] Failed to search cafes:', error)
      return []
    }
  }

  // 키워드 기반 카페 추천
  const fetchKeywordRecommendCafes = async (keywords: string[]) => {
    console.log('[useCafeApi] fetchKeywordRecommendCafes called with:', { keywords })
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/cafes/recommend`, {
        params: {
          option: "keyword",
          keyword: keywords.join(' ')  // 키워드 배열을 쉼표로 구분된 문자열로 변환
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        withCredentials: true
      })
      console.log('[useCafeApi] fetchKeywordRecommendCafes response:', response.data.data)
      return response.data.data as Place[]
    } catch (error) {
      console.error('[useCafeApi] Failed to fetch keyword recommend cafes:', error)
      return []
    }
  }

  return {
    fetchSelfRecommendCafes,
    fetchNearbyCafes,
    fetchInitialNearbyCafes,
    searchCafes,
    fetchKeywordRecommendCafes
  }
} 