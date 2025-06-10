import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useLocationRecommend } from '@/hooks/useLocationRecommend'

interface LocationRecommendContextType {
  places: any[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  isLoadingMore: boolean
  fetchPlaces: (latitude: number, longitude: number, page?: number) => Promise<void>
  loadMore: (latitude: number, longitude: number) => Promise<void>
  refresh: (latitude: number, longitude: number) => Promise<void>
}

const LocationRecommendContext = createContext<LocationRecommendContextType | undefined>(undefined)

export function LocationRecommendProvider({ children }: { children: ReactNode }) {
  const { locationRecommend } = useLocationRecommend()

  useEffect(() => {
    // Reset state on mount to ensure consistent initial state
    locationRecommend.refresh(0, 0)
  }, [])

  return (
    <LocationRecommendContext.Provider value={locationRecommend}>
      {children}
    </LocationRecommendContext.Provider>
  )
}

export function useLocationRecommendContext() {
  const context = useContext(LocationRecommendContext)
  if (context === undefined) {
    throw new Error('useLocationRecommendContext must be used within a LocationRecommendProvider')
  }
  return context
} 