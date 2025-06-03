"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { Place } from '@/types/place'

interface PlacesContextType {
  places: Place[]
  setPlaces: React.Dispatch<React.SetStateAction<Place[]>>
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  keywordList: string[]
  setKeywordList: (keywords: string[]) => void
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined)

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keywordList, setKeywordList] = useState<string[]>([])

  return (
    <PlacesContext.Provider value={{
      places,
      setPlaces,
      isLoading,
      setIsLoading,
      keywordList,
      setKeywordList
    }}>
      {children}
    </PlacesContext.Provider>
  )
}

export function usePlaces() {
  const context = useContext(PlacesContext)
  if (context === undefined) {
    throw new Error('usePlaces must be used within a PlacesProvider')
  }
  return context
} 