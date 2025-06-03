"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Profile() {
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [profile, setProfile] = useState({
    nickName: "",
    email: "",
    imageUrl: "",
    bookmarkCount: 0,
    reviewCount: 0,
    keywords: [] as Array<{ word: string; count: number }>
  })
  // const [isLoading, setIsLoading] = useState(true)
  
  const  fetchProfile = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/users/profile`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      console.log(response.data)
      setProfile(response.data)
    } catch (error) {
      console.error('프로필 로딩 실패');
    } finally {
      // setIsLoading(false)
    }
    
    

  }
  useEffect(()=> {
    fetchProfile() 
  },[])
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
                src={profile.imageUrl}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{profile.nickName}</h2>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="flex-shrink-0"
              onClick={() => router.push("/profile/edit")}
            >
              프로필 수정
            </Button>
          </div>
          {/* 키워드 태그 */}
          {profile.keywords && profile.keywords.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">관심 키워드</h3>
              <div className="flex flex-wrap gap-2">
                {profile.keywords.map((keyword, index) => (
                  <span
                    key={`${keyword.word}-${index}`}
                    className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm"
                  >
                    {keyword.word}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="font-bold text-lg">{profile.reviewCount}</div>
              <div className="text-sm text-gray-600">내 리뷰</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{profile.bookmarkCount}</div>
              <div className="text-sm text-gray-600">북마크</div>
            </div>
          </div>
          
          
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => router.push('/profile/reviews')}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <span>내 리뷰</span>
            <span className="text-gray-400">→</span>
          </button>
          <button 
            onClick={() => router.push('/profile/bookmarks')}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <span>북마크</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between">
            <span>알림 설정</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between">
            <span>크레딧</span>
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

      {/* Footer */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 카페감수광. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="/terms" className="hover:text-gray-700">이용약관</a>
              <a href="/privacy" className="hover:text-gray-700">개인정보처리방침</a>
              <a href="/contact" className="hover:text-gray-700">문의하기</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
