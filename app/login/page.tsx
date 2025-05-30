"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from '@/contexts/AuthContext'
import axios from "axios"

export default function Login() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const from = searchParams.get('from') || '/'
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isTestMode, setIsTestMode] = useState(false)

  // 테스트 모드 변경 시 이메일과 비밀번호 자동 입력
  const handleTestModeChange = (checked: boolean) => {
    setIsTestMode(checked)
    if (checked) {
      setEmail("test@example.com")
      setPassword("test1234")
    } else {
      setEmail("")
      setPassword("")
    }
  }

  const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
  
    window.location.href = kakaoAuthURL;
  };

  // TODO : Naver, Google 설정 정보 등록
  const handleNaverLogin = () => {
    const REST_API_KEY = process.env.NEXT_PUBLIC_NAVER_REST_API_KEY;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI;
    const naverAuthURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&state=random_state_string`;

    window.location.href = naverAuthURL;
  };

  const handleGoogleLogin = () => {
    const REST_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_REST_API_KEY;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&scope=openid%20email%20profile`;

    window.location.href = googleAuthURL;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isTestMode) {
      // 테스트 모드일 경우 임의의 accessToken을 쿠키에 저장
      const testToken = "test_access_token_" + Math.random().toString(36).substring(7)
      const expires = new Date()
      expires.setDate(expires.getDate() + 7) // 7일 후 만료
      document.cookie = `accessToken=${testToken}; expires=${expires.toUTCString()}; path=/`
      login(testToken)
      router.push(from)
      return
    }
    console.log(email)
    console.log(password)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_HOST}/auth/login`,
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      )
      // 서버에서 받은 accessToken으로 로그인 처리
      const { accessToken, refreshToken } = response.data.data
      login(accessToken)
      router.push(from)
    } catch (error) {
      console.error('Login failed:', error)
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 로고 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
            <p className="mt-2 text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-orange-500 hover:text-orange-600">
                회원가입
              </Link>
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="이메일을 입력하세요"
                />
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
            </div>

            <div className="flex items-center">
              <Checkbox
                id="test-mode"
                checked={isTestMode}
                onCheckedChange={handleTestModeChange}
              />
              <label
                htmlFor="test-mode"
                className="ml-2 block text-sm text-gray-900"
              >
                테스트 모드
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  로그인 상태 유지
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600">
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              로그인
            </Button>
          </form>

          {/* 소셜 로그인 */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">소셜 계정으로 로그인</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
                onClick={handleKakaoLogin}>
                <Image
                  src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
                  alt="카카오 로그인"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  priority
                />
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50" 
                onClick={handleNaverLogin}>
                <Image
                  src="/naver_logo.png"
                  alt="네이버 로그인"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  priority
                />
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50" 
              onClick={handleGoogleLogin}> 
                <Image
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                  alt="구글 로그인"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  priority
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
