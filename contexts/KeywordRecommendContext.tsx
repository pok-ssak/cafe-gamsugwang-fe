"use client"

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useKeywordRecommend } from '@/hooks/useKeywordRecommend'
import { Place } from '@/types/place'

interface KeywordRecommendContextType {
  places: Place[]
  isLoading: boolean
  error: string | null
  fetchPlaces: (keywords: string[]) => Promise<void>
}

const KeywordRecommendContext = createContext<KeywordRecommendContextType | undefined>(undefined)

export function KeywordRecommendProvider({ children }: { children: ReactNode }) {
  const { keywordRecommend } = useKeywordRecommend()

  // 초기 상태 설정
  useEffect(() => {
    // 초기 상태에서는 빈 배열로 시작
    keywordRecommend.fetchPlaces([])
  }, [])

  return (
    <KeywordRecommendContext.Provider value={keywordRecommend}>
      {children}
    </KeywordRecommendContext.Provider>
  )
}

export function useKeywordRecommendContext() {
  const context = useContext(KeywordRecommendContext)
  if (context === undefined) {
    throw new Error('useKeywordRecommendContext must be used within a KeywordRecommendProvider')
  }
  return context
} 