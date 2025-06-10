import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useKeywordRank } from '@/hooks/useKeywordRank'

interface KeywordRankContextType {
  keywords: string[]
  isLoading: boolean
  error: string | null
  fetchPopularKeywords: () => Promise<void>
}

const KeywordRankContext = createContext<KeywordRankContextType | undefined>(undefined)

export function KeywordRankProvider({ children }: { children: ReactNode }) {
  const keywordRank = useKeywordRank()

  useEffect(() => {
    keywordRank.fetchPopularKeywords()
  }, [])

  return (
    <KeywordRankContext.Provider value={keywordRank}>
      {children}
    </KeywordRankContext.Provider>
  )
}

export function useKeywordRankContext() {
  const context = useContext(KeywordRankContext)
  if (context === undefined) {
    throw new Error('useKeywordRankContext must be used within a KeywordRankProvider')
  }
  return context
} 