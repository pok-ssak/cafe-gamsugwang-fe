import { Place } from "@/types/place"
import { FALLBACK_IMAGE_URL } from "@/app/constants"

interface PlaceCardProps {
  place: Place
  onClick: () => void
  rank?: number
  variant?: 'default' | 'ranking'
}

export function PlaceCard({ place, onClick, rank, variant = 'default' }: PlaceCardProps) {
  const RANKING_BADGES = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  }

  if (variant === 'ranking' && rank && rank <= 3) {
    return (
      <div
        className="relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <div className="absolute top-3 left-3 z-10 text-2xl">
          {RANKING_BADGES[rank as keyof typeof RANKING_BADGES]}
        </div>
        <div className="flex">
          <img 
            src={place.imageUrl || FALLBACK_IMAGE_URL} 
            alt={place.title}
            className="w-32 h-32 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE_URL;
            }}
          />
          <div className="flex-1 p-4">
            <h3 className="font-bold text-gray-900 text-lg">{place.title}</h3>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">{place.rate}</span>
              <span className="ml-1 text-sm text-gray-500">({place.reviewCount})</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{place.description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {rank && rank <= 3 && (
        <div className="absolute top-2 left-2 z-10 text-xl">
          {RANKING_BADGES[rank as keyof typeof RANKING_BADGES]}
        </div>
      )}
      <img 
        src={place.imageUrl || FALLBACK_IMAGE_URL} 
        alt={place.title}
        className="w-full h-32 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = FALLBACK_IMAGE_URL;
        }}
      />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{place.title}</h3>
          {rank && rank > 3 && (
            <span className="text-sm font-medium text-gray-500">#{rank}</span>
          )}
        </div>
        <div className="flex items-center mt-1">
          <span className="text-yellow-400">★</span>
          <span className="ml-1 text-sm text-gray-600">{place.rate}</span>
          <span className="ml-1 text-sm text-gray-500">({place.reviewCount})</span>
        </div>
      </div>
    </div>
  )
} 