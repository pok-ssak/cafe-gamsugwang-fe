'use client'; // App Router인 경우

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext'
import axiosInstance from '@/lib/axios';

export default function NaverRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get("state");

    if (code && state) {
      (async () => {
        try {
          const response = await axiosInstance.post('/auth/oauth/naver', { code, state });
          const { accessToken, refreshToken } = response.data.data.jwtTokenDto;
          
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          if (response.data.data.isRegister === true) {
            router.push('/');
          } else {
            router.push('/signup?oauth=true')
          }
        } catch (error) {
          console.error('OAuth 실패', error);
          router.push('/login');
        }
      })();
    }
  }, );

  return <div>로그인 처리 중입니다...</div>;
}
