export interface Restaurant {
  id: string;
  name: string;
  category: string;
  foodType: string;
  priceLevel: string;
  priceRange: string;
  distanceKm: number;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  address: string;
  openHours: string;
  image: string;
  gallery: string[];
  description: string;
  highlights: {
    specialty: string;
    vibe: string;
    suitableFor: string;
  };
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Phở Thìn Bờ Hồ',
    category: 'Quán ăn bình dân',
    foodType: 'Món truyền thống',
    priceLevel: '50k - 100k',
    priceRange: '50.000 - 100.000đ',
    distanceKm: 0.35,
    lat: 21.0285,
    lng: 105.8525,
    rating: 4.6,
    reviewsCount: 1200,
    address: '61 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    openHours: '06:00 - 22:00',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80',
    ],
    description: 'Phở Thìn Bờ Hồ là một trong những quán phở nổi tiếng lâu đời tại Hà Nội, với hương vị đậm đà, nước dùng trong và thơm. Quán nằm ngay gần Hồ Gươm, rất thuận tiện cho du khách tham quan.',
    highlights: {
      specialty: 'Phở tái, nam, gầu',
      vibe: 'Sạch sẽ, thoáng mát',
      suitableFor: 'Du khách, gia đình, bạn bè'
    }
  },
  {
    id: '2',
    name: 'Bún chả Hương Liên',
    category: 'Quán ăn bình dân',
    foodType: 'Đặc sản địa phương',
    priceLevel: '100k - 200k',
    priceRange: '100.000 - 200.000đ',
    distanceKm: 0.7,
    lat: 21.0145,
    lng: 105.8495,
    rating: 4.4,
    reviewsCount: 980,
    address: '24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội',
    openHours: '08:00 - 20:30',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80'],
    description: 'Nổi tiếng với món bún chả nướng than hoa thơm lừng và từng được tổng thống Obama ghé thăm.',
    highlights: {
      specialty: 'Bún chả đặc biệt, nem hải sản',
      vibe: 'Đông đúc, nhộn nhịp',
      suitableFor: 'Khách du lịch, nhóm bạn'
    }
  },
  {
    id: '3',
    name: 'Kem Tràng Tiền',
    category: 'Ăn vặt',
    foodType: 'Đặc sản địa phương',
    priceLevel: 'Dưới 50k',
    priceRange: '20.000 - 50.000đ',
    distanceKm: 0.85,
    lat: 21.0255,
    lng: 105.8545,
    rating: 4.3,
    reviewsCount: 760,
    address: '35 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    openHours: '07:30 - 23:00',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=80'],
    description: 'Thương hiệu kem truyền thống lâu đời gắn liền với tuổi thơ người dân Thủ đô.',
    highlights: {
      specialty: 'Kem ốc quế, kem cốm, kem đậu xanh',
      vibe: 'Không gian mở, nhộn nhịp',
      suitableFor: 'Mọi lứa tuổi'
    }
  }
];
