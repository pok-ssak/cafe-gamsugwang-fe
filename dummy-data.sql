-- 카페 더미 데이터
INSERT INTO cafes (id, name, description, address, latitude, longitude, rating, review_count, image_url, business_hours, phone_number, created_at, updated_at) VALUES
(1, '카페 감수광', '제주도의 아름다운 풍경을 바라보며 즐길 수 있는 카페입니다. 신선한 원두로 내린 커피와 함께 특별한 시간을 보내세요.', '제주특별자치도 제주시 애월읍 애월로 123', 33.4615, 126.3112, 4.8, 128, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', '09:00 - 22:00', '064-123-4567', NOW(), NOW()),
(2, '해변 카페', '제주도의 아름다운 해변을 바라보며 즐길 수 있는 카페입니다. 신선한 원두로 내린 커피와 함께 특별한 시간을 보내세요.', '제주특별자치도 제주시 애월읍 애월로 456', 33.4625, 126.3122, 4.5, 89, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', '10:00 - 21:00', '064-234-5678', NOW(), NOW()),
(3, '숲속 카페', '제주도의 아름다운 숲을 바라보며 즐길 수 있는 카페입니다. 신선한 원두로 내린 커피와 함께 특별한 시간을 보내세요.', '제주특별자치도 제주시 애월읍 애월로 789', 33.4635, 126.3132, 4.2, 0, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', '11:00 - 20:00', '064-345-6789', NOW(), NOW()),
(4, '제주시청 카페', '제주시청은 제주시의 중심지입니다.', '제주특별자치도 제주시 광양9길 10', 33.4996213, 126.5311884, 4.5, 100, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop', '09:00 - 18:00', '064-728-2114', NOW(), NOW()),
(5, '제주특별자치도청 카페', '제주도의 행정 중심지인 제주특별자치도청입니다. 제주도의 미래를 이끌어가는 현대적인 건물입니다.', '제주특별자치도 제주시 연동 312-1', 33.4996213, 126.5311884, 4.7, 234, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop', '09:00 - 18:00', '064-710-2114', NOW(), NOW()),
(6, '용두암 카페', '용두암은 제주시의 중심지입니다.', '제주특별자치도 제주시 용두암길 15', 33.5159423, 126.5129876, 4.5, 100, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop', '09:00 - 18:00', '064-728-2114', NOW(), NOW()),
(7, '제주공항 카페', '제주도의 관문, 제주국제공항입니다. 국내선과 국제선이 모두 운항되는 현대적인 공항입니다.', '제주특별자치도 제주시 용두암길 15', 33.5113, 126.4930, 4.5, 1234, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000', '09:00 - 18:00', '064-728-2114', NOW(), NOW()),
(8, '카페 스타벅스 제주공항점', '제주공항 내에 위치한 스타벅스입니다. 여행 전후로 편안하게 머물 수 있는 공간을 제공합니다.', '제주특별자치도 제주시 용두암길 15', 33.5115, 126.4932, 4.2, 856, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000', '09:00 - 18:00', '064-728-2114', NOW(), NOW()),
(9, '제주공항 면세점 카페', '다양한 브랜드의 면세품을 만나볼 수 있는 제주공항 면세점입니다.', '제주특별자치도 제주시 용두암길 15', 33.5114, 126.4931, 4.0, 567, 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1000', '09:00 - 18:00', '064-728-2114', NOW(), NOW());

-- 메뉴 더미 데이터
INSERT INTO menus (cafe_id, name, price, description, image_url, created_at, updated_at) VALUES
(1, '아메리카노', 4500, '깊은 바디감의 에스프레소와 물의 조화', '/menu-1.jpg', NOW(), NOW()),
(1, '카페라떼', 5000, '부드러운 우유와 에스프레소의 완벽한 밸런스', '/menu-2.jpg', NOW(), NOW()),
(4, '아메리카노', 4500, '깔끔한 아메리카노', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', NOW(), NOW()),
(4, '카페라떼', 5000, '부드러운 카페라떼', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', NOW(), NOW()),
(4, '바닐라라떼', 5500, '달콤한 바닐라라떼', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop', NOW(), NOW()),
(5, '아메리카노', 4500, '깔끔한 아메리카노', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', NOW(), NOW()),
(5, '카페라떼', 5000, '부드러운 카페라떼', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', NOW(), NOW()); 