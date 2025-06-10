import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
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
  const [selectedIndex, setSelectedIndex] = useState(-1)
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
      // 검색 결과가 있을 때 첫 번째 항목 선택
      if (response.data.length > 0) {
        setSelectedIndex(0)
      }
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
    setSelectedIndex(-1) // 검색어 변경 시 선택 인덱스 초기화

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
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || autoCompleteResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < autoCompleteResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const selectedResult = autoCompleteResults[selectedIndex]
          setSearchQuery(selectedResult.title)
          handleFocusChange(false)
          onSearch(selectedResult.title)
        } else {
          handleSearch(e)
        }
        break
      case 'Escape':
        e.preventDefault()
        handleFocusChange(false)
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
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="카페 이름, 키워드로 검색"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => handleFocusChange(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 rounded-full shadow-lg"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </form>

      {/* 자동완성 결과 */}
      {isSearchFocused && autoCompleteResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {autoCompleteResults.map((result, index) => (
            <button
              key={result.id}
              type="button"
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              onClick={() => {
                setSearchQuery(result.title)
                handleFocusChange(false)
                onSearch(result.title)
              }}
            >
              {result.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 