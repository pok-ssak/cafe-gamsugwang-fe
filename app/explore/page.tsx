"use client"

import { Search, ChevronRight, Star, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRef } from "react"
import { useAuth } from "@/hooks/useAuth"

const CAFE_KEYWORDS = [
  { id: 1, name: "로스팅 카페", color: "bg-pink-100" },
  { id: 2, name: "디저트 카페", color: "bg-blue-100" },
  { id: 3, name: "브런치 카페", color: "bg-green-100" },
  { id: 4, name: "북카페", color: "bg-yellow-100" },
  { id: 5, name: "테마 카페", color: "bg-purple-100" },
  { id: 6, name: "공부 카페", color: "bg-orange-100" },
  { id: 7, name: "힐링 카페", color: "bg-teal-100" },
  { id: 8, name: "전통 카페", color: "bg-rose-100" },
  { id: 9, name: "베이커리 카페", color: "bg-indigo-100" },
  { id: 10, name: "아이스크림 카페", color: "bg-cyan-100" },
  { id: 11, name: "차 카페", color: "bg-lime-100" },
  { id: 12, name: "와플 카페", color: "bg-amber-100" },
]

// 임시 데이터
const NEARBY_CAFES = [
  { id: 1, name: "카페 A", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.5, reviewCount: 128 },
  { id: 2, name: "카페 B", image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.3, reviewCount: 95 },
  { id: 3, name: "카페 C", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.7, reviewCount: 156 },
  { id: 4, name: "카페 D", image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.2, reviewCount: 87 },
]

const RECOMMENDED_CAFES = [
  { id: 1, name: "추천 카페 A", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.8, reviewCount: 234 },
  { id: 2, name: "추천 카페 B", image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.6, reviewCount: 189 },
  { id: 3, name: "추천 카페 C", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.9, reviewCount: 312 },
  { id: 4, name: "추천 카페 D", image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D", rating: 4.7, reviewCount: 267 },
]

export default function Explore() {
  const { isAuthenticated, isLoading } = useAuth()
  const nearbyScrollRef = useRef<HTMLDivElement>(null)
  const recommendedScrollRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 200
      const currentScroll = ref.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      ref.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">탐색</h1>
        </div>
        {/* 상단 검색바 */}
        <div className="relative top-4 left-4 right-4 z-10">
          <div className="relative">
            <Input className="pl-10 pr-4 py-2 bg-white rounded-full shadow-lg" placeholder="검색어를 입력하세요" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* 맞춤 추천 섹션 */}
      <div className="mt-8 pt-16 px-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">맞춤 추천</h2>
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            더보기
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="relative">
          <div 
            ref={recommendedScrollRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {RECOMMENDED_CAFES.map((cafe) => (
              <div key={cafe.id} className="flex-shrink-0 w-48">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <img 
                    src={cafe.image} 
                    alt={cafe.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900">{cafe.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">{cafe.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({cafe.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 키워드 섹션 */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">카페 키워드</h2>
        <div className="flex flex-wrap gap-3">
          {CAFE_KEYWORDS.map((keyword) => (
            <button
              key={keyword.id}
              className={`${keyword.color} px-4 py-2 rounded-full text-gray-700 hover:shadow-md transition-shadow`}
            >
              {keyword.name}
            </button>
          ))}
        </div>
      </div>

      {/* 근처 카페 섹션 */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">근처 카페</h2>
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            더보기
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="relative">
          <div 
            ref={nearbyScrollRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NEARBY_CAFES.map((cafe) => (
              <div key={cafe.id} className="flex-shrink-0 w-48">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <img 
                    src={cafe.image} 
                    alt={cafe.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900">{cafe.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">{cafe.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({cafe.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 pb-24">
        <div className="space-y-4">
          {NEARBY_CAFES.map((cafe) => (
            <div
              key={cafe.id}
              className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={cafe.image} 
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="text-lg font-bold truncate">{cafe.name}</h2>
                      <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-orange-600 text-sm">{cafe.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm flex-shrink-0">({cafe.reviewCount})</span>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
