"use client"

import { Heart, MessageCircle, Bookmark, Share2, Filter } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { FALLBACK_IMAGE_URL } from "../constants"

const FEED_ITEMS = [
  {
    id: 1,
    cafe: {
      name: "카페 A",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D",
      rating: 4.5,
      location: "제주시 애월읍"
    },
    user: {
      name: "사용자1",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww",
    },
    content: "오늘 방문한 카페에서 마신 아메리카노가 정말 맛있었어요. 분위기도 좋고 직원분들도 친절하셔서 더 좋았습니다.",
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    likes: 128,
    comments: 24,
    timestamp: "2시간 전"
  },
  {
    id: 2,
    cafe: {
      name: "카페 B",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D",
      rating: 4.3,
      location: "제주시 조천읍"
    },
    user: {
      name: "사용자2",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    },
    content: "주말에 방문했는데 사람이 많았지만, 테라스에서 바다를 보면서 마시는 커피는 정말 최고였어요. 특히 디저트도 맛있었습니다.",
    images: [
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    likes: 95,
    comments: 15,
    timestamp: "5시간 전"
  },
]

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
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
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">피드</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
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
        {FEED_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* 카페 정보 */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <img 
                  src={item.cafe.image || FALLBACK_IMAGE_URL} 
                  alt={item.cafe.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE_URL;
                  }}
                />
                <div>
                  <h3 className="font-bold text-gray-900">{item.cafe.name}</h3>
                  <p className="text-sm text-gray-500">{item.cafe.location}</p>
                </div>
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={item.user.avatar || FALLBACK_IMAGE_URL} 
                  alt={item.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE_URL;
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{item.user.name}</p>
                  <p className="text-sm text-gray-500">{item.timestamp}</p>
                </div>
              </div>

              {/* 리뷰 내용 */}
              <p className="text-gray-800 mb-4">{item.content}</p>

              {/* 이미지 그리드 */}
              {item.images.length > 0 && (
                <div className={`grid gap-2 mb-4 ${
                  item.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}>
                  {item.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image || FALLBACK_IMAGE_URL} 
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 상호작용 버튼 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{item.comments}</span>
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 hover:text-yellow-500">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="text-gray-600 hover:text-green-500">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 