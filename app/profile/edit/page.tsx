"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, ArrowLeft } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { blob } from "stream/consumers"

export default function ProfileEdit() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nickname, setNickname] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isImageChanged, setIsImageChanged] = useState(false)

  // 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/users/profile`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        setNickname(response.data.nickName)
        setProfileImage(response.data.imageUrl)
      } catch (error) {
        console.error('프로필 로딩 실패:', error)
      }
    }
    fetchProfile()
  }, [])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        setIsImageChanged(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageSubmit = async () => {
    if (!isImageChanged) return

    try {
      setIsLoading(true)
      setError("")

      const formData = new FormData()
      const file = fileInputRef.current?.files?.[0]
      if (file) {
        formData.append("image", file)
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_HOST}/users/profile/image`,
         formData, 
         {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      )

      setIsImageChanged(false)
      setError("")
    } catch (error: any) {
      console.error('Profile image update failed:', error)
      setError(error.response?.data?.message || '프로필 이미지 수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNicknameSubmit = async () => {
    if (!nickname) return

    try {
      setIsLoading(true)
      setError("")

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_HOST}/users/profile`,
        { nickName: nickname },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      )

      router.push("/profile")
    } catch (error: any) {
      console.error('Nickname update failed:', error)
      setError(error.response?.data?.message || '수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold ml-4">프로필 수정</h1>
        </div>
      </div>

      {/* 프로필 수정 폼 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={handleImageClick}
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
            >
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                onClick={handleImageClick}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {profileImage ? "프로필 이미지 변경" : "프로필 이미지 추가"}
              </button>
              <Button
                onClick={handleImageSubmit}
                disabled={isLoading || !isImageChanged}
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? "저장 중..." : "이미지 저장"}
              </Button>
            </div>
          </div>

          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              닉네임
            </label>
            <div className="flex gap-2">
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="flex-1"
              />
              <Button
                onClick={handleNicknameSubmit}
                disabled={isLoading || !nickname}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 