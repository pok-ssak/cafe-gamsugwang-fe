"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const INTEREST_KEYWORDS = [
  "아메리카노", "라떼", "에스프레소", "콜드브루", "디저트",
  "브런치", "테라스", "북카페", "로스팅", "원두",
  "스페셜티", "디카페인", "시그니처", "베이글", "케이크"
]

export default function AdditionalSignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nickname: "",
    profileImage: null as File | null,
    interests: [] as string[],
  })
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [signupData, setSignupData] = useState<any>(null)

  useEffect(() => {
    // Check if user came from first phase
    const storedData = localStorage.getItem("signupData")
    if (!storedData) {
      router.push("/signup")
      return
    }
    setSignupData(JSON.parse(storedData))
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }))
    setPreviewUrl("")
  }

  const toggleInterest = (keyword: string) => {
    setFormData(prev => {
      const interests = prev.interests.includes(keyword)
        ? prev.interests.filter(k => k !== keyword)
        : [...prev.interests, keyword]
      return { ...prev, interests }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement signup logic with both essential and additional info
    console.log("Complete signup with:", { ...signupData, ...formData })
    // Clear signup data from localStorage
    localStorage.removeItem("signupData")
    // Redirect to login or home page
    router.push("/login")
  }

  if (!signupData) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">추가 정보 입력</h1>
            <p className="mt-2 text-sm text-gray-600">
              프로필을 완성해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Camera className="w-8 h-8 text-gray-400" />
                  </label>
                )}
              </div>
              {!previewUrl && (
                <p className="mt-2 text-sm text-gray-500">
                  프로필 이미지를 선택해주세요
                </p>
              )}
            </div>

            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                required
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                className="mt-1"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            {/* 관심 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관심 키워드 (최대 5개)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => toggleInterest(keyword)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.interests.includes(keyword)
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={!formData.interests.includes(keyword) && formData.interests.length >= 5}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              가입 완료
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 