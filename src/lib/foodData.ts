import { rawFoods } from './food-restaurants';

export interface FoodItem {
  id: number;
  name: string;
  price: number; // in thousands VND
  image: number; // index for sprite atlas
  sub: string;
  category: "Bình dân" | "Đặc sản" | "Sang trọng";
  tags: string[];
  veg?: boolean;
  cultureStory?: string;
  tastingTip?: string;
}

export const FOOD_ITEMS: FoodItem[] = rawFoods.map((f, i) => ({
  id: i + 1,
  name: f.name,
  price: f.price,
  image: f.image !== undefined ? f.image : (i % 18),
  sub: f.sub || 'Món ăn đặc sản',
  category: f.price >= 100 ? 'Sang trọng' : f.price >= 50 ? 'Đặc sản' : 'Bình dân',
  tags: [f.name.split(' ')[0], f.sub ? f.sub.split('•')[0].trim() : 'Món ngon'],
  veg: f.veg || false,
  cultureStory: f.quip || `Món ${f.name} thơm ngon hấp dẫn với hương vị đậm đà truyền thống được tuyển chọn từ kho ẩm thực.`,
  tastingTip: 'Thưởng thức khi còn nóng để cảm nhận trọn vẹn hương vị tuyệt hảo.'
}));
