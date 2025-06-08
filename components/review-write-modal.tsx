"use client"

import { X, Star, Camera } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import axiosInstance from '@/lib/axios'

interface ReviewWriteModalProps {
  placeId: number
  onClose: () => void
  onReviewSubmit: () => void
}

export function ReviewWriteModal({ placeId, onClose, onReviewSubmit }: ReviewWriteModalProps) {
  const [newReview, setNewReview] = useState({
    content: "",
    imageUrl: "",
    rating: 5
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setErrorMessage("")

      const formData = new FormData()
      formData.append("image", file)

      const response = await axiosInstance.post('/upload', formData)

      const imageUrl = response.data.url
      setNewReview(prev => ({
        ...prev,
        imageUrl
      }))

      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview([reader.result as string])
      }
      reader.readAsDataURL(file)

    } catch (error: any) {
      console.error('Image upload failed:', error)
      setErrorMessage(error.response?.data?.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setNewReview(prev => ({
      ...prev,
      imageUrl: ""
    }))
    setImagePreview([])
  }

  const handleSubmitReview = async () => {
    try {
      setErrorMessage("")
      const payload = {
        cafeId: placeId,
        content: newReview.content,
        imageUrl: newReview.imageUrl,
        rating: newReview.rating
      }
      await axiosInstance.post('/reviews', payload)
      
      onClose()
      onReviewSubmit()
    } catch (error: any) {
      console.error('Review submission failed:', error)
      setErrorMessage(error.response?.data?.error?.message || '리뷰 등록에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">리뷰 작성</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* 별점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              별점
            </label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1 text-center">
              {newReview.rating}점 / 5점
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용
            </label>
            <Textarea
              id="review-content"
              value={newReview.content}
              onChange={e => setNewReview(prev => ({ ...prev, content: e.target.value }))}
              placeholder="리뷰를 작성해주세요"
              className="min-h-[120px]"
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 첨부
            </label>
            <div className="space-y-4">
              {/* 이미지 미리보기 */}
              {imagePreview.length > 0 && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview[0]}
                    alt="리뷰 이미지 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* 이미지 업로드 버튼 */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {isUploading ? "업로드 중..." : "이미지 선택"}
                </Button>
                {isUploading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                )}
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button
            onClick={handleSubmitReview}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            리뷰 등록
          </Button>
        </div>
      </div>
    </div>
  )
} 