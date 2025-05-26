"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  login: (accessToken: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 보호된 경로 패턴
const protectedPaths = [
  '/profile',
  '/feed',
  '/explore',
  '/places',
  '/search',
  '/map',
  '/review',
  '/settings'
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // 초기 로드 시 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setAccessToken(token)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  // 라우트 보호
  useEffect(() => {
    if (!isLoading) {
      const isProtectedPath = protectedPaths.some(path => pathname?.startsWith(path))
      
      if (isProtectedPath && !isAuthenticated) {
        router.push(`/login?from=${pathname}`)
      }
    }
  }, [isLoading, isAuthenticated, pathname, router])

  // axios 인터셉터 설정
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.request.eject(interceptor)
    }
  }, [accessToken])

  const login = (token: string) => {
    localStorage.setItem('accessToken', token)
    setAccessToken(token)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      // await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/auth/logout`,
      //   {},
      //   {
      //     withCredentials: true
      //   }
      // )
      
      localStorage.removeItem('accessToken')
      setAccessToken(null)
      setIsAuthenticated(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 