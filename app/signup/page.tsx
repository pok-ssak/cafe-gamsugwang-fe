"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Camera, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"

const INTEREST_KEYWORDS = [
  "아메리카노", "라떼", "에스프레소", "콜드브루", "디저트",
  "브런치", "테라스", "북카페", "로스팅", "원두",
  "스페셜티", "디카페인", "시그니처", "베이글", "케이크"
]

export default function Signup() {
  const router = useRouter()
  const { login } = useAuth()
  const searchParams = useSearchParams();
  const isOAuth = searchParams.get('oauth') === 'true';
  const [step, setStep] = useState(isOAuth ? 2 : 1);

  // Step 1: 기본 정보
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(true)
  const [isVerifying, setIsVerifying] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // Step 2: 추가 정보
  const [formData, setFormData] = useState({
    nickname: "",
    profileImage: null as File | null,
    interests: [] as string[],
  })
  const [previewUrl, setPreviewUrl] = useState<string>("")

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

  const handleEmailVerification = async () => {
    if (!email) {
      setErrorMessage('이메일을 입력해주세요.')
      return
    }

    setIsVerifying(true)
    setErrorMessage("")
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_HOST}/auth/verify-email`,
        { email }
      )
      setIsEmailVerified(true)
    } catch (error: any) {
      setIsEmailVerified(false)
      setErrorMessage(error.response?.data?.error?.message || '이메일 확인 중 오류가 발생했습니다.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmailVerified) {
      alert('이메일 중복 확인이 필요합니다.')
      return
    }

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
  
    const isOAuth = !email && !password; // email, password 없으면 OAuth 회원가입 판단
  
    try {
      const requestBody = isOAuth
        ? {
            nickname: formData.nickname,
            keywords: formData.interests.map(k => ({
              word: k,
              count: 0
            }))
            // profileImage 포함 시 multipart/form-data 처리 필요
          }
        : {
            email,
            password,
            nickname: formData.nickname,
            keywords: formData.interests.map(k => ({
              word: {k},
              count: 0
            }))
          };

          console.log(requestBody)
  
      const url = isOAuth
        ? `${process.env.NEXT_PUBLIC_API_HOST}/auth/oauth/signup`
        : `${process.env.NEXT_PUBLIC_API_HOST}/auth/signup`;

      const token = isOAuth ? localStorage.getItem('accessToken') : null;

      console.log(token);

      const response = await axios.post(url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          ...(isOAuth && token ? { Authorization: `Bearer ${token}` } : {}),
          withCredentials: true
        },
      });
  
      const { accessToken } = response.data;
      login(accessToken);
      router.push("/");
    } catch (error: any) {
      console.log(error)
      setErrorMessage(error.response?.data?.error?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1 ? (
                <>
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="text-orange-500 hover:text-orange-600">
                    로그인
                  </Link>
                </>
              ) : (
                "프로필을 완성해주세요"
              )}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {step === 1 ? (
            // Step 1: 기본 정보 입력
            <form onSubmit={handleStep1Submit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setIsEmailVerified(false)
                      }}
                      className="flex-1"
                      placeholder="example@email.com"
                      disabled={isVerifying}
                    />
                    <Button
                      type="button"
                      onClick={handleEmailVerification}
                      disabled={!email || isVerifying || isEmailVerified}
                      className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {isVerifying ? '확인 중...' : '중복 확인'}
                    </Button>
                  </div>
                  {isEmailVerified && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ 사용 가능한 이메일입니다
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <div className="relative mt-1">
                    <Input
                      id="password-confirm"
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!isEmailVerified}
              >
                다음
              </Button>
            </form>
          ) : (
            // Step 2: 추가 정보 입력
            <form onSubmit={handleStep2Submit} className="mt-8 space-y-6">
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

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  가입 완료
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 