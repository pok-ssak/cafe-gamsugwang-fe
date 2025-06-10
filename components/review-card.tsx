import { Star, ThumbsUp, User } from "lucide-react"
import { Review } from "@/types/review"
import { FALLBACK_IMAGE_URL } from "@/app/constants"
import Image from "next/image"

interface ReviewCardProps {
  review: Review
  onLikeToggle: (reviewId: number) => void
  variant?: 'modal' | 'list'
}

export function ReviewCard({ review, onLikeToggle, variant = 'modal' }: ReviewCardProps) {
  return (
    <div className={`bg-white rounded-lg p-3 ${
      variant === 'modal' ? 'flex-none w-72 border' : 'w-full shadow-sm'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {review.profileImageUrl ? (
              <Image
                src={review.profileImageUrl}
                alt={review.nickname}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGE_URL;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{review.nickname}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{review.rating}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onLikeToggle(review.id)}
          className={`flex items-center gap-1 text-sm ${
            review.likedByUser ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{review.likeCount}</span>
        </button>
      </div>
      {review.imageUrl && (
        <div className={`relative w-full ${variant === 'modal' ? 'h-32' : 'h-40'} mb-2 rounded-lg overflow-hidden`}>
          <Image
            src={review.imageUrl}
            alt="리뷰 이미지"
            fill
            className="object-cover"
          />
        </div>
      )}
      <p className="text-gray-600 text-sm line-clamp-2">{review.content}</p>
      {variant === 'list' && (
        <div className="mt-2 text-xs text-gray-500">
          {review.createdAt}
        </div>
      )}
    </div>
  )
} 