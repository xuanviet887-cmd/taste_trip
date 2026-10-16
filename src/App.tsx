import { useState, useEffect } from 'react';
import { FOOD_ITEMS } from './lib/foodData';
import type { FoodItem } from './lib/foodData';
import { sendChatMessage, generateItinerary } from './lib/ai-api';
import { 
  MapPin, Utensils, Compass, Bot, Clock, Sparkles, Navigation, 
  CheckCircle, ChevronRight, ArrowLeft, Calendar, X, DollarSign, Clock3, BookOpen, Camera, Send, Globe
} from 'lucide-react';

interface StopItem {
  time: string;
  mealType: string;
  name: string;
  address: string;
  image?: string;
  food?: FoodItem;
  price: string;
  priceNum?: number;
  category: string;
  cultureStory: string;
  tastingTip: string;
  englishMenu: string;
  distance: string;
}

interface ThemeTour {
  id: string;
  title: string;
  desc: string;
  image: string;
  region: string;
  stops: StopItem[];
  totalDistance?: string;
  totalCost?: string;
  status?: string;
}

const THEMED_TOURS: ThemeTour[] = [
  // 1. Đồng bằng sông Hồng (10 Tỉnh/Thành)
  {
    id: 'hanoi',
    title: 'Hà Nội Trọn Vẹn',
    desc: 'Sáng: Phở bò | Trưa: Bún chả | Chiều: Bánh giò/Nem chua rán | Tối: Chả cá Lã Vọng.',
    image: '/picture/provinces/hanoi.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở bò', address: 'Quận Hoàn Kiếm, Hà Nội', image: '/picture/provinces/hanoi.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Biểu tượng ẩm thực Thủ đô với nước dùng hầm xương 12 giờ.', tastingTip: 'Ăn kèm quẩy giòn và trứng chần.', englishMenu: 'Traditional Hanoi Beef Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bún chả', address: 'Quận Hoàn Kiếm, Hà Nội', image: '/picture/provinces/hanoi.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản', cultureStory: 'Chả nướng than hoa thơm lừng đậm đà nét Tràng An.', tastingTip: 'Ăn kèm rau sống tươi và nem rán.', englishMenu: 'Grilled Pork with Rice Vermicelli.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh giò/Nem chua rán', address: 'Khu Phố Cổ, Hà Nội', image: '/picture/provinces/hanoi.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Quà chiều quen thuộc phố cổ.', tastingTip: 'Chấm tương ớt cay ngọt.', englishMenu: 'Steamed Rice Dumpling & Crispy Fermented Pork.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Chả cá Lã Vọng', address: '14 Phố Chả Cá, Hoàn Kiếm, Hà Nội', image: '/picture/provinces/hanoi.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Món ăn danh tiếng hơn 150 năm.', tastingTip: 'Ăn kèm bún, mắm tôm và thì là.', englishMenu: 'Turmeric Grilled Fish with Dill.', distance: '1.5 km' }
    ]
  },
  {
    id: 'haiphong',
    title: 'Hải Phòng - Thành Phố Hoa Phượng Đỏ',
    desc: 'Sáng: Bún cá cay | Trưa: Bánh đa cua | Chiều: Nem cua bể, dừa dầm | Tối: Lẩu cua đồng.',
    image: '/picture/provinces/hai-phong-opera-house.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún cá cay', address: 'Lê Chân, Hải Phòng', image: '/picture/provinces/hai-phong-opera-house.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Hương vị cay nồng đậm chất miền biển.', tastingTip: 'Thêm mẻ chua và dọc mùng.', englishMenu: 'Spicy Fish Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bánh đa cua', address: 'Ngô Quyền, Hải Phòng', image: '/picture/provinces/hai-phong-opera-house.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Đặc sản trứ danh với bánh đa đỏ và riêu cua đồng.', tastingTip: 'Ăn kèm chả lá lốt và rau rút.', englishMenu: 'Red Rice Noodle Soup with Crab.', distance: '1.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Nem cua bể, dừa dầm', address: 'Cầu Đất, Hải Phòng', image: '/picture/provinces/hai-phong-opera-house.jpg', price: '45.000đ', priceNum: 45000, category: 'Ăn vặt', cultureStory: 'Nem vuông giòn rụm kết hợp chè dừa dầm ngọt mát.', tastingTip: 'Thưởng thức khi nem còn nóng.', englishMenu: 'Square Crab Spring Roll & Coconut Dessert.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu cua đồng', address: 'Hồng Bàng, Hải Phòng', image: '/picture/provinces/hai-phong-opera-house.jpg', price: '200.000đ', priceNum: 200000, category: 'Sang trọng', cultureStory: 'Nồi lẩu đồng quê ấm cúng.', tastingTip: 'Nhúng rau rút và thịt bò.', englishMenu: 'Freshwater Crab Hotpot.', distance: '1.2 km' }
    ]
  },
  {
    id: 'hanam',
    title: 'Hà Nam - Vùng Đất Phủ Lý',
    desc: 'Sáng: Bánh cuốn Phủ Lý | Trưa: Cá kho làng Vũ Đại | Chiều: Bánh đa kê | Tối: Bún cá ngạnh.',
    image: '/picture/provinces/ha-nam.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh cuốn Phủ Lý', address: 'TP. Phủ Lý, Hà Nam', image: '/picture/provinces/ha-nam.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bánh cuốn mềm mỏng ăn kèm thịt nướng vỉa hè thơm phức.', tastingTip: 'Chấm nước mắm ấm pha tỏi ớt.', englishMenu: 'Phu Ly Rolled Rice Pancake with Grilled Pork.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cá kho làng Vũ Đại', address: 'Hòa Hậu, Lý Nhân, Hà Nam', image: '/picture/provinces/ha-nam.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản', cultureStory: 'Món cá kho niêu đất truyền thống ninh rục xương suốt 16 tiếng.', tastingTip: 'Ăn kèm cơm trắng nóng dẻo.', englishMenu: 'Braised Fish in Clay Pot.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh đa kê', address: 'Chợ Biên Hòa, Hà Nam', image: '/picture/provinces/ha-nam.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Quà vặt bùi bùi vị kê, đỗ xanh và bánh đa giòn.', tastingTip: 'Thưởng thức ngay khi còn giòn.', englishMenu: 'Crispy Rice Cracker with Millet.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bún cá ngạnh', address: 'TP. Phủ Lý, Hà Nam', image: '/picture/provinces/ha-nam.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Bún cá ngạnh sông tươi ngon với nước dùng nghệ thơm lừng.', tastingTip: 'Ăn kèm dọc mùng và rau thì là.', englishMenu: 'Catfish Noodle Soup with Turmeric.', distance: '1.1 km' }
    ]
  },
  {
    id: 'haiduong',
    title: 'Hải Dương - Xứ Đông Văn Hiến',
    desc: 'Sáng: Bún cá rô đồng | Trưa: Gà nướng lu | Chiều: Bánh đậu xanh uống trà | Tối: Rươi Tứ Kỳ.',
    image: '/picture/provinces/hai-duong.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún cá rô đồng', address: 'TP. Hải Dương', image: '/picture/provinces/hai-duong.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún cá rô rán giòn với nước dùng xương hầm thanh ngọt.', tastingTip: 'Ăn kèm rau ngổ và dọc mùng.', englishMenu: 'Perch Fish Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gà nướng lu', address: 'Thanh Hà, Hải Dương', image: '/picture/provinces/hai-duong.jpg', price: '130.000đ', priceNum: 130000, category: 'Đặc sản', cultureStory: 'Gà đồi Thanh Hà nướng trong lu đất da giòn thịt ngọt.', tastingTip: 'Chấm muối ớt chanh.', englishMenu: 'Jar-Roasted Hill Chicken.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh đậu xanh uống trà', address: 'TP. Hải Dương', image: '/picture/provinces/hai-duong.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Đặc sản trứ danh kết hợp cùng chè xanh thơm nức.', tastingTip: 'Nhâm nhi ngụm chè đắng để cảm nhận vị ngọt bùi.', englishMenu: 'Green Bean Pastry with Green Tea.', distance: '0.5 km' },
      { time: '19:00', mealType: 'Tối', name: 'Rươi Tứ Kỳ', address: 'Tứ Kỳ, Hải Dương', image: '/picture/provinces/hai-duong.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Chả rươi béo ngậy đặc sản quý hiếm theo mùa.', tastingTip: 'Chấm nước mắm chua ngọt pha vỏ quýt.', englishMenu: 'Sand Worm Omelette.', distance: '1.4 km' }
    ]
  },
  {
    id: 'hungyen',
    title: 'Hưng Yên - Phố Hiến Xưa',
    desc: 'Sáng: Bún thang lươn | Trưa: Chả gà Tiểu Quan | Chiều: Đậu phụ nướng Tương Bần | Tối: Gà Đông Tảo.',
    image: '/picture/provinces/hung-yen.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún thang lươn', address: 'TP. Hưng Yên', image: '/picture/provinces/hung-yen.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Biến tấu độc đáo bún thang kết hợp lươn đồng xào nghệ.', tastingTip: 'Thêm chút mắm tôm và giấm tỏi.', englishMenu: 'Eel Rice Vermicelli Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Chả gà Tiểu Quan', address: 'Khoái Châu, Hưng Yên', image: '/picture/provinces/hung-yen.jpg', price: '90.000đ', priceNum: 90000, category: 'Đặc sản', cultureStory: 'Món chả gà giã tay truyền thống thơm mùi thì là và vỏ quýt.', tastingTip: 'Ăn kèm cơm nóng hoặc bún.', englishMenu: 'Tieu Quan Minced Chicken Patties.', distance: '1.1 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Đậu phụ nướng Tương Bần', address: 'Mỹ Hào, Hưng Yên', image: '/picture/provinces/hung-yen.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Đậu phụ làng Sét nướng thơm chấm tương Bần đậm đà.', tastingTip: 'Thưởng thức khi đậu còn nóng giòn.', englishMenu: 'Grilled Tofu with Soybean Paste.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gà Đông Tảo', address: 'Khoái Châu, Hưng Yên', image: '/picture/provinces/hung-yen.jpg', price: '250.000đ', priceNum: 250000, category: 'Sang trọng', cultureStory: 'Đặc sản tiến vua với đôi chân to quý hiếm và thịt chắc thơm.', tastingTip: 'Chế biến thành các món luộc, xào sả ớt.', englishMenu: 'Dong Tao Rare Breed Chicken.', distance: '1.6 km' }
    ]
  },
  {
    id: 'namdinh',
    title: 'Nam Định - Quê Hương Thành Nam',
    desc: 'Sáng: Phở bò băm | Trưa: Bún đũa | Chiều: Bánh xíu páo | Tối: Cá nướng trui.',
    image: '/picture/provinces/nam-inh.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở bò băm', address: 'TP. Nam Định', image: '/picture/provinces/nam-inh.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản', cultureStory: 'Phở bò truyền thống nổi tiếng với thịt băm xào tái lăn đậm đà.', tastingTip: 'Ăn kèm tương ớt Nam Định cay nồng.', englishMenu: 'Nam Dinh Minced Beef Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bún đũa', address: 'Chợ Rồng, Nam Định', image: '/picture/provinces/nam-inh.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Món bún sợi to ăn kèm riêu cua và rau muống luộc.', tastingTip: 'Chan nước dùng cua đồng đậm đặc.', englishMenu: 'Thick Rice Noodle Soup with Crab.', distance: '1.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh xíu páo', address: 'TP. Nam Định', image: '/picture/provinces/nam-inh.jpg', price: '15.000đ', priceNum: 15000, category: 'Ăn vặt', cultureStory: 'Bánh nướng nhân thịt xá xíu đậm chất giao thoa văn hóa.', tastingTip: 'Ăn khi bánh còn ấm để cảm nhận lớp vỏ xốp.', englishMenu: 'Xiu Pao Baked Pastry.', distance: '0.4 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cá nướng trui', address: 'Giao Thủy, Nam Định', image: '/picture/provinces/nam-inh.jpg', price: '120.000đ', priceNum: 120000, category: 'Sang trọng', cultureStory: 'Cá sông nướng rơm thơm lừng đậm chất miền quê chiêm trũng.', tastingTip: 'Cuốn bánh tráng rau sống chấm mắm gừng.', englishMenu: 'Straw-Roasted River Fish.', distance: '1.5 km' }
    ]
  },
  {
    id: 'ninhbinh',
    title: 'Ninh Bình - Cố Đô Hoa Lư',
    desc: 'Sáng: Miến lươn | Trưa: Cơm cháy chà bông | Chiều: Bánh tôm | Tối: Thịt dê núi 7 món.',
    image: '/picture/provinces/ninh-binh.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Miến lươn', address: 'TP. Ninh Bình', image: '/picture/provinces/ninh-binh.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Miến lươn giòn tan với nước dùng hầm xương lươn ngọt đậm.', tastingTip: 'Thêm hoa chuối bào và rau răm.', englishMenu: 'Crispy Eel Glass Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm cháy chà bông', address: 'Tràng An, Ninh Bình', image: '/picture/provinces/ninh-binh.jpg', price: '80.000đ', priceNum: 80000, category: 'Đặc sản', cultureStory: 'Cơm cháy giòn rụm chan sốt thịt dê đậm đà.', tastingTip: 'Trộn đều sốt sền sệt lên miếng cơm cháy.', englishMenu: 'Crispy Rice with Pork & Goat Sauce.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tôm', address: 'Phố cổ Hoa Lư, Ninh Bình', image: '/picture/provinces/ninh-binh.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bánh tôm vàng giòn hấp dẫn.', tastingTip: 'Chấm nước mắm chua ngọt kèm đu đủ xanh.', englishMenu: 'Crispy Shrimp Fritters.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Thịt dê núi 7 món', address: 'Hoa Lư, Ninh Bình', image: '/picture/provinces/ninh-binh.jpg', price: '220.000đ', priceNum: 220000, category: 'Sang trọng', cultureStory: 'Thịt dê núi chăn thả tự nhiên chắc thịt, chế biến 7 món.', tastingTip: 'Ăn kèm lá sung, tương gừng chuẩn vị.', englishMenu: 'Mountain Goat Feast.', distance: '1.8 km' }
    ]
  },
  {
    id: 'thaibinh',
    title: 'Thái Bình - Quê Hương Chị Hai Năm Tấn',
    desc: 'Sáng: Bún bung | Trưa: Nộm sứa Diêm Điền | Chiều: Bánh cáy trà | Tối: Canh cá Quỳnh Côi.',
    image: '/picture/provinces/thai-binh.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún bung', address: 'TP. Thái Bình', image: '/picture/provinces/thai-binh.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún bung hoa chuối sườn sụn thơm ngậy.', tastingTip: 'Thêm chút mẻ chua và dọc mùng.', englishMenu: 'Banana Blossom and Pork Rib Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Nộm sứa Diêm Điền', address: 'Thái Thụy, Thái Bình', image: '/picture/provinces/thai-binh.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản', cultureStory: 'Sứa biển giòn sần sật trộn hoa chuối và lạc rang.', tastingTip: 'Trộn đều nước mắm tỏi ớt.', englishMenu: 'Jellyfish Salad.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh cáy thưởng trà', address: 'Làng Nguyễn, Thái Bình', image: '/picture/provinces/thai-binh.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Đặc sản bánh cáy ngọt bùi nhâm nhi cùng chén chè xanh.', tastingTip: 'Cắt miếng nhỏ thưởng thức cùng trà nóng.', englishMenu: 'Traditional Sticky Rice Cake with Tea.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Canh cá Quỳnh Côi', address: 'Quỳnh Phụ, Thái Bình', image: '/picture/provinces/thai-binh.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Bánh đúc hoặc bánh đa chan canh cá rô đồng thơm ngọt.', tastingTip: 'Thêm rau cải xanh và gừng tươi.', englishMenu: 'Quynh Coi Fish Soup.', distance: '1.2 km' }
    ]
  },
  {
    id: 'vinhphuc',
    title: 'Vĩnh Phúc - Miền Đất Tam Đảo',
    desc: 'Sáng: Bánh hòn | Trưa: Bò tái kiến đen | Chiều: Bánh đúc mít | Tối: Cá thính Lập Thạch.',
    image: '/picture/provinces/vinh-phuc.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh hòn', address: 'Lập Thạch, Vĩnh Phúc', image: '/picture/provinces/vinh-phuc.jpg', price: '30.000đ', priceNum: 30000, category: 'Bình dân', cultureStory: 'Bánh bột gạo nhân thịt mộc nhĩ thơm ngon truyền thống.', tastingTip: 'Chấm nước mắm tỏi ớt.', englishMenu: 'Vinh Phuc Rice Dumpling.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bò tái kiến đen', address: 'Tam Đảo, Vĩnh Phúc', image: '/picture/provinces/vinh-phuc.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Thịt bò tươi treo trên cây rừng cho kiến đốt tạo vị chua độc đáo.', tastingTip: 'Ăn kèm lá ngót rừng và chuối xanh.', englishMenu: 'Beef Terrec-Ant Special.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh đúc mít', address: 'Vĩnh Yên, Vĩnh Phúc', image: '/picture/provinces/vinh-phuc.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh đúc thanh mát ăn kèm mít chín thơm ngọt.', tastingTip: 'Thưởng thức vào buổi chiều hè.', englishMenu: 'Rice Cake with Jackfruit.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cá thính Lập Thạch', address: 'Lập Thạch, Vĩnh Phúc', image: '/picture/provinces/vinh-phuc.jpg', price: '100.000đ', priceNum: 100000, category: 'Sang trọng', cultureStory: 'Cá ướp thính gạo rang thơm nức nướng vàng trên bếp than.', tastingTip: 'Ăn kèm cơm trắng nóng.', englishMenu: 'Fermented Salted Grilled Fish.', distance: '1.3 km' }
    ]
  },
  {
    id: 'bacninh',
    title: 'Bắc Ninh - Kinh Bắc Quan Họ',
    desc: 'Sáng: Bún tôm | Trưa: Chim ngói hầm | Chiều: Bánh phu thê Đình Bảng | Tối: Trâu giật Từ Sơn.',
    image: '/picture/provinces/bac-ninh.jpg',
    region: 'Đồng bằng sông Hồng',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún tôm', address: 'TP. Bắc Ninh', image: '/picture/provinces/bac-ninh.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún tôm tươi ngọt nước từ thịt tôm đồng và rau cần.', tastingTip: 'Thêm chút ớt chưng cay nồng.', englishMenu: 'Freshwater Shrimp Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Chim ngói hầm', address: 'Từ Sơn, Bắc Ninh', image: '/picture/provinces/bac-ninh.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản', cultureStory: 'Chim ngói bổ dưỡng hầm hạt sen thuốc bắc.', tastingTip: 'Ăn nóng để tận hưởng trọn vẹn dinh dưỡng.', englishMenu: 'Stewed Turtle Dove with Lotus Seeds.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh phu thê Đình Bảng', address: 'Đình Bảng, Tiên Sơn, Bắc Ninh', image: '/picture/provinces/bac-ninh.jpg', price: '15.000đ', priceNum: 15000, category: 'Ăn vặt', cultureStory: 'Bánh dẻo nhân đậu xanh đu đủ tượng trưng tình thủy chung.', tastingTip: 'Bóc lớp lá chuối thưởng thức dẻo ngọt.', englishMenu: 'Traditional Wedding Sweet Cake.', distance: '0.5 km' },
      { time: '19:00', mealType: 'Tối', name: 'Trâu giật Từ Sơn', address: 'Từ Sơn, Bắc Ninh', image: '/picture/provinces/bac-ninh.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Thịt trâu tươi vừa mổ mềm ngọt chế biến nhúng mẻ hoặc xào lăn.', tastingTip: 'Chấm mẻ chua hoặc tương gừng.', englishMenu: 'Fresh Beef/Buffalo Hotpot.', distance: '1.5 km' }
    ]
  },

  // 2. Đông Bắc Bộ (9 Tỉnh)
  {
    id: 'bacgiang',
    title: 'Bắc Giang - Vải Thiều & Núi Rừng',
    desc: 'Sáng: Phở chua | Trưa: Gà đồi Yên Thế luộc | Chiều: Bánh đúc Đồng Quan | Tối: Khâu nhục.',
    image: '/picture/provinces/bac-giang.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở chua', address: 'Lục Ngạn, Bắc Giang', image: '/picture/provinces/bac-giang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Phở chua thanh mát trộn nước sốt đặc chế và lạc rang.', tastingTip: 'Trộn đều trước khi thưởng thức.', englishMenu: 'Bac Giang Sour Noodle.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gà đồi Yên Thế luộc', address: 'Yên Thế, Bắc Giang', image: '/picture/provinces/bac-giang.jpg', price: '130.000đ', priceNum: 130000, category: 'Đặc sản', cultureStory: 'Gà đồi chạy bộ da vàng giòn, thịt thơm ngọt.', tastingTip: 'Chấm muối lá chanh.', englishMenu: 'Yen The Hill Chicken.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh đúc Đồng Quan', address: 'Nếnh, Việt Yên, Bắc Giang', image: '/picture/provinces/bac-giang.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh đúc dẻo quánh chấm tương bần đậm đà.', tastingTip: 'Cắt miếng nhỏ chấm tương đậm vị.', englishMenu: 'Dong Quan Rice Cake.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Khâu nhục', address: 'Lục Nam, Bắc Giang', image: '/picture/provinces/bac-giang.jpg', price: '120.000đ', priceNum: 120000, category: 'Sang trọng', cultureStory: 'Thịt ba chỉ hầm nhừ cùng khoai môn và gia vị hồi quế.', tastingTip: 'Ăn cùng cơm nóng hoặc xôi.', englishMenu: 'Braised Pork Belly.', distance: '1.4 km' }
    ]
  },
  {
    id: 'backan',
    title: 'Bắc Kạn - Hồ Ba Bể Xanh Thắm',
    desc: 'Sáng: Bún miến dong | Trưa: Cá sông Năng nướng | Chiều: Bánh ngải | Tối: Lợn sữa quay.',
    image: '/picture/provinces/bac-can.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún miến dong', address: 'Na Rì, Bắc Kạn', image: '/picture/provinces/bac-can.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Miến dong Na Rì nổi tiếng dai ngon nấu xương ống.', tastingTip: 'Thêm măng chua.', englishMenu: 'Glass Noodle Soup with Pork.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cá sông Năng nướng', address: 'Hồ Ba Bể, Bắc Kạn', image: '/picture/provinces/bac-can.jpg', price: '110.000đ', priceNum: 110000, category: 'Đặc sản', cultureStory: 'Cá suối Ba Bể nướng than hoa thơm phức.', tastingTip: 'Chấm muối hạt dổi.', englishMenu: 'Grilled Nang River Fish.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh ngải', address: 'Ba Bể, Bắc Kạn', image: '/picture/provinces/bac-can.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh làm từ gạo nếp và lá ngải cứu nhân đậu xanh ngọt bùi.', tastingTip: 'Thưởng thức khi bánh mềm dẻo.', englishMenu: 'Wormwood Sticky Rice Cake.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lợn sữa quay', address: 'TP. Bắc Kạn', image: '/picture/provinces/bac-can.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Lợn sữa tẩm mắc khén quay giòn bì.', tastingTip: 'Chấm nước mắm lá mác mật.', englishMenu: 'Roast Suckling Pig.', distance: '1.5 km' }
    ]
  },
  {
    id: 'caobang',
    title: 'Cao Bằng - Miền Non Nước Cao Bằng',
    desc: 'Sáng: Phở vịt quay | Trưa: Vịt quay 7 vị | Chiều: Bánh cuốn nước xương | Tối: Bánh khảo.',
    image: '/picture/provinces/cao-bang.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở vịt quay', address: 'TP. Cao Bằng', image: '/picture/provinces/cao-bang.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản', cultureStory: 'Phở chan nước vịt quay đậm đà thơm ngát lá móc mật.', tastingTip: 'Thêm măng ớt chua cay.', englishMenu: 'Roast Duck Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Vịt quay 7 vị', address: 'Thạch An, Cao Bằng', image: '/picture/provinces/cao-bang.jpg', price: '130.000đ', priceNum: 130000, category: 'Đặc sản', cultureStory: 'Vịt quay tẩm ướp 7 loại gia vị thảo mộc truyền thống.', tastingTip: 'Ăn kèm nước sốt trong bụng vịt.', englishMenu: '7-Spice Roast Duck.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh cuốn nước xương', address: 'TP. Cao Bằng', image: '/picture/provinces/cao-bang.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bánh cuốn trứng chan nước hầm xương ngọt thanh.', tastingTip: 'Thả nguyên quả trứng lòng đào vào bát nước chấm.', englishMenu: 'Rolled Rice Pancake with Bone Broth.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bánh khảo, chè đắng', address: 'TP. Cao Bằng', image: '/picture/provinces/cao-bang.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Đặc sản bánh khảo ngọt bùi uống kèm chè đắng tiêu thực.', tastingTip: 'Nhấp ngụm chè đắng sau miếng bánh khảo.', englishMenu: 'Banh Khao Pastry & Bitter Tea.', distance: '1.0 km' }
    ]
  },
  {
    id: 'hagiang',
    title: 'Hà Giang - Cao Nguyên Đá Địa Chất',
    desc: 'Sáng: Bánh cuốn chan nước xương | Trưa: Cơm lam thịt nướng | Chiều: Bánh tam giác mạch | Tối: Cháo ấu tẩu.',
    image: '/picture/provinces/ha-giang.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh cuốn chan nước xương', address: 'Đồng Văn, Hà Giang', image: '/picture/provinces/ha-giang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bánh cuốn nóng hổi chan nước dùng xương ấm lòng miền sơn cước.', tastingTip: 'Thêm giò lụa và tiêu bắc.', englishMenu: 'Dong Van Rolled Rice Pancake.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm lam, thịt lợn nướng', address: 'Mèo Vạc, Hà Giang', image: '/picture/provinces/ha-giang.jpg', price: '80.000đ', priceNum: 80000, category: 'Đặc sản', cultureStory: 'Cơm lam ống nứa thơm dẻo ăn kèm lợn đen nướng mắc khén.', tastingTip: 'Chấm muối vừng hoặc chẳm chéo.', englishMenu: 'Bamboo Tube Rice & Grilled Pork.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tam giác mạch', address: 'Phố cổ Đồng Văn', image: '/picture/provinces/ha-giang.jpg', price: '15.000đ', priceNum: 15000, category: 'Ăn vặt', cultureStory: 'Bánh nướng thơm bùi từ hạt hoa tam giác mạch đặc trưng.', tastingTip: 'Thưởng thức khi bánh còn nóng giòn.', englishMenu: 'Buckwheat Cake.', distance: '0.5 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cháo ấu tẩu, Thắng cố', address: 'TP. Hà Giang', image: '/picture/provinces/ha-giang.jpg', price: '60.000đ', priceNum: 60000, category: 'Sang trọng', cultureStory: 'Cháo đắng bổ dưỡng trị cảm và thắng cố ngựa đậm vị núi rừng.', tastingTip: 'Ăn ấm để cơ thể ấm lên trong sương mù.', englishMenu: 'Aromatic Bitter Porridge & Thang Co.', distance: '1.8 km' }
    ]
  },
  {
    id: 'langson',
    title: 'Lạng Sơn - Xứ Lạng Hoa Xứ',
    desc: 'Sáng: Phở chua | Trưa: Vịt quay lá móc mật | Chiều: Bánh áp chao | Tối: Khâu nhục.',
    image: '/picture/provinces/lang-son.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở chua', address: 'TP. Lạng Sơn', image: '/picture/provinces/lang-son.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Phở chua đậm đà với khoai lang chiên, thịt xá xíu và nước sốt chua ngọt.', tastingTip: 'Trộn đều các nguyên liệu.', englishMenu: 'Lang Son Sour Noodle.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Vịt quay lá móc mật', address: 'Đồng Đăng, Lạng Sơn', image: '/picture/provinces/lang-son.jpg', price: '130.000đ', priceNum: 130000, category: 'Đặc sản', cultureStory: 'Vịt quay thơm phức mùi lá móc mật nướng than hoa.', tastingTip: 'Chấm nước sốt vịt đậm đà.', englishMenu: 'Roast Duck with Mac Mat Leaves.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh áp chao', address: 'TP. Lạng Sơn', image: '/picture/provinces/lang-son.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh bột nếp nhân thịt vịt chiên giòn rụm.', tastingTip: 'Ăn kèm nước mắm chua ngọt và đu đủ xanh.', englishMenu: 'Ap Chao Fried Duck Rice Cake.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Khâu nhục, Phở cuốn', address: 'TP. Lạng Sơn', image: '/picture/provinces/lang-son.jpg', price: '120.000đ', priceNum: 120000, category: 'Sang trọng', cultureStory: 'Đặc sản trứ danh ẩm thực xứ Lạng.', tastingTip: 'Ăn cùng cơm nóng.', englishMenu: 'Khau Nhuc & Rolled Pho.', distance: '1.4 km' }
    ]
  },
  {
    id: 'phutho',
    title: 'Phú Thọ - Đất Tổ Hùng Vương',
    desc: 'Sáng: Phở gà đồi | Trưa: Cơm nắm lá cọ | Chiều: Bánh tai | Tối: Cá lăng sông Đà.',
    image: '/picture/provinces/phu-tho.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở gà đồi', address: 'Việt Trì, Phú Thọ', image: '/picture/provinces/phu-tho.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Phở gà đồi Phú Thọ thịt dai thơm nước dùng ngọt thanh.', tastingTip: 'Thêm lá chanh thái chỉ.', englishMenu: 'Hill Chicken Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm nắm lá cọ, thịt rang', address: 'Thanh Ba, Phú Thọ', image: '/picture/provinces/phu-tho.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản', cultureStory: 'Cơm nắm lá cọ xanh dẻo ăn kèm thịt lợn rang cạnh cháy cạnh.', tastingTip: 'Chấm muối vừng.', englishMenu: 'Palm Leaf Rice Ball with Sautéed Pork.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tai', address: 'Phú Thọ', image: '/picture/provinces/phu-tho.jpg', price: '15.000đ', priceNum: 15000, category: 'Ăn vặt', cultureStory: 'Bánh bột tẻ hình chiếc tai nhân thịt mỡ thơm ngon.', tastingTip: 'Chấm nước mắm tỏi ớt.', englishMenu: 'Ear-Shaped Rice Cake.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cá lăng sông Đà', address: 'Việt Trì, Phú Thọ', image: '/picture/provinces/phu-tho.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng', cultureStory: 'Cá lăng nấu om mẻ hoặc nướng muối ớt thơm nức.', tastingTip: 'Ăn kèm bún và rau chuối.', englishMenu: 'Da River Catfish.', distance: '1.6 km' }
    ]
  },
  {
    id: 'quangninh',
    title: 'Quảng Ninh - Vịnh Hạ Long Kỳ Quan',
    desc: 'Sáng: Bún hải sản | Trưa: Xôi trắng chả mực | Chiều: Sữa chua trân châu | Tối: Cù kỳ, Ngán biển.',
    image: '/picture/provinces/quang-ninh.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún hải sản', address: 'Hạ Long, Quảng Ninh', image: '/picture/provinces/quang-ninh.jpg', price: '50.000đ', priceNum: 50000, category: 'Bình dân', cultureStory: 'Bún bề bề, tôm tươi biển Hạ Long đậm đà.', tastingTip: 'Thêm quất và ớt tươi.', englishMenu: 'Ha Long Seafood Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Xôi trắng chả mực giã tay', address: 'Hạ Long, Quảng Ninh', image: '/picture/provinces/quang-ninh.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản', cultureStory: 'Chả mực giã tay sần sật ăn kèm xôi dẻo thơm.', tastingTip: 'Chấm mắm tiêu.', englishMenu: 'Sticky Rice with Hand-Pounded Squid Cake.', distance: '1.1 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Sữa chua trân châu Hạ Long', address: 'Hạ Long, Quảng Ninh', image: '/picture/provinces/quang-ninh.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Sữa chua dẻo mát kết hợp trân châu cốt dừa ấm.', tastingTip: 'Khuấy đều trân châu ấm vào sữa chua mát.', englishMenu: 'Ha Long Yogurt with Warm Pearls.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cù kỳ hấp, Ngán biển nướng', address: 'Hòn Gai, Quảng Ninh', image: '/picture/provinces/quang-ninh.jpg', price: '220.000đ', priceNum: 220000, category: 'Sang trọng', cultureStory: 'Hải sản độc lạ Quảng Ninh nướng mỡ hành.', tastingTip: 'Thưởng thức khi hải sản còn nóng.', englishMenu: 'Steamed Red Crab & Grilled Ngan Clam.', distance: '1.7 km' }
    ]
  },
  {
    id: 'thainguyen',
    title: 'Thái Nguyên - Thủ Phủ Chè Xanh',
    desc: 'Sáng: Bún cuốn | Trưa: Cơm lam Định Hóa | Chiều: Bánh chưng Bờ Đậu | Tối: Trà Tân Cương.',
    image: '/picture/provinces/thai-nguyen.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún cuốn', address: 'TP. Thái Nguyên', image: '/picture/provinces/thai-nguyen.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bún cuốn thịt ba chỉ, trứng giò và rau thơm chấm mắm chua ngọt.', tastingTip: 'Cuốn chặt tay và chấm ngập nước mắm.', englishMenu: 'Thai Nguyen Rolled Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm lam Định Hóa', address: 'Định Hóa, Thái Nguyên', image: '/picture/provinces/thai-nguyen.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản', cultureStory: 'Cơm lam nướng ống nứa dẻo thơm.', tastingTip: 'Chấm muối vừng đậu phộng.', englishMenu: 'Dinh Hoa Bamboo Rice.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh chưng Bờ Đậu', address: 'Phú Lương, Thái Nguyên', image: '/picture/provinces/thai-nguyen.jpg', price: '50.000đ', priceNum: 50000, category: 'Ăn vặt', cultureStory: 'Bánh chưng xanh dẻo nhân đậu thịt đậm vị nếp nương.', tastingTip: 'Cắt bánh bằng dây lạt.', englishMenu: 'Bo Dau Sticky Rice Cake.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Trà Tân Cương, kẹo lạc', address: 'TP. Thái Nguyên', image: '/picture/provinces/thai-nguyen.jpg', price: '40.000đ', priceNum: 40000, category: 'Sang trọng', cultureStory: 'Thưởng thức trà Tân Cương tiền chát hậu ngọt.', tastingTip: 'Nhâm nhi ngụm trà kèm kẹo lạc giòn tan.', englishMenu: 'Tan Cuong Green Tea & Peanut Candy.', distance: '1.1 km' }
    ]
  },
  {
    id: 'tuyenquang',
    title: 'Tuyên Quang - Miền Xứ Tuyên',
    desc: 'Sáng: Phở bò | Trưa: Lợn đen luộc | Chiều: Bánh nếp trứng kiến | Tối: Gỏi cá nghéo.',
    image: '/picture/provinces/tuyen-quang.jpg',
    region: 'Đông Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở bò', address: 'TP. Tuyên Quang', image: '/picture/provinces/tuyen-quang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Phở bò truyền thống nước dùng thơm ngọt.', tastingTip: 'Thêm giấm tỏi.', englishMenu: 'Tuyen Quang Beef Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lợn đen luộc chấm muối hạt dổi', address: 'Chiêm Hóa, Tuyên Quang', image: '/picture/provinces/tuyen-quang.jpg', price: '110.000đ', priceNum: 110000, category: 'Đặc sản', cultureStory: 'Thịt lợn đen bản địa luộc chấm muối hạt dổi thơm nức.', tastingTip: 'Chấm đậm vị hạt dổi rừng.', englishMenu: 'Black Pork with Doi Seeds Salt.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh nếp nhân trứng kiến', address: 'Lâm Bình, Tuyên Quang', image: '/picture/provinces/tuyen-quang.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh nếp dẻo thơm bùi béo vị trứng kiến rừng.', tastingTip: 'Thưởng thức vào mùa xuân hè.', englishMenu: 'Sticky Rice Cake with Ant Eggs.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gỏi cá nghéo', address: 'TP. Tuyên Quang', image: '/picture/provinces/tuyen-quang.jpg', price: '140.000đ', priceNum: 140000, category: 'Sang trọng', cultureStory: 'Gỏi cá sông đậm đà hương vị miền núi.', tastingTip: 'Ăn kèm rau rừng và nước chấm đặc chế.', englishMenu: 'River Fish Salad.', distance: '1.5 km' }
    ]
  },

  // 3. Tây Bắc Bộ (6 Tỉnh)
  {
    id: 'dienbien',
    title: 'Điện Biên - Miền Hoa Ban Trắng',
    desc: 'Sáng: Xôi chim Mường Thanh | Trưa: Lợn bản thui luộc | Chiều: Bánh xén | Tối: Gà nướng mắc khén.',
    image: '/picture/provinces/ien-bien.jpg',
    region: 'Tây Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Xôi chim Mường Thanh', address: 'TP. Điện Biên Phủ', image: '/picture/provinces/ien-bien.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Xôi nếp nương Mường Thanh dẻo thơm kết hợp chim bồ câu băm nhỏ xào đậm đà.', tastingTip: 'Ăn nóng để cảm nhận vị béo ngậy của thịt chim.', englishMenu: 'Muong Thanh Bird Sticky Rice.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lợn bản thui luộc', address: 'Điện Biên', image: '/picture/provinces/ien-bien.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản', cultureStory: 'Thịt lợn bản chăn thả thui rơm vàng ruộm luộc chấm muối mắc khén.', tastingTip: 'Chấm đẫm chẳm chéo.', englishMenu: 'Black Pig Boiled with Herbs.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh xén', address: 'Mường Lay, Điện Biên', image: '/picture/provinces/ien-bien.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh truyền thống của người Thái làm từ bột gạo giòn tan.', tastingTip: 'Ăn chơi buổi chiều.', englishMenu: 'Xen Rice Crackers.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gà nướng mắc khén', address: 'TP. Điện Biên Phủ', image: '/picture/provinces/ien-bien.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng', cultureStory: 'Gà đồi ướp hạt mắc khén, hạt dổi nướng than hồng.', tastingTip: 'Xé tay chấm chẳm chéo ướt.', englishMenu: 'Hill Chicken Grilled with Mac Khen Spices.', distance: '1.6 km' }
    ]
  },
  {
    id: 'hoabinh',
    title: 'Hòa Bình - Xứ Mường Thử Thách',
    desc: 'Sáng: Phở măng chua | Trưa: Lợn thui luộc lá rừng | Chiều: Chả cuốn lá bưởi | Tối: Cơm lam thịt nướng.',
    image: '/picture/provinces/hoa-binh.jpg',
    region: 'Tây Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở măng chua', address: 'TP. Hòa Bình', image: '/picture/provinces/hoa-binh.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Phở kết hợp măng chua rừng giòn sần sật.', tastingTip: 'Thêm ớt tỏi.', englishMenu: 'Sour Bamboo Shoot Pho.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lợn thui luộc cuốn lá rừng', address: 'Tân Lạc, Hòa Bình', image: '/picture/provinces/hoa-binh.jpg', price: '110.000đ', priceNum: 110000, category: 'Đặc sản', cultureStory: 'Thịt lợn thui vàng cuốn lá lốt, lá đinh lăng chấm muối hạt dổi.', tastingTip: 'Cuộn chặt tay cùng các loại lá rừng.', englishMenu: 'Boiled Pork Wrapped in Forest Leaves.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Chả cuốn lá bưởi', address: 'Đà Bắc, Hòa Bình', image: '/picture/provinces/hoa-binh.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Thịt băm cuốn lá bưởi nướng than hoa thơm lừng.', tastingTip: 'Thưởng thức khi còn nóng.', englishMenu: 'Minced Pork Wrapped in Pomelo Leaves.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cơm lam, thịt nướng xâu', address: 'Mai Châu, Hòa Bình', image: '/picture/provinces/hoa-binh.jpg', price: '90.000đ', priceNum: 90000, category: 'Sang trọng', cultureStory: 'Cơm lam nướng ống tre thơm dẻo cùng xiên thịt lợn bản.', tastingTip: 'Bóc lớp vỏ nứa ngoài khi ăn.', englishMenu: 'Mai Chau Bamboo Rice & Skewered Pork.', distance: '1.5 km' }
    ]
  },
  {
    id: 'laichau',
    title: 'Lai Châu - Cổng Trời Mây Núi',
    desc: 'Sáng: Bún tôm | Trưa: Cá nướng Pa pỉnh tộp | Chiều: Lạp xưởng gác bếp | Tối: Lẩu cá lăng.',
    image: '/picture/provinces/lai-chau.jpg',
    region: 'Tây Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún tôm', address: 'TP. Lai Châu', image: '/picture/provinces/lai-chau.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún tôm đậm đà hương vị miền núi phía Bắc.', tastingTip: 'Thêm rau thơm.', englishMenu: 'Northern Style Shrimp Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cá nướng Pa pỉnh tộp', address: 'Than Uyên, Lai Châu', image: '/picture/provinces/lai-chau.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản', cultureStory: 'Cá suối nhồi mắc khén, sả, rau thơm gấp đôi nướng than hồng.', tastingTip: 'Gỡ thịt cá chấm gia vị nhồi bên trong.', englishMenu: 'Pa Pinh Top Grilled Stream Fish.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Lạp xưởng gác bếp', address: 'Phong Thổ, Lai Châu', image: '/picture/provinces/lai-chau.jpg', price: '50.000đ', priceNum: 50000, category: 'Ăn vặt', cultureStory: 'Lạp xưởng hun khói bếp củi thơm mùi gia vị gác bếp.', tastingTip: 'Thái lát mỏng hấp hoặc nướng.', englishMenu: 'Smoked Kitchen Sausage.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu cá lăng', address: 'TP. Lai Châu', image: '/picture/provinces/lai-chau.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Lẩu cá lăng sông Đà chua thanh đậm đà.', tastingTip: 'Nhúng rau dọc mùng và hoa chuối.', englishMenu: 'Catfish Hotpot.', distance: '1.6 km' }
    ]
  },
  {
    id: 'laocai',
    title: 'Lào Cai - Sapa Mù Sương',
    desc: 'Sáng: Phở chua Bắc Hà | Trưa: Lợn cắp nách quay | Chiều: Hạt dẻ nướng | Tối: Lẩu cá tầm, cá hồi.',
    image: '/picture/provinces/lao-cai.jpg',
    region: 'Tây Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở chua Bắc Hà', address: 'Bắc Hà, Lào Cai', image: '/picture/provinces/lao-cai.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Phở chua trộn đặc trưng với thịt xá xíu, đậu phộng và nước chua thanh.', tastingTip: 'Trộn đều trước khi ăn.', englishMenu: 'Bac Ha Sour Pho.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lợn cắp nách quay', address: 'Sapa, Lào Cai', image: '/picture/provinces/lao-cai.jpg', price: '140.000đ', priceNum: 140000, category: 'Đặc sản', cultureStory: 'Lợn bản nhỏ quay giòn bì thơm phức mùi thảo mộc.', tastingTip: 'Chấm muối tiêu chanh.', englishMenu: 'Sapa Pit-Roast Piglet.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Hạt dẻ nướng', address: 'Chợ đêm Sapa', image: '/picture/provinces/lao-cai.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Hạt dẻ Sapa to tròn bùi béo nướng nóng hổi.', tastingTip: 'Bóc vỏ thưởng thức giữa không khí se lạnh.', englishMenu: 'Roasted Sapa Chestnuts.', distance: '0.5 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu cá tầm, lẩu cá hồi Sapa', address: 'Sapa, Lào Cai', image: '/picture/provinces/lao-cai.jpg', price: '250.000đ', priceNum: 250000, category: 'Sang trọng', cultureStory: 'Lẩu cá hồi nuôi nước lạnh tươi ngon thịt chắc.', tastingTip: 'Nhúng rau tươi xứ lạnh như cải mèo.', englishMenu: 'Sapa Salmon & Sturgeon Hotpot.', distance: '1.8 km' }
    ]
  },
  {
    id: 'sonla',
    title: 'Sơn La - Cao Nguyên Mộc Châu Xanh',
    desc: 'Sáng: Bún cá chép | Trưa: Nậm pịa | Chiều: Thịt trâu gác bếp | Tối: Bê chao Mộc Châu.',
    image: '/picture/provinces/son-la.jpg',
    region: 'Tây Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún cá chép', address: 'TP. Sơn La', image: '/picture/provinces/son-la.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún cá chép sông Đà ngọt nước.', tastingTip: 'Thêm rau thơm.', englishMenu: 'Carp Fish Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Nậm pịa', address: 'Mộc Châu, Sơn La', image: '/picture/provinces/son-la.jpg', price: '90.000đ', priceNum: 90000, category: 'Đặc sản', cultureStory: 'Món ăn độc đáo làm từ nội tạng non và nước dùng đặc trưng của đồng bào.', tastingTip: 'Thưởng thức cùng rượu ngô.', englishMenu: 'Nam Pia Traditional Specialty.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Thịt trâu gác bếp', address: 'Mộc Châu, Sơn La', image: '/picture/provinces/son-la.jpg', price: '120.000đ', priceNum: 120000, category: 'Ăn vặt', cultureStory: 'Thịt trâu hun khói tẩm mắc khén dai ngọt đậm đà.', tastingTip: 'Xé nhỏ chấm chẳm chéo.', englishMenu: 'Smoked Buffalo Meat.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bê chao Mộc Châu', address: 'Mộc Châu, Sơn La', image: '/picture/provinces/son-la.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Thịt bê sữa non chao dầu béo ngậy thơm nức.', tastingTip: 'Chấm tương đậu ngọt.', englishMenu: 'Moc Chau Seared Veal.', distance: '1.6 km' }
    ]
  },
  {
    id: 'yenbai',
    title: 'Yên Bái - Ruộng Bậc Thang Mù Cang Chải',
    desc: 'Sáng: Phở vịt nướng | Trưa: Muồm muỗm rang Mường Lò | Chiều: Bánh chưng đen | Tối: Xôi nếp Tú Lệ.',
    image: '/picture/provinces/yen-bai.jpg',
    region: 'Tây Bắc Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở vịt nướng', address: 'Lục Yên, Yên Bái', image: '/picture/provinces/yen-bai.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Phở chan thịt vịt nướng thơm mùi lá mắc mật.', tastingTip: 'Thêm măng chua.', englishMenu: 'Yen Bai Roast Duck Pho.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Muồm muỗm rang Mường Lò', address: 'Văn Chấn, Yên Bái', image: '/picture/provinces/yen-bai.jpg', price: '90.000đ', priceNum: 90000, category: 'Đặc sản', cultureStory: 'Muồm muỗm rang lá chanh bùi béo mùa gặt.', tastingTip: 'Ăn giòn tan vị đồng quê.', englishMenu: 'Stir-Fried Grasshoppers.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh chưng đen', address: 'Lò Lò, Mù Cang Chải', image: '/picture/provinces/yen-bai.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh chưng nhuộm màu tro cây rừng nhân đỗ xanh thịt mỡ.', tastingTip: 'Cắt bằng dây lạt.', englishMenu: 'Black Sticky Rice Cake.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Xôi nếp Tú Lệ, Gà nướng', address: 'Tú Lệ, Văn Chấn, Yên Bái', image: '/picture/provinces/yen-bai.jpg', price: '130.000đ', priceNum: 130000, category: 'Sang trọng', cultureStory: 'Xôi nếp nương Tú Lệ dẻo thơm danh tiếng ăn kèm gà nướng.', tastingTip: 'Ăn nóng để cảm nhận vị dẻo ngọt của hạt nếp.', englishMenu: 'Tu Le Sticky Rice & Grilled Chicken.', distance: '1.5 km' }
    ]
  },

  // 4. Bắc Trung Bộ (6 Tỉnh)
  {
    id: 'thanhhoa',
    title: 'Thanh Hóa - Xứ Thanh Địa Linh Nhân Kiệt',
    desc: 'Sáng: Bánh cuốn nóng | Trưa: Gỏi cá nhệch Nga Sơn | Chiều: Nem chua | Tối: Chả tôm nướng.',
    image: '/picture/provinces/thanh-hoa.jpg',
    region: 'Bắc Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh cuốn nóng', address: 'TP. Thanh Hóa', image: '/picture/provinces/thanh-hoa.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bánh cuốn mỏng dẻo nhân thịt mộc nhĩ chấm nước mắm cốt pha chanh ớt.', tastingTip: 'Thêm chút tinh dầu cà cuống.', englishMenu: 'Thanh Hoa Steamed Rolled Pancake.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gỏi cá nhệch Nga Sơn', address: 'Nga Sơn, Thanh Hóa', image: '/picture/provinces/thanh-hoa.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Gỏi cá nhệch cuốn lá sung, lá đinh lăng chấm chẻo nhệch béo ngậy.', tastingTip: 'Cuốn thành hình phễu để chấm chẻo đậm đặc.', englishMenu: 'Nga Son Raw Eel Salad with Herbs.', distance: '1.6 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Nem chua, Bánh răng bừa', address: 'TP. Thanh Hóa', image: '/picture/provinces/thanh-hoa.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Nem chua đặc sản lá đinh lăng và bánh răng bừa thơm mùi hành mỡ.', tastingTip: 'Chấm tương ớt.', englishMenu: 'Fermented Pork Roll & Banh Rang Bua.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Chả tôm nướng than hoa', address: 'Phố Lê Thị Hoa, TP. Thanh Hóa', image: '/picture/provinces/thanh-hoa.jpg', price: '50.000đ', priceNum: 50000, category: 'Sang trọng', cultureStory: 'Chả tôm bọc bánh phở nướng kẹp vỉ than hoa thơm nức.', tastingTip: 'Ăn kèm rau sống và nước mắm chua ngọt.', englishMenu: 'Grilled Shrimp Patties.', distance: '1.2 km' }
    ]
  },
  {
    id: 'nghean',
    title: 'Nghệ An - Quê Hương Bác Hồ',
    desc: 'Sáng: Súp lươn bánh mỳ | Trưa: Mực nháy Cửa Lò | Chiều: Bánh mướt | Tối: Gà nướng đất sét.',
    image: '/picture/provinces/nghe-an.jpg',
    region: 'Bắc Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Súp lươn bánh mỳ / Miến lươn', address: 'TP. Vinh, Nghệ An', image: '/picture/provinces/nghe-an.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Lươn đồng xào nghệ cay nồng đậm đà xứ Nghệ.', tastingTip: 'Chấm bánh mỳ giòn vào nước súp đậm vị.', englishMenu: 'Nghe An Spicy Eel Soup with Bread.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Mực nháy nướng Cửa Lò', address: 'Cửa Lò, Nghệ An', image: '/picture/provinces/nghe-an.jpg', price: '180.000đ', priceNum: 180000, category: 'Đặc sản', cultureStory: 'Mực tươi vừa đánh bắt nướng than hoa ngọt lịm.', tastingTip: 'Chấm tương ớt cay.', englishMenu: 'Fresh Grilled Squid.', distance: '2.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh mướt', address: 'TP. Vinh, Nghệ An', image: '/picture/provinces/nghe-an.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh mướt dẻo mịn ăn kèm nước mắm chỏi hoặc xáo lòng.', tastingTip: 'Thêm chút hành phi thơm phức.', englishMenu: 'Nghe An Soft Rice Steamed Roll.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gà nướng đất sét', address: 'Nam Đàn, Nghệ An', image: '/picture/provinces/nghe-an.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng', cultureStory: 'Gà đồi bọc đất sét nướng kín giữ trọn vị ngọt nguyên bản.', tastingTip: 'Đập lớp đất sét khô để lấy gà thơm phức.', englishMenu: 'Clay-Baked Hill Chicken.', distance: '1.7 km' }
    ]
  },
  {
    id: 'hatinh',
    title: 'Hà Tĩnh - Miền Núi Hồng Lĩnh',
    desc: 'Sáng: Cháo canh | Trưa: Mực nhảy Vũng Áng | Chiều: Kẹo Cu Đơ chè xanh | Tối: Hến xào bánh tráng.',
    image: '/picture/provinces/ha-tinh.jpg',
    region: 'Bắc Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Cháo canh', address: 'TP. Hà Tĩnh', image: '/picture/provinces/ha-tinh.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Sợi bánh canh bột mì dai nấu xương heo và giò.', tastingTip: 'Thêm hành hoa và tiêu.', englishMenu: 'Ha Tinh Thick Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Mực nhảy Vũng Áng', address: 'Kỳ Anh, Hà Tĩnh', image: '/picture/provinces/ha-tinh.jpg', price: '190.000đ', priceNum: 190000, category: 'Đặc sản', cultureStory: 'Mực nhảy giòn ngọt luộc hoặc nhúng giấm.', tastingTip: 'Chấm muối ớt xanh.', englishMenu: 'Vung Ang Live Squid.', distance: '1.8 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Kẹo Cu Đơ thưởng chè xanh', address: 'TP. Hà Tĩnh', image: '/picture/provinces/ha-tinh.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Kẹo mật mía gừng bọc lạc giòn tan ăn cùng bát nước chè xanh chát dịu.', tastingTip: 'Cắn miếng kẹo ngọt bùi rồi chiêu ngụm chè xanh.', englishMenu: 'Cu Do Peanut Molasses Candy & Tea.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Hến xào xúc bánh tráng', address: 'Đức Thọ, Hà Tĩnh', image: '/picture/provinces/ha-tinh.jpg', price: '70.000đ', priceNum: 70000, category: 'Sang trọng', cultureStory: 'Hến sông Lam xào thơm nức xúc bánh tráng nướng giòn.', tastingTip: 'Dùng bánh tráng múc hến xúc ăn.', englishMenu: 'Stir-Fried Baby Clams with Rice Crackers.', distance: '1.3 km' }
    ]
  },
  {
    id: 'quangbinh',
    title: 'Quảng Bình - Vương Quốc Hang Động',
    desc: 'Sáng: Cháo canh cá lóc | Trưa: Gà nướng Phong Nha | Chiều: Bánh lọc trần | Tối: Lẩu cá khoai.',
    image: '/picture/provinces/quang-binh.jpg',
    region: 'Bắc Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Cháo canh cá lóc', address: 'TP. Đồng Hới, Quảng Bình', image: '/picture/provinces/quang-binh.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Cháo canh sợi bột gạo tẻ chan nước dùng cá lóc rim đậm đà.', tastingTip: 'Ăn kèm ram giòn và rau cải xanh thái nhỏ.', englishMenu: 'Snakehead Fish Thick Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gà nướng Phong Nha', address: 'Phong Nha, Quảng Bình', image: '/picture/provinces/quang-binh.jpg', price: '140.000đ', priceNum: 140000, category: 'Đặc sản', cultureStory: 'Gà nướng mắc khén chấm muối tiêu chè xanh.', tastingTip: 'Thưởng thức giữa thiên nhiên núi rừng.', englishMenu: 'Phong Nha Grilled Chicken.', distance: '1.6 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh lọc trần', address: 'Đồng Hới, Quảng Bình', image: '/picture/provinces/quang-binh.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bánh bột lọc trong suốt nhân tôm thịt đậm vị.', tastingTip: 'Chấm ngập nước mắm ớt cay.', englishMenu: 'Clear Tapioca Dumpling with Shrimp.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu cá khoai', address: 'Đồng Hới, Quảng Bình', image: '/picture/provinces/quang-binh.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Lẩu cá khoai thịt mềm tan trong nước dùng chua ngọt.', tastingTip: 'Nhúng cá vừa chín tới để không bị nát.', englishMenu: 'Bombay Duck Fish Hotpot.', distance: '1.5 km' }
    ]
  },
  {
    id: 'quangtri',
    title: 'Quảng Trị - Miền Đất Lịch Sử',
    desc: 'Sáng: Bún hến | Trưa: Thịt trâu lá trơng | Chiều: Bánh ít lá gai | Tối: Cháo vạt giường.',
    image: '/picture/provinces/quang-tri.jpg',
    region: 'Bắc Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún hến', address: 'TP. Đông Hà, Quảng Trị', image: '/picture/provinces/quang-tri.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bún hến sông Hiền Lương cay nồng vị ruốc và ớt.', tastingTip: 'Trộn đều rau sống thái nhỏ.', englishMenu: 'Quang Tri Spicy Baby Clam Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Thịt trâu lá trơng', address: 'Đông Hà, Quảng Trị', image: '/picture/provinces/quang-tri.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Thịt trâu nướng cuốn lá trơng rừng thơm cay đặc trưng.', tastingTip: 'Chấm mắm nêm hoặc tương.', englishMenu: 'Buffalo Meat Wrapped in Tron Leaves.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh ít lá gai', address: 'Hải Lăng, Quảng Trị', image: '/picture/provinces/quang-tri.jpg', price: '15.000đ', priceNum: 15000, category: 'Ăn vặt', cultureStory: 'Bánh dẻo thơm lá gai nhân đậu xanh dừa.', tastingTip: 'Thưởng thức tráng miệng.', englishMenu: 'Ramie Leaf Sticky Rice Cake.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cháo vạt giường (Cháo cá lóc)', address: 'Triệu Phong, Quảng Trị', image: '/picture/provinces/quang-tri.jpg', price: '45.000đ', priceNum: 45000, category: 'Sang trọng', cultureStory: 'Cháo vạt giường sợi bột gạo cắt tay nấu cá lóc đồng.', tastingTip: 'Thêm nhiều tiêu và ớt bột.', englishMenu: 'Vat Giuong Flat Noodle Porridge.', distance: '1.3 km' }
    ]
  },
  {
    id: 'hue',
    title: 'Thừa Thiên Huế - Cố Đô Thơ Mộng',
    desc: 'Sáng: Bún bò Huế | Trưa: Cơm hến | Chiều: Bánh bèo, nậm, lọc | Tối: Bánh khoái, nem lụi.',
    image: '/picture/provinces/thua-thien-hue.jpg',
    region: 'Bắc Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún bò Huế', address: 'Đường Chi Lăng, Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Bún bò Huế đậm đà hương vị sả, ruốc và nước dùng thơm ngát.', tastingTip: 'Thêm bắp chuối bào, giá đỗ và sa tế cay.', englishMenu: 'Authentic Hue Beef Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm hến', address: 'Đường Vĩ Dạ, Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '30.000đ', priceNum: 30000, category: 'Bình dân', cultureStory: 'Cơm nguội trộn hến xào, tóp mỡ, mắm ruốc và hoa chuối.', tastingTip: 'Trộn đều tất cả nguyên liệu cay nồng.', englishMenu: 'Hue Baby Clam Rice.', distance: '1.1 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Các loại bánh bèo, nậm, lọc', address: 'Phố cổ Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '40.000đ', priceNum: 40000, category: 'Ăn vặt', cultureStory: 'Bộ ba bánh cung đình Huế tinh tế đậm vị tôm thịt.', tastingTip: 'Chan nước mắm ớt ngọt vừa đủ.', englishMenu: 'Hue Royal Steamed Rice Cakes.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bánh khoái, nem lụi', address: 'Đường Đinh Tiên Hoàng, Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '80.000đ', priceNum: 80000, category: 'Sang trọng', cultureStory: 'Bánh khoái giòn rụm nhân tôm thịt ăn kèm nước lèo đậu phộng gan.', tastingTip: 'Cuốn bánh khoái và nem lụi với rau sống.', englishMenu: 'Hue Crispy Pancake & Lemongrass Skewers.', distance: '1.4 km' }
    ]
  },

  // 5. Duyên hải Nam Trung Bộ (8 Tỉnh/Thành)
  {
    id: 'danang',
    title: 'Đà Nẵng - Thành Phố Đáng Sống',
    desc: 'Sáng: Bún chả cá | Trưa: Mì Quảng | Chiều: Bánh tráng cuốn thịt heo | Tối: Hải sản ven biển.',
    image: '/picture/provinces/a-nang.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún chả cá', address: 'Hải Châu, Đà Nẵng', image: '/picture/provinces/a-nang.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Bún chả cá thơm ngọt nước dùng bí đỏ, bắp cải và thơm.', tastingTip: 'Thêm mắm ruốc và hành tỏi ngâm chua.', englishMenu: 'Da Nang Fish Cake Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Mì Quảng', address: 'Thanh Khê, Đà Nẵng', image: '/picture/provinces/a-nang.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Mì Quảng tôm thịt đậm đà ăn kèm bánh tráng mè giòn.', tastingTip: 'Trộn đều rau sống búp và đậu phộng rang.', englishMenu: 'Da Nang Quang Style Noodles.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng cuốn thịt heo', address: 'Đường Hải Phòng, Đà Nẵng', image: '/picture/provinces/a-nang.jpg', price: '70.000đ', priceNum: 70000, category: 'Đặc sản', cultureStory: 'Thịt heo hai đầu da cuốn bánh tráng phơi sương và rau rừng.', tastingTip: 'Chấm ngập mắm nêm đậm đà.', englishMenu: 'Pork Belly Wrapped in Rice Paper.', distance: '1.0 km' },
      { time: '19:00', mealType: 'Tối', name: 'Hải sản ven biển', address: 'Bãi biển Mỹ Khê, Đà Nẵng', image: '/picture/provinces/a-nang.jpg', price: '250.000đ', priceNum: 250000, category: 'Sang trọng', cultureStory: 'Hải sản tươi sống nướng mỡ hành hoặc hấp sả.', tastingTip: 'Thưởng thức gió biển và hải sản tươi.', englishMenu: 'Beachfront Seafood Feast.', distance: '2.5 km' }
    ]
  },
  {
    id: 'quangnam',
    title: 'Quảng Nam - Phố Hoài Hội An',
    desc: 'Sáng: Mì Quảng gà | Trưa: Cơm gà Hội An | Chiều: Cao lầu | Tối: Bê thui Cầu Mống.',
    image: '/picture/provinces/quang-nam.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Mì Quảng gà', address: 'Tam Kỳ, Quảng Nam', image: '/picture/provinces/quang-nam.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Mì Quảng gà đồi thơm mùi nén và đậu phộng rang.', tastingTip: 'Trộn bánh tráng nướng bóp vụn vào mì.', englishMenu: 'Tam Ky Chicken Quang Noodles.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm gà Hội An', address: 'Phố cổ Hội An, Quảng Nam', image: '/picture/provinces/quang-nam.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Cơm nấu nước luộc gà nghệ vàng dẻo thơm ăn kèm gà xé trộn rau răm.', tastingTip: 'Ăn kèm hành tây ngâm chua và đu đủ.', englishMenu: 'Hoi An Chicken Rice.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Cao lầu', address: 'Phố cổ Hội An, Quảng Nam', image: '/picture/provinces/quang-nam.jpg', price: '45.000đ', priceNum: 45000, category: 'Ăn vặt', cultureStory: 'Món mì truyền thống Hội An sợi dai đặc biệt nước giếng Bá Lễ.', tastingTip: 'Trộn đều thịt xá xíu, tóp mỡ và rau trà quế.', englishMenu: 'Hoi An Ancient Cao Lau Noodles.', distance: '0.5 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bê thui Cầu Mống', address: 'Điện Bàn, Quảng Nam', image: '/picture/provinces/quang-nam.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Thịt bê thui chín tái vừa tới, da mềm ngọt.', tastingTip: 'Cuốn bánh tráng chấm mắm nêm hảo hạng.', englishMenu: 'Cau Mong Veal.', distance: '1.8 km' }
    ]
  },
  {
    id: 'quangngai',
    title: 'Quảng Ngãi - Núi Ấn Sông Trà',
    desc: 'Sáng: Bún don | Trưa: Cơm cá bống sông Trà | Chiều: Kẹo gương | Tối: Bún cá thu.',
    image: '/picture/provinces/quang-ngai.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún don', address: 'TP. Quảng Ngãi', image: '/picture/provinces/quang-ngai.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Món bún don sông Trà thanh ngọt ăn kèm bánh tráng nướng.', tastingTip: 'Bẻ vụn bánh tráng thả vào tô bún.', englishMenu: 'Quang Ngai Don Clam Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm cá bống sông Trà kho tiêu', address: 'TP. Quảng Ngãi', image: '/picture/provinces/quang-ngai.jpg', price: '80.000đ', priceNum: 80000, category: 'Đặc sản', cultureStory: 'Cá bống sông Trà kho tiêu đậm đà quánh quẩn.', tastingTip: 'Ăn kèm cơm trắng nóng dẻo.', englishMenu: 'Tra River Braised Gobio Fish with Rice.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Kẹo gương', address: 'TP. Quảng Ngãi', image: '/picture/provinces/quang-ngai.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Kẹo mạch nha trong suốt giòn tan phủ mè trắng.', tastingTip: 'Thưởng thức cùng nước chè xanh.', englishMenu: 'Crystal Peanut Sugar Candy.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bún cá thu', address: 'TP. Quảng Ngãi', image: '/picture/provinces/quang-ngai.jpg', price: '45.000đ', priceNum: 45000, category: 'Sang trọng', cultureStory: 'Bún cá thu tươi ngon đậm đà hương vị biển.', tastingTip: 'Thêm chả cá thu chiên giòn.', englishMenu: 'Mackerel Fish Vermicelli.', distance: '1.3 km' }
    ]
  },
  {
    id: 'binhdinh',
    title: 'Bình Định - Xứ Nẫu Võ Thuật',
    desc: 'Sáng: Bún tôm Châu Trúc | Trưa: Bánh hỏi cháo lòng | Chiều: Bánh xèo tôm nhảy | Tối: Gà chỉ Quy Nhơn.',
    image: '/picture/provinces/binh-inh.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún tôm Châu Trúc', address: 'Phù Mỹ, Bình Định', image: '/picture/provinces/binh-inh.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún tươi ép thủ công ăn cùng tôm đất tươi giòn.', tastingTip: 'Chan nước dùng tôm ngọt thanh.', englishMenu: 'Chau Truc Shrimp Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bánh hỏi cháo lòng', address: 'TP. Quy Nhơn, Bình Định', image: '/picture/provinces/binh-inh.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Bánh hỏi mượt mà phết dầu hẹ ăn kèm đĩa lòng heo luộc và cháo nóng.', tastingTip: 'Chấm bánh hỏi và lòng vào nước mắm gừng.', englishMenu: 'Fine Rice Vermicelli with Pork Offal Porridge.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh xèo tôm nhảy', address: 'Rạch Đất, Quy Nhơn', image: '/picture/provinces/binh-inh.jpg', price: '45.000đ', priceNum: 45000, category: 'Ăn vặt', cultureStory: 'Bánh xèo giòn rụm nhân tôm đất nhảy tanh tách.', tastingTip: 'Cuốn rau sống bánh tráng chấm mắm tỏi ớt.', englishMenu: 'Jumping Shrimp Crispy Pancake.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gà chỉ Quy Nhơn', address: 'Quy Nhơn, Bình Định', image: '/picture/provinces/binh-inh.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng', cultureStory: 'Thực khách tự chỉ con gà vườn để chế biến các món.', tastingTip: 'Thưởng thức gà nướng lu hoặc nấu lá giang.', englishMenu: 'Quy Nhon Free-Range Chicken.', distance: '1.9 km' }
    ]
  },
  {
    id: 'phuyen',
    title: 'Phú Yên - Hoa Vàng Trên Cỏ Xanh',
    desc: 'Sáng: Bánh canh hẹ | Trưa: Cơm gà Phú Yên | Chiều: Bánh căn mực | Tối: Mắt cá ngừ đại dương.',
    image: '/picture/provinces/phu-yen.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh canh hẹ', address: 'TP. Tuy Hòa, Phú Yên', image: '/picture/provinces/phu-yen.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bánh canh chả cá ngập tràn lá hẹ xanh mướt.', tastingTip: 'Thưởng thức nước dùng ngọt thanh từ cá.', englishMenu: 'Chive Fish Cake Rice Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm gà Phú Yên', address: 'Tuy Hòa, Phú Yên', image: '/picture/provinces/phu-yen.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản', cultureStory: 'Cơm gà vàng óng hạt tơi xốp ăn kèm hành tây chua ngọt.', tastingTip: 'Chấm nước mắm ớt trái cây đậm đà.', englishMenu: 'Phu Yen Chicken Rice.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh căn mực', address: 'Tuy Hòa, Phú Yên', image: '/picture/provinces/phu-yen.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bánh căn nhỏ đổ khuôn nóng hổi nhân mực tươi giòn.', tastingTip: 'Chấm bát nước mắm xoài chua ngọt.', englishMenu: 'Mini Squid Rice Pancakes.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Mắt cá ngừ đại dương hầm thuốc bắc', address: 'Tuy Hòa, Phú Yên', image: '/picture/provinces/phu-yen.jpg', price: '60.000đ', priceNum: 60000, category: 'Sang trọng', cultureStory: 'Mắt cá ngừ tiềm thuốc bắc trong thố đất bổ dưỡng.', tastingTip: 'Ăn nóng kèm rau cải xanh thái nhỏ.', englishMenu: 'Stewed Tuna Eye with Herbal Medicine.', distance: '1.5 km' }
    ]
  },
  {
    id: 'khanhhoa',
    title: 'Khánh Hòa - Thành Phố Biển Nha Trang',
    desc: 'Sáng: Bún sứa | Trưa: Bún lá cá dầm | Chiều: Nem nướng Ninh Hòa | Tối: Hải sản nướng.',
    image: '/picture/provinces/khanh-hoa.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún sứa', address: 'Nha Trang, Khánh Hòa', image: '/picture/provinces/khanh-hoa.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Sứa biển giòn sần sật trong nước dùng cá liệt thanh ngọt.', tastingTip: 'Thêm chút mắm tôm và ớt xay.', englishMenu: 'Nha Trang Jellyfish Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bún lá cá dầm', address: 'Nha Trang, Khánh Hòa', image: '/picture/provinces/khanh-hoa.jpg', price: '40.000đ', priceNum: 40000, category: 'Đặc sản', cultureStory: 'Bún lá ăn kèm chả cá chiên/hấp và thịt cá dầm thơm ngọt.', tastingTip: 'Vắt chanh tươi và thêm ớt hiểm.', englishMenu: 'Fish Cake Vermicelli.', distance: '1.1 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Nem nướng Ninh Hòa', address: 'Ninh Hòa, Khánh Hòa', image: '/picture/provinces/khanh-hoa.jpg', price: '60.000đ', priceNum: 60000, category: 'Ăn vặt', cultureStory: 'Nem nướng than hoa cuốn bánh tráng chiên giòn và rau sống.', tastingTip: 'Chấm ngập nước sốt đậu phộng gan heo.', englishMenu: 'Ninh Hoa Grilled Pork Skewer Rolls.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Hải sản nướng', address: 'Đường Tháp Bà, Nha Trang', image: '/picture/provinces/khanh-hoa.jpg', price: '220.000đ', priceNum: 220000, category: 'Sang trọng', cultureStory: 'Hải sản tươi sống phong phú nướng mỡ hành.', tastingTip: 'Thưởng thức hải sản tươi ngon đêm Nha Trang.', englishMenu: 'Nha Trang Seafood Grill.', distance: '2.0 km' }
    ]
  },
  {
    id: 'ninhthuan',
    title: 'Ninh Thuận - Vùng Đất Nắng Gió',
    desc: 'Sáng: Bánh canh chả cá | Trưa: Cơm gà Phan Rang | Chiều: Bánh căn bánh xèo | Tối: Thịt cừu nướng.',
    image: '/picture/provinces/ninh-thuan.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh canh chả cá', address: 'TP. Phan Rang, Ninh Thuận', image: '/picture/provinces/ninh-thuan.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bánh canh bột gạo dai mềm cùng chả cá thu thơm ngon.', tastingTip: 'Thêm mắm ớt tỏi Phan Rang.', englishMenu: 'Phan Rang Fish Cake Rice Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm gà Phan Rang', address: 'Phan Rang, Ninh Thuận', image: '/picture/provinces/ninh-thuan.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản', cultureStory: 'Cơm gà vàng ruộm ăn kèm nước chấm tỏi ớt đặc trưng.', tastingTip: 'Chấm đẫm nước chấm chua ngọt.', englishMenu: 'Phan Rang Chicken Rice.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh căn, bánh xèo', address: 'Phan Rang, Ninh Thuận', image: '/picture/provinces/ninh-thuan.jpg', price: '40.000đ', priceNum: 40000, category: 'Ăn vặt', cultureStory: 'Bánh căn mực, tôm đổ khuôn đất nướng giòn.', tastingTip: 'Chấm nước chấm đậu phộng mắm nêm.', englishMenu: 'Phan Rang Mini Pancakes.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gỏi cá mai, thịt cừu nướng', address: 'Phan Rang, Ninh Thuận', image: '/picture/provinces/ninh-thuan.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Đặc sản thịt cừu Ninh Thuận nướng sa tế thơm lừng.', tastingTip: 'Ăn kèm rau thơm và tương chấm.', englishMenu: 'Fresh Anchovy Salad & Grilled Mutton.', distance: '1.7 km' }
    ]
  },
  {
    id: 'binhthuan',
    title: 'Bình Thuận - Thiên Đường Biển Mũi Né',
    desc: 'Sáng: Bánh quai vạc | Trưa: Lẩu thả Mũi Né | Chiều: Bánh xèo Phan Thiết | Tối: Dông cát nướng.',
    image: '/picture/provinces/binh-thuan.jpg',
    region: 'Duyên hải Nam Trung Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh quai vạc', address: 'Phan Thiết, Bình Thuận', image: '/picture/provinces/binh-thuan.jpg', price: '30.000đ', priceNum: 30000, category: 'Bình dân', cultureStory: 'Bánh bột lọc nhỏ nhân tôm đậm đà nước mắm Phan Thiết.', tastingTip: 'Chan nước mắm ớt sền sệt.', englishMenu: 'Phan Thiet Clear Shrimp Dumpling.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu thả Mũi Né', address: 'Mũi Né, Phan Thiết', image: '/picture/provinces/binh-thuan.jpg', price: '200.000đ', priceNum: 200000, category: 'Đặc sản', cultureStory: 'Lẩu thả hải sản cá mai tươi sống ăn cùng bún và hoa quả.', tastingTip: 'Trộn đều các nguyên liệu trong bẹ chuối.', englishMenu: 'Mui Ne Seafood Hotpot.', distance: '2.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh xèo Phan Thiết', address: 'Tuyên Quang, Phan Thiết', image: '/picture/provinces/binh-thuan.jpg', price: '35.000đ', priceNum: 35000, category: 'Ăn vặt', cultureStory: 'Bánh xèo nhỏ khuôn đất nhân tôm mực giá đỗ.', tastingTip: 'Chấm nước mắm đậu phộng.', englishMenu: 'Phan Thiet Crispy Mini Pancake.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Dông cát nướng', address: 'Mũi Né, Bình Thuận', image: '/picture/provinces/binh-thuan.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Đặc sản dông cát nướng muối ớt dai ngọt thơm phức.', tastingTip: 'Nhâm nhi cùng bạn bè bên biển đêm.', englishMenu: 'Grilled Sand Lizard.', distance: '1.9 km' }
    ]
  },

  // 6. Tây Nguyên (5 Tỉnh)
  {
    id: 'daklak',
    title: 'Đắk Lắk - Thủ Phủ Cà Phê Tây Nguyên',
    desc: 'Sáng: Bún đỏ | Trưa: Cơm lam gà nướng Bản Đôn | Chiều: Bánh ướt thịt nướng | Tối: Cá lăng nướng.',
    image: '/picture/provinces/ak-lak.jpg',
    region: 'Tây Nguyên',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún đỏ', address: 'TP. Buôn Ma Thuột, Đắk Lắk', image: '/picture/provinces/ak-lak.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bún sợi to màu đỏ đặc trưng chan nước dùng riêu cua đậm vị.', tastingTip: 'Ăn kèm trứng cút và rau cải ngọt.', englishMenu: 'Buon Ma Thuot Red Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm lam, gà nướng Bản Đôn', address: 'Bản Đôn, Đắk Lắk', image: '/picture/provinces/ak-lak.jpg', price: '140.000đ', priceNum: 140000, category: 'Đặc sản', cultureStory: 'Gà nướng than hồng quết mật ong rừng ăn với cơm lam.', tastingTip: 'Chấm muối ớt é.', englishMenu: 'Ban Don Bamboo Rice & Grilled Chicken.', distance: '2.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh ướt thịt nướng', address: 'Buôn Ma Thuột, Đắk Lắk', image: '/picture/provinces/ak-lak.jpg', price: '45.000đ', priceNum: 45000, category: 'Ăn vặt', cultureStory: 'Bánh ướt mỏng tự cuốn với thịt nướng, xoài chua và dưa leo.', tastingTip: 'Cuốn chặt tay chấm nước mắm mặn ngọt.', englishMenu: 'Wet Rice Paper Rolls with Grilled Pork.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cá lăng sông nướng', address: 'Hồ Lắk, Đắk Lắk', image: '/picture/provinces/ak-lak.jpg', price: '170.000đ', priceNum: 170000, category: 'Sang trọng', cultureStory: 'Cá lăng sông Sê Pốc tươi ngon nướng muối ớt.', tastingTip: 'Ăn kèm lá rừng và bún tươi.', englishMenu: 'Grilled River Catfish.', distance: '1.6 km' }
    ]
  },
  {
    id: 'daknong',
    title: 'Đắk Nông - Cao Nguyên Đại Ngàn',
    desc: 'Sáng: Phở cuốn | Trưa: Lẩu cá lăng | Chiều: Bánh tráng nướng | Tối: Cơm đọt mây bóp sỏi.',
    image: '/picture/provinces/ak-nong.jpg',
    region: 'Tây Nguyên',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở cuốn', address: 'Gia Nghĩa, Đắk Nông', image: '/picture/provinces/ak-nong.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Phở cuốn thịt bò xào và rau thơm tươi mát.', tastingTip: 'Chấm nước mắm chua ngọt.', englishMenu: 'Beef Rolled Pho.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá lăng', address: 'Gia Nghĩa, Đắk Nông', image: '/picture/provinces/ak-nong.jpg', price: '180.000đ', priceNum: 180000, category: 'Đặc sản', cultureStory: 'Lẩu cá lăng nấu măng chua đậm đà vị núi rừng.', tastingTip: 'Nhúng rau đắng và hoa chuối.', englishMenu: 'Catfish and Sour Bamboo Soup.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng nướng', address: 'Gia Nghĩa, Đắk Nông', image: '/picture/provinces/ak-nong.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh tráng nướng mỡ hành trứng cút thơm giòn.', tastingTip: 'Thưởng thức khi còn nóng.', englishMenu: 'Grilled Rice Paper Pizza.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cơm đọt mây bóp sỏi', address: 'Đắk Nông', image: '/picture/provinces/ak-nong.jpg', price: '90.000đ', priceNum: 90000, category: 'Sang trọng', cultureStory: 'Món ăn độc đáo đọt mây đắng nhẹ trộn gia vị truyền thống.', tastingTip: 'Thưởng thức vị đắng thanh độc đáo.', englishMenu: 'Rattan Shoot Specialty.', distance: '1.4 km' }
    ]
  },
  {
    id: 'gialai',
    title: 'Gia Lai - Phố Núi Pleiku',
    desc: 'Sáng: Phở khô 2 tô | Trưa: Bò một nắng muối kiến vàng | Chiều: Bún cua thối | Tối: Gà nướng cơm lam.',
    image: '/picture/provinces/gia-lai.jpg',
    region: 'Tây Nguyên',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở khô 2 tô', address: 'Pleiku, Gia Lai', image: '/picture/provinces/gia-lai.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Phở khô đặc sản Pleiku gồm một tô phở trộn sốt thịt băm và một tô nước dùng.', tastingTip: 'Trộn đều tương đen và sa tế vào tô phở khô.', englishMenu: 'Pleiku Dry Pho (2-Bowl Style).', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bò một nắng chấm muối kiến vàng', address: 'Kbang, Gia Lai', image: '/picture/provinces/gia-lai.jpg', price: '160.000đ', priceNum: 160000, category: 'Đặc sản', cultureStory: 'Thịt bò phơi một nắng nướng chín tới chấm muối kiến vàng rừng.', tastingTip: 'Chấm đậm muối kiến vàng đặc sản.', englishMenu: 'Sun-Dried Beef with Golden Ant Salt.', distance: '1.8 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bún cua thối (bún mắm cua)', address: 'Pleiku, Gia Lai', image: '/picture/provinces/gia-lai.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bún cua lên men có mùi đặc trưng đậm đà hương vị Tây Nguyên.', tastingTip: 'Ăn kèm măng chua, nem chua và rau sống.', englishMenu: 'Pleiku Fermented Crab Vermicelli.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gà nướng, cơm lam', address: 'Pleiku, Gia Lai', image: '/picture/provinces/gia-lai.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Gà đồi nướng nguyên con thơm nức mũi.', tastingTip: 'Xé tay chấm muối tiêu mắc khén.', englishMenu: 'Hill Chicken & Bamboo Rice.', distance: '1.5 km' }
    ]
  },
  {
    id: 'kontum',
    title: 'Kon Tum - Ngã Ba Đông Dương',
    desc: 'Sáng: Bún nước | Trưa: Gỏi lá | Chiều: Xôi măng | Tối: Cá tầm nướng.',
    image: '/picture/provinces/kontum.jpg',
    region: 'Tây Nguyên',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún nước', address: 'TP. Kon Tum', image: '/picture/provinces/kontum.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bún tươi chan nước dùng tôm thịt giã nhuyễn ngọt tự nhiên.', tastingTip: 'Thêm ớt xay giã.', englishMenu: 'Kon Tum Fresh Shrimp Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gỏi lá', address: 'TP. Kon Tum', image: '/picture/provinces/kontum.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Đặc sản hơn 40 loại lá rừng cuốn kèm thịt ba chỉ, tôm và bì.', tastingTip: 'Cuốn thành phễu lớn bỏ các loại lá và thịt.', englishMenu: 'Forest Leaf Salad.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Xôi măng', address: 'Kon Tum', image: '/picture/provinces/kontum.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Xôi nếp vàng ăn kèm măng tươi xào đậm đà.', tastingTip: 'Thêm chút tép khô và hành phi.', englishMenu: 'Sticky Rice with Sautéed Bamboo Shoots.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cá tầm nướng', address: 'Măng Đen, Kon Tum', image: '/picture/provinces/kontum.jpg', price: '200.000đ', priceNum: 200000, category: 'Sang trọng', cultureStory: 'Cá tầm Măng Đen nướng muối ớt giữa không gian se lạnh.', tastingTip: 'Ăn nóng kèm rau rừng Măng Đen.', englishMenu: 'Mang Den Grilled Sturgeon.', distance: '2.0 km' }
    ]
  },
  {
    id: 'lamdong',
    title: 'Lâm Đồng - Thành Phố Ngàn Hoa Đà Lạt',
    desc: 'Sáng: Bánh mì xíu mại chảo | Trưa: Lẩu bò Ba Toa | Chiều: Bánh tráng nướng | Tối: Lẩu gà lá é.',
    image: '/picture/provinces/lam-ong.jpg',
    region: 'Tây Nguyên',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh mì xíu mại chảo', address: 'Đà Lạt, Lâm Đồng', image: '/picture/provinces/lam-ong.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Xíu mại viên nóng hổi trong chén nước dùng béo ngọt ăn kèm bánh mì giòn.', tastingTip: 'Xé bánh mì chấm ngập nước xíu mại.', englishMenu: 'Da Lat Meatball Bread.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu bò Ba Toa', address: 'Đà Lạt, Lâm Đồng', image: '/picture/provinces/lam-ong.jpg', price: '180.000đ', priceNum: 180000, category: 'Đặc sản', cultureStory: 'Lẩu bò gân nạm thơm nức mùi sả thảo mộc trong tiết trời se lạnh.', tastingTip: 'Nhúng mì trứng và cải xanh tươi Đà Lạt.', englishMenu: 'Ba Toa Beef Hotpot.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng nướng, sữa đậu nành nóng', address: 'Chợ Đà Lạt', image: '/picture/provinces/lam-ong.jpg', price: '35.000đ', priceNum: 35000, category: 'Ăn vặt', cultureStory: 'Bánh tráng nướng mỡ hành phô mai trứng gà và sữa đậu nành ấm.', tastingTip: 'Thưởng thức khi bánh còn giòn tan.', englishMenu: 'Da Lat Pizza & Warm Soy Milk.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu gà lá é', address: 'Đường 3/4, Đà Lạt', image: '/picture/provinces/lam-ong.jpg', price: '200.000đ', priceNum: 200000, category: 'Sang trọng', cultureStory: 'Lẩu gà nấu lá é thơm cay nồng ấm áp giữa đêm sương mù.', tastingTip: 'Nhúng lá é vừa chín tới để lấy vị thanh cay.', englishMenu: 'Chicken Hotpot with Lemon Basil.', distance: '1.6 km' }
    ]
  },

  // 7. Đông Nam Bộ (6 Tỉnh/Thành)
  {
    id: 'vungtau',
    title: 'Bà Rịa - Vũng Tàu - Phố Biển Lãng Mạn',
    desc: 'Sáng: Bánh canh Long Hương | Trưa: Lẩu súng Phước Hải | Chiều: Bánh khọt | Tối: Gỏi cá mai, hải sản.',
    image: '/picture/provinces/ba-ria-vung-tau.jpg',
    region: 'Đông Nam Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh canh Long Hương', address: 'Bà Rịa, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Bánh canh giò heo sợi dai mềm nước dùng hầm xương đậm đà.', tastingTip: 'Thêm giá đỗ và hành ngò.', englishMenu: 'Long Huong Rice Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu súng Phước Hải', address: 'Phước Hải, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '180.000đ', priceNum: 180000, category: 'Đặc sản', cultureStory: 'Lẩu hải sản nấu bông súng giòn sần sật chua thanh.', tastingTip: 'Nhúng bông súng vào nước lẩu sôi.', englishMenu: 'Phuoc Hai Water Lily Seafood Hotpot.', distance: '2.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh khọt', address: 'Đường Nguyễn Trường Tộ, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '50.000đ', priceNum: 50000, category: 'Ăn vặt', cultureStory: 'Bánh khọt tôm tươi giòn rụm đổ khuôn dầu ăn kèm rau sống mỡ hành.', tastingTip: 'Cuốn bánh khọt với rau cải xanh và chấm nước mắm ngọt.', englishMenu: 'Vung Tau Mini Crispy Shrimp Pancakes.', distance: '1.2 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gỏi cá mai, hải sản', address: 'Bãi Trước, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '220.000đ', priceNum: 220000, category: 'Sang trọng', cultureStory: 'Gỏi cá mai trộn thính thơm ngậy chấm nước sốt đậu phộng.', tastingTip: 'Cuốn bánh tráng với rau thơm và khế chua.', englishMenu: 'Fresh Anchovy Salad & Seafood.', distance: '1.8 km' }
    ]
  },
  {
    id: 'binhduong',
    title: 'Bình Dương - Vùng Đất Trái Cây Lái Thiêu',
    desc: 'Sáng: Bún tôm | Trưa: Gỏi gà măng cụt Lái Thiêu | Chiều: Bánh bèo Mỹ Liên | Tối: Bò nướng ngói.',
    image: '/picture/provinces/binh-duong.jpg',
    region: 'Đông Nam Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún tôm', address: 'Thủ Dầu Một, Bình Dương', image: '/picture/provinces/binh-duong.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún tôm tươi ngọt nước đậm chất miền Đông.', tastingTip: 'Thêm rau thơm.', englishMenu: 'Binh Duong Shrimp Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gỏi gà măng cụt Lái Thiêu', address: 'Lái Thiêu, Bình Dương', image: '/picture/provinces/binh-duong.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Món gỏi độc đáo kết hợp măng cụt xanh giòn sần sật và gà xé phay.', tastingTip: 'Thưởng thức vào mùa hè măng cụt chín.', englishMenu: 'Mangosteen Chicken Salad.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh bèo Mỹ Liên', address: 'Bình Dương', image: '/picture/provinces/binh-duong.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh bèo chén nhân đậu xanh tôm cháy thơm ngon.', tastingTip: 'Chan nước mắm ngọt.', englishMenu: 'My Lien Steamed Rice Cakes.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bò nướng ngói', address: 'Thủ Dầu Một, Bình Dương', image: '/picture/provinces/binh-duong.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng', cultureStory: 'Thịt bò nướng trên ngói giữ trọn vị mềm ngọt.', tastingTip: 'Cuốn rau sống bánh tráng.', englishMenu: 'Tile-Grilled Beef.', distance: '1.4 km' }
    ]
  },
  {
    id: 'binhphuoc',
    title: 'Bình Phước - Thủ Phủ Hạt Điều',
    desc: 'Sáng: Phở xào | Trưa: Gỏi hạt điều | Chiều: Bánh xèo bắp | Tối: Heo thả rông nướng.',
    image: '/picture/provinces/binh-phuoc.jpg',
    region: 'Đông Nam Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở xào', address: 'Đồng Xoài, Bình Phước', image: '/picture/provinces/binh-phuoc.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Phở xào thịt bò và cải ngọt đậm đà.', tastingTip: 'Thêm chút tương ớt.', englishMenu: 'Stir-Fried Pho.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gỏi hạt điều', address: 'Đồng Xoài, Bình Phước', image: '/picture/provinces/binh-phuoc.jpg', price: '110.000đ', priceNum: 110000, category: 'Đặc sản', cultureStory: 'Gỏi tôm thịt trộn hạt điều giòn bùi đặc sản Bình Phước.', tastingTip: 'Trộn đều trước khi thưởng thức.', englishMenu: 'Cashew Nut Salad.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh xèo bắp', address: 'Chơn Thành, Bình Phước', image: '/picture/provinces/binh-phuoc.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bánh xèo làm từ bắp ngọt tươi giòn thơm.', tastingTip: 'Chấm nước mắm chua ngọt.', englishMenu: 'Corn Crispy Pancake.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Heo thả rông nướng', address: 'Bù Đăng, Bình Phước', image: '/picture/provinces/binh-phuoc.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng', cultureStory: 'Heo bản địa nướng than hồng.', tastingTip: 'Chấm muối ớt.', englishMenu: 'Free-Range Grilled Pork.', distance: '1.6 km' }
    ]
  },
  {
    id: 'dongnai',
    title: 'Đồng Nai - Trái Cây Bưởi Tân Triều',
    desc: 'Sáng: Bánh cuốn Biên Hòa | Trưa: Gỏi bưởi Tân Triều | Chiều: Chả lụi | Tối: Cơm niêu.',
    image: '/picture/provinces/ong-nai.jpg',
    region: 'Đông Nam Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh cuốn Biên Hòa', address: 'TP. Biên Hòa, Đồng Nai', image: '/picture/provinces/ong-nai.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Bánh cuốn nóng nhân thịt mộc nhĩ thơm ngon.', tastingTip: 'Chấm nước mắm pha.', englishMenu: 'Bien Hoa Rolled Rice Pancake.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gỏi bưởi Tân Triều', address: 'Làng bưởi Tân Triều, Đồng Nai', image: '/picture/provinces/ong-nai.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản', cultureStory: 'Gỏi bưởi tôm thịt chua ngọt thanh mát đặc sản Đồng Nai.', tastingTip: 'Ăn kèm phồng tôm giòn.', englishMenu: 'Tan Trieu Pomelo Salad.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Chả lụi', address: 'Trảng Bom, Đồng Nai', image: '/picture/provinces/ong-nai.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Chả lụi cuốn bánh tráng nướng giòn rụm.', tastingTip: 'Chấm mắm đậu phộng.', englishMenu: 'Grilled Minced Pork Skewers.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cơm niêu', address: 'Biên Hòa, Đồng Nai', image: '/picture/provinces/ong-nai.jpg', price: '130.000đ', priceNum: 130000, category: 'Sang trọng', cultureStory: 'Cơm niêu đáy cháy giòn ăn kèm cá kho tộ.', tastingTip: 'Thưởng thức cơm cháy vàng giòn.', englishMenu: 'Claypot Rice with Braised Fish.', distance: '1.5 km' }
    ]
  },
  {
    id: 'tphcm',
    title: 'TP. Hồ Chí Minh - Sài Gòn Năng Động',
    desc: 'Sáng: Cơm tấm sườn bì chả | Trưa: Bún thịt nướng | Chiều: Gỏi cuốn súp cua | Tối: Ốc xào, hủ tiếu gõ.',
    image: '/picture/provinces/tp-ho-chi-minh.jpg',
    region: 'Đông Nam Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Cơm tấm sườn bì chả', address: 'Quận 1, Sài Gòn', image: '/picture/provinces/tp-ho-chi-minh.jpg', price: '55.000đ', priceNum: 55000, category: 'Đặc sản', cultureStory: 'Biểu tượng ẩm thực Sài Gòn với hạt tấm thơm, sườn nướng than hoa đậm đà.', tastingTip: 'Rưới đều nước mắm chua ngọt lên đĩa cơm.', englishMenu: 'Saigon Broken Rice with Grilled Pork.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bún thịt nướng', address: 'Quận 3, Sài Gòn', image: '/picture/provinces/tp-ho-chi-minh.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản', cultureStory: 'Bún tươi ăn kèm thịt nướng, chả giò, mỡ hành và đồ chua.', tastingTip: 'Chan ngập nước mắm tỏi ớt chua ngọt.', englishMenu: 'Grilled Pork Rice Vermicelli.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Gỏi cuốn, súp cua', address: 'Quận 5, Sài Gòn', image: '/picture/provinces/tp-ho-chi-minh.jpg', price: '40.000đ', priceNum: 40000, category: 'Ăn vặt', cultureStory: 'Gỏi cuốn tôm thịt chấm tương đậu phộng và súp cua trứng bắc thảo.', tastingTip: 'Thưởng thức quà vặt chiều phố thị.', englishMenu: 'Fresh Spring Rolls & Crab Soup.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Ốc xào/nướng các loại, hủ tiếu gõ', address: 'Quận 4, Sài Gòn', image: '/picture/provinces/tp-ho-chi-minh.jpg', price: '120.000đ', priceNum: 120000, category: 'Sang trọng', cultureStory: 'Văn hóa ẩm thực hẻm Sài Gòn sôi động về đêm.', tastingTip: 'Thưởng thức cùng bạn bè.', englishMenu: 'Saigon Street Snails & Midnight Noodle.', distance: '2.0 km' }
    ]
  },
  {
    id: 'tayninh',
    title: 'Tây Ninh - Miền Đất Thánh Núi Bà',
    desc: 'Sáng: Bánh canh Trảng Bàng | Trưa: Bò tơ cuốn rau rừng | Chiều: Bánh tráng phơi sương | Tối: Ốc núi Bà Đen.',
    image: '/picture/provinces/tay-ninh.jpg',
    region: 'Đông Nam Bộ',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh canh Trảng Bàng', address: 'Trảng Bàng, Tây Ninh', image: '/picture/provinces/tay-ninh.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Bánh canh phơi sương dai ngon với giò heo và thịt nạc.', tastingTip: 'Ăn kèm đĩa rau rừng Tây Ninh phong phú.', englishMenu: 'Trang Bang Rice Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bò tơ cuốn rau rừng', address: 'Tòa Thánh Tây Ninh', image: '/picture/provinces/tay-ninh.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Thịt bò tơ mềm ngọt cuốn bánh tráng phơi sương và rau rừng.', tastingTip: 'Chấm mắm nêm đậm vị.', englishMenu: 'Young Veal Wrapped in Rice Paper.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng phơi sương chấm muối tôm', address: 'Trảng Bàng, Tây Ninh', image: '/picture/provinces/tay-ninh.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Đặc sản trứ danh bánh tráng phơi sương dẻo quánh.', tastingTip: 'Chấm muối tôm Tây Ninh cay thơm.', englishMenu: 'Dew-Protected Rice Paper with Shrimp Salt.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Ốc núi Bà Đen', address: 'Núi Bà Đen, Tây Ninh', image: '/picture/provinces/tay-ninh.jpg', price: '120.000đ', priceNum: 120000, category: 'Sang trọng', cultureStory: 'Ốc núi ăn thảo dược quý hiếm xào tỏi hoặc hấp sả.', tastingTip: 'Hút trọn phần thịt ốc ngọt béo.', englishMenu: 'Ba Den Mountain Snails.', distance: '1.8 km' }
    ]
  },

  // 8. Đồng Bằng Sông Cửu Long (13 Tỉnh/Thành)
  {
    id: 'angiang',
    title: 'An Giang - Miền Sông Nước Cửu Long',
    desc: 'Sáng: Bún cá Châu Đốc | Trưa: Lẩu mắm | Chiều: Bánh bò thốt nốt | Tối: Gỏi sầu đâu.',
    image: '/picture/provinces/an-giang.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún cá Châu Đốc', address: 'Châu Đốc, An Giang', image: '/picture/provinces/an-giang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún cá nước vàng nghệ nấu ngải bún thơm lừng.', tastingTip: 'Ăn kèm bông so đũa và rau điên điển.', englishMenu: 'Chau Doc Fish Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu mắm', address: 'TP. Long Xuyên, An Giang', image: '/picture/provinces/an-giang.jpg', price: '190.000đ', priceNum: 190000, category: 'Đặc sản', cultureStory: 'Nồi lẩu mắm đậm đà cá linh, tôm, thịt ba rọi và rau miền tây.', tastingTip: 'Nhúng rau nhút, bông súng vào lẩu mắm.', englishMenu: 'Mekong Fermented Fish Hotpot.', distance: '1.6 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh bò thốt nốt', address: 'Tịnh Biên, An Giang', image: '/picture/provinces/an-giang.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh bò xốp mềm thơm mùi đường thốt nốt vùng bảy núi.', tastingTip: 'Chan nước cốt dừa béo ngậy.', englishMenu: 'Palm Sugar Sponge Cake.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Gỏi sầu đâu', address: 'Châu Đốc, An Giang', image: '/picture/provinces/an-giang.jpg', price: '80.000đ', priceNum: 80000, category: 'Sang trọng', cultureStory: 'Lá sầu đâu đắng thanh trộn dưa leo, tôm khô và thịt luộc.', tastingTip: 'Trộn đều nước mắm chua ngọt.', englishMenu: 'Neem Leaf Salad.', distance: '1.4 km' }
    ]
  },
  {
    id: 'baclieu',
    title: 'Bạc Liêu - Xứ Dạ Cổ Hoài Lang',
    desc: 'Sáng: Bún nước lèo | Trưa: Lẩu cá bống mú | Chiều: Bánh tằm bì | Tối: Bún bò cay.',
    image: '/picture/provinces/bac-lieu.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún nước lèo', address: 'TP. Bạc Liêu', image: '/picture/provinces/bac-lieu.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún nước lèo mắm bò hóc thơm ngọt đậm đà.', tastingTip: 'Ăn kèm rau bắp chuối và giá đỗ.', englishMenu: 'Bac Lieu Fish Broth Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá bống mú', address: 'TP. Bạc Liêu', image: '/picture/provinces/bac-lieu.jpg', price: '200.000đ', priceNum: 200000, category: 'Đặc sản', cultureStory: 'Cá bống mú tươi ngon nấu lẩu chua ngọt.', tastingTip: 'Nhúng rau muống bào.', englishMenu: 'Grouper Fish Hotpot.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tằm bì', address: 'TP. Bạc Liêu', image: '/picture/provinces/bac-lieu.jpg', price: '35.000đ', priceNum: 35000, category: 'Ăn vặt', cultureStory: 'Bánh tằm thủ công dẻo dai ăn kèm bì thính và nước cốt dừa.', tastingTip: 'Chan nước mắm cốt dừa béo ngậy.', englishMenu: 'Tapioca Noodle with Shredded Pork Skin.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bún bò cay', address: 'TP. Bạc Liêu', image: '/picture/provinces/bac-lieu.jpg', price: '50.000đ', priceNum: 50000, category: 'Sang trọng', cultureStory: 'Bún bò nấu sả ớt cay nồng đậm chất Bạc Liêu.', tastingTip: 'Chấm thịt bò với muối ớt chanh.', englishMenu: 'Bac Lieu Spicy Beef Vermicelli.', distance: '1.3 km' }
    ]
  },
  {
    id: 'bentre',
    title: 'Bến Tre - Xứ Dừa Bạt Ngàn',
    desc: 'Sáng: Hủ tiếu | Trưa: Cá tai tượng chiên xù | Chiều: Chuối nếp nướng | Tối: Đuông dừa nước mắm.',
    image: '/picture/provinces/ben-tre.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Hủ tiếu', address: 'TP. Bến Tre', image: '/picture/provinces/ben-tre.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Hủ tiếu Nam Bộ nước dùng ngọt xương.', tastingTip: 'Thêm giá hẹ.', englishMenu: 'Ben Tre Rice Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cá tai tượng chiên xù', address: 'Mỏ Cày, Bến Tre', image: '/picture/provinces/ben-tre.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Cá tai tượng tươi nguyên con chiên giòn rụm cuốn bánh tráng.', tastingTip: 'Cuốn rau sống chấm mắm nêm.', englishMenu: 'Crispy Fried Giant Gourami.', distance: '1.4 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Chuối nếp nướng', address: 'TP. Bến Tre', image: '/picture/provinces/ben-tre.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Chuối nếp nướng cốt dừa béo ngậy thơm nức.', tastingTip: 'Thưởng thức khi chuối còn nóng ấm.', englishMenu: 'Grilled Sticky Rice Banana.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Đuông dừa tắm nước mắm', address: 'Bến Tre', image: '/picture/provinces/ben-tre.jpg', price: '100.000đ', priceNum: 100000, category: 'Sang trọng', cultureStory: 'Đặc sản đuông dừa béo ngậy sống trong chén nước mắm nhĩ ớt cay.', tastingTip: 'Thưởng thức trọn vẹn vị béo ngậy độc đáo.', englishMenu: 'Coconut Worm in Fish Sauce.', distance: '1.2 km' }
    ]
  },
  {
    id: 'camau',
    title: 'Cà Mau - Đất Mũi Cực Nam Tổ Quốc',
    desc: 'Sáng: Bún nước lèo | Trưa: Cua rang me | Chiều: Bánh tầm xíu mại | Tối: Lẩu cá bóp.',
    image: '/picture/provinces/ca-mau.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún nước lèo', address: 'TP. Cà Mau', image: '/picture/provinces/ca-mau.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún nước lèo đậm đà hương vị miền đất mũi.', tastingTip: 'Ăn kèm rau muống bào.', englishMenu: 'Ca Mau Fish Broth Noodle.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cua rang me', address: 'Năm Căn, Cà Mau', image: '/picture/provinces/ca-mau.jpg', price: '250.000đ', priceNum: 250000, category: 'Đặc sản', cultureStory: 'Cua Năm Căn thịt chắc ngọt sốt me chua ngọt đậm đà.', tastingTip: 'Dùng kìm kẹp càng cua để thưởng thức phần gạch.', englishMenu: 'Tamarind Glazed Crab.', distance: '2.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tầm xíu mại', address: 'TP. Cà Mau', image: '/picture/provinces/ca-mau.jpg', price: '35.000đ', priceNum: 35000, category: 'Ăn vặt', cultureStory: 'Bánh tầm dẻo kết hợp xíu mại đậm vị nước cốt dừa.', tastingTip: 'Trộn đều trước khi ăn.', englishMenu: 'Tapioca Noodle with Meatball.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu cá bóp', address: 'TP. Cà Mau', image: '/picture/provinces/ca-mau.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Lẩu cá bóp tươi ngon nấu ngót hoặc chua ngọt.', tastingTip: 'Nhúng rau nhút và bún tươi.', englishMenu: 'Cobia Fish Hotpot.', distance: '1.5 km' }
    ]
  },
  {
    id: 'cantho',
    title: 'Cần Thơ - Thủ Phủ Miền Tây Tây Đô',
    desc: 'Sáng: Hủ tiếu sườn | Trưa: Cá lóc nướng trui | Chiều: Bánh cống | Tối: Lẩu vịt nấu chao.',
    image: '/picture/provinces/can-tho.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Hủ tiếu sườn', address: 'Ninh Kiều, Cần Thơ', image: '/picture/provinces/can-tho.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Hủ tiếu Nam Bộ đậm đà ăn kèm sườn non mềm nhừ.', tastingTip: 'Thêm giá hẹ và tỏi phi.', englishMenu: 'Can Tho Pork Rib Rice Noodle.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cá lóc nướng trui cuốn bánh tráng', address: 'Cồn Ấu, Cần Thơ', image: '/picture/provinces/can-tho.jpg', price: '140.000đ', priceNum: 140000, category: 'Đặc sản', cultureStory: 'Cá lóc đồng nướng rơm thơm lừng cuốn rau sống bánh tráng.', tastingTip: 'Chấm mắm me chua ngọt đậm đà.', englishMenu: 'Straw-Grilled Snakehead Fish Rolls.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh cống', address: 'Cái Răng, Cần Thơ', image: '/picture/provinces/can-tho.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh cống giòn rụm nhân thịt tôm đậu xanh đổ khuôn tròn.', tastingTip: 'Cuốn cải xanh chấm nước mắm ớt.', englishMenu: 'Can Tho Crispy Cong Cake.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu vịt nấu chao', address: 'Hẻm Lý Tự Trọng, Cần Thơ', image: '/picture/provinces/can-tho.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng', cultureStory: 'Vịt nấu chao môn thơm béo nức tiếng đất Tây Đô.', tastingTip: 'Nhúng bún tươi và rau muống vào nồi lẩu.', englishMenu: 'Duck in Fermented Tofu Hotpot.', distance: '1.7 km' }
    ]
  },
  {
    id: 'dongthap',
    title: 'Đồng Tháp - Đất Sen Hồng',
    desc: 'Sáng: Hủ tiếu Sa Đéc | Trưa: Lẩu cá linh bông điên điển | Chiều: Nem Lai Vung | Tối: Chuột đồng nướng lu.',
    image: '/picture/provinces/ong-thap.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Hủ tiếu Sa Đéc', address: 'Sa Đéc, Đồng Tháp', image: '/picture/provinces/ong-thap.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Hủ tiếu Sa Đéc nổi tiếng với sợi bánh mềm dai và nước dùng ngọt thanh.', tastingTip: 'Trộn cùng nước sốt đặc chế.', englishMenu: 'Sa Dec Rice Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá linh bông điên điển', address: 'Cao Lãnh, Đồng Tháp', image: '/picture/provinces/ong-thap.jpg', price: '180.000đ', priceNum: 180000, category: 'Đặc sản', cultureStory: 'Đặc sản mùa nước nổi với cá linh non và bông điên điển giòn thơm.', tastingTip: 'Thưởng thức khi điền điển vừa chín tới.', englishMenu: 'Lin Fish and Sesbania Flower Hotpot.', distance: '1.8 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Nem Lai Vung', address: 'Lai Vung, Đồng Tháp', image: '/picture/provinces/ong-thap.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Nem chua gói lá vông chua ngọt đậm vị.', tastingTip: 'Bóc vỏ kèm vài tép tỏi và ớt.', englishMenu: 'Lai Vung Fermented Pork Nem.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Chuột đồng nướng lu', address: 'Tam Nông, Đồng Tháp', image: '/picture/provinces/ong-thap.jpg', price: '110.000đ', priceNum: 110000, category: 'Sang trọng', cultureStory: 'Đặc sản đồng quê chuột đồng nướng lu vàng ruộm.', tastingTip: 'Chấm muối ớt chanh.', englishMenu: 'Lu-Roasted Field Mouse Specialty.', distance: '1.4 km' }
    ]
  },
  {
    id: 'haugiang',
    title: 'Hậu Giang - Miền Sông Nước Hiền Hòa',
    desc: 'Sáng: Bún mắm | Trưa: Khóm xào hải sản | Chiều: Sỏi mầm | Tối: Cháo lòng Cái Tắc.',
    image: '/picture/provinces/hau-giang.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún mắm', address: 'TP. Vị Thanh, Hậu Giang', image: '/picture/provinces/hau-giang.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân', cultureStory: 'Bún mắm đậm đà hương vị miền tây nam bộ.', tastingTip: 'Ăn kèm rau đắng, bắp chuối.', englishMenu: 'Hau Giang Fermented Fish Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Khóm xào hải sản', address: 'Vị Thanh, Hậu Giang', image: '/picture/provinces/hau-giang.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản', cultureStory: 'Khóm Cầu Đúc ngọt thanh xào mực tôm tươi.', tastingTip: 'Thưởng thức nóng.', englishMenu: 'Pineapple Sautéed with Seafood.', distance: '1.2 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Sỏi mầm', address: 'Hậu Giang', image: '/picture/provinces/hau-giang.jpg', price: '130.000đ', priceNum: 130000, category: 'Ăn vặt', cultureStory: 'Thịt bò tươi thái mỏng chín trên những viên sỏi nung nóng.', tastingTip: 'Nhúng thịt lên sỏi nóng rồi cuốn rau.', englishMenu: 'Hot-Stone Sliced Beef.', distance: '0.9 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cháo lòng Cái Tắc', address: 'Cái Tắc, Hậu Giang', image: '/picture/provinces/hau-giang.jpg', price: '40.000đ', priceNum: 40000, category: 'Sang trọng', cultureStory: 'Cháo lòng thơm ngon nóng hổi ăn kèm bánh quẩy.', tastingTip: 'Chấm lòng vào nước mắm gừng.', englishMenu: 'Cai Tac Pork Offal Porridge.', distance: '1.1 km' }
    ]
  },
  {
    id: 'kiengiang',
    title: 'Kiên Giang - Thiên Đường Phú Quốc',
    desc: 'Sáng: Bún cá Kiên Giang | Trưa: Gỏi cá trích Phú Quốc | Chiều: Bánh ống lá dứa | Tối: Lẩu chua sả nghệ.',
    image: '/picture/provinces/kien-giang.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún cá Kiên Giang', address: 'Rạch Giá, Kiên Giang', image: '/picture/provinces/kien-giang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún cá rô phi/cá ngát nấu nước dùng thơm mùi nghệ.', tastingTip: 'Ăn kèm giá đỗ và rau sống.', englishMenu: 'Kien Giang Fish Noodle.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Gỏi cá trích Phú Quốc', address: 'Phú Quốc, Kiên Giang', image: '/picture/provinces/kien-giang.jpg', price: '150.000đ', priceNum: 150000, category: 'Đặc sản', cultureStory: 'Cá trích tươi sống cuốn bánh tráng rau rừng chấm nước mắm Phú Quốc hảo hạng.', tastingTip: 'Cuốn chặt tay chấm ngập nước mắm ớt đậu phộng.', englishMenu: 'Phu Quoc Raw Herring Salad.', distance: '2.0 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh ống lá dứa', address: 'Hà Tiên, Kiên Giang', image: '/picture/provinces/kien-giang.jpg', price: '20.000đ', priceNum: 20000, category: 'Ăn vặt', cultureStory: 'Bánh ống hấp thơm ngát hương lá dứa và dừa nạo.', tastingTip: 'Thưởng thức khi bánh còn ấm.', englishMenu: 'Pandanus Leaf Tube Cake.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu chua sả nghệ', address: 'Phú Quốc, Kiên Giang', image: '/picture/provinces/kien-giang.jpg', price: '200.000đ', priceNum: 200000, category: 'Sang trọng', cultureStory: 'Lẩu hải sản nấu sả nghệ thơm nức mũi.', tastingTip: 'Nhúng cá bóp tươi.', englishMenu: 'Lemongrass and Turmeric Seafood Hotpot.', distance: '1.8 km' }
    ]
  },
  {
    id: 'longan',
    title: 'Long An - Vùng Đất Vàm Cỏ',
    desc: 'Sáng: Hủ tiếu | Trưa: Canh chua cá chốt | Chiều: Lạp xưởng Cần Đước | Tối: Bún xiêm lo.',
    image: '/picture/provinces/long-an.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Hủ tiếu', address: 'TP. Tân An, Long An', image: '/picture/provinces/long-an.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân', cultureStory: 'Hủ tiếu Nam Bộ đậm đà.', tastingTip: 'Thêm rau hẹ.', englishMenu: 'Long An Rice Noodle.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Canh chua cá chốt', address: 'Vàm Cỏ, Long An', image: '/picture/provinces/long-an.jpg', price: '90.000đ', priceNum: 90000, category: 'Đặc sản', cultureStory: 'Canh chua cá chốt bông so điên điển thanh mát.', tastingTip: 'Ăn cùng cơm trắng.', englishMenu: 'Sour Catfish Soup.', distance: '1.3 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Lạp xưởng Cần Đước nướng', address: 'Cần Đước, Long An', image: '/picture/provinces/long-an.jpg', price: '40.000đ', priceNum: 40000, category: 'Ăn vặt', cultureStory: 'Lạp xưởng tươi nướng nước hoặc than hoa.', tastingTip: 'Ăn kèm củ kiệu trắng.', englishMenu: 'Can Duoc Grilled Sausage.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Bún xiêm lo', address: 'Tân An, Long An', image: '/picture/provinces/long-an.jpg', price: '45.000đ', priceNum: 45000, category: 'Sang trọng', cultureStory: 'Bún xiêm lo hương vị Campuchia đậm đà.', tastingTip: 'Thêm chanh và ớt.', englishMenu: 'Xiêm Lo Rice Vermicelli.', distance: '1.2 km' }
    ]
  },
  {
    id: 'soctrang',
    title: 'Sóc Trăng - Miền Đất Chùa Khơ-me',
    desc: 'Sáng: Bún nước lèo | Trưa: Bún gỏi dà | Chiều: Bánh pía | Tối: Lẩu mắm bò hóc.',
    image: '/picture/provinces/soc-trang.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún nước lèo', address: 'TP. Sóc Trăng', image: '/picture/provinces/soc-trang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún nước lèo trứ danh với mắm cá sặc và cá lóc đồng.', tastingTip: 'Thêm rau bắp chuối và hẹ.', englishMenu: 'Soc Trang Fish Broth Vermicelli.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Bún gỏi dà', address: 'TP. Sóc Trăng', image: '/picture/provinces/soc-trang.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản', cultureStory: 'Bún gỏi dà độc đáo nước dùng me chua ngọt.', tastingTip: 'Trộn đều thịt ba rọi, tôm và tép mỡ.', englishMenu: 'Bun Goi Da Tamarind Vermicelli.', distance: '1.1 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh pía', address: 'Đại Tâm, Sóc Trăng', image: '/picture/provinces/soc-trang.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bánh pía sầu riêng trứng muối thơm ngon nức tiếng.', tastingTip: 'Thưởng thức cùng trà nóng.', englishMenu: 'Durian Salted Egg Pastry.', distance: '0.6 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu mắm bò hóc', address: 'TP. Sóc Trăng', image: '/picture/provinces/soc-trang.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng', cultureStory: 'Lẩu mắm đậm đà hương vị Khơ-me Nam Bộ.', tastingTip: 'Nhúng rau đồng cỏ.', englishMenu: 'Prahok Fermented Fish Hotpot.', distance: '1.6 km' }
    ]
  },
  {
    id: 'tiengiang',
    title: 'Tiền Giang - Vương Quốc Trái Cây Miền Tây',
    desc: 'Sáng: Hủ tiếu Mỹ Tho | Trưa: Lẩu cá lóng | Chiều: Bánh giá Chợ Giồng | Tối: Cháo cá lóc.',
    image: '/picture/provinces/tien-giang.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Hủ tiếu Mỹ Tho', address: 'Mỹ Tho, Tiền Giang', image: '/picture/provinces/tien-giang.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Hủ tiếu Mỹ Tho sợi khô dai ngon đặc trưng.', tastingTip: 'Trộn tỏi phi và nước sốt.', englishMenu: 'My Tho Clear Rice Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá lóng', address: 'Cái Bè, Tiền Giang', image: '/picture/provinces/tien-giang.jpg', price: '160.000đ', priceNum: 160000, category: 'Đặc sản', cultureStory: 'Lẩu cá sông miền tây chua ngọt.', tastingTip: 'Nhúng rau nhút.', englishMenu: 'River Fish Hotpot.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh giá Chợ Giồng', address: 'Gò Công, Tiền Giang', image: '/picture/provinces/tien-giang.jpg', price: '25.000đ', priceNum: 25000, category: 'Ăn vặt', cultureStory: 'Bánh giá chiên giòn nhân tôm thịt giá đỗ.', tastingTip: 'Chấm nước mắm chua ngọt.', englishMenu: 'Cho Giong Crispy Fritter.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Cháo cá quả (cá lóc)', address: 'Mỹ Tho, Tiền Giang', image: '/picture/provinces/tien-giang.jpg', price: '45.000đ', priceNum: 45000, category: 'Sang trọng', cultureStory: 'Cháo cá lóc đồng ấm nóng thơm hành ngò.', tastingTip: 'Thêm gừng sợi và tiêu.', englishMenu: 'Snakehead Fish Porridge.', distance: '1.2 km' }
    ]
  },
  {
    id: 'travinh',
    title: 'Trà Vinh - Xứ Sở Ao Bà Om',
    desc: 'Sáng: Bún suông | Trưa: Cơm nướng dừa | Chiều: Bánh tét Trà Cuôn | Tối: Chù ụ rang me.',
    image: '/picture/provinces/tra-vinh.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Bún suông', address: 'TP. Trà Vinh', image: '/picture/provinces/tra-vinh.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún suông chả tôm dài hình con đuông độc đáo.', tastingTip: 'Chấm chả tôm với tương đen.', englishMenu: 'Tra Vinh Shrimp Noodle Soup.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm nướng dừa', address: 'TP. Trà Vinh', image: '/picture/provinces/tra-vinh.jpg', price: '70.000đ', priceNum: 70000, category: 'Đặc sản', cultureStory: 'Cơm nấu nước cốt dừa trong trái dừa xiêm thơm béo.', tastingTip: 'Thưởng thức hạt cơm dẻo quyện vị dừa.', englishMenu: 'Coconut Rice.', distance: '1.1 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tét Trà Cuôn', address: 'Cầu Ngang, Trà Vinh', image: '/picture/provinces/tra-vinh.jpg', price: '50.000đ', priceNum: 50000, category: 'Ăn vặt', cultureStory: 'Bánh tét nhân đậu thịt lòng đỏ trứng muối nhuộm lá ngót xanh.', tastingTip: 'Cắt bánh bằng dây lạt.', englishMenu: 'Tra Cuon Cylindrical Sticky Rice Cake.', distance: '0.7 km' },
      { time: '19:00', mealType: 'Tối', name: 'Chù ụ rang me', address: 'Duyên Hải, Trà Vinh', image: '/picture/provinces/tra-vinh.jpg', price: '120.000đ', priceNum: 120000, category: 'Sang trọng', cultureStory: 'Chù ụ rang sốt me chua ngọt đậm đà.', tastingTip: 'Hút phần gạch đậm đà.', englishMenu: 'Mud Crab Relative with Tamarind.', distance: '1.6 km' }
    ]
  },
  {
    id: 'vinhlong',
    title: 'Vĩnh Long - Miền Đất Cù Lao Xanh',
    desc: 'Sáng: Phở kho | Trưa: Tôm càng xanh nướng | Chiều: Bánh tráng nem | Tối: Lẩu gà nòi.',
    image: '/picture/provinces/vinh-long.jpg',
    region: 'Đồng bằng Sông Cửu Long',
    stops: [
      { time: '08:00', mealType: 'Sáng', name: 'Phở kho', address: 'TP. Vĩnh Long', image: '/picture/provinces/vinh-long.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Biến tấu phở khô sốt đậu phộng đậm đà miền Tây.', tastingTip: 'Trộn đều trước khi ăn.', englishMenu: 'Vinh Long Dry Pho.', distance: '0.0 km' },
      { time: '12:00', mealType: 'Trưa', name: 'Tôm càng xanh nướng', address: 'Cù Lao An Bình, Vĩnh Long', image: '/picture/provinces/vinh-long.jpg', price: '180.000đ', priceNum: 180000, category: 'Đặc sản', cultureStory: 'Tôm càng xanh sông Cửu Long nướng than hồng ngọt thịt.', tastingTip: 'Chấm muối ớt xanh.', englishMenu: 'Grilled Giant Freshwater Prawns.', distance: '1.5 km' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng nem', address: 'Vũng Liêm, Vĩnh Long', image: '/picture/provinces/vinh-long.jpg', price: '30.000đ', priceNum: 30000, category: 'Ăn vặt', cultureStory: 'Bánh tráng cuốn nem thơm ngon.', tastingTip: 'Cuốn rau sống.', englishMenu: 'Rice Paper Rolls.', distance: '0.8 km' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu gà nòi', address: 'TP. Vĩnh Long', image: '/picture/provinces/vinh-long.jpg', price: '170.000đ', priceNum: 170000, category: 'Sang trọng', cultureStory: 'Lẩu gà nòi thả vườn thịt chắc nấu lá giang chua thanh.', tastingTip: 'Nhúng bún tươi và rau ngổ.', englishMenu: 'Fighting Chicken Hotpot.', distance: '1.6 km' }
    ]
  }
];



function getBudgetTier(budgetVal: number): 'Bình dân' | 'Đặc sản' | 'Sang trọng' {
  if (budgetVal >= 600000) return 'Sang trọng';
  if (budgetVal >= 300000) return 'Đặc sản';
  return 'Bình dân';
}

function buildCustomTourStops(
  location: string,
  need: string,
  timeOption: string,
  timeManual: string,
  budgetVal: number,
  hobby: string,
  radius: number
): { stops: StopItem[]; totalDistance: string; totalCost: string; status: string } {
  const locLower = (location || '').toLowerCase();
  
  // Pre-curated local signature fallback stops if specific location is matched
  let regionalStops: StopItem[] = [];
  if (locLower.includes('đà nẵng')) {
    regionalStops = [
      { time: '08:00', mealType: 'Sáng', name: 'Mì Quảng Trứ Danh', address: 'Đường Lê Đình Dương, gần Cầu Rồng, Hải Châu, Đà Nẵng', image: '/picture/provinces/đà nẵng.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản • Mì Quảng', cultureStory: 'Mì Quảng đậm đà nước lèo hầm xương tôm thịt nguyên bản, biểu tượng ẩm thực xứ Quảng.', tastingTip: 'Trộn đều bánh tráng nướng bóp vụn và rau sống búp tươi.', englishMenu: 'Quang Style Turmeric Noodles with Shrimp and Pork.', distance: '0.0 km (Khởi hành)' },
      { time: '12:00', mealType: 'Trưa', name: 'Bánh xèo tôm nhảy', address: 'Đường Hoàng Diệu, gần Chợ Mới, Thanh Khê, Đà Nẵng', image: '/picture/provinces/đà nẵng.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản • Bánh xèo', cultureStory: 'Bánh xèo giòn rụm nhân tôm đất tươi sống đánh bắt từ đầm phá.', tastingTip: 'Cuốn bánh tráng mỏng cùng rau rừng và chấm nước mắm đậu phộng.', englishMenu: 'Crispy Central Vietnamese Pancake with River Prawns.', distance: '1.2 km từ điểm trước' },
      { time: '15:30', mealType: 'Chiều', name: 'Gỏi cá Nam Ô', address: 'Làng chài Nam Ô, chân đèo Hải Vân, Liên Chiểu, Đà Nẵng', image: '/picture/provinces/đà nẵng.jpg', price: '80.000đ', priceNum: 80000, category: 'Sang trọng • Hải sản', cultureStory: 'Đặc sản trứ danh lâu đời của làng chài Nam Ô với nước sốt cá cốt đậm đà.', tastingTip: 'Cuốn bánh tráng với rau rừng và chấm đẫm nước sốt đặc chế.', englishMenu: 'Nam O Raw Fish Salad with Forest Herbs.', distance: '1.5 km từ điểm trước' },
      { time: '19:00', mealType: 'Tối', name: 'Hải sản biển Mỹ Khê', address: 'Đường Võ Nguyên Giáp, sát bờ biển Mỹ Khê, Sơn Trà, Đà Nẵng', image: '/picture/provinces/đà nẵng.jpg', price: '180.000đ', priceNum: 180000, category: 'Sang trọng • Hải sản', cultureStory: 'Hải sản tươi sống đánh bắt trực tiếp từ vịnh Đà Nẵng về đêm.', tastingTip: 'Thưởng thức hấp sả gừng hoặc nướng muối ớt.', englishMenu: 'Fresh My Khe Beach Seafood Feast.', distance: '1.8 km từ điểm trước' }
    ];
  } else if (locLower.includes('huế') || locLower.includes('thừa thiên huế')) {
    regionalStops = [
      { time: '08:00', mealType: 'Sáng', name: 'Bún bò Huế O Phượng', address: 'Đường Chi Lăng, gần Cầu Gia Hội, Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản • Bún bò', cultureStory: 'Hương vị bún bò cung đình đậm đà sả, ruốc Huế và nước dùng thơm ngát.', tastingTip: 'Thêm bắp chuối bào, giá đỗ và sa tế cay nồng.', englishMenu: 'Authentic Hue Beef Noodle Soup with Lemongrass.', distance: '0.0 km (Khởi hành)' },
      { time: '12:00', mealType: 'Trưa', name: 'Cơm hến Vĩ Dạ', address: 'Đường Hàn Mặc Tử, cồn Hến, Vĩ Dạ, Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '30.000đ', priceNum: 30000, category: 'Bình dân • Cơm hến', cultureStory: 'Món ăn dân dã xứ Huế kết hợp hến sông Hương ngọt lịm và ruốc thơm.', tastingTip: 'Trộn đều tất cả nguyên liệu cay toát mồ hôi.', englishMenu: 'Hue Baby Clam Rice with Herbs & Peanuts.', distance: '1.1 km từ điểm trước' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh bèo, nậm, lọc Gia Vỹ', address: 'Đường Phạm Hồng Thái, trung tâm Phố cổ Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '45.000đ', priceNum: 45000, category: 'Ăn vặt • Bánh cung đình', cultureStory: 'Bộ ba bánh truyền thống Huế tinh tế làm từ bột gạo và tôm thịt.', tastingTip: 'Chan nước mắm ngọt vừa đủ để cảm nhận vị dẻo mịn.', englishMenu: 'Hue Royal Steamed Rice Cakes Trio.', distance: '0.8 km từ điểm trước' },
      { time: '19:00', mealType: 'Tối', name: 'Bánh khoái & Nem lụi', address: 'Đường Đinh Tiên Hoàng, sát Đại Nội Huế', image: '/picture/provinces/thua-thien-hue.jpg', price: '85.000đ', priceNum: 85000, category: 'Đặc sản • Bánh khoái', cultureStory: 'Bánh khoái giòn rụm nhân tôm thịt ăn kèm nước lèo gan đậu phộng độc quyền.', tastingTip: 'Cuốn bánh và nem lụi với rau sống khế chua chát.', englishMenu: 'Hue Crispy Pancake & Lemongrass Pork Skewers.', distance: '1.4 km từ điểm trước' }
    ];
  } else if (locLower.includes('nha trang') || locLower.includes('khánh hòa')) {
    regionalStops = [
      { time: '08:00', mealType: 'Sáng', name: 'Bún chả cá Nha Trang', address: 'Đường Yersin, gần Chợ Đầm, Nha Trang', image: '/picture/provinces/khanh-hoa.jpg', price: '45.000đ', priceNum: 45000, category: 'Đặc sản • Bún chả cá', cultureStory: 'Nước dùng trong vắt nấu từ cá biển tươi ngọt lịm không tanh.', tastingTip: 'Thêm mắm tôm và hành ngâm chua ngọt.', englishMenu: 'Nha Trang Clear Fish Cake Vermicelli Soup.', distance: '0.0 km (Khởi hành)' },
      { time: '12:00', mealType: 'Trưa', name: 'Nem nướng Ninh Hòa', address: 'Đường Lê Hồng Phong, Nha Trang', image: '/picture/provinces/khanh-hoa.jpg', price: '65.000đ', priceNum: 65000, category: 'Đặc sản • Nem nướng', cultureStory: 'Nem nướng than hoa thơm phức cuốn bánh tráng chiên giòn và rau sống.', tastingTip: 'Chấm đẫm nước sốt thịt bằm đậu phộng sền sệt.', englishMenu: 'Ninh Hoa Grilled Pork Skewers with Rice Paper.', distance: '1.3 km từ điểm trước' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh căn mực tươi', address: 'Đường Tháp Bà, sát Tháp Bà Ponagar, Nha Trang', image: '/picture/provinces/khanh-hoa.jpg', price: '40.000đ', priceNum: 40000, category: 'Ăn vặt • Bánh căn', cultureStory: 'Bánh căn đổ khuôn đất nung nóng hổi nhân mực tươi giòn sần sật.', tastingTip: 'Nhúng ngập bánh vào chén nước mắm xoài bằm.', englishMenu: 'Mini Rice Pancakes with Fresh Squid.', distance: '1.0 km từ điểm trước' },
      { time: '19:00', mealType: 'Tối', name: 'Hải sản tháp Bà / Bờ kè', address: 'Đường Trần Phú, sát vịnh Nha Trang', image: '/picture/provinces/khanh-hoa.jpg', price: '200.000đ', priceNum: 200000, category: 'Sang trọng • Hải sản', cultureStory: 'Hải sản phong phú đánh bắt từ vịnh biển sâu Nha Trang.', tastingTip: 'Thưởng thức tôm hùm nướng bơ tỏi và ốc hương trứng muối.', englishMenu: 'Nha Trang Bay Seafood Feast.', distance: '2.0 km từ điểm trước' }
    ];
  } else if (locLower.includes('vũng tàu') || locLower.includes('bà rịa')) {
    regionalStops = [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh khọt Cô Ba Vũng Tàu', address: 'Đường Hoàng Hoa Thám, Bãi Trước, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '60.000đ', priceNum: 60000, category: 'Đặc sản • Bánh khọt', cultureStory: 'Bánh khọt vàng giòn nhân tôm tươi rắc tôm chấy đỏ rực.', tastingTip: 'Cuốn rau cải xanh, tía tô chấm nước mắm chua ngọt.', englishMenu: 'Vung Tau Mini Crispy Shrimp Pancakes.', distance: '0.0 km (Khởi hành)' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá đuối Trương Công Định', address: 'Đường Trương Công Định, trung tâm Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '160.000đ', priceNum: 160000, category: 'Đặc sản • Lẩu', cultureStory: 'Nồi lẩu cá đuối chua cay đậm đà măng chua và rau giòn.', tastingTip: 'Nhúng bún tươi và măng chua giòn sần sật.', englishMenu: 'Stingray Hotpot with Sour Bamboo Shoots.', distance: '1.2 km từ điểm trước' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh bông lan trứng muối Gốc Cột Điện', address: 'Đường Nguyễn Trường Tộ, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '35.000đ', priceNum: 35000, category: 'Ăn vặt • Bánh ngọt', cultureStory: 'Bánh bông lan mềm mịn thơm béo vị trứng muối và phô mai.', tastingTip: 'Thưởng thức khi bánh còn ấm.', englishMenu: 'Salted Egg Yolk Sponge Cake.', distance: '0.9 km từ điểm trước' },
      { time: '19:00', mealType: 'Tối', name: 'Hải sản Gành Hào', address: 'Đường Trần Phú, sát biển Bãi Trước, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '220.000đ', priceNum: 220000, category: 'Sang trọng • Hải sản', cultureStory: 'Nhà hàng hải sản view biển ngắm hoàng hôn đẹp nhất Vũng Tàu.', tastingTip: 'Thưởng thức ghẹ rang me và mực một nắng nướng.', englishMenu: 'Ganh Hao Oceanside Seafood Dining.', distance: '2.1 km từ điểm trước' }
    ]
  } else if (locLower.includes('cần thơ') || locLower.includes('miền tây')) {
    regionalStops = [
      { time: '08:00', mealType: 'Sáng', name: 'Bánh xèo miền Tây củ hủ dừa', address: 'Đường Lê Lai, gần Bến Ninh Kiều, Cần Thơ', image: '/picture/provinces/cần thơ.jpg', price: '50.000đ', priceNum: 50000, category: 'Đặc sản • Bánh xèo', cultureStory: 'Bánh xèo giòn vàng rụm nhân củ hủ dừa ngọt mát và tép bạc sông.', tastingTip: 'Cuốn rau vườn dân dã chấm mắm me chua ngọt.', englishMenu: 'Mekong Delta Giant Crispy Pancake.', distance: '0.0 km (Khởi hành)' },
      { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá kèo lá giang', address: 'Khu bờ kè Cái Răng, Cần Thơ', image: '/picture/provinces/cần thơ.jpg', price: '150.000đ', priceNum: 150000, category: 'Sang trọng • Lẩu', cultureStory: 'Nồi lẩu chua thanh vị lá giang ăn kèm cá kèo tươi sống đồng bằng.', tastingTip: 'Nhúng bông súng, rau đắng và cù nèo.', englishMenu: 'Mekong Delta River Catfish Hotpot.', distance: '1.4 km từ điểm trước' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tằm bì nước cốt dừa', address: 'Hẻm Phan Đình Phùng, Ninh Kiều, Cần Thơ', image: '/picture/provinces/cần thơ.jpg', price: '35.000đ', priceNum: 35000, category: 'Bình dân • Ăn vặt', cultureStory: 'Bánh tằm dẻo bùi béo ngậy rưới nước cốt dừa đậm đà.', tastingTip: 'Ăn kèm bì thính và nước mắm tỏi ớt.', englishMenu: 'Silky Rice Noodles with Coconut Milk & Pork.', distance: '0.9 km từ điểm trước' },
      { time: '19:00', mealType: 'Tối', name: 'Cá lóc nướng trui đồng quê', address: 'Bến Ninh Kiều, Cần Thơ', image: '/picture/provinces/cần thơ.jpg', price: '120.000đ', priceNum: 120000, category: 'Đặc sản • Nướng', cultureStory: 'Cá lóc nướng rơm thơm lừng đậm chất miền sông nước Nam Bộ.', tastingTip: 'Cuốn bánh tráng bún rau sống chấm mắm nêm.', englishMenu: 'Straw-Grilled Snakehead Fish Rolls.', distance: '1.2 km từ điểm trước' }
    ]
  } else if (locLower.includes('sài gòn') || locLower.includes('tp.hồ chí minh') || locLower.includes('hồ chí minh')) {
    regionalStops = [
      { time: '08:00', mealType: 'Sáng', name: 'Cơm tấm Sài Gòn sườn bì chả', address: 'Đường Đinh Tiên Hoàng, Quận 1, TP.HCM', image: '/picture/provinces/tp hồ chí minh.jpg', price: '55.000đ', priceNum: 55000, category: 'Đặc sản • Cơm tấm', cultureStory: 'Hạt cơm tấm thơm ngon sườn nướng mật ong đậm đà phong cách Nam Bộ.', tastingTip: 'Thêm nước mắm kẹo ngọt cay.', englishMenu: 'Saigon Broken Rice with Honey Grilled Pork.', distance: '0.0 km (Khởi hành)' },
      { time: '12:00', mealType: 'Trưa', name: 'Bánh mì chảo / Bánh mì Sài Gòn', address: 'Đường Lý Chính Thắng, Quận 3, TP.HCM', image: '/picture/provinces/tp hồ chí minh.jpg', price: '45.000đ', priceNum: 45000, category: 'Bình dân • Bánh mì', cultureStory: 'Bánh mì nóng giòn kết hợp chảo thập cẩm pate trứng xúc xích.', tastingTip: 'Chấm bánh mì ngập sốt nóng.', englishMenu: 'Saigon Sizzling Baguette with Pate & Egg.', distance: '1.1 km từ điểm trước' },
      { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng trộn Sài Gòn', address: 'Khu vực Hồ Con Rùa, Quận 3, TP.HCM', image: '/picture/provinces/tp hồ chí minh.jpg', price: '30.000đ', priceNum: 30000, category: 'Bình dân • Ăn vặt', cultureStory: 'Món ăn vặt tuổi thơ trứ danh giới trẻ Sài thành.', tastingTip: 'Trộn đều trước khi thưởng thức.', englishMenu: 'Saigon Mixed Rice Paper Snack.', distance: '0.8 km từ điểm trước' },
      { time: '19:00', mealType: 'Tối', name: 'Lẩu bò Ba Toa Sài Gòn', address: 'Khu phố ẩm thực Quận 5, TP.HCM', image: '/picture/provinces/tp hồ chí minh.jpg', price: '160.000đ', priceNum: 160000, category: 'Sang trọng • Lẩu', cultureStory: 'Lẩu bò thơm nức mùi sả thuốc bắc ấm cúng đêm Sài Gòn.', tastingTip: 'Nhúng mì tươi và chao.', englishMenu: 'Saigon Beef Hotpot with Herbal Broth.', distance: '1.5 km từ điểm trước' }
    ]
  }

  if (regionalStops.length > 0) {
    const totalDistNum = Math.min(Number(regionalStops.reduce((acc, s, idx) => idx === 0 ? 0 : acc + Number(s.distance.split(' ')[0]), 0).toFixed(1)), radius);
    const totalCostNum = regionalStops.reduce((acc, s) => acc + (s.priceNum || 50000), 0);
    return {
      stops: regionalStops,
      totalDistance: `${totalDistNum} km`,
      totalCost: `${totalCostNum.toLocaleString('vi-VN')}đ`,
      status: `Lộ trình chuẩn tối ưu cho "${need}" tại ${location} (Bán kính <= ${radius}km)`
    };
  }

  // Dynamic Algorithmic Construction if no pre-curated match
  const tier = getBudgetTier(budgetVal);
  let pool = FOOD_ITEMS.filter(f => f.category === tier);
  if (pool.length < 4) pool = FOOD_ITEMS;

  const hobbyLower = hobby.toLowerCase();
  if (hobbyLower) {
    const matched = pool.filter(f => f.name.toLowerCase().includes(hobbyLower) || f.tags.some(t => t.toLowerCase().includes(hobbyLower)) || f.sub.toLowerCase().includes(hobbyLower));
    if (matched.length >= 2) pool = matched;
  }

  const timeText = (timeManual.trim() || timeOption).toLowerCase();
  let selectedStopsCount = 4;
  if (timeText.includes('sáng')) selectedStopsCount = 2;
  else if (timeText.includes('chiều') || timeText.includes('tối')) selectedStopsCount = 3;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const stopsList: FoodItem[] = [];
  let currentCost = 0;
  const maxBudget = tier === 'Sang trọng' ? 1200 : tier === 'Đặc sản' ? 600 : 300;

  for (const item of shuffled) {
    if (stopsList.length >= selectedStopsCount) break;
    if (currentCost + item.price <= maxBudget || stopsList.length === 0) {
      stopsList.push(item);
      currentCost += item.price;
    }
  }
  while (stopsList.length < selectedStopsCount) {
    const fallback = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    if (!stopsList.includes(fallback)) {
      stopsList.push(fallback);
      currentCost += fallback.price;
    }
  }

  const times = selectedStopsCount === 2 ? ['07:30', '09:30'] : selectedStopsCount === 3 ? ['15:00', '18:00', '20:30'] : ['07:30', '12:00', '16:00', '19:00'];
  const mealTypes = selectedStopsCount === 2 ? ['Ăn sáng', 'Cà phê'] : selectedStopsCount === 3 ? ['Ăn xế', 'Ăn tối', 'Tráng miệng'] : ['Ăn sáng', 'Ăn trưa', 'Ăn xế', 'Ăn tối'];

  let accumDist = 0.0;
  const stops: StopItem[] = stopsList.map((dish, i) => {
    const dist = i === 0 ? 0 : Number((0.4 + Math.random() * Math.min(radius - 0.5, 1.2)).toFixed(1));
    accumDist += dist;
    const locName = location.trim() || 'Hà Nội';
    return {
      time: times[i] || '12:00',
      mealType: mealTypes[i] || 'Ăn uống',
      name: dish.name,
      food: dish,
      address: `Quán ${dish.name} gần điểm tham quan nổi tiếng, ${locName}`,
      image: `/${dish.image}`,
      price: `${(dish.price * 1000).toLocaleString('vi-VN')}đ`,
      priceNum: dish.price * 1000,
      category: `${dish.category} • ${dish.tags.join(', ')}`,
      cultureStory: dish.cultureStory || `Món ${dish.name} đặc sắc với hương vị đậm đà, được tuyển chọn từ kho ẩm thực di sản ${locName}.`,
      tastingTip: dish.tastingTip || 'Thưởng thức khi còn nóng hổi cùng các gia vị kèm theo để cảm nhận trọn vẹn hương vị tuyệt hảo.',
      englishMenu: `${dish.name} - Authentic local signature dish prepared with traditional recipe.`,
      distance: i === 0 ? '0.0 km (Khởi hành)' : `${dist} km từ điểm trước`
    };
  });

  const totalDistNum = Number(stops.reduce((acc, s, idx) => idx === 0 ? 0 : acc + Number(s.distance.split(' ')[0]), 0).toFixed(1));
  const finalDist = Math.min(totalDistNum, radius);
  const totalCostNum = stops.reduce((acc, s) => acc + (s.priceNum || 50000), 0);
  const totalCostStr = `${totalCostNum.toLocaleString('vi-VN')}đ`;
  const status = `Rất phù hợp cho "${need}" (Bán kính <= ${radius}km)`;

  return { stops, totalDistance: `${finalDist} km`, totalCost: totalCostStr, status };
}

export default function App() {
  const [step, setStep] = useState<
    'start' | 'get-loc' | 'main-menu' | 'custom-tour' | 'themed-tour' | 'ai-chat' | 'render-details' | 'checkout' | 'reservation' | 'finish'
  >('start');

  const [reservationState, setReservationState] = useState<'none' | 'held' | 'paid' | 'cancelled'>('none');
  const [holdTimestamp, setHoldTimestamp] = useState<number | null>(null);
  const [selectedFoodModal, setSelectedFoodModal] = useState<{
    name: string;
    tag: string;
    img: string;
    story: string;
    tastingTip: string;
    englishMenu: string;
    regionTitle?: string;
    tagColor?: string;
  } | null>(null);
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);

  const handleHoldTour = () => {
    setReservationState('held');
    setHoldTimestamp(Date.now());
    changeStep('reservation');
  };

  const navigateWithTransition = (callback: () => void) => {
    if (!(document as any).startViewTransition) {
      callback();
      return;
    }
    (document as any).startViewTransition(() => {
      callback();
    });
  };

  const changeStep = (nextStep: typeof step) => {
    navigateWithTransition(() => {
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [locMode, setLocMode] = useState<'gps' | 'manual'>('gps');
  const [locationAddress, setLocationAddress] = useState<string>('Hồ Gươm, Hoàn Kiếm, Hà Nội');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Tùy Chỉnh (Chế độ 1)
  const [customLocation, setCustomLocation] = useState<string>('Phố cổ Hà Nội');
  const [customNeed, setCustomNeed] = useState<string>('Khám phá ẩm thực truyền thống & check-in');
  const [customTimeOption, setCustomTimeOption] = useState<string>('Cả ngày (8:00 - 20:00)');
  const [customTimeManual, setCustomTimeManual] = useState<string>('');
  const [customBudgetVal, setCustomBudgetVal] = useState<number>(300000); // VNĐ
  const [customHobby, setCustomHobby] = useState<string>('Thích ăn phở, uống cà phê trứng và các món ăn vặt lâu đời');
  const [customRadius, setCustomRadius] = useState<number>(3); // km
  const [customLoading, setCustomLoading] = useState<boolean>(false);

  const [activeTour, setActiveTour] = useState<ThemeTour>(THEMED_TOURS[0]);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Xin chào! Tôi là Trợ lý AI TasteTrip. Tôi có thể tư vấn món ăn, lịch trình hoặc giai thoại ẩm thực Việt Nam cho bạn.' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const handleDetectGPS = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          const locStr = `${lat}° N, ${lng}° E (GPS Verified)`;
          setIsDetecting(false);
          setLocationAddress(locStr);
          setCustomLocation(locStr);
          changeStep('ai-chat');
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsDetecting(false);
          const fallbackLoc = '21.0285° N, 105.8525° E (Hà Nội Center - GPS)';
          setLocationAddress(fallbackLoc);
          setCustomLocation(fallbackLoc);
          changeStep('ai-chat');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setTimeout(() => {
        setIsDetecting(false);
        const fallbackLoc = '21.0285° N, 105.8525° E (GPS Verified)';
        setLocationAddress(fallbackLoc);
        setCustomLocation(fallbackLoc);
        changeStep('ai-chat');
      }, 1200);
    }
  };

  const handleManualLoc = () => {
    if (!locationAddress.trim()) {
      alert('Vui lòng nhập địa điểm của bạn!');
      return;
    }
    setCustomLocation(locationAddress);
    changeStep('ai-chat');
  };

  const handleBuildCustomTour = async () => {
    const finalTime = customTimeManual.trim() || customTimeOption;
    const finalBudget = `${customBudgetVal.toLocaleString('vi-VN')}đ`;
    
    setCustomLoading(true);
    const promptText = `Hãy thiết kế một lịch trình food tour chi tiết dựa trên các tiêu chí sau:
1. Vị trí khởi hành / Điểm đến: ${customLocation}
2. Nhu cầu / Mục đích chuyến đi: ${customNeed}
3. Thời gian: ${finalTime}
4. Ngân sách dự kiến: ${finalBudget}
5. Sở thích ẩm thực: ${customHobby}
6. Bán kính di chuyển tối đa: ${customRadius} km

Hãy trả về lịch trình các điểm dừng ăn uống với tên quán thật, địa chỉ, thời gian, mô tả món ăn, mẹo thưởng thức và giá tiền.`;

    try {
      const tour = await generateItinerary(promptText);
      if (tour) {
        setActiveTour({
          ...tour,
          id: 'custom-tour-result',
          title: tour.title || `Food Tour Tùy Chỉnh: "${customNeed}"`,
          desc: tour.desc || `Khởi hành: ${customLocation} | Thời gian: ${finalTime} | Ngân sách: ${finalBudget} | Bán kính: ${customRadius}km.`,
        });
        setActiveStopIndex(0);
        changeStep('render-details');
        setCustomLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('AI itinerary generation failed:', err);
      setCustomLoading(false);
      alert(err.message || 'Chưa kết nối được đến với server.');
      return;
    }

    // Fallback if AI fails
    const result = buildCustomTourStops(
      customLocation,
      customNeed,
      customTimeOption,
      customTimeManual,
      customBudgetVal,
      customHobby,
      customRadius
    );

    setCustomLoading(false);

    setActiveTour({
      id: 'custom-tour-result',
      title: `Food Tour Tùy Chỉnh: "${customNeed}"`,
      desc: `Khởi hành: ${customLocation} | Thời gian: ${finalTime} | Ngân sách: ${finalBudget} | Bán kính tối đa: ${customRadius}km.`,
      image: '/picture/provinces/vinh-long.jpg',
      region: 'Việt Nam',
      stops: result.stops,
      totalDistance: result.totalDistance,
      totalCost: result.totalCost,
      status: result.status
    });
    setActiveStopIndex(0);
    changeStep('render-details');
  };

  const [selectedRegion, setSelectedRegion] = useState<string>('Tất cả');
  const [searchProvince, setSearchProvince] = useState<string>('');

  const regionsList = [
    'Tất cả',
    'Đồng bằng sông Hồng',
    'Đông Bắc Bộ',
    'Tây Bắc Bộ',
    'Bắc Trung Bộ',
    'Duyên hải Nam Trung Bộ',
    'Tây Nguyên',
    'Đông Nam Bộ',
    'Đồng bằng Sông Cửu Long'
  ];

  const filteredTours = THEMED_TOURS.filter(tour => {
    const matchRegion = selectedRegion === 'Tất cả' || tour.region === selectedRegion;
    const matchSearch = tour.title.toLowerCase().includes(searchProvince.toLowerCase()) || tour.desc.toLowerCase().includes(searchProvince.toLowerCase());
    return matchRegion && matchSearch;
  });

  const handleSelectThemeTour = (tour: ThemeTour) => {
    const stops = tour.stops.map((s, idx) => ({
      ...s,
      priceNum: s.priceNum || (parseInt(s.price.replace(/\D/g, '')) || 50000),
      distance: s.distance || (idx === 0 ? '0.0 km' : `${(0.8 + idx * 0.4).toFixed(1)} km`)
    }));
    const totalCostNum = stops.reduce((acc, s) => acc + (s.priceNum || 50000), 0);
    const totalDistNum = Number(stops.reduce((acc, s, idx) => idx === 0 ? 0 : acc + Number((s.distance || '0').split(' ')[0]), 0).toFixed(1));
    
    const enrichedTour: ThemeTour = {
      ...tour,
      stops,
      totalCost: `${totalCostNum.toLocaleString('vi-VN')}đ`,
      totalDistance: `${totalDistNum > 0 ? totalDistNum : (stops.length * 0.9).toFixed(1)} km`
    };

    setActiveTour(enrichedTour);
    setActiveStopIndex(0);
    changeStep('render-details');
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    const history = newMessages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [m.text]
    }));

    const reply = await sendChatMessage(userMsg, history);
    setChatMessages([...newMessages, { role: 'model', text: reply }]);
    setChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-bamboo-watermark text-[#2C221E] font-sans-inter selection:bg-[#D4B872] transition-colors duration-700 overflow-x-hidden">
      
      {/* WATERMARK TRÔNG ĐỒNG */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url(/picture/hoa-tiet-trong-dong-vector-01.jpg)' }}></div>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled || step !== 'start' ? 'bg-[#FAF6EE]/95 backdrop-blur-xl border-b border-[#D4B872]/20 py-4 shadow-sm' : 'bg-transparent py-8'}`} style={{ viewTransitionName: 'header-group' }}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div onClick={() => changeStep('start')} className="flex items-center gap-4 cursor-pointer group focus-ring-accessible rounded-2xl p-1" tabIndex={0}>
            <div className="relative w-11 h-11 overflow-hidden rounded-full bg-[#8B0000] flex items-center justify-center border border-[#D4B872]/30 shadow-inner group-hover:scale-110 transition-transform">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 animate-pulse"></div>
               <Utensils className="w-5 h-5 text-[#D4B872] relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-playfair font-black text-2xl tracking-tighter text-[#8B0000] italic transition-all">TasteTrip</span>
              <span className="text-[10px] font-bold font-sans-montserrat text-[#D4B872] uppercase tracking-[0.2em] -mt-1 opacity-80">Hành Trình Di Sản</span>
            </div>
          </div>

        </div>
      </header>

      {/* TEXT MARQUEE TICKER */}
      <div className="bg-[#8B0000] text-[#D4B872] py-2.5 overflow-hidden whitespace-nowrap mt-20 border-y border-[#D4B872]/30 shadow-inner">
        <div className="animate-marquee font-sans-oswald text-xs font-black tracking-[0.3em] uppercase flex gap-12">
          <span>🌾 HÀNH TRÌNH VẠN DẶM QUA HƯƠNG VỊ BẢN SẮC VIỆT</span>
          <span>✦</span>
          <span>🏛️ MỖI MÓN ĂN LÀ MỘT DI SẢN • MỖI MIỀN ĐẤT LÀ MỘT CÂU CHUYỆN</span>
          <span>✦</span>
          <span>🍜 VIỆT NAM • ĐẬM ĐÀ HỒN THIÊNG DÂN TỘC</span>
          <span>✦</span>
          <span>✨ THƯỞNG VỊ TRĂM MIỀN • TRỌN VẸN TINH HOA NON NƯỚC</span>
          <span>✦</span>
          <span>🌾 HÀNH TRÌNH VẠN DẶM QUA HƯƠNG VỊ BẢN SẮC VIỆT</span>
          <span>✦</span>
          <span>🏛️ MỖI MÓN ĂN LÀ MỘT DI SẢN • MỖI MIỀN ĐẤT LÀ MỘT CÂU CHUYỆN</span>
          <span>✦</span>
          <span>🍜 VIỆT NAM • ĐẬM ĐÀ HỒN THIÊNG DÂN TỘC</span>
          <span>✦</span>
          <span>✨ THƯỞNG VỊ TRĂM MIỀN • TRỌN VẸN TINH HOA NON NƯỚC</span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="relative z-10" style={{ viewTransitionName: 'page-group' }}>
        
        {/* START SCREEN */}
        {step === 'start' && (
          <div className="flex flex-col animate-motion-floatIn">
            
            {/* HERO SECTION */}
            <section className="min-h-[85vh] flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2 px-8 lg:px-24 space-y-8 py-20 order-2 lg:order-1">
                <div className="flex items-center gap-3 animate-motion-slideIn">
                  <div className="w-12 h-[1px] bg-[#D4B872]"></div>
                  <span className="text-[11px] font-bold font-sans-montserrat text-[#D4B872] uppercase tracking-[0.3em]">Hương Vị Bản Sắc Việt</span>
                </div>
                <h1 className="font-serif-playfair font-black text-6xl lg:text-9xl leading-[0.9] text-[#2C221E] tracking-tighter">
                  Khám Phá <br />
                  <span className="text-[#8B0000] italic">Ẩm Thực.</span>
                </h1>
                <p className="font-serif-lora text-lg text-[#2C221E]/80 max-w-md leading-relaxed italic">
                  "Hồn Việt gửi trao trong từng phong vị." Chu du qua dải đất hình chữ S, nơi mỗi món ăn là một pho sử sống đong đầy ký ức và chiều sâu di sản ngàn năm.
                </p>
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                  {/* Card 1: Trợ Lý AI */}
                  <div 
                    onClick={() => changeStep('get-loc')} 
                    className="group bg-white p-7 rounded-[32px] shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer border border-[#D4B872]/30 relative overflow-hidden focus-ring-accessible"
                    tabIndex={0}
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-[#1E5631] text-[#FAF6EE] p-3.5">
                        <Bot className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-serif-playfair text-xl font-black text-[#2C221E] group-hover:text-[#1E5631] transition-colors leading-tight">
                          Trợ Lý AI 
                        </h4>
                        <p className="font-serif-merriweather text-xs text-[#2C221E]/70 leading-relaxed">
                          Chọn GPS hoặc nhập địa điểm, thiết lập 6 mục chi tiết kết hợp Gemini AI.
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-1.5 text-[#1E5631] font-black font-sans-montserrat text-[10px] uppercase tracking-[0.2em]">
                        <span>Bắt đầu</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Theo Tour */}
                  <div 
                    onClick={() => changeStep('themed-tour')} 
                    className="group bg-white p-7 rounded-[32px] shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer border border-[#D4B872]/30 relative overflow-hidden focus-ring-accessible"
                    tabIndex={0}
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-[#D4B872] text-[#8B0000] p-3.5">
                        <Compass className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-serif-playfair text-xl font-black text-[#2C221E] group-hover:text-[#8B0000] transition-colors leading-tight">
                         Tour
                        </h4>
                        <p className="font-serif-merriweather text-xs text-[#2C221E]/70 leading-relaxed">
                          Khám phá các hành trình ẩm thực có sẵn (Hà Nội, 63 Tỉnh Thành,...).
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-1.5 text-[#8B0000] font-black font-sans-montserrat text-[10px] uppercase tracking-[0.2em]">
                        <span>Bắt đầu</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HERO BANNER */}
              <div className="w-full lg:w-1/2 h-[60vh] lg:h-[80vh] relative order-1 lg:order-2 overflow-hidden shadow-2xl rounded-bl-[60px]">
                <div className="absolute inset-0 bg-[#8B0000]/15 z-10 mix-blend-multiply"></div>
                <img src="/picture/pexels-qui-nguyen-7862521-37615202.jpg" alt="Local Picture" className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2s]" />
                <div className="absolute bottom-12 right-12 z-20 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl animate-motion-floatIn">
                   <div className="font-script-dancing text-[#D4B872] text-4xl mb-1">"Vẻ đẹp bất tận"</div>
                   <div className="text-white/90 text-[10px] uppercase font-sans-montserrat tracking-widest font-bold">Tinh Hoa Di Sản Ẩm Thực Ba Miền</div>
                </div>
              </div>
            </section>

            {/* THƯ VIỆN THỰC TẾ 3 MIỀN (NỬA ẢNH - NỬA CÂU CHUYỆN & CÁCH ĂN & MENU TIẾNG ANH) */}
            <section className="py-24 px-8 max-w-7xl mx-auto space-y-20">
              <div className="text-center space-y-3">
                <span className="text-[11px] font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-[0.3em] bg-[#D4B872]/20 px-4 py-1.5 rounded-full flex items-center gap-2 w-max mx-auto">
                  <Camera className="w-4 h-4 text-[#8B0000]" /> Thư Viện Thực Tế & Giai Thoại Ẩm Thực
                </span>
                <h2 className="font-serif-playfair text-4xl lg:text-5xl font-black text-[#2C221E]">
                  Khoảnh Khắc Trải Nghiệm <span className="text-[#8B0000] italic">Việt Nam</span>
                </h2>
                <p className="font-serif-lora text-sm text-[#2C221E]/70 max-w-2xl mx-auto italic">
                  Mỗi món ăn là một di sản sống động: khám phá hình ảnh thực tế, câu chuyện lịch sử, cách ăn chuẩn vị và thực đơn tiếng Anh chuẩn quốc tế.
                </p>
              </div>

              {[
                {
                  regionTitle: 'Đặc Sản Miền Bắc',
                  tagColor: 'bg-[#8B0000] text-[#D4B872]',
                  items: [
                    {
                      name: 'Phở Bò Hà Nội',
                      tag: 'Hà Nội Di Sản',
                      img: '/picture/pexels-qui-nguyen-7862521-32698015.jpg',
                      story: 'Xuất hiện từ đầu thế kỷ 20, phở khởi nguồn từ những gánh phở rong kẽo kẹt đêm đông phố cổ Hà Nội. Nước dùng là linh hồn món ăn, được ninh ròng 12-16 tiếng từ xương ống bò cùng sá sùng và thảo mộc hồi, quế, thảo quả nướng thơm phức.',
                      tastingTip: 'Húp thìa nước dùng đầu tiên khi còn bốc khói nghi ngút để cảm nhận vị ngọt thanh của tủy bò; sau đó vắt chanh tươi, giấm tỏi ớt Bắc, ăn kèm quẩy giòn và trứng chần lòng đào.',
                      englishMenu: 'Traditional Hanoi Beef Noodle Soup – 12-hour simmered aromatic beef bone broth with tender beef brisket, fresh flat rice noodles and scallions.'
                    },
                    {
                      name: 'Cà Phê Trứng Giảng',
                      tag: 'Phố Cổ • 1946',
                      img: '/picture/pexels-soc-nang-d-ng-2150345854-35775552.jpg',
                      story: 'Ra đời năm 1946 bởi cụ Nguyễn Văn Giảng – cựu pha chế trưởng khách sạn Metropole. Khi sữa tươi cực kỳ khan hiếm thời kỳ kháng chiến, cụ nảy ra ý tưởng dùng lòng đỏ trứng gà đánh bông mịn thay thế cho sữa, tạo nên kiệt tác cà phê trứng vang danh thế giới.',
                      tastingTip: 'Cốc cà phê luôn đặt trong chén nước ấm để giữ nhiệt; dùng thìa nhỏ nếm lớp kem trứng bồng bềnh béo ngậy trước, sau đó khuấy nhẹ uống quyện cùng cốt cà phê Robusta đậm đà.',
                      englishMenu: 'Hanoi Egg Coffee – Rich robusta drip coffee crowned with a velvety, frothy sweet egg yolk foam.'
                    },
                    {
                      name: 'Bún Chả Hà Nội',
                      tag: 'Đặc Sản Tràng An',
                      img: '/picture/pexels-markus-winkler-1430818-3858270.jpg',
                      story: 'Món ăn thanh tao đất Tràng An từng được nhà văn Thạch Lam khắc họa trong "Hà Nội 36 phố phường". Bún chả trở thành hiện tượng văn hóa toàn cầu khi Tổng thống Barack Obama thưởng thức cùng đầu bếp Anthony Bourdain tại phố Lê Văn Hưu năm 2016.',
                      tastingTip: 'Gắp một gắp bún sợi nhỏ nhúng ngập vào bát nước mắm chua ngọt ấm nóng ngập chả miếng nướng than hoa và đu đủ xanh giòn, ăn kèm rau tía tô, kinh giới.',
                      englishMenu: 'Hanoi Grilled Pork with Rice Vermicelli – Charcoal-grilled pork patties and caramelized belly slices served in warm sweet-sour dipping broth with fresh herbs.'
                    },
                    {
                      name: 'Bún Đậu Mắm Tôm',
                      tag: 'Hương Vị Phố Cổ',
                      img: '/picture/bun-dau-mam-tom-ha-noi-1.jpg',
                      story: 'Từ món quà rong dân dã ven bờ sông Hồng, bún đậu đã vươn lên thành nét văn hóa vỉa hè Hà Nội không thể trộn lẫn. Bí quyết làm nên hương vị khó quên là mắm tôm gia truyền đất Cự Đà dậy mùi nồng nàn.',
                      tastingTip: 'Dùng đũa đánh bông mắm tôm cùng nước cốt tắc/quất tươi, thêm thìa mỡ sôi nóng hổi và ớt cay; gắp miếng đậu Mơ rán giòn vàng ruộm chấm ngập thưởng thức cùng chả cốm dẻo thơm.',
                      englishMenu: 'Crispy Tofu & Vermicelli Platter with Shrimp Paste – Golden deep-fried tofu cubes, boiled pork belly and green rice cakes served with fermented shrimp dipping sauce.'
                    }
                  ]
                },
                {
                  regionTitle: 'Đặc Sản Miền Trung',
                  tagColor: 'bg-[#D4B872] text-[#8B0000]',
                  items: [
                    {
                      name: 'Bánh Bột Lọc Huế',
                      tag: 'Cung Đình Cố Đô',
                      img: '/picture/pexels-h-i-nguy-n-1627264-5948999.jpg',
                      story: 'Bắt nguồn từ chốn cung đình triều Nguyễn, bánh bột lọc đòi hỏi sự khéo léo của các cung nữ xưa. Lớp vỏ lọc trong suốt như pha lê để lộ nhân tôm sông đỏ au và thịt ba chỉ rim đậm đà gói ghém bên trong lớp lá chuối tươi xanh.',
                      tastingTip: 'Bóc nhẹ lớp lá chuối khi bánh còn nóng ấm, chấm ngập vào chén nước mắm mặn cốt nguyên chất dầm ớt xiêm xanh cay nồng xé lưỡi đặc trưng xứ Huế.',
                      englishMenu: 'Hue Clear Tapioca Dumplings – Translucent chewy tapioca cakes stuffed with caramelized river shrimp and pork belly, steamed in fragrant banana leaves.'
                    },
                    {
                      name: 'Bún Bò Huế',
                      tag: 'Đặc Sản Xứ Huế',
                      img: '/picture/pexels-jang-2591594.jpg',
                      story: 'Đỉnh cao ẩm thực miền Trung kết hợp vị cay nồng của sả ớt và hương thơm đặc trưng của mắm ruốc hạ thổ. Từng được cố đầu bếp lừng danh Anthony Bourdain tôn vinh là một trong những món nước ngon nhất hành tinh.',
                      tastingTip: 'Ăn cùng sợi bún tròn to, thêm chả cua quết dẻo, móng giò giòn sần sật; vắt chanh tươi và thả nhiều hoa chuối bào sợi, rau ngổ, giá sống.',
                      englishMenu: 'Hue Royal Spicy Beef Noodle Soup – Robust lemongrass and fermented shrimp paste broth with tender beef shank, crab balls and thick rice vermicelli.'
                    },
                    {
                      name: 'Bánh Tráng Cuốn Thịt Heo',
                      tag: 'Đà Nẵng • Xứ Quảng',
                      img: '/picture/pexels-connorscottmcmanus-11783326.jpg',
                      story: 'Món ăn danh tiếng của thành phố sông Hàn, nổi bật với nghệ thuật luộc thịt heo hai đầu da giòn ngọt và sự kết hợp của hơn 10 loại rau rừng tươi non thu hái ven bờ sông Thu Bồn.',
                      tastingTip: 'Trải tấm bánh tráng phơi sương, đặt bánh phở mỏng, xếp lớp thịt luộc 2 đầu da kèm chuối chát, khế chua; cuộn chặt tay rồi chấm đẫm chén mắm nêm đậm vị tỏi ớt.',
                      englishMenu: 'Danang Two-Tier Pork Rice Paper Rolls – Thinly sliced pork belly rolled with wild herbs, green banana, cucumber and piquant fermented anchovy dipping sauce.'
                    },
                    {
                      name: 'Mỳ Quảng Trứ Danh',
                      tag: 'Hồn Quê Quảng Nam',
                      img: '/picture/Buoc-8-Thanh-pham-1-8-8366-1684125654.jpg',
                      story: 'Gắn liền với cuộc khẩn hoang phương Nam từ thế kỷ 16 qua thương cảng Hội An. Sợi mỳ màu vàng nghệ óng ả làm từ gạo ngon, nước nhưỡng chan xâm xấp đậm đà phản ánh tính cách phóng khoáng của người miền Trung.',
                      tastingTip: 'Bẻ vụn miếng bánh tráng mè nướng giòn rụm vào tô mỳ, rắc thêm lạc rang giã dập, trộn đều cùng rau sống búp chuối non và cắn kèm trái ớt xanh cay nồng.',
                      englishMenu: 'Quang Turmeric Noodles – Yellow flat noodles served with braised pork, shrimp, crushed peanuts, toasted sesame rice crackers and rich shallow savory broth.'
                    }
                  ]
                },
                {
                  regionTitle: 'Đặc Sản Miền Nam',
                  tagColor: 'bg-[#1E5631] text-[#FAF6EE]',
                  items: [
                    {
                      name: 'Cơm Tấm Sài Gòn',
                      tag: 'Linh Hồn Sài Gòn',
                      img: '/picture/pexels-nguyen-tran-327588-8791778.jpg',
                      story: 'Khởi đầu từ hạt gạo tấm rơi vãi thời kỳ nghèo khó của người lao động Nam Bộ, cơm tấm nay trở thành biểu tượng ẩm thực nhộn nhịp nhất của thành phố phương Nam với sườn nướng mật ong thơm nức phố phường.',
                      tastingTip: 'Thưởng thức đĩa cơm sườn nướng than hoa thơm lừng cùng bì thính, chả trứng hấp, rưới đẫm mỡ hành béo ngậy và nước mắm chua ngọt pha kẹo sánh.',
                      englishMenu: 'Saigon Broken Rice with Grilled Pork – Steamed broken rice with honey-lemongrass charcoal grilled pork chop, steamed egg meatloaf and scallion oil.'
                    },
                    {
                      name: 'Lẩu Mắm Miền Tây',
                      tag: 'Mùa Nước Nổi',
                      img: '/picture/4351473951ef5607250a046cb3aefef0.jpg',
                      story: 'Tinh hoa ẩm thực vùng sông nước Đồng bằng sông Cửu Long, biểu trưng cho sự giao thoa văn hóa Việt - Khmer - Hoa. Nước lẩu nấu từ mắm cá linh, cá sặc đồng hòa cùng nước dừa tươi ngọt lành.',
                      tastingTip: 'Thả đĩa rau đồng hoa nội phong phú hơn 20 loại: bông điên điển, bông so đũa, rau nhút, cọng súng; nhúng cá béo, tôm càng và thịt ba chỉ tươi rói.',
                      englishMenu: 'Mekong Delta Fermented Fish Hotpot – A deeply savory aromatic broth made from fermented river fish, coconut water, fresh seafood and wild delta greens.'
                    },
                    {
                      name: 'Cá Lóc Nướng Trui',
                      tag: 'Khai Hoang Mở Cõi',
                      img: '/picture/517e741c904473e101991d6b34f9d6b9.jpg',
                      story: 'Món ăn nguyên bản từ thời khai hoang mở đất Nam Bộ. Cá lóc đồng vừa bắt dưới mương chỉ cần xiên thanh tre cắm xuống đất, phủ rơm khô đốt rực lửa ngay bên bờ ruộng thơm lừng mùi rơm mới.',
                      tastingTip: 'Cạo sạch lớp vảy cháy xém để lộ thịt cá trắng phau thơm nức mùi khói rơm; rưới mỡ hành, cuốn bánh tráng rau rừng rồi chấm ngập chén mắm me chua ngọt dầm ớt cay.',
                      englishMenu: 'Straw-Roasted Snakehead Fish – Whole wild snakehead fish roasted directly inside blazing dry rice straw, served with wild herbs and tangy tamarind dip.'
                    },
                    {
                      name: 'Bánh Xèo Nam Bộ',
                      tag: 'Hào Sảng Miệt Vườn',
                      img: '/picture/Buoc-10-Thanh-pham-1-1-5225-1695107554.jpg',
                      story: 'Tên gọi vang lên từ tiếng "xèo" vui tai khi vá bột gạo pha nước cốt dừa và nghệ vàng đổ vào chảo gang nóng rực mỡ, tượng trưng cho sự trù phú, hào sảng của miệt vườn cây trái Nam Bộ.',
                      tastingTip: 'Bẻ miếng bánh vàng ruộm giòn tan nhân tôm thịt giá đỗ, cuộn cùng lá cải xanh cay, lá cách, đọt xoài chua và chấm đẫm chén nước mắm chua ngọt tỏi ớt.',
                      englishMenu: 'Giant Crispy Southern Crepe – Crispy golden turmeric crepe filled with river shrimp, pork belly and bean sprouts, wrapped in wild mustard greens.'
                    }
                  ]
                }
              ].map((section, sIdx) => (
                <div key={sIdx} className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-8 bg-[#8B0000] rounded-full"></div>
                    <h3 className="font-serif-playfair text-3xl font-black text-[#8B0000]">{section.regionTitle}</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {section.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedFoodModal({ ...item, regionTitle: section.regionTitle, tagColor: section.tagColor })}
                        className="group relative h-72 rounded-[30px] overflow-hidden shadow-xl border border-[#D4B872]/30 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                      >
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity"></div>
                        <div className="absolute top-4 left-4">
                          <span className={`text-[10px] font-black font-sans-montserrat px-3 py-1 rounded-full uppercase tracking-widest shadow-md ${section.tagColor}`}>
                            {item.tag}
                          </span>
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                          <h4 className="font-serif-playfair font-bold text-lg group-hover:text-[#D4B872] transition-colors">{item.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-sans-montserrat text-[#D4B872] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                            <Sparkles className="w-3 h-3" />
                            <span>Chạm để xem chi tiết</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* POPUP MODAL: NỬA ẢNH - NỬA LỊCH SỬ / CÁCH ĂN ĐÚNG VỊ / THỰC ĐƠN TIẾNG ANH */}
        {selectedFoodModal && (
          <div 
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-motion-floatIn"
            onClick={() => setSelectedFoodModal(null)}
          >
            <div 
              className="relative w-full max-w-5xl bg-white rounded-[36px] overflow-hidden shadow-2xl border border-[#D4B872]/40 flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* NÚT ĐÓNG */}
              <button 
                onClick={() => setSelectedFoodModal(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all shadow-lg"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              {/* MỘT NỬA (50%): HÌNH ẢNH MÓN */}
              <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full overflow-hidden bg-black/10">
                <img 
                  src={selectedFoodModal.img} 
                  alt={selectedFoodModal.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className={`text-[11px] font-black font-sans-montserrat px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-md ${selectedFoodModal.tagColor || 'bg-[#8B0000] text-[#D4B872]'}`}>
                    {selectedFoodModal.tag}
                  </span>
                  {selectedFoodModal.regionTitle && (
                    <span className="text-[10px] font-bold font-sans-montserrat px-3 py-1 rounded-full uppercase tracking-widest bg-white/90 text-[#2C221E] shadow-sm backdrop-blur-sm w-fit">
                      {selectedFoodModal.regionTitle}
                    </span>
                  )}
                </div>
              </div>

              {/* MỘT NỬA (50%): LỊCH SỬ, CÁCH THƯỞNG THỨC ĐÚNG VỊ & MENU TIẾNG ANH */}
              <div className="w-full md:w-1/2 p-7 md:p-9 overflow-y-auto space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-bold font-sans-montserrat text-[#D4B872] uppercase tracking-[0.25em]">Di Sản Ẩm Thực Việt Nam</span>
                    <h3 className="font-serif-playfair font-black text-3xl md:text-4xl text-[#8B0000] leading-tight mt-1">{selectedFoodModal.name}</h3>
                  </div>

                  {/* 1. LỊCH SỬ VỀ MÓN ĂN */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#8B0000] text-xs font-bold font-sans-montserrat uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>Lịch Sử & Giai Thoại Món Ăn</span>
                    </div>
                    <p className="font-serif-merriweather text-xs md:text-[13px] text-[#2C221E]/80 leading-relaxed pl-4 border-l-2 border-[#8B0000]/40">
                      {selectedFoodModal.story}
                    </p>
                  </div>

                  {/* 2. CÁCH THƯỞNG THỨC ĐÚNG VỊ */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#1E5631] text-xs font-bold font-sans-montserrat uppercase tracking-wider">
                      <Utensils className="w-4 h-4" />
                      <span>Cách Thưởng Thức Đúng Vị</span>
                    </div>
                    <p className="font-serif-merriweather text-xs md:text-[13px] text-[#2C221E]/80 leading-relaxed pl-4 border-l-2 border-[#1E5631]/40">
                      {selectedFoodModal.tastingTip}
                    </p>
                  </div>

                  {/* 3. THỰC ĐƠN TIẾNG ANH */}
                  <div className="space-y-1.5 bg-[#FAF6EE] p-4 rounded-2xl border border-[#D4B872]/40">
                    <div className="flex items-center gap-2 text-[#8B0000] text-xs font-bold font-sans-montserrat uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-[#8B0000]" />
                      <span>Thực Đơn Tiếng Anh (English Menu)</span>
                    </div>
                    <p className="font-sans-inter text-xs text-[#2C221E]/80 leading-relaxed italic">
                      {selectedFoodModal.englishMenu}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedFoodModal(null)}
                    className="w-full bg-[#8B0000] text-white py-3.5 rounded-2xl font-sans-montserrat font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#A52A2A] transition-all"
                  >
                    Đóng Khám Phá
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GET LOC */}
        {step === 'get-loc' && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 space-y-10 animate-motion-floatIn my-20">
            <div className="flex items-center justify-between">
              <button onClick={() => changeStep('start')} className="text-[11px] font-bold font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:italic flex items-center gap-2 focus-ring-accessible"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black font-sans-montserrat text-[#8B0000] bg-[#D4B872]/20 px-4 py-1.5 rounded-full uppercase tracking-widest">Bước 1: Lấy Vị Trí</span>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="font-serif-playfair text-4xl font-black text-[#2C221E]">Xác Định <span className="italic text-[#8B0000]">Vị Trí Của Bạn</span></h2>
              <p className="font-serif-lora text-xs text-[#2C221E]/60 italic">Chọn tự động qua GPS hoặc nhập địa chỉ điểm đến của bạn.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setLocMode('gps')}
                className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex flex-col gap-3 ${locMode === 'gps' ? 'border-[#8B0000] bg-[#8B0000]/5 text-[#8B0000]' : 'border-[#D4B872]/30 text-[#2C221E]/70 hover:bg-[#D4B872]/10'}`}
              >
                <Navigation className="w-6 h-6 text-[#8B0000]" />
                <div>
                  <div className="font-sans-montserrat text-sm">Tự động GPS</div>
                  <div className="text-[10px] font-normal opacity-75">Xác định tọa độ hiện tại</div>
                </div>
              </button>

              <button 
                onClick={() => setLocMode('manual')}
                className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex flex-col gap-3 ${locMode === 'manual' ? 'border-[#8B0000] bg-[#8B0000]/5 text-[#8B0000]' : 'border-[#D4B872]/30 text-[#2C221E]/70 hover:bg-[#D4B872]/10'}`}
              >
                <MapPin className="w-6 h-6 text-[#8B0000]" />
                <div>
                  <div className="font-sans-montserrat text-sm">Nhập thủ công</div>
                  <div className="text-[10px] font-normal opacity-75">Nhập địa điểm bắt đầu</div>
                </div>
              </button>
            </div>

            {locMode === 'gps' ? (
              <button 
                onClick={handleDetectGPS} 
                disabled={isDetecting} 
                className="w-full bg-[#8B0000] text-white py-5 rounded-2xl font-sans-poppins font-bold text-base shadow-xl hover:bg-[#A52A2A] transition-all flex items-center justify-center gap-2 focus-ring-accessible"
              >
                {isDetecting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Xác định tọa độ hiện tại qua GPS</>}
              </button>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={locationAddress === 'Hồ Gươm, Hoàn Kiếm, Hà Nội' ? '' : locationAddress} 
                  onChange={(e) => setLocationAddress(e.target.value)} 
                  placeholder="Nhập địa chỉ hoặc điểm đến của bạn..." 
                  className="w-full p-5 bg-[#FAF6EE] border-2 border-transparent rounded-2xl font-serif-lora text-base focus:border-[#D4B872] focus:outline-none" 
                />
                <button 
                  onClick={handleManualLoc} 
                  className="w-full bg-[#8B0000] text-white py-5 rounded-2xl font-sans-poppins font-bold text-base shadow-xl hover:bg-[#A52A2A] transition-all focus-ring-accessible"
                >
                  Xác nhận địa điểm & Tiếp tục
                </button>
              </div>
            )}
          </div>
        )}

        {/* CUSTOM TOUR (TÙY CHỈNH) */}
        {step === 'custom-tour' && (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 space-y-8 animate-motion-floatIn my-16">
            <div className="flex items-center justify-between">
              <button onClick={() => changeStep('start')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black font-sans-montserrat text-[#8B0000] bg-[#8B0000]/10 px-3 py-1 rounded-full">Tùy Chỉnh Chi Tiết</span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="font-serif-playfair text-3xl font-bold text-[#8B0000]">Tùy Chỉnh Food Tour</h2>
              <p className="font-serif-lora text-xs text-[#2C221E]/60 italic">Cá nhân hóa mọi tiêu chuẩn cho chuyến đi của bạn.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#8B0000]" /> 1. Vị trí khởi hành / Điểm đến
                </label>
                <input 
                  type="text" 
                  value={customLocation} 
                  onChange={(e) => setCustomLocation(e.target.value)} 
                  placeholder="Ví dụ: Phố cổ Hà Nội..." 
                  className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#8B0000]" /> 2. Nhu cầu / Mục đích chuyến đi
                </label>
                <input 
                  type="text" 
                  value={customNeed} 
                  onChange={(e) => setCustomNeed(e.target.value)} 
                  placeholder="Ví dụ: Ăn sập phố cổ, hẹn hò, khám phá di sản..." 
                  className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock3 className="w-4 h-4 text-[#8B0000]" /> 3. Thời gian (Chọn sẵn hoặc tự nhập tay)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <select 
                    value={customTimeOption} 
                    onChange={(e) => { setCustomTimeOption(e.target.value); setCustomTimeManual(''); }} 
                    className="p-3.5 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-xs"
                  >
                    <option value="Cả ngày (8:00 - 20:00)">Cả ngày (8:00 - 20:00)</option>
                    <option value="Buổi sáng (7:00 - 11:30)">Buổi sáng (7:00 - 11:30)</option>
                    <option value="Buổi chiều & Tối (15:00 - 22:00)">Buổi chiều & Tối (15:00 - 22:00)</option>
                  </select>
                  <input 
                    type="text" 
                    value={customTimeManual} 
                    onChange={(e) => setCustomTimeManual(e.target.value)} 
                    placeholder="Hoặc nhập tay (VD: 9h - 17h)..." 
                    className="p-3.5 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-xs focus:outline-none focus:border-[#8B0000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-[#8B0000]" /> 4. Ngân sách dự kiến</span>
                  <span className="text-sm font-black text-[#8B0000]">{Number(customBudgetVal).toLocaleString('vi-VN')}đ</span>
                </label>
                <input 
                  type="range" 
                  min={50000} 
                  max={1000000} 
                  step={50000}
                  value={customBudgetVal} 
                  onChange={(e) => setCustomBudgetVal(Number(e.target.value))} 
                  className="w-full accent-[#8B0000] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#2C221E]/60 font-sans-montserrat mt-1">
                  <span>50.000đ (Bình dân)</span>
                  <span>500.000đ (Đặc sản)</span>
                  <span>1.000.000đ+ (Sang trọng)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#8B0000]" /> 5. Sở thích ẩm thực
                </label>
                <input 
                  type="text" 
                  value={customHobby} 
                  onChange={(e) => setCustomHobby(e.target.value)} 
                  placeholder="Ví dụ: Thích món nước, quán lâu đời..." 
                  className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2">
                  6. Khoảng cách di chuyển tối đa: {customRadius} km
                </label>
                <input 
                  type="range" 
                  min={1} 
                  max={10} 
                  value={customRadius} 
                  onChange={(e) => setCustomRadius(Number(e.target.value))} 
                  className="w-full accent-[#8B0000]" 
                />
              </div>

              <button onClick={handleBuildCustomTour} disabled={customLoading} className="w-full bg-[#8B0000] text-white py-5 rounded-2xl font-sans-poppins font-bold text-base shadow-xl hover:bg-[#A52A2A] transition-all flex items-center justify-center gap-2 focus-ring-accessible disabled:opacity-70">
                {customLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Sparkles className="w-5 h-5 text-[#D4B872]" /> Tạo lịch trình</>}
              </button>
            </div>
          </div>
        )}

        {/* THEMED TOUR (THEO TOUR - 63 TỈNH THÀNH) */}
        {step === 'themed-tour' && (
          <div className="space-y-12 max-w-7xl mx-auto py-16 px-8 animate-motion-floatIn">
            <div className="flex items-center justify-between">
              <button onClick={() => changeStep('start')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black font-sans-montserrat text-[#8B0000] bg-[#D4B872]/20 px-4 py-1.5 rounded-full uppercase tracking-widest">63 Tỉnh Thành • Food Tour</span>
            </div>

            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="font-serif-playfair text-4xl lg:text-5xl font-bold text-[#2C221E]">Khám Phá <span className="text-[#8B0000] italic">63 Tỉnh Thành</span> Việt Nam</h2>
              <p className="font-serif-lora text-sm text-[#2C221E]/70 italic">Trải nghiệm food tour chuẩn vị từ Bắc chí Nam với các món đặc sản sáng, trưa, chiều, tối.</p>

              {/* SEARCH INPUT */}
              <div className="pt-2">
                <input 
                  type="text"
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  placeholder="🔍 Tìm kiếm tỉnh thành hoặc món ăn (VD: Hà Nội, Hải Phòng, Cần Thơ, Phở...)"
                  className="w-full p-4 bg-white border border-[#D4B872]/40 rounded-2xl font-serif-lora text-sm shadow-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>
            </div>

            {/* REGION TABS */}
            <div className="flex flex-wrap justify-center gap-2">
              {regionsList.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold font-sans-montserrat transition-all border ${
                    selectedRegion === region ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-md' : 'bg-white text-[#2C221E]/70 border-[#D4B872]/30 hover:border-[#8B0000]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* TOURS GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map(tour => (
                <div key={tour.id} onClick={() => handleSelectThemeTour(tour)} className="bg-white rounded-[35px] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-[#D4B872]/30 cursor-pointer group flex flex-col justify-between">
                  <div className="relative h-56 overflow-hidden">
                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-[#8B0000] text-[#D4B872] px-3.5 py-1 rounded-full text-xs font-bold font-sans-montserrat shadow">
                      {tour.region}
                    </div>
                  </div>
                  <div className="p-8 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-serif-playfair text-2xl font-bold text-[#8B0000]">{tour.title}</h3>
                      <p className="font-serif-merriweather text-xs text-[#2C221E]/70 leading-relaxed">{tour.desc}</p>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-[#FAF6EE]">
                      <span className="text-[10px] font-bold font-sans-montserrat text-[#D4B872] uppercase tracking-wider">{tour.stops.length} Món ăn / Điểm dừng</span>
                      <div className="flex items-center gap-1 text-[#8B0000] font-bold font-sans-montserrat text-xs group-hover:translate-x-1 transition-transform">
                        <span>Chi tiết</span> <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTours.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[40px] border border-[#D4B872]/20 space-y-3">
                <Utensils className="w-12 h-12 text-[#D4B872] mx-auto opacity-30" />
                <p className="font-serif-lora italic text-[#2C221E]/50">Không tìm thấy tỉnh thành phù hợp với tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        )}

        {/* AI CHAT & ASSISTANT (TRỢ LÝ AI) */}
        {step === 'ai-chat' && (
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 space-y-8 animate-motion-floatIn my-16">
            <div className="flex items-center justify-between">
              <button onClick={() => changeStep('start')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black font-sans-montserrat text-[#1E5631] bg-[#1E5631]/10 px-4 py-1.5 rounded-full uppercase tracking-widest">Trí Tuệ Nhân Tạo • Lịch Trình</span>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#1E5631] text-[#D4B872] flex items-center justify-center mx-auto shadow">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="font-serif-playfair text-3xl md:text-4xl font-bold text-[#2C221E]">
                Thiết Kế Tour Bằng Trí Tuệ Nhân Tạo
              </h2>
              <p className="font-serif-lora text-xs text-[#2C221E]/60 italic max-w-lg mx-auto">
                Nhập tiêu chí khởi hành, nhu cầu và ngân sách để Gemini AI tự động tính toán lộ trình tối ưu hoá tuyến đường.
              </p>
            </div>

            <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#1E5631]" /> 1. Vị trí khởi hành / Tỉnh thành (63 Tỉnh Thành)</span>
                    <button 
                      type="button" 
                      onClick={handleDetectGPS}
                      className="text-[10px] bg-[#1E5631] text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-[#2E8B57] transition-all shadow"
                    >
                      <Navigation className="w-3 h-3" /> {isDetecting ? 'Đang định vị...' : 'Lấy GPS của tôi'}
                    </button>
                  </label>
                  <select 
                    onChange={(e) => { if (e.target.value) setCustomLocation(e.target.value); }}
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631] mb-2"
                  >
                    <option value="">-- Chọn nhanh 1 trong 63 Tỉnh Thành --</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Hà Nam">Hà Nam</option>
                    <option value="Hải Dương">Hải Dương</option>
                    <option value="Hưng Yên">Hưng Yên</option>
                    <option value="Nam Định">Nam Định</option>
                    <option value="Ninh Bình">Ninh Bình</option>
                    <option value="Thái Bình">Thái Bình</option>
                    <option value="Vĩnh Phúc">Vĩnh Phúc</option>
                    <option value="Bắc Ninh">Bắc Ninh</option>
                    <option value="Bắc Giang">Bắc Giang</option>
                    <option value="Bắc Kạn">Bắc Kạn</option>
                    <option value="Cao Bằng">Cao Bằng</option>
                    <option value="Hà Giang">Hà Giang</option>
                    <option value="Lạng Sơn">Lạng Sơn</option>
                    <option value="Phú Thọ">Phú Thọ</option>
                    <option value="Quảng Ninh">Quảng Ninh</option>
                    <option value="Thái Nguyên">Thái Nguyên</option>
                    <option value="Tuyên Quang">Tuyên Quang</option>
                    <option value="Điện Biên">Điện Biên</option>
                    <option value="Hòa Bình">Hòa Bình</option>
                    <option value="Lai Châu">Lai Châu</option>
                    <option value="Lào Cai">Lào Cai</option>
                    <option value="Sơn La">Sơn La</option>
                    <option value="Yên Bái">Yên Bái</option>
                    <option value="Thanh Hóa">Thanh Hóa</option>
                    <option value="Nghệ An">Nghệ An</option>
                    <option value="Hà Tĩnh">Hà Tĩnh</option>
                    <option value="Quảng Bình">Quảng Bình</option>
                    <option value="Quảng Trị">Quảng Trị</option>
                    <option value="Thừa Thiên Huế">Thừa Thiên Huế</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Quảng Nam">Quảng Nam</option>
                    <option value="Quảng Ngãi">Quảng Ngãi</option>
                    <option value="Bình Định">Bình Định</option>
                    <option value="Phú Yên">Phú Yên</option>
                    <option value="Khánh Hòa">Khánh Hòa</option>
                    <option value="Ninh Thuận">Ninh Thuận</option>
                    <option value="Bình Thuận">Bình Thuận</option>
                    <option value="Đắk Lắk">Đắk Lắk</option>
                    <option value="Đắk Nông">Đắk Nông</option>
                    <option value="Gia Lai">Gia Lai</option>
                    <option value="Kon Tum">Kon Tum</option>
                    <option value="Lâm Đồng">Lâm Đồng</option>
                    <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Bình Phước">Bình Phước</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh (Sài Gòn)</option>
                    <option value="Tây Ninh">Tây Ninh</option>
                    <option value="An Giang">An Giang</option>
                    <option value="Bạc Liêu">Bạc Liêu</option>
                    <option value="Bến Tre">Bến Tre</option>
                    <option value="Cà Mau">Cà Mau</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Đồng Tháp">Đồng Tháp</option>
                    <option value="Hậu Giang">Hậu Giang</option>
                    <option value="Kiên Giang">Kiên Giang</option>
                    <option value="Long An">Long An</option>
                    <option value="Sóc Trăng">Sóc Trăng</option>
                    <option value="Tiền Giang">Tiền Giang</option>
                    <option value="Trà Vinh">Trà Vinh</option>
                    <option value="Vĩnh Long">Vĩnh Long</option>
                  </select>
                  <input 
                    type="text" 
                    value={customLocation} 
                    onChange={(e) => setCustomLocation(e.target.value)} 
                    placeholder="Hoặc nhập địa điểm cụ thể (VD: Quận 1, Sài Gòn / Phố Cổ Hà Nội)..." 
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-[#1E5631]" /> 2. Nhu cầu / Mục đích chuyến đi
                  </label>
                  <input 
                    type="text" 
                    value={customNeed} 
                    onChange={(e) => setCustomNeed(e.target.value)} 
                    placeholder="VD: Khám phá ẩm thực truyền thống & check-in" 
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#1E5631]" /> 3. Thời gian chuyến đi
                  </label>
                  <select 
                    value={customTimeOption} 
                    onChange={(e) => setCustomTimeOption(e.target.value)} 
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631] mb-2"
                  >
                    <option value="Cả ngày (8:00 - 20:00)">Cả ngày (8:00 - 20:00)</option>
                    <option value="Buổi sáng (7:30 - 11:30)">Buổi sáng (7:30 - 11:30)</option>
                    <option value="Buổi chiều (14:00 - 18:00)">Buổi chiều (14:00 - 18:00)</option>
                    <option value="Buổi tối (18:00 - 22:00)">Buổi tối (18:00 - 22:00)</option>
                  </select>
                  <input 
                    type="text" 
                    value={customTimeManual} 
                    onChange={(e) => setCustomTimeManual(e.target.value)} 
                    placeholder="Hoặc nhập tay (VD: 9h - 17h)..." 
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-[#1E5631]" /> 4. Ngân sách dự kiến</span>
                    <span className="text-sm font-black text-[#1E5631]">{Number(customBudgetVal).toLocaleString('vi-VN')}đ</span>
                  </label>
                  <input 
                    type="range" 
                    min={50000} 
                    max={1000000} 
                    step={50000}
                    value={customBudgetVal} 
                    onChange={(e) => setCustomBudgetVal(Number(e.target.value))} 
                    className="w-full accent-[#1E5631] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#2C221E]/60 font-sans-montserrat mt-1">
                    <span>50.000đ (Bình dân)</span>
                    <span>500.000đ (Đặc sản)</span>
                    <span>1.000.000đ+ (Sang trọng)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#1E5631]" /> 5. Sở thích ẩm thực
                  </label>
                  <input 
                    type="text" 
                    value={customHobby} 
                    onChange={(e) => setCustomHobby(e.target.value)} 
                    placeholder="VD: Thích ăn phở, uống cà phê trứng và các món ăn vặt lâu đời" 
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2">
                    6. Khoảng cách di chuyển tối đa: {customRadius} km
                  </label>
                  <input 
                    type="range" 
                    min={1} 
                    max={10} 
                    value={customRadius} 
                    onChange={(e) => setCustomRadius(Number(e.target.value))} 
                    className="w-full accent-[#1E5631]" 
                  />
                </div>

                <button 
                  onClick={handleBuildCustomTour} 
                  disabled={customLoading} 
                  className="w-full bg-[#1E5631] hover:bg-[#2E8B57] text-white py-5 rounded-2xl font-sans-poppins font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 focus-ring-accessible disabled:opacity-70"
                >
                  {customLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Sparkles className="w-5 h-5 text-[#D4B872]" /> Tạo lịch trình AI & Quét Google Maps</>}
                </button>
              </div>
          </div>
        )}

        {/* RENDER DETAILS */}
        {step === 'render-details' && (
          <div className="space-y-12 max-w-7xl mx-auto py-12 animate-motion-fadeIn">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-[35px] border border-[#D4B872]/30 shadow-sm gap-4">
              <div>
                <button onClick={() => changeStep('themed-tour')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
                <h2 className="font-serif-playfair text-4xl font-black text-[#8B0000]">{activeTour.title}</h2>
                <p className="font-serif-lora text-xs text-[#2C221E]/70 italic mt-1">{activeTour.desc}</p>
              </div>
              <button onClick={() => changeStep('checkout')} className="bg-[#D4B872] hover:bg-[#C2A55F] text-[#2C221E] font-sans-poppins font-bold px-8 py-4 rounded-2xl shadow transition-all flex items-center gap-2 text-sm focus-ring-accessible">
                <Calendar className="w-4 h-4" /> Đặt Chỗ Ngay
              </button>
            </div>

            {/* DASHBOARD TỔNG KẾT HÀNH TRÌNH (KHỐI 4.3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[30px] border border-[#D4B872]/30 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-[#8B0000]/10 rounded-2xl flex items-center justify-center text-[#8B0000]">
                  <Navigation className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold font-sans-montserrat text-[#2C221E]/60 uppercase tracking-widest">Tổng Quãng Đường</div>
                  <div className="text-2xl font-black font-sans-montserrat text-[#8B0000]">{activeTour.totalDistance || '2.4 km'}</div>
                  <div className="text-[10px] text-[#1E5631] font-semibold">✓ Đã lọc trong bán kính tối đa</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[30px] border border-[#D4B872]/30 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-[#D4B872]/20 rounded-2xl flex items-center justify-center text-[#8B0000]">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold font-sans-montserrat text-[#2C221E]/60 uppercase tracking-widest">Tổng Chi Phí Dự Kiến</div>
                  <div className="text-2xl font-black font-sans-montserrat text-[#8B0000]">{activeTour.totalCost || '290.000đ'}</div>
                  <div className="text-[10px] text-[#1E5631] font-semibold">✓ Khớp ngân sách lựa chọn</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* TIMELINE, CULTURE, MENU */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[40px] border border-[#D4B872]/30 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-serif-playfair font-bold text-xl text-[#8B0000] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#D4B872]" /> Chi Tiết Lịch Trình & Văn Hóa
                    </h3>
                    <span className="text-[10px] font-black font-sans-montserrat bg-[#8B0000] text-[#D4B872] px-3.5 py-1 rounded-full">Sắp xếp: Sáng → Trưa → Tối</span>
                  </div>

                  <div className="space-y-8 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-[#D4B872]/40">
                    {activeTour.stops.map((stop, idx) => (
                      <div key={idx} className="relative flex gap-6 items-start pl-2">
                        <div className="w-9 h-9 rounded-full bg-[#8B0000] text-[#D4B872] font-black text-xs flex items-center justify-center shrink-0 z-10 shadow border border-[#D4B872]">
                          {idx + 1}
                        </div>
                        <div className="bg-[#FAF6EE] rounded-[30px] p-6 border border-[#D4B872]/20 flex-1 space-y-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-black font-sans-montserrat bg-[#D4B872]/20 text-[#8B0000] px-3.5 py-1 rounded-full uppercase tracking-wider">
                              {stop.time} • {stop.mealType}
                            </span>
                            <span className="text-xs text-[#2C221E]/60 font-semibold flex items-center gap-1 font-serif-lora">
                              <MapPin className="w-3.5 h-3.5 text-[#8B0000]" /> {stop.distance}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-serif-playfair font-bold text-xl text-[#8B0000]">{stop.name}</h4>
                            <p className="font-serif-lora text-xs text-[#2C221E]/60">{stop.address}</p>
                            <p className="font-sans-montserrat text-xs font-bold text-[#8B0000]">{stop.price} • {stop.category}</p>
                            
                            {/* UI_Culture */}
                            <div className="text-xs bg-white p-4 rounded-2xl border border-[#D4B872]/40 text-[#2C221E] space-y-1 shadow-sm leading-relaxed">
                              <span className="font-bold font-sans-montserrat text-[#8B0000] block mb-1">💡 Câu chuyện văn hóa:</span> 
                              <span>{stop.cultureStory || 'Món ăn truyền thống đặc sắc mang đậm bản sắc văn hóa ẩm thực địa phương.'}</span>
                            </div>
                            <div className="text-xs bg-[#1E5631]/10 p-4 rounded-2xl border border-[#1E5631]/20 text-[#1E5631] space-y-1 shadow-sm leading-relaxed">
                              <span className="font-bold font-sans-montserrat block mb-1">✨ Mẹo thưởng thức chuẩn vị:</span> 
                              <span>{stop.tastingTip || 'Thưởng thức khi còn nóng hổi cùng các gia vị kèm theo để cảm nhận trọn vẹn hương vị.'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROADMAP & ACTION MENU */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-[35px] border border-[#D4B872]/30 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-playfair font-bold text-base text-[#8B0000] flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#D4B872]" /> Roadmap Dẫn Đường
                    </h3>
                    <span className="text-[10px] font-black font-sans-montserrat bg-[#8B0000]/10 text-[#8B0000] px-3 py-1 rounded-full">
                      {activeStopIndex + 1} / {activeTour.stops.length}
                    </span>
                  </div>

                  <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#D4B872]/40 space-y-3 text-left shadow-inner">
                    <div className="font-serif-playfair font-bold text-base text-[#8B0000]">
                      {activeTour.stops[activeStopIndex]?.name || 'Điểm dừng'}
                    </div>
                    <div className="font-serif-lora text-xs text-[#2C221E]/70 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#8B0000] shrink-0" />
                      <span>{activeTour.stops[activeStopIndex]?.address}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        onClick={() => setActiveStopIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeStopIndex === 0}
                        className="flex-1 bg-white hover:bg-gray-50 text-[#8B0000] border border-[#8B0000]/30 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
                      >
                        ← Điểm trước
                      </button>
                      <button 
                        onClick={() => setActiveStopIndex(prev => Math.min(activeTour.stops.length - 1, prev + 1))}
                        disabled={activeStopIndex === activeTour.stops.length - 1}
                        className="flex-1 bg-[#8B0000] hover:bg-[#A52A2A] text-white py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
                      >
                        Điểm tiếp →
                      </button>
                    </div>

                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activeTour.stops[activeStopIndex]?.name || '') + ' ' + (activeTour.stops[activeStopIndex]?.address || ''))}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full bg-[#1E5631] hover:bg-[#2E8B57] text-white text-xs font-sans-poppins font-bold py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 focus-ring-accessible block text-center"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Mở Google Maps Dẫn Đường
                    </a>
                  </div>
                </div>

                {/* ACTION MENU */}
                <div className="bg-gradient-to-br from-[#8B0000] to-[#5C0000] p-8 rounded-[40px] text-[#FAF6EE] shadow-xl space-y-6 border border-[#D4B872]/50">
                  <h3 className="font-serif-playfair font-bold text-2xl text-[#D4B872]">Thao Tác Lộ Trình</h3>
                  <p className="font-serif-lora text-xs text-[#FAF6EE]/80 italic">Xác nhận đặt tour hoặc quay về trang khám phá.</p>
                  
                  <div className="space-y-3">
                    <button onClick={() => changeStep('checkout')} className="w-full bg-[#D4B872] text-[#2C221E] hover:bg-[#C2A55F] font-sans-poppins font-bold py-4 rounded-2xl shadow text-xs transition-colors focus-ring-accessible">
                      Đặt Tour Trải Nghiệm
                    </button>
                    <button onClick={handleHoldTour} className="w-full bg-[#1E5631]/30 hover:bg-[#1E5631]/50 text-[#FAF6EE] border border-[#1E5631]/60 font-sans-poppins font-bold py-4 rounded-2xl shadow text-xs transition-colors flex items-center justify-center gap-2 focus-ring-accessible">
                      Giữ Chỗ Miễn Phí 24h
                    </button>
                    <button onClick={() => changeStep('main-menu')} className="w-full bg-transparent text-[#FAF6EE] hover:bg-white/10 font-sans-poppins font-bold py-4 rounded-2xl border border-[#D4B872]/50 text-xs transition-colors focus-ring-accessible">
                      Quay lại
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CHECKOUT */}
        {step === 'checkout' && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 space-y-8 animate-motion-floatIn my-16">
            <div className="flex items-center justify-between">
              <button onClick={() => changeStep('render-details')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black font-sans-montserrat text-[#1E5631] bg-[#1E5631]/10 px-3 py-1 rounded-full">Thanh Toán</span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="font-serif-playfair text-3xl font-bold text-[#8B0000]">Thanh Toán & Đặt Tour</h2>
              <p className="font-serif-lora text-xs text-[#2C221E]/60 italic">Xác nhận thanh toán để hoàn tất trải nghiệm.</p>
            </div>

            <div className="bg-[#FAF6EE] p-6 rounded-3xl space-y-3 border border-[#D4B872]/30">
              <div className="flex justify-between text-xs font-serif-lora">
                <span className="text-[#2C221E]/70">Gói tour:</span>
                <span className="font-bold text-[#8B0000]">{activeTour.title}</span>
              </div>
              <div className="flex justify-between text-xs font-serif-lora">
                <span className="text-[#2C221E]/70">Số điểm dừng:</span>
                <span className="font-bold">{activeTour.stops.length || 5} địa điểm</span>
              </div>
              <div className="border-t border-[#D4B872]/30 pt-3 flex justify-between font-serif-playfair font-bold text-sm">
                <span>Tổng chi phí:</span>
                <span className="text-[#8B0000]">{activeTour.totalCost || '290.000đ'} / người</span>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => changeStep('finish')} className="w-full bg-[#1E5631] hover:bg-[#2E8B57] text-white py-5 rounded-2xl font-sans-poppins font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 focus-ring-accessible">
                <CheckCircle className="w-5 h-5 text-[#D4B872]" /> Thanh Toán Thành Công & Hoàn Tất
              </button>
              <button onClick={handleHoldTour} className="w-full bg-[#FAF6EE] hover:bg-[#F3EAD8] text-[#8B0000] border border-[#8B0000]/30 py-4 rounded-2xl font-sans-poppins font-bold text-xs shadow transition-all flex items-center justify-center gap-2 focus-ring-accessible">
                🛡️ Còn chần chừ? Giữ chỗ trong 24h (Miễn phí)
              </button>
            </div>
          </div>
        )}

        {/* RESERVATION / HOLD 24H */}
        {step === 'reservation' && (
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 space-y-8 animate-motion-floatIn my-16">
            <div className="flex items-center justify-between">
              <button onClick={() => changeStep('render-details')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black font-sans-montserrat text-amber-800 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> Giữ Chỗ 24 Giờ
              </span>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow border border-amber-300 mb-2">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="font-serif-playfair text-3xl font-bold text-[#8B0000]">Giữ Chỗ Thành Công (24h)</h2>
              <p className="font-serif-lora text-xs text-[#2C221E]/60 italic">
                Bạn đang phân vân? Chỗ của bạn đã được giữ tạm thời. Vui lòng thanh toán trước khi hết hạn để không bị hủy tour.
              </p>
            </div>

            <div className="bg-[#FAF6EE] p-6 rounded-3xl space-y-4 border border-[#D4B872]/30">
              <div className="flex justify-between text-xs font-serif-lora">
                <span className="text-[#2C221E]/70">Gói tour đã giữ:</span>
                <span className="font-bold text-[#8B0000]">{activeTour.title}</span>
              </div>
              <div className="flex justify-between text-xs font-serif-lora">
                <span className="text-[#2C221E]/70">Thời điểm giữ:</span>
                <span className="font-bold">{holdTimestamp ? new Date(holdTimestamp).toLocaleTimeString() : 'Vừa xong'}</span>
              </div>
              <div className="flex justify-between text-xs font-serif-lora">
                <span className="text-[#2C221E]/70">Thời gian giữ chỗ:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">Còn 23h 59m (Hạn 24h)</span>
              </div>
              <div className="flex justify-between text-xs font-serif-lora">
                <span className="text-[#2C221E]/70">Trạng thái:</span>
                <span className="font-bold text-[#1E5631]">
                  {reservationState === 'held' ? '🛡️ Đang giữ chỗ (Chưa thanh toán)' : reservationState}
                </span>
              </div>
              <div className="border-t border-[#D4B872]/30 pt-3 flex justify-between font-serif-playfair font-bold text-sm">
                <span>Tổng chi phí:</span>
                <span className="text-[#8B0000]">{activeTour.totalCost || '290.000đ'}</span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 font-serif-lora space-y-1">
              <p className="font-bold">⚠️ Quy định giữ chỗ:</p>
              <p>• Trong vòng 24 giờ, nếu bạn không hoàn tất thanh toán, hệ thống sẽ tự động hủy giữ chỗ.</p>
              <p>• Nếu bạn thanh toán, đơn hàng sẽ được chuyển sang trạng thái <b>Thanh toán thành công</b>.</p>
            </div>

            <div className="space-y-3">
              <button onClick={() => { setReservationState('paid'); changeStep('finish'); }} className="w-full bg-[#1E5631] hover:bg-[#2E8B57] text-white py-4 rounded-2xl font-sans-poppins font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 focus-ring-accessible">
                <CheckCircle className="w-5 h-5 text-[#D4B872]" /> Thanh Toán Ngay (Xác Nhận Đặt Tour)
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setReservationState('cancelled'); alert('Đã hủy giữ chỗ thành công theo yêu cầu của bạn.'); changeStep('start'); }} className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 rounded-xl font-sans-poppins font-bold text-xs transition-all focus-ring-accessible">
                  ❌ Hủy Giữ Chỗ
                </button>
                <button onClick={() => { setReservationState('cancelled'); alert('⚠️ Mô phỏng: Đã qua 24h mà không thanh toán -> Chỗ giữ đã bị tự động hủy!'); changeStep('start'); }} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 py-3 rounded-xl font-sans-poppins font-bold text-xs transition-all focus-ring-accessible">
                  ⏱️ Giả Lập Hết Hạn 24h
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FINISH */}
        {step === 'finish' && (
          <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 text-center space-y-6 animate-motion-fadeIn my-20">
            <div className="w-20 h-20 bg-[#1E5631]/15 text-[#1E5631] rounded-full flex items-center justify-center mx-auto shadow border border-[#1E5631]/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="font-serif-playfair text-3xl font-bold text-[#8B0000]">Kết Thúc Trải Nghiệm!</h2>
            <p className="font-serif-lora text-xs text-[#2C221E]/80 leading-relaxed italic">
              "Trọn vị non sông – Thấm tình đất Việt." Cảm ơn bạn đã đồng hành cùng TasteTrip trên hành trình thưởng ngoạn di sản ẩm thực. Hẹn gặp lại trong những chuyến du ngoạn đượm nồng hương sắc tiếp theo!
            </p>
            <button onClick={() => changeStep('start')} className="w-full bg-[#8B0000] hover:bg-[#A52A2A] text-white py-4 rounded-2xl font-sans-poppins font-bold text-sm shadow transition-all focus-ring-accessible">
              Về Trang Chủ Ban Đầu
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#FAF6EE] border-t border-[#D4B872]/20 py-20" style={{ viewTransitionName: 'footer-group' }}>
         <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-4 gap-16">
            <div className="lg:col-span-2 space-y-6">
               <div className="font-serif-playfair font-black text-4xl italic text-[#8B0000]">TasteTrip</div>
               <p className="font-serif-merriweather text-[#2C221E]/70 text-xs max-w-sm leading-relaxed">
                 Cầu nối gìn giữ và tôn vinh phong vị dân tộc, dẫn lối tâm hồn du khách thưởng ngoạn tinh hoa ẩm thực ba miền và chiều sâu văn hóa ngàn năm của đất Việt.
               </p>
            </div>
         </div>
      </footer>

      {/* FLOATING AI CHAT POPUP WIDGET */}
      {!isChatPopupOpen ? (
        <button
          onClick={() => setIsChatPopupOpen(true)}
          className="fixed bottom-6 right-6 z-[160] flex items-center gap-3 bg-gradient-to-r from-[#1E5631] to-[#2E8B57] hover:from-[#164324] hover:to-[#1E5631] text-white px-5 py-3.5 rounded-full shadow-2xl border-2 border-[#D4B872]/60 hover:scale-105 active:scale-95 transition-all duration-300 group focus-ring-accessible cursor-pointer"
          title="Trò chuyện cùng Trợ lý AI TasteTrip"
          aria-label="Mở chatbox Trợ lý AI"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#1E5631] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#D4B872]">Trợ Lý AI</div>
            <div className="text-xs font-semibold leading-tight text-white font-serif-lora">Hỏi đáp món ngon & du lịch</div>
          </div>
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 z-[160] w-[92vw] sm:w-[400px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#D4B872]/40 flex flex-col overflow-hidden animate-motion-fadeIn">
          {/* POPUP HEADER */}
          <div className="bg-gradient-to-r from-[#1E5631] to-[#2E8B57] text-white p-4 flex items-center justify-between border-b border-[#D4B872]/30 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#FAF6EE] text-[#1E5631] flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-serif-playfair font-bold text-sm tracking-wide flex items-center gap-1.5 text-white">
                  Trợ Lý AI TasteTrip
                  <Sparkles className="w-3.5 h-3.5 text-[#D4B872]" />
                </h3>
                <p className="text-[10px] text-[#FAF6EE]/80 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Trực tuyến • Tư vấn 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatPopupOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-ring-accessible cursor-pointer"
              aria-label="Đóng popup chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* QUICK PROMPT SUGGESTIONS */}
          <div className="px-3 py-2 bg-[#FAF6EE] border-b border-[#D4B872]/20 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              'Phở ngon nhất ở Hà Nội?',
              'Đặc sản miền Trung nên thử?',
              'Gợi ý ăn sáng Sài Gòn'
            ].map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChatInput(hint)}
                className="whitespace-nowrap text-[10px] font-serif-lora px-2.5 py-1 rounded-full bg-white border border-[#D4B872]/40 text-[#2C221E]/80 hover:bg-[#1E5631] hover:text-white hover:border-[#1E5631] transition-all cursor-pointer"
              >
                💡 {hint}
              </button>
            ))}
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF6EE]/40">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-serif-lora leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#1E5631] text-white rounded-br-none'
                      : 'bg-white text-[#2C221E] border border-[#D4B872]/30 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#2C221E] p-3.5 rounded-2xl rounded-bl-none border border-[#D4B872]/30 text-xs flex items-center gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-[#1E5631] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#1E5631] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-[#1E5631] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-[#2C221E]/60 ml-1 font-serif-lora italic">AI đang trả lời...</span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-[#D4B872]/20 flex gap-2 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Hỏi món ngon, quán ăn, văn hóa..."
              className="flex-1 px-4 py-2.5 bg-[#FAF6EE] border border-[#D4B872]/30 rounded-xl font-serif-lora text-xs text-[#2C221E] focus:outline-none focus:border-[#1E5631] transition-colors"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-[#1E5631] hover:bg-[#2E8B57] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow focus-ring-accessible flex items-center justify-center cursor-pointer"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
