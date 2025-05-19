import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-lg text-muted-foreground mb-8">페이지를 찾을 수 없습니다</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
} 