'use client'; // App Router인 경우

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios';

export default function KakaoRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      (async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/auth/oauth/kakao`, { code });

            const accessToken = response.data.data.jwtTokenDto.accessToken;
            
            localStorage.setItem("accessToken", accessToken);

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
