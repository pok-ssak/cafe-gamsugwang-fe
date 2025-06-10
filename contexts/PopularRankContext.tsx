import { createContext, useContext, ReactNode } from 'react'
import { usePopularRank } from '@/hooks/usePopularRank'

interface PopularRankContextType {
  places: any[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  isLoadingMore: boolean
  fetchPopularPlaces: (latitude: number, longitude: number, page?: number) => Promise<void>
  loadMore: (latitude: number, longitude: number) => Promise<void>
  refresh: (latitude: number, longitude: number) => Promise<void>
}

const PopularRankContext = createContext<PopularRankContextType | undefined>(undefined)

export function PopularRankProvider({ children }: { children: ReactNode }) {
  const popularRank = usePopularRank()

  return (
    <PopularRankContext.Provider value={popularRank}>
      {children}
    </PopularRankContext.Provider>
  )
}

export function usePopularRankContext() {
  const context = useContext(PopularRankContext)
  if (context === undefined) {
    throw new Error('usePopularRankContext must be used within a PopularRankProvider')
  }
  return context
} 