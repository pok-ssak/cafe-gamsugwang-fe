export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg text-muted-foreground">지도를 불러오는 중...</p>
      </div>
    </div>
  )
}
