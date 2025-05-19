"use client"

import { useParams } from "next/navigation"
import { Star, Heart, MapPin, Phone, Clock } from "lucide-react"
import { PLACES } from "@/app/page"

export default function PlaceDetail() {
  const params = useParams()
  const place = PLACES.find(p => p.id === params.id)

  if (!place) {
    return <div>장소를 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로필 이미지 */}
      <div className="relative h-64 w-full">
        <img 
          src={place.imageUrl || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop"} 
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="w-6 h-6 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 -mt-8 relative">
          <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{place.rating}</span>
            </div>
            <span className="text-gray-500">({place.reviewCount}개의 리뷰)</span>
          </div>
          <p className="text-gray-600 mb-6">{place.description}</p>

          {/* 정보 섹션 */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <h3 className="font-medium mb-1">주소</h3>
                <p className="text-gray-600">{place.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <h3 className="font-medium mb-1">전화번호</h3>
                <p className="text-gray-600">{place.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <h3 className="font-medium mb-1">영업시간</h3>
                <p className="text-gray-600">{place.businessHours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 