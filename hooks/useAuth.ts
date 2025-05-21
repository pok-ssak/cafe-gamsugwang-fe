import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    // 쿠키에서 accessToken 확인
    const checkAuth = () => {
      const hasToken = document.cookie.includes('accessToken=')
      
      if (mounted) {
        setIsAuthenticated(hasToken)

        // 홈페이지와 로그인 페이지가 아닌데 인증되지 않은 경우
        if (!hasToken && pathname !== '/' && pathname !== '/login') {
          // 로딩 상태를 유지한 채로 리다이렉트
          window.location.href = '/login'
        } else {
          setIsLoading(false)
        }
      }
    }

    // 초기 체크
    checkAuth()

    // 쿠키 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      mounted = false
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname])

  return { isAuthenticated, isLoading }
} 