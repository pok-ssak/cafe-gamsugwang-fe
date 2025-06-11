import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Place } from "@/types/place"
import axiosInstance from "@/lib/axios"

interface SearchBarProps {
  onSearch: (keyword: string) => void
  onFocusChange?: (isFocused: boolean) => void
  className?: string
}

export function SearchBar({ onSearch, onFocusChange, className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [autoCompleteResults, setAutoCompleteResults] = useState<{id: number, title: string}[]>([])
  const [isLoadingAutoComplete, setIsLoadingAutoComplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastSearchQuery = useRef("")

  // 자동완성 검색
  const fetchAutoComplete = async (keyword: string) => {
    if (!keyword.trim()) {
      setAutoCompleteResults([])
      return
    }

    try {
      setIsLoadingAutoComplete(true)
      const response = await axiosInstance.get(`/api/v1/cafes/auto-complete`, {
        params: { keyword }
      })
      setAutoCompleteResults(response.data)
      // 검색 결과가 있을 때 선택 인덱스 초기화
      setSelectedIndex(0)
      lastSearchQuery.current = keyword
    } catch (error) {
      console.error('Failed to fetch auto-complete:', error)
      setAutoCompleteResults([])
    } finally {
      setIsLoadingAutoComplete(false)
    }
  }

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(0) // 검색어 변경 시 선택 인덱스 초기화

    // 이전 타이머가 있다면 제거
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 1초 후에 자동완성 검색 실행
    searchTimeoutRef.current = setTimeout(() => {
      fetchAutoComplete(value)
    }, 1000)
  }

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery)
      handleFocusChange(false)
    }
  }

  // 포커스 상태 변경 핸들러
  const handleFocusChange = (focused: boolean) => {
    setIsSearchFocused(focused)
    onFocusChange?.(focused)
    
    if (focused && searchQuery.trim() && searchQuery === lastSearchQuery.current) {
      // 포커스를 얻었을 때 이전 검색어와 동일하면 자동완성 결과 다시 표시
      fetchAutoComplete(searchQuery)
    } else if (!focused) {
      setSelectedIndex(0)
      setAutoCompleteResults([])
      inputRef.current?.blur()
    }
  }

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setAutoCompleteResults([])
      handleFocusChange(false)
      return
    }

    if (!isSearchFocused || autoCompleteResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < autoCompleteResults.length ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex > 0) {
          const selectedResult = autoCompleteResults[selectedIndex - 1]
          setSearchQuery(selectedResult.title)
          handleFocusChange(false)
          onSearch(selectedResult.title)
        } else {
          // 선택된 결과가 없으면 현재 검색어로 전체 검색
          handleSearch(e)
        }
        break
    }
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={className}>
        <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="카페 이름으로 검색"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => handleFocusChange(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 rounded-full shadow-lg"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
        >
          <Search className="w-5 h-5 text-gray-400" />
        </button>
        {isSearchFocused && (
          <button
            type="button"
            onClick={() => handleFocusChange(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </form>

      {/* 자동완성 결과 */}
      {isSearchFocused && searchQuery.trim() && (
        <div className="max-w-2xl mx-auto absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {isLoadingAutoComplete ? (
            <div className="px-4 py-3 text-center text-gray-500">
              검색 중...
            </div>
          ) : autoCompleteResults.length > 0 ? (
            autoCompleteResults.map((result, index) => (
              <button
                key={result.id}
                type="button"
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                  index + 1 === selectedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  setSearchQuery(result.title)
                  handleFocusChange(false)
                  onSearch(result.title)
                }}
              >
                {result.title}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}
        </div>
    </div>
  )
} 