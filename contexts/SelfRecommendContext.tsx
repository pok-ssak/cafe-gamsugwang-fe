"use client"

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useSelfRecommend } from '@/hooks/useSelfRecommend'
import { useLocation } from './LocationContext'

interface SelfRecommendContextType {
  places: any[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  isLoadingMore: boolean
  fetchPlaces: (latitude: number, longitude: number, page?: number) => Promise<void>
  loadMore: (latitude: number, longitude: number) => Promise<void>
  refresh: (latitude: number, longitude: number) => Promise<void>
}

const SelfRecommendContext = createContext<SelfRecommendContextType | undefined>(undefined)

export function SelfRecommendProvider({ children }: { children: ReactNode }) {
  const { selfRecommend } = useSelfRecommend()
  const { userLocation } = useLocation()

  useEffect(() => {
    if (userLocation) {
      selfRecommend.fetchPlaces(userLocation.lat, userLocation.lon)
    }
  }, [userLocation])

  return (
    <SelfRecommendContext.Provider value={selfRecommend}>
      {children}
    </SelfRecommendContext.Provider>
  )
}

export function useSelfRecommendContext() {
  const context = useContext(SelfRecommendContext)
  if (context === undefined) {
    throw new Error('useSelfRecommendContext must be used within a SelfRecommendProvider')
  }
  return context
} 