"use client"

import { Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface FeedResponse {
  feedId: number
  content: string
  url: string
  type: string
  isRead: boolean
  createdAt: string
}

interface Sort {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}

interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  paged: boolean
  unpaged: boolean
}

interface PageResponse<T> {
  content: T[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: Sort
  first: boolean
  numberOfElements: number
  empty: boolean
}

const PAGE_SIZE = 20

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [feedItems, setFeedItems] = useState<FeedResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/feeds/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (response.ok) {
        setFeedItems(prev => prev.map(item => ({ ...item, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking all feeds as read:', error)
    }
  }

  const markAsRead = async (feedId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/feeds/${feedId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        setFeedItems(prev => 
          prev.map(item => 
            item.feedId === feedId ? { ...item, isRead: true } : item
          )
        )
      }
    } catch (error) {
      console.error('Error marking feed as read:', error)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      const url = `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/feeds?page=${page}&size=${PAGE_SIZE}`
      const token = localStorage.getItem('accessToken')
      console.log("🔍 Fetching:", url)
      console.log("🔐 Token:", token)

      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setFeedItems(data.content)
          setTotalPages(data.totalPages)
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error fetching feed data:', error)
          setError(`피드 데이터를 불러오는데 실패했습니다. (${error.message})`)
          setIsLoading(false)
        })
    }
  }, [page, authLoading])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const filters = [
    { id: 'all', name: '전체' },
    { id: 'following', name: '팔로잉' },
    { id: 'nearby', name: '근처' },
    { id: 'popular', name: '인기' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 필터 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">피드</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* 피드 컨텐츠 */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 모두 읽음 처리 버튼 */}
        {feedItems.some(item => !item.isRead) && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <span>모두 읽음 처리</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                {feedItems.filter(item => !item.isRead).length}개
              </span>
            </button>
          </div>
        )}

        {error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            표시할 피드가 없습니다.
          </div>
        ) : (
          feedItems.map((item) => (
            <div 
              key={item.feedId} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                !item.isRead ? 'border-l-4 border-orange-500' : 'opacity-75'
              }`}
              onClick={() => !item.isRead && markAsRead(item.feedId)}
            >
              {/* 피드 내용 */}
              <div className="p-4">
                {/* 피드 메세지 */}
                <p className={`mb-4 whitespace-pre-wrap ${
                  item.isRead ? 'text-gray-500' : 'text-gray-800'
                }`}>{item.content}</p>

                {/* URL이 있는 경우 */}
                {item.url && (
                  <div className="mb-4">
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline break-all ${
                        item.isRead ? 'text-blue-400' : 'text-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {item.url}
                    </a>
                  </div>
                )}

                {/* 작성 시간 */}
                <p className={`text-sm ${
                  item.isRead ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {/* 피드 타입 */}
                <div className="flex justify-end mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.type === 'REVIEW' 
                      ? 'bg-blue-100 text-blue-600'
                      : item.type === 'LIKE'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.type === 'REVIEW' ? '리뷰' : item.type === 'LIKE' ? '좋아요' : '시스템'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* 페이지네이션 버튼 */}
        {!error && totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`px-4 py-2 rounded-lg ${
                    page === index
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 