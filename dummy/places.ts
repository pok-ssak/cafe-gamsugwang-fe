import { Place } from "@/types/place"

export const PLACES: Place[] = [
  {
    id: 1,
    name: "카페 감수광",
    description: "제주도의 아름다운 풍경을 바라보며 즐길 수 있는 카페입니다. 신선한 원두로 내린 커피와 함께 특별한 시간을 보내세요.",
    address: "제주특별자치도 제주시 애월읍 애월로 123",
    latitude: 33.4615,
    longitude: 126.3112,
    rating: 4.8,
    reviewCount: 128,
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    businessHours: "09:00 - 22:00",
    phone: "064-123-4567",
    menu: [
      {
        id: 1,
        name: "아메리카노",
        price: 4500,
        description: "깊은 바디감의 에스프레소와 물의 조화",
        imageUrl: "/menu-1.jpg"
      },
      {
        id: 2,
        name: "카페라떼",
        price: 5000,
        description: "부드러운 우유와 에스프레소의 완벽한 밸런스",
        imageUrl: "/menu-2.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "해변 카페",
    description: "제주도의 아름다운 해변을 바라보며 즐길 수 있는 카페입니다. 신선한 원두로 내린 커피와 함께 특별한 시간을 보내세요.",
    address: "제주특별자치도 제주시 애월읍 애월로 456",
    latitude: 33.4625,
    longitude: 126.3122,
    rating: 4.5,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    businessHours: "10:00 - 21:00",
    phone: "064-234-5678",
    menu: [] // 메뉴 정보 없음
  },
  {
    id: 3,
    name: "숲속 카페",
    description: "제주도의 아름다운 숲을 바라보며 즐길 수 있는 카페입니다. 신선한 원두로 내린 커피와 함께 특별한 시간을 보내세요.",
    address: "제주특별자치도 제주시 애월읍 애월로 789",
    latitude: 33.4635,
    longitude: 126.3132,
    rating: 4.2,
    reviewCount: 0, // 리뷰 없음
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    businessHours: "11:00 - 20:00",
    phone: "064-345-6789",
    menu: [] // 메뉴 정보 없음
  },
  {
    id: 4,
    name: "제주시청",
    latitude: 33.4996213,
    longitude: 126.5311884,
    description: "제주시청은 제주시의 중심지입니다.",
    rating: 4.5,
    reviewCount: 100,
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
    address: "제주특별자치도 제주시 광양9길 10",
    phone: "064-728-2114",
    businessHours: "09:00 - 18:00",
    menu: [
      {
        id: 1,
        name: "아메리카노",
        price: 4500,
        description: "깔끔한 아메리카노",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop"
      },
      {
        id: 2,
        name: "카페라떼",
        price: 5000,
        description: "부드러운 카페라떼",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop"
      },
      {
        id: 3,
        name: "바닐라라떼",
        price: 5500,
        description: "달콤한 바닐라라떼",
        imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop"
      }
    ]
  },
  {
    id: 5,
    name: "제주특별자치도청",
    latitude: 33.4996213,
    longitude: 126.5311884,
    description: "제주도의 행정 중심지인 제주특별자치도청입니다. 제주도의 미래를 이끌어가는 현대적인 건물입니다.",
    rating: 4.7,
    reviewCount: 234,
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
    address: "제주특별자치도 제주시 연동 312-1",
    phone: "064-710-2114",
    businessHours: "09:00 - 18:00",
    menu: [
      {
        id: 1,
        name: "아메리카노",
        price: 4500,
        description: "깔끔한 아메리카노",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop"
      },
      {
        id: 2,
        name: "카페라떼",
        price: 5000,
        description: "부드러운 카페라떼",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop"
      }
    ]
  },
  {
    id: 6,
    name: "용두암",
    latitude: 33.5159423,
    longitude: 126.5129876,
    description: "용두암은 제주시의 중심지입니다.",
    rating: 4.5,
    reviewCount: 100,
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
    address: "제주특별자치도 제주시 용두암길 15",
    phone: "064-728-2114",
    businessHours: "09:00 - 18:00",
    menu: []
  },
  {
    id: 7,
    name: "제주국제공항 제1터미널 국제선 출발장",
    description: "제주도의 관문, 제주국제공항입니다. 국내선과 국제선이 모두 운항되는 현대적인 공항입니다.",
    rating: 4.5,
    reviewCount: 1234,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000",
    latitude: 33.5113,
    longitude: 126.4930,
    address: "제주특별자치도 제주시 용두암길 15",
    phone: "064-728-2114",
    businessHours: "09:00 - 18:00",
    menu: []
  },
  {
    id: 8,
    name: "카페 스타벅스 제주공항점",
    description: "제주공항 내에 위치한 스타벅스입니다. 여행 전후로 편안하게 머물 수 있는 공간을 제공합니다.",
    rating: 4.2,
    reviewCount: 856,
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000",
    latitude: 33.5115,
    longitude: 126.4932,
    address: "제주특별자치도 제주시 용두암길 15",
    phone: "064-728-2114",
    businessHours: "09:00 - 18:00",
    menu: []
  },
  {
    id: 9,
    name: "제주공항 면세점",
    description: "다양한 브랜드의 면세품을 만나볼 수 있는 제주공항 면세점입니다.",
    rating: 4.0,
    reviewCount: 567,
    imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1000",
    latitude: 33.5114,
    longitude: 126.4931,
    address: "제주특별자치도 제주시 용두암길 15",
    phone: "064-728-2114",
    businessHours: "09:00 - 18:00",
    menu: []
  }
] 