"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"

export default function Profile() {
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}      
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">프로필</h1>
        </div>
      </div>

      {/* 프로필 카드 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww"
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">사용자 이름</h2>
              <p className="text-gray-600">@username</p>
            </div>
            <Button variant="outline" className="flex-shrink-0">
              프로필 수정
            </Button>
          </div>
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="font-bold text-lg">123</div>
              <div className="text-sm text-gray-600">리뷰</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">456</div>
              <div className="text-sm text-gray-600">팔로워</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">789</div>
              <div className="text-sm text-gray-600">팔로잉</div>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between">
            <span>내 리뷰</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between">
            <span>저장한 장소</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between">
            <span>알림 설정</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between">
            <span>고객센터</span>
            <span className="text-gray-400">→</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between text-red-500"
          >
            <span>로그아웃</span>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
