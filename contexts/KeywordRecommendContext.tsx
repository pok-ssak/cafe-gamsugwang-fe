import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useKeywordRecommend } from '@/hooks/useKeywordRecommend'

interface KeywordRecommendContextType {
  places: any[]
  isLoading: boolean
  error: string | null
  fetchPlaces: (keywords: string[]) => Promise<void>
}

const KeywordRecommendContext = createContext<KeywordRecommendContextType | undefined>(undefined)

export function KeywordRecommendProvider({ children }: { children: ReactNode }) {
  const { keywordRecommend } = useKeywordRecommend()

  useEffect(() => {
    // Reset state on mount to ensure consistent initial state
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