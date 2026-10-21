import { useState, useEffect, useRef } from 'react';
import { FOOD_ITEMS } from './lib/foodData';
import type { FoodItem } from './lib/foodData';
import { sendChatMessage, generateItinerary, createBookingRequest, getAdminBookings, updateAdminBooking, lookupCustomerBooking, findCustomerBookingsByPhone, reportCustomerPayment, getPartnerVouchers, getAdminVouchers, getAdminDatabaseOverview, getAdminAffiliateClickReport, logAffiliateClick, createSharedItinerary, getSharedItinerary, createAdminVoucher, setAdminVoucherActive } from './lib/ai-api';
import type { AdminDatabaseOverview, AffiliateClickReportRow, BookingRecord, BookingStatus, CustomerBookingSummary, CustomerBookingView, PartnerVoucher, PartnerVoucherInput, SharedItinerary } from './lib/ai-api';
import { getPartnerCategoryUrl, isActiveAffiliateLink, PARTNER_DESTINATION_NAMES, PARTNER_PUBLIC_WEBSITES, PROVINCE_PARTNER_LINKS } from './data/partner-links';
import type { AffiliateLink } from './data/partner-links';
import { CURRENT_PROVINCES, LEGACY_PROVINCE_TO_CURRENT } from './data/provinces';
import { TOUR_CONTENT_OVERRIDES } from './lib/tour-content';
import { 
  MapPin, Utensils, Bot, Clock, Sparkles, Navigation, 
  CheckCircle, ChevronRight, ArrowLeft, X, DollarSign, Clock3, BookOpen, Camera, Send, Globe,
  Bookmark, Share2, Printer, MapPinned, Compass
} from 'lucide-react';

type ChatLine = { kind: 'heading' | 'bullet' | 'number' | 'paragraph'; text: string };

const PENDING_BOOKING_STORAGE_KEY = 'tastetrip_pending_booking_v1';

function readPendingBookingRecovery(): { booking: CustomerBookingView; phone: string; savedAt: number } | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PENDING_BOOKING_STORAGE_KEY) || 'null');
    if (!saved?.booking?.id || typeof saved.phone !== 'string' || Date.now() - saved.savedAt > 30 * 60 * 1000
      || saved.booking.paymentStatus === 'refunded') {
      sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
      return null;
    }
    return saved as { booking: CustomerBookingView; phone: string; savedAt: number };
  } catch {
    return null;
  }
}

function formatChatLines(text: string): ChatLine[] {
  const normalized = text
    .replace(/\r\n?/g, '\n')
    // Split list items and headings even when the model puts them on one line.
    .replace(/\s+(?=(?:#{1,6}\s|[-*•]\s|\d+[.)]\s))/g, '\n');

  return normalized.split('\n').map((rawLine) => {
    const line = rawLine.trim();
    if (!line) return { kind: 'paragraph', text: '' };

    const heading = line.match(/^#{1,6}\s*(.*)$/);
    if (heading) return { kind: 'heading', text: heading[1] };

    const bullet = line.match(/^(?:[-*•])\s+(.*)$/);
    if (bullet) return { kind: 'bullet', text: bullet[1] };

    const number = line.match(/^(\d+[.)])\s+(.*)$/);
    if (number) return { kind: 'number', text: `${number[1]} ${number[2]}` };

    return { kind: 'paragraph', text: line };
  });
}

function renderChatText(text: string) {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|_[^_]+_)/g).map((part, index) => {
    const isBold = (part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'));
    const isItalic = !isBold && ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_')));
    if (isBold) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (isItalic) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

interface StopItem {
  day?: number;
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
  dayCount?: number;
  serverItineraryId?: string;
  title: string;
  desc: string;
  image: string;
  region: string;
  stops: StopItem[];
  totalDistance?: string;
  totalCost?: string;
  status?: string;
  partnerProvinceId?: string;
  savedId?: string;
  foodCostKnownVnd?: number;
  foodCostPricedStops?: number;
}

type PartnerPlacement = 'primary_tour' | 'hotel' | 'transport' | 'guided_tour' | 'assistant_chat';
type ChatPartnerLink = AffiliateLink & { provinceId: string; placement: PartnerPlacement };
type ChatMessage = { role: 'user' | 'model'; text: string; partnerLinks?: ChatPartnerLink[] };

const normalizePlaceText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

const parsePriceNum = (priceStr?: string): number => {
  if (!priceStr) return 0;
  const firstPart = priceStr.split(/[-–]/)[0];
  const num = parseInt(firstPart.replace(/\D/g, ''), 10);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

function resolvePartnerProvince(value: string): string | undefined {
  const normalized = normalizePlaceText(value);
  if (!normalized) return undefined;
  const aliases: Record<string, string[]> = {
    tphcm: ['sai gon', 'tp hcm', 'hcm', 'ho chi minh', 'thanh pho ho chi minh'],
  };
  const aliasMatch = Object.entries(aliases).find(([, names]) => names.some((name) => normalized.includes(name)));
  if (aliasMatch) return aliasMatch[0];
  const provinceNameMatch = CURRENT_PROVINCES
    .flatMap((province) => [province.name, ...province.legacyNames].map((name) => ({ id: province.id, name: normalizePlaceText(name) })))
    .sort((a, b) => b.name.length - a.name.length)
    .find(({ name }) => name.length >= 4 && normalized.includes(name));
  if (provinceNameMatch) return provinceNameMatch.id;
  const idMatch = Object.keys(LEGACY_PROVINCE_TO_CURRENT).sort((a, b) => b.length - a.length)
    .find((id) => normalized.includes(normalizePlaceText(id)));
  if (idMatch) return LEGACY_PROVINCE_TO_CURRENT[idMatch];
  const match = THEMED_TOURS.find((tour) => {
    const title = normalizePlaceText(tour.title);
    const candidates = [title, title.replace(/tron ven|trong ngay|food ?tour/g, '').trim()];
    return candidates.some((candidate) => candidate.length >= 4 && normalized.includes(candidate));
  });
  return match?.id;
}

function readSharedHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#tour=')) return { kind: 'tour' as const, id: decodeURIComponent(hash.slice(6)) };
  if (hash.startsWith('#shared=')) return { kind: 'shared' as const, id: decodeURIComponent(hash.slice(8)) };
  return null;
}

const BASE_THEMED_TOURS: ThemeTour[] = [
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
      { time: '08:00', mealType: 'Sáng', name: 'Bún tôm', address: 'Chợ San Thàng, Phường Tân Phong (ngay mặt đường QL4D), TP. Lai Châu.', image: '/picture/provinces/lai-chau.jpg', price: '40.000đ', priceNum: 40000, category: 'Bình dân', cultureStory: 'Bún tôm Lai Châu là nét chấm phá ẩm thực độc đáo vùng cao Tây Bắc, thể hiện sự giao thoa giữa sản vật tôm suối tự nhiên ngọt thanh và các gia vị đại ngàn như mắc khén, hạt dổi. Món ăn chứa đựng triết lý cân bằng âm dương giúp làm ấm cơ thể trong khí hậu se lạnh, đồng thời gắn liền với nét đẹp đời sống sinh hoạt nơi chợ phiên vùng cao.', tastingTip: 'Húp thử ngụm nước dùng ngọt thanh nguyên bản trước khi trộn đều, sau đó ăn kèm các loại rau rừng tươi như rau dớn hay hoa chuối thái mỏng. Hãy chấm tôm suối cùng muối giã mắc khén ớt nướng và thêm chút măng chua ngâm tỏi ớt để món ăn bùng nổ hương vị chua cay tê nhẹ chuẩn nét Tây Bắc.', englishMenu: 'Northern Style Shrimp Vermicelli.', distance: '0.0 km' },
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
      { time: '15:30', mealType: 'Chiều', name: 'Bánh khọt - Cô Hai Thảo', address: 'Đường Nguyễn Trường Tộ, Vũng Tàu', image: '/picture/provinces/ba-ria-vung-tau.jpg', price: '50.000đ', priceNum: 50000, category: 'Ăn vặt', cultureStory: 'Bánh khọt tôm tươi giòn rụm đổ khuôn dầu ăn kèm rau sống mỡ hành.', tastingTip: 'Cuốn bánh khọt với rau cải xanh và chấm nước mắm ngọt.', englishMenu: 'Vung Tau Mini Crispy Shrimp Pancakes.', distance: '1.2 km' },
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

const LEGACY_THEMED_TOURS = new Map(BASE_THEMED_TOURS.map((tour) => [tour.id, tour]));
const THEMED_TOURS: ThemeTour[] = CURRENT_PROVINCES.flatMap((province) => {
  const sourceTour = LEGACY_THEMED_TOURS.get(province.sourceTourId);
  if (!sourceTour) return [];
  const merged = province.id !== province.sourceTourId;
  return [{
    ...sourceTour,
    id: province.id,
    title: merged ? `${province.name} - ${province.itineraryCenter} Food Tour` : sourceTour.title,
    desc: merged ? `Lịch trình mẫu tại ${province.itineraryCenter}. ${sourceTour.desc}` : sourceTour.desc,
    stops: sourceTour.stops.map((stop, index) => ({
      ...stop,
      ...TOUR_CONTENT_OVERRIDES[sourceTour.id]?.[index],
    })),
  }];
});


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
  const initialSharedHash = readSharedHash();
  const initialLinkedTour = initialSharedHash?.kind === 'tour'
    ? THEMED_TOURS.find((tour) => tour.id === (LEGACY_PROVINCE_TO_CURRENT[initialSharedHash.id] || initialSharedHash.id))
    : undefined;
  const [pendingBookingRecovery, setPendingBookingRecovery] = useState(readPendingBookingRecovery);
  const [step, setStep] = useState<
    'start' | 'main-menu' | 'custom-tour' | 'themed-tour' | 'ai-chat' | 'render-details' | 'checkout' | 'payment' | 'admin'
  >(() => pendingBookingRecovery ? 'checkout' : window.location.hash === '#admin' ? 'admin' : initialLinkedTour ? 'render-details' : 'start');

  const [bookingDate, setBookingDate] = useState(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()));
  const [bookingGuests, setBookingGuests] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingRecoveryNotice, setBookingRecoveryNotice] = useState('');
  const bookingErrorRef = useRef<HTMLParagraphElement>(null);
  const bookingPaymentRef = useRef<HTMLElement>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const bookingSubmitLockRef = useRef(false);
  const [paymentLookupId, setPaymentLookupId] = useState(pendingBookingRecovery?.booking.id || '');
  const [paymentLookupPhone, setPaymentLookupPhone] = useState(pendingBookingRecovery?.phone || '');
  const [customerBookingMatches, setCustomerBookingMatches] = useState<CustomerBookingSummary[]>([]);
  const [customerBooking, setCustomerBooking] = useState<CustomerBookingView | null>(pendingBookingRecovery?.booking || null);
  const [paidBookingConfirmation, setPaidBookingConfirmation] = useState<CustomerBookingView | null>(null);
  const [paymentLookupError, setPaymentLookupError] = useState('');
  const [paymentLookupLoading, setPaymentLookupLoading] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminBookings, setAdminBookings] = useState<BookingRecord[]>([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminNotice, setAdminNotice] = useState('');
  const [adminVouchers, setAdminVouchers] = useState<PartnerVoucher[]>([]);
  const [adminDatabaseOverview, setAdminDatabaseOverview] = useState<AdminDatabaseOverview | null>(null);
  const [affiliateClickReport, setAffiliateClickReport] = useState<AffiliateClickReportRow[]>([]);
  const [partnerVouchers, setPartnerVouchers] = useState<PartnerVoucher[]>([]);
  const [voucherNotice, setVoucherNotice] = useState('');
  const [voucherSubmitting, setVoucherSubmitting] = useState(false);
  const [voucherDraft, setVoucherDraft] = useState<PartnerVoucherInput>(() => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    return { tourId: '*', stopIndex: null, restaurantName: '', title: '', benefit: '', code: '', terms: '', validFrom: today, validTo: today };
  });
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
  const [savedTourIds, setSavedTourIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tastetrip_saved_tours') || '[]');
      const currentIds = new Set(CURRENT_PROVINCES.map((province) => province.id));
      return Array.isArray(saved)
        ? [...new Set(saved.filter((id): id is string => typeof id === 'string').map((id) => LEGACY_PROVINCE_TO_CURRENT[id] || id).filter((id) => currentIds.has(id)))]
        : [];
    } catch {
      return [];
    }
  });
  const [savedCustomTours, setSavedCustomTours] = useState<ThemeTour[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tastetrip_saved_ai_itineraries_v1') || '[]');
      return Array.isArray(saved) ? saved.filter((tour) => tour && typeof tour.savedId === 'string' && Array.isArray(tour.stops)) : [];
    } catch { return []; }
  });
  const [showSavedTours, setShowSavedTours] = useState(false);
  const [tourActionNotice, setTourActionNotice] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [sharedItineraryLoading, setSharedItineraryLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tastetrip_saved_tours', JSON.stringify(savedTourIds));
    } catch {
      setTourActionNotice('Trình duyệt không cho phép lưu tour trên thiết bị này.');
    }
  }, [savedTourIds]);

  useEffect(() => {
    try { localStorage.setItem('tastetrip_saved_ai_itineraries_v1', JSON.stringify(savedCustomTours)); }
    catch { setTourActionNotice('Trình duyệt không cho phép lưu lịch trình trên thiết bị này.'); }
  }, [savedCustomTours]);

  const toggleSavedTour = (tourId: string) => {
    setSavedTourIds((current) => current.includes(tourId)
      ? current.filter((id) => id !== tourId)
      : [...current, tourId]);
  };

  const getFullRouteUrl = (tour: ThemeTour) => {
    const places = tour.stops.map((stop) => `${stop.name} ${stop.address}`);
    const destination = places.pop() || tour.title;
    const waypoints = places.length ? `&waypoints=${encodeURIComponent(places.join('|'))}` : '';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${waypoints}&travelmode=walking`;
  };

  const shareActiveTour = async () => {
    setShareLoading(true);
    try {
      let shareHash: string;
      if (activeTour.id === 'custom-tour-result') {
        const { shareId } = await createSharedItinerary({ ...activeTour } as SharedItinerary);
        shareHash = `#shared=${shareId}`;
      } else shareHash = `#tour=${encodeURIComponent(activeTour.id)}`;
      const shareUrl = `${window.location.origin}${window.location.pathname}${shareHash}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setTourActionNotice('Đã sao chép liên kết mở lịch trình này.');
      } catch {
        if (navigator.share) await navigator.share({ title: activeTour.title, url: shareUrl });
        else throw new Error('clipboard-unavailable');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') setTourActionNotice('Chưa tạo được liên kết chia sẻ. Hãy kiểm tra kết nối server rồi thử lại.');
    } finally { setShareLoading(false); }
  };

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (bookingSubmitLockRef.current) return;
    bookingSubmitLockRef.current = true;
    setBookingError('');
    setBookingSubmitting(true);
    try {
      const parsedFoodCost = activeTour.totalCost ? parsePriceNum(activeTour.totalCost) : NaN;
      const result = await createBookingRequest({
        tourId: activeTour.id,
        itineraryId: checkoutProduct === 'unlock' ? activeTour.serverItineraryId : undefined,
        tourTitle: checkoutProduct === 'unlock'
          ? `Mở khóa lịch trình: ${activeTour.title}`.slice(0, 180)
          : checkoutProduct === 'buddy'
            ? `Yêu cầu Local Buddy: ${activeTour.title}`.slice(0, 180)
            : activeTour.title,
        kind: checkoutProduct === 'buddy' ? 'guided' : 'self-guided',
        date: bookingDate,
        guests: checkoutProduct === 'unlock' || checkoutProduct === 'buddy' ? 1 : bookingGuests,
        customerName,
        phone: customerPhone,
        email: '',
        notes: checkoutProduct === 'unlock'
          ? 'Thanh toán mở khóa toàn bộ lịch trình nhiều ngày TasteTrip.'
          : checkoutProduct === 'buddy'
            ? 'Khách muốn Local Buddy đồng hành Ngày 1. Mức tham khảo 150.000đ/buổi; cần TasteTrip xác nhận người dẫn và báo giá trước thanh toán.'
            : '',
        estimatedFoodCostPerPerson: Number.isFinite(parsedFoodCost)
          ? checkoutProduct === 'unlock' ? 49000 : parsedFoodCost
          : activeTour.stops.reduce((sum, stop) => sum + (stop.priceNum || 0), 0),
        itinerary: checkoutProduct === 'unlock' ? [] : activeTour.stops.map(({ day, time, mealType, name, address, image, price, category, cultureStory, tastingTip, englishMenu, distance }) => ({
          day, time, mealType, name, address, image, price, category, cultureStory, tastingTip, englishMenu, distance,
        })),
      });
      setPaymentLookupId(result.bookingId);
      setPaymentLookupPhone(customerPhone);
      setCustomerBooking(result.booking);
      setSelectedItineraryDay(1);
      const recovery = { booking: result.booking, phone: customerPhone, savedAt: Date.now() };
      try {
        sessionStorage.setItem(PENDING_BOOKING_STORAGE_KEY, JSON.stringify(recovery));
        setPendingBookingRecovery(recovery);
      } catch {
        // The in-memory QR remains available when session storage is disabled.
      }
      setBookingRecoveryNotice(result.reused
        ? checkoutProduct === 'buddy'
          ? 'Đã tìm thấy yêu cầu Local Buddy trước đó. Mình đã mở lại mã đơn để tránh gửi trùng.'
          : 'Đã tìm thấy yêu cầu giống hệt đang chờ thanh toán. Mình đã mở lại mã đơn và QR cũ để tránh tạo thêm đơn trùng.'
        : checkoutProduct === 'buddy'
          ? 'Đã gửi yêu cầu Local Buddy. TasteTrip sẽ xác nhận người dẫn và báo giá trước khi bạn thanh toán.'
          : 'Đơn đã được tạo. Giữ trang này mở để hoàn tất thanh toán.');
      setStep('checkout');
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Không gửi được yêu cầu đặt tour.');
      requestAnimationFrame(() => bookingErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    } finally {
      bookingSubmitLockRef.current = false;
      setBookingSubmitting(false);
    }
  };

  const handleCustomerBookingLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (paymentLookupLoading) return;
    setPaymentLookupLoading(true);
    setPaymentLookupError('');
    setCustomerBooking(null);
    setCustomerBookingMatches([]);
    try {
      const result = await findCustomerBookingsByPhone(paymentLookupPhone.trim());
      if (result.bookings.length === 0) {
        setPaymentLookupError('Không tìm thấy đơn nào với số điện thoại này. Hãy kiểm tra số đã dùng khi đặt tour.');
      } else if (result.bookings.length === 1) {
        const match = result.bookings[0];
        setCustomerBookingMatches(result.bookings);
        setPaymentLookupId(match.id);
        const bookingResult = await lookupCustomerBooking(match.id, paymentLookupPhone.trim());
        setCustomerBooking(bookingResult.booking);
      } else {
        setCustomerBookingMatches(result.bookings);
      }
    } catch (error) {
      setPaymentLookupError(error instanceof Error ? error.message : 'Không tra cứu được đơn hàng.');
    } finally {
      setPaymentLookupLoading(false);
    }
  };

  const handleSelectCustomerBooking = async (booking: CustomerBookingSummary) => {
    if (paymentLookupLoading) return;
    setPaymentLookupLoading(true);
    setPaymentLookupError('');
    try {
      const result = await lookupCustomerBooking(booking.id, paymentLookupPhone.trim());
      setPaymentLookupId(booking.id);
      setCustomerBooking(result.booking);
    } catch (error) {
      setPaymentLookupError(error instanceof Error ? error.message : 'Không mở được thông tin đơn hàng.');
    } finally {
      setPaymentLookupLoading(false);
    }
  };

  const handleCustomerPaymentReport = async () => {
    if (paymentLookupLoading) return;
    setPaymentLookupLoading(true);
    setPaymentLookupError('');
    try {
      const result = await reportCustomerPayment(paymentLookupId.trim(), paymentLookupPhone.trim());
      setCustomerBooking(result.booking);
      if (result.booking.paymentStatus === 'paid') {
        openPaidBookingItinerary(result.booking);
      }
    } catch (error) {
      setPaymentLookupError(error instanceof Error ? error.message : 'Không gửi được yêu cầu đối soát.');
    } finally {
      setPaymentLookupLoading(false);
    }
  };

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError('');
    setAdminNotice('');
    setAdminLoading(true);
    try {
      const [bookingResult, voucherResult, databaseResult, affiliateClickResult] = await Promise.all([
        getAdminBookings(adminToken.trim()),
        getAdminVouchers(adminToken.trim()),
        getAdminDatabaseOverview(adminToken.trim()),
        getAdminAffiliateClickReport(adminToken.trim()),
      ]);
      setAdminBookings(bookingResult.bookings);
      setAdminVouchers(voucherResult.vouchers);
      setAdminDatabaseOverview(databaseResult);
      setAffiliateClickReport(affiliateClickResult.clicks);
      setAdminLoggedIn(true);
    } catch (error) {
      setAdminLoggedIn(false);
      setAdminError(error instanceof Error ? error.message : 'Không đăng nhập được.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminRefresh = async () => {
    setAdminError('');
    setAdminLoading(true);
    try {
      const [bookingResult, voucherResult, databaseResult, affiliateClickResult] = await Promise.all([
        getAdminBookings(adminToken.trim()),
        getAdminVouchers(adminToken.trim()),
        getAdminDatabaseOverview(adminToken.trim()),
        getAdminAffiliateClickReport(adminToken.trim()),
      ]);
      setAdminBookings(bookingResult.bookings);
      setAdminVouchers(voucherResult.vouchers);
      setAdminDatabaseOverview(databaseResult);
      setAffiliateClickReport(affiliateClickResult.clicks);
    } catch (error) {
      setAdminLoggedIn(false);
      setAdminError(error instanceof Error ? error.message : 'Không tải được danh sách đơn.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateVoucher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError('');
    setAdminNotice('');
    setVoucherSubmitting(true);
    try {
      const result = await createAdminVoucher(adminToken.trim(), voucherDraft);
      setAdminVouchers((current) => [result.voucher, ...current]);
      setAdminNotice(`Đã thêm ưu đãi ${result.voucher.title}.`);
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
      setVoucherDraft({ tourId: '*', stopIndex: null, restaurantName: '', title: '', benefit: '', code: '', terms: '', validFrom: today, validTo: today });
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không lưu được voucher.');
    } finally {
      setVoucherSubmitting(false);
    }
  };

  const handleVoucherActiveChange = async (voucher: PartnerVoucher) => {
    setAdminError('');
    setAdminNotice('');
    try {
      const result = await setAdminVoucherActive(adminToken.trim(), voucher.id, !voucher.active);
      setAdminVouchers((current) => current.map((item) => item.id === voucher.id ? result.voucher : item));
      setAdminNotice(result.voucher.active ? 'Đã bật ưu đãi.' : 'Đã tạm ẩn ưu đãi.');
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không cập nhật được trạng thái voucher.');
    }
  };

  const handleAdminUpdate = async (booking: BookingRecord) => {
    setAdminError('');
    setAdminNotice('');
    try {
      const result = await updateAdminBooking(adminToken.trim(), booking.id, {
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        quotedTotalVnd: booking.quotedTotalVnd,
        adminNote: booking.adminNote,
        guideName: booking.guideName,
        guidePhone: booking.guidePhone,
      });
      setAdminBookings((current) => current.map((item) => item.id === booking.id ? result.booking : item));
      setAdminNotice(`Đã cập nhật đơn ${booking.id}.`);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không cập nhật được đơn.');
    }
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
    if (nextStep === 'checkout') {
      setCustomerBooking(null);
      setBookingError('');
      setBookingRecoveryNotice('');
      try {
        sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
      } catch {
        // Session recovery is optional; booking still works without storage access.
      }
      setPendingBookingRecovery(null);
    }
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

  useEffect(() => {
    if (step !== 'checkout' || !customerBooking) return;
    requestAnimationFrame(() => {
      bookingPaymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      bookingPaymentRef.current?.focus({ preventScroll: true });
    });
  }, [step, customerBooking]);

  const [locMode, setLocMode] = useState<'gps' | 'manual'>('manual');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Tùy Chỉnh (Chế độ 1)
  const [customLocation, setCustomLocation] = useState<string>('Phố cổ Hà Nội');
  const [customNeed, setCustomNeed] = useState<string>('Khám phá ẩm thực truyền thống & check-in');
  const [customTimeOption, setCustomTimeOption] = useState<string>('Cả ngày (8:00 - 20:00)');
  const [customDays, setCustomDays] = useState(1);
  const [customTimeManual, setCustomTimeManual] = useState<string>('');
  const [customBudgetVal, setCustomBudgetVal] = useState<number>(300000); // VNĐ
  const [customHobby, setCustomHobby] = useState<string>('Thích ăn phở, uống cà phê trứng và các món ăn vặt lâu đời');
  const [customRadius, setCustomRadius] = useState<number>(3); // km
  const [customLoading, setCustomLoading] = useState<boolean>(false);

  const [activeTour, setActiveTour] = useState<ThemeTour>(initialLinkedTour || THEMED_TOURS[0]);
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const [selectedItineraryDay, setSelectedItineraryDay] = useState(1);
  const [unlockedTourId, setUnlockedTourId] = useState('');
  const [checkoutProduct, setCheckoutProduct] = useState<'tour' | 'unlock' | 'buddy'>('tour');
  const activeCustomSaved = Boolean(activeTour.savedId && savedCustomTours.some((tour) => tour.savedId === activeTour.savedId));
  const toggleSaveActiveTour = () => {
    if (activeTour.id !== 'custom-tour-result') {
      toggleSavedTour(activeTour.id);
      return;
    }
    const savedId = activeTour.savedId || `ai-${crypto.randomUUID()}`;
    const nextTour = { ...activeTour, savedId };
    if (activeCustomSaved) {
      setSavedCustomTours((current) => current.filter((tour) => tour.savedId !== savedId));
      setTourActionNotice('Đã bỏ lịch trình AI khỏi danh sách đã lưu.');
    } else {
      setActiveTour(nextTour);
      setSavedCustomTours((current) => [nextTour, ...current.filter((tour) => tour.savedId !== savedId)]);
      setTourActionNotice('Đã lưu lịch trình AI trên trình duyệt này.');
    }
  };

  useEffect(() => {
    const hash = readSharedHash();
    if (hash?.kind !== 'shared' || pendingBookingRecovery) return;
    let cancelled = false;
    setSharedItineraryLoading(true);
    getSharedItinerary(hash.id).then(({ tour }) => {
      if (cancelled) return;
      setActiveTour(tour as ThemeTour);
      setActiveStopIndex(0);
      setSelectedItineraryDay(1);
      setStep('render-details');
    }).catch((error) => {
      if (!cancelled) {
        setTourActionNotice(error instanceof Error ? error.message : 'Không tải được lịch trình chia sẻ.');
        setStep('start');
      }
    }).finally(() => { if (!cancelled) setSharedItineraryLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const openPaidBookingItinerary = (booking: CustomerBookingView) => {
    const isUnlockPurchase = booking.tourTitle.startsWith('Mở khóa lịch trình: ');
    const dayToOpen = isUnlockPurchase ? selectedItineraryDay : 1;
    const savedTourId = LEGACY_PROVINCE_TO_CURRENT[booking.tourId] || booking.tourId;
    const savedTour = THEMED_TOURS.find((tour) => tour.id === savedTourId);
    const bookingStops = Array.isArray(booking.itinerary) ? booking.itinerary : [];
    const stops = bookingStops.length
      ? bookingStops.map((stop, index) => ({
        ...savedTour?.stops[index],
        ...stop,
        priceNum: parsePriceNum(stop.price) || savedTour?.stops[index]?.priceNum || 0,
      } as StopItem))
      : savedTour?.stops;
    if (!stops?.length) {
      setPaymentLookupError('Đơn này chưa lưu bản chi tiết lịch trình. Vui lòng liên hệ TasteTrip để nhận lại lịch trình.');
      return;
    }
    setActiveTour({
      ...(savedTour || THEMED_TOURS[0]),
      id: booking.tourId || savedTour?.id || 'paid-booking-tour',
      dayCount: Math.max(1, ...stops.map((stop) => stop.day || 1)),
      title: booking.tourTitle.replace(/^(Mở khóa lịch trình|Yêu cầu Local Buddy):\s*/, ''),
      desc: `Lịch trình đã thanh toán · Mã đơn ${booking.id}`,
      stops,
      totalCost: booking.quotedTotalVnd !== null
        ? `${Math.round(booking.quotedTotalVnd / Math.max(booking.guests, 1)).toLocaleString('vi-VN')}đ / người`
        : savedTour?.totalCost,
    });
    if (isUnlockPurchase) setUnlockedTourId(booking.tourId);
    setSelectedItineraryDay(dayToOpen);
    const firstStopForDay = stops.findIndex((stop) => (stop.day || 1) === dayToOpen);
    setActiveStopIndex(firstStopForDay < 0 ? 0 : firstStopForDay);
    setPaidBookingConfirmation(booking);
    setCustomerBooking(booking);
    try { sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY); } catch { /* Optional session recovery. */ }
    setPendingBookingRecovery(null);
    setStep('render-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if ((step !== 'checkout' && step !== 'payment') || !customerBooking) return;
    let checking = false;
    const checkPayment = async () => {
      if (checking) return;
      checking = true;
      try {
        const result = await lookupCustomerBooking(customerBooking.id, paymentLookupPhone);
        setCustomerBooking(result.booking);
        if (result.booking.paymentStatus === 'paid' && customerBookingMatches.length === 0) openPaidBookingItinerary(result.booking);
      } catch {
        // Keep the QR visible during brief network interruptions; the next poll retries.
      } finally {
        checking = false;
      }
    };
    if (customerBooking.paymentStatus === 'paid' && customerBookingMatches.length === 0) {
      openPaidBookingItinerary(customerBooking);
      return;
    }
    if (customerBooking.paymentStatus === 'paid') return;
    const timer = window.setInterval(checkPayment, 8000);
    return () => window.clearInterval(timer);
  }, [step, customerBooking?.id, customerBooking?.paymentStatus, customerBookingMatches.length, paymentLookupPhone]);

  useEffect(() => {
    if (step !== 'render-details') return;
    let cancelled = false;
    getPartnerVouchers(activeTour.id)
      .then(({ vouchers }) => { if (!cancelled) setPartnerVouchers(vouchers); })
      .catch(() => { if (!cancelled) setPartnerVouchers([]); });
    return () => { cancelled = true; };
  }, [step, activeTour.id]);

  const handleCopyVoucherCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setVoucherNotice(`Đã sao chép mã ${code}.`);
    } catch {
      setVoucherNotice('Không sao chép được mã. Bạn có thể chọn và sao chép trực tiếp.');
    }
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
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
          setLocMode('gps');
          setCustomLocation(locStr);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsDetecting(false);
          alert(error.code === error.PERMISSION_DENIED
            ? 'Bạn chưa cấp quyền vị trí. Hãy chọn “Tự nhập địa điểm” để tiếp tục.'
            : 'Chưa thể lấy vị trí GPS. Hãy thử lại hoặc chọn “Tự nhập địa điểm”.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setIsDetecting(false);
      alert('Trình duyệt này không hỗ trợ GPS. Hãy chọn “Tự nhập địa điểm” để tiếp tục.');
    }
  };

  const handleBuildCustomTour = async () => {
    const finalTime = customTimeManual.trim() || customTimeOption;
    const finalBudget = `${customBudgetVal.toLocaleString('vi-VN')}đ`;
    const requestedDays = customDays;
    
    setCustomLoading(true);
    const promptText = `Hãy thiết kế một lịch trình food tour chi tiết dựa trên các tiêu chí sau:
1. Vị trí khởi hành / Điểm đến: ${customLocation}
2. Nhu cầu / Mục đích chuyến đi: ${customNeed}
3. Thời gian: ${finalTime}
4. Số ngày: ${requestedDays} ngày. Chia lịch trình rõ theo ngày; mỗi điểm dừng phải có thuộc tính day là số nguyên từ 1 đến ${requestedDays}. Tạo ít nhất 4 điểm dừng cho mỗi ngày.
5. Ngân sách dự kiến: ${finalBudget} mỗi ngày
6. Sở thích ẩm thực: ${customHobby}
7. Bán kính di chuyển tối đa: ${customRadius} km

Hãy trả về lịch trình các điểm dừng ăn uống với tên quán thật, địa chỉ, thời gian, mô tả món ăn, mẹo thưởng thức và giá tiền. Cấu trúc JSON: { title, desc, duration, stops: [{ day, name, time, activity, address, desc, image, tip, cultureStory, tastingTip, englishMenu, price }] }. Không gộp nhiều ngày vào một ngày.`;

    try {
      const tour = await generateItinerary(promptText, requestedDays);
      if (tour && Array.isArray(tour.stops) && tour.stops.length > 0) {
        if (requestedDays > 1 && typeof tour.itineraryId !== 'string') {
          throw new Error('Server chưa lưu lịch trình an toàn để mở khóa. Vui lòng tạo lại tour.');
        }
        const generatedStops = tour.stops.map((stop: StopItem) => ({ ...stop, day: Number(stop.day) || 1 }));
        const partnerProvinceId = resolvePartnerProvince(customLocation);
        setActiveTour({
          ...tour,
          id: 'custom-tour-result',
          savedId: `ai-${tour.itineraryId || crypto.randomUUID()}`,
          partnerProvinceId,
          dayCount: requestedDays,
          serverItineraryId: tour.itineraryId,
          stops: generatedStops,
          title: tour.title || `Food Tour Tùy Chỉnh: "${customNeed}"`,
          desc: requestedDays > 1
            ? `Lịch trình ${requestedDays} ngày được AI thiết kế theo sở thích của bạn. Bạn có thể xem đầy đủ từng ngày.`
            : tour.desc || `Khởi hành: ${customLocation} | Thời gian: ${finalTime} | Ngân sách: ${finalBudget} | Bán kính: ${customRadius}km.`,
        });
        setSelectedItineraryDay(1);
        setUnlockedTourId('');
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
    if (requestedDays > 1) {
      setCustomLoading(false);
      alert('Chưa tạo được lịch trình nhiều ngày an toàn trên server. Vui lòng thử lại sau.');
      return;
    }
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
    const fallbackStops = result.stops.map((stop, index) => ({ ...stop, day: Math.min(requestedDays, Math.floor(index * requestedDays / result.stops.length) + 1) }));

    const partnerProvinceId = resolvePartnerProvince(customLocation);
    setActiveTour({
      id: 'custom-tour-result',
      savedId: `ai-${crypto.randomUUID()}`,
      partnerProvinceId,
      dayCount: 1,
      title: `Food Tour Tùy Chỉnh: "${customNeed}"`,
      desc: `Khởi hành: ${customLocation} | Thời gian: ${finalTime} | Ngân sách: ${finalBudget} | Bán kính tối đa: ${customRadius}km.`,
      image: '/picture/provinces/vinh-long.jpg',
      region: 'Việt Nam',
      stops: fallbackStops,
      totalDistance: result.totalDistance,
      totalCost: result.totalCost,
      status: result.status
    });
    setSelectedItineraryDay(1);
    setUnlockedTourId('');
    setActiveStopIndex(0);
    changeStep('render-details');
  };

  const [selectedRegion, setSelectedRegion] = useState<string>('Tất cả');
  const [searchProvince, setSearchProvince] = useState<string>('');

  const getTourEstimatedCost = (tour: ThemeTour) => tour.stops.reduce(
    (sum, stop) => sum + (stop.priceNum || Number(stop.price.replace(/\D/g, '')) || 0),
    0,
  );
  const getTourCostCoverage = (tour: ThemeTour) => tour.stops.filter(
    (stop) => (stop.priceNum || Number(stop.price.replace(/\D/g, '')) || 0) > 0,
  ).length;

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
    const province = CURRENT_PROVINCES.find((item) => item.id === tour.id);
    const normalizedSearch = normalizePlaceText(searchProvince);
    const matchSearch = !normalizedSearch || normalizePlaceText(tour.title).includes(normalizedSearch)
      || normalizePlaceText(tour.desc).includes(normalizedSearch)
      || Boolean(province?.legacyNames.some((name) => normalizePlaceText(name).includes(normalizedSearch)));
     const matchSaved = !showSavedTours || savedTourIds.includes(tour.id);
    return matchRegion && matchSearch && matchSaved;
  });
  const visibleTours = showSavedTours
    ? [...filteredTours, ...savedCustomTours.filter((tour) => tour.title.toLowerCase().includes(searchProvince.toLowerCase()))]
    : filteredTours;

  const handleSelectThemeTour = (tour: ThemeTour) => {
    const stops = tour.stops.map((s, idx) => ({
      ...s,
      priceNum: s.priceNum || parsePriceNum(s.price),
      distance: s.distance || (idx === 0 ? '0.0 km' : `${(0.8 + idx * 0.4).toFixed(1)} km`)
    }));
    const pricedStops = stops.filter((stop) => Number.isFinite(stop.priceNum) && (stop.priceNum || 0) > 0);
    const totalCostNum = pricedStops.reduce((acc, s) => acc + (s.priceNum || 0), 0);
    const totalDistNum = Number(stops.reduce((acc, s, idx) => idx === 0 ? 0 : acc + Number((s.distance || '0').split(' ')[0]), 0).toFixed(1));
    
    const enrichedTour: ThemeTour = {
      ...tour,
      stops,
      totalCost: pricedStops.length === stops.length ? `${totalCostNum.toLocaleString('vi-VN')}đ` : undefined,
      foodCostKnownVnd: totalCostNum,
      foodCostPricedStops: pricedStops.length,
      totalDistance: `${totalDistNum > 0 ? totalDistNum : (stops.length * 0.9).toFixed(1)} km`
    };

    setActiveTour(enrichedTour);
    setActiveStopIndex(0);
    setSelectedItineraryDay(1);
    setUnlockedTourId('');
    setCheckoutProduct('tour');
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

    try {
      const reply = await sendChatMessage(userMsg, history);
      const normalized = normalizePlaceText(userMsg);
      const provinceId = resolvePartnerProvince(userMsg)
        || (step === 'render-details' ? activeTour.partnerProvinceId || (activeTour.id !== 'custom-tour-result' ? activeTour.id : undefined) : undefined);
      const wantsHotel = /khach san|o dau|cho o|dat phong|nghi dem/.test(normalized);
      const wantsTransport = /di chuyen|di lai|xe|tau|may bay|den bang gi|van chuyen/.test(normalized);
      const wantsGuided = /tour|huong dan|local guide|huong dan vien|trai nghiem/.test(normalized);
      const links = provinceId ? PROVINCE_PARTNER_LINKS[provinceId] : undefined;
      const partnerLinks: ChatPartnerLink[] = [
        ...(wantsHotel ? (links?.hotelLinks || []).map((link) => ({ ...link, provinceId: provinceId!, placement: 'assistant_chat' as const })) : []),
        ...(wantsTransport ? (links?.transportLinks || []).map((link) => ({ ...link, provinceId: provinceId!, placement: 'assistant_chat' as const })) : []),
        ...(wantsGuided ? (links?.tourLinks || []).map((link) => ({ ...link, provinceId: provinceId!, placement: 'assistant_chat' as const })) : []),
      ].filter(isActiveAffiliateLink);
      const partnerNote = partnerLinks.length ? '\n\nMột số dịch vụ đối tác tại điểm đến này:' : '';
      setChatMessages([...newMessages, { role: 'model', text: `${reply}${partnerNote}`, partnerLinks }]);
    } catch (error) {
      setChatMessages([...newMessages, { role: 'model', text: error instanceof Error ? error.message : 'Trợ lý chưa phản hồi được. Vui lòng thử lại.' }]);
    } finally { setChatLoading(false); }
  };

  const itineraryDayCount = Math.max(activeTour.dayCount || 1, ...activeTour.stops.map((stop) => stop.day || 1));
  const isMultiDayItinerary = activeTour.id === 'custom-tour-result' && itineraryDayCount > 1;
  const selectedDayStops = activeTour.stops.filter((stop) => (stop.day || 1) === selectedItineraryDay);
  const selectedDayFirstStopIndex = activeTour.stops.findIndex((stop) => (stop.day || 1) === selectedItineraryDay);
  const selectedDayActiveStopPosition = Math.max(0, selectedDayStops.findIndex((stop) => stop === activeTour.stops[activeStopIndex]));
  const selectedDayIsLocked = false;
  const currentDayFoodCost = selectedDayStops.reduce((sum, stop) => sum + (stop.priceNum || parsePriceNum(stop.price) || 0), 0);
  const allDaysFoodCost = activeTour.stops.reduce((sum, stop) => sum + (stop.priceNum || parsePriceNum(stop.price) || 0), 0);
  const activeProvinceId = activeTour.partnerProvinceId
    ? (LEGACY_PROVINCE_TO_CURRENT[activeTour.partnerProvinceId] || activeTour.partnerProvinceId)
    : (PROVINCE_PARTNER_LINKS[activeTour.id] ? activeTour.id : undefined);
  const activePartnerData = activeProvinceId ? PROVINCE_PARTNER_LINKS[activeProvinceId] : undefined;
  const activeTourLinks = (activePartnerData?.tourLinks || []).filter(isActiveAffiliateLink);
  const activeHotelLinks = (activePartnerData?.hotelLinks || []).filter(isActiveAffiliateLink);
  const activeTransportLinks = (activePartnerData?.transportLinks || []).filter(isActiveAffiliateLink);
  const estimatedFoodCostPerPersonVnd = checkoutProduct === 'unlock'
    ? 49000
    : isMultiDayItinerary ? currentDayFoodCost : allDaysFoodCost;
  const estimatedTripTotalVnd = checkoutProduct === 'unlock'
    ? 49000
    : checkoutProduct === 'buddy' ? 150000 : estimatedFoodCostPerPersonVnd * bookingGuests;

  return (
    <div className="min-h-screen bg-bamboo-watermark text-[#2C221E] font-sans-inter selection:bg-[#D4B872] transition-colors duration-700 overflow-x-hidden">
      
      {/* WATERMARK TRÔNG ĐỒNG */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url(/picture/hoa-tiet-trong-dong-vector-01.jpg)' }}></div>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled || step !== 'start' ? 'bg-[#FAF7F2]/95 backdrop-blur-xl border-b border-[#C59B4B]/20 py-3.5 shadow-editorial' : 'bg-transparent py-6'}`} style={{ viewTransitionName: 'header-group' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <div onClick={() => changeStep('start')} className="flex items-center gap-3.5 cursor-pointer group focus-ring-accessible rounded-2xl p-1" tabIndex={0}>
            <div className="relative w-10 h-10 overflow-hidden rounded-full bg-[#8B1E1E] flex items-center justify-center border border-[#C59B4B]/30 shadow-md group-hover:scale-105 transition-transform duration-300">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 animate-pulse"></div>
               <Utensils className="w-5 h-5 text-[#C59B4B] relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-playfair font-black text-2xl tracking-tighter text-[#8B1E1E] italic transition-all leading-none">TasteTrip</span>
              <span className="text-[10px] font-bold font-sans text-[#C59B4B] uppercase tracking-[0.22em] mt-0.5">Hành Trình Di Sản</span>
            </div>
          </div>

          {/* QUICK NAV ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {savedTourIds.length > 0 && (
              <button
                onClick={() => setShowSavedTours(true)}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-[#C59B4B]/30 bg-white/70 text-[#8B1E1E] hover:bg-white transition-all shadow-sm"
                title="Tour đã lưu"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Đã lưu ({savedTourIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* TEXT MARQUEE TICKER */}
      <div className="bg-[#8B1E1E] text-[#FAF7F2] py-2.5 overflow-hidden whitespace-nowrap mt-20 border-y border-[#C59B4B]/25 shadow-inner">
        <div className="animate-marquee font-sans text-xs font-bold tracking-[0.25em] uppercase flex gap-12 text-[#FAF7F2]/90">
          <span>🌾 HÀNH TRÌNH VẠN DẶM QUA HƯƠNG VỊ BẢN SẮC VIỆT</span>
          <span className="text-[#C59B4B]">✦</span>
          <span>🏛️ MỖI MÓN ĂN LÀ MỘT DI SẢN • MỖI MIỀN ĐẤT LÀ MỘT CÂU CHUYỆN</span>
          <span className="text-[#C59B4B]">✦</span>
          <span>🍜 VIỆT NAM • ĐẬM ĐÀ HỒN THIÊNG DÂN TỘC</span>
          <span className="text-[#C59B4B]">✦</span>
          <span>✨ THƯỞNG VỊ TRĂM MIỀN • TRỌN VẸN TINH HOA NON NƯỚC</span>
          <span className="text-[#C59B4B]">✦</span>
          <span>🌾 HÀNH TRÌNH VẠN DẶM QUA HƯƠNG VỊ BẢN SẮC VIỆT</span>
          <span className="text-[#C59B4B]">✦</span>
          <span>🏛️ MỖI MÓN ĂN LÀ MỘT DI SẢN • MỖI MIỀN ĐẤT LÀ MỘT CÂU CHUYỆN</span>
          <span className="text-[#C59B4B]">✦</span>
          <span>🍜 VIỆT NAM • ĐẬM ĐÀ HỒN THIÊNG DÂN TỘC</span>
          <span className="text-[#C59B4B]">✦</span>
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
                  {/* Card 1: Thiết Kế Tour Bằng Trí Tuệ Nhân Tạo */}
                  <div 
                    onClick={() => changeStep('ai-chat')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') changeStep('ai-chat'); }}
                    className="group bg-white p-7 rounded-[32px] shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer border border-[#D4B872]/30 relative overflow-hidden focus-ring-accessible"
                    tabIndex={0}
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-[#1E5631] text-[#FAF6EE] p-3.5">
                        <Bot className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-serif-playfair text-xl font-black text-[#2C221E] group-hover:text-[#1E5631] transition-colors leading-tight">
                          Tạo Lịch Trình AI
                        </h4>
                        <p className="font-serif-merriweather text-xs text-[#2C221E]/70 leading-relaxed">
                          Nhập tiêu chí khởi hành, nhu cầu và ngân sách để Gemini AI tự động tính toán lộ trình tối ưu hoá tuyến đường.
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
                          Khám phá các hành trình ẩm thực có sẵn (Hà Nội, 34 Tỉnh Thành,...).
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
                    {section.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedFoodModal({ ...item, regionTitle: section.regionTitle, tagColor: section.tagColor })}
                        className="group relative aspect-[4/5] min-h-[290px] rounded-[28px] overflow-hidden shadow-editorial border border-[#C59B4B]/25 cursor-pointer hover:shadow-editorial-hover hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      >
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/90 via-[#2C221E]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <span className={`text-[10px] font-bold font-sans px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md ${section.tagColor}`}>
                            {item.tag}
                          </span>
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                          <h4 className="font-serif-playfair font-bold text-lg group-hover:text-[#E0BA6A] transition-colors leading-tight">{item.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-sans text-[#E0BA6A] uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                            <Sparkles className="w-3 h-3" />
                            <span>Khám phá giai thoại</span>
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
            className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-motion-fadeIn"
            onClick={() => setSelectedFoodModal(null)}
          >
            <div 
              className="relative w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-editorial-lg border border-[#C59B4B]/35 flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* NÚT ĐÓNG */}
              <button 
                onClick={() => setSelectedFoodModal(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all shadow-lg focus-ring-accessible cursor-pointer"
                title="Đóng cửa sổ"
                aria-label="Đóng"
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
                  <span className={`text-[11px] font-bold font-sans px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md ${selectedFoodModal.tagColor || 'bg-[#8B1E1E] text-white'}`}>
                    {selectedFoodModal.tag}
                  </span>
                  {selectedFoodModal.regionTitle && (
                    <span className="text-[10px] font-bold font-sans px-3 py-1 rounded-full uppercase tracking-wider bg-white/95 text-[#2C221E] shadow-sm backdrop-blur-md w-fit">
                      {selectedFoodModal.regionTitle}
                    </span>
                  )}
                </div>
              </div>

              {/* MỘT NỬA (50%): LỊCH SỬ, CÁCH THƯỞNG THỨC ĐÚNG VỊ & MENU TIẾNG ANH */}
              <div className="w-full md:w-1/2 p-7 md:p-9 overflow-y-auto space-y-6 flex flex-col justify-between bg-[#FAF7F2]/40">
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-bold font-sans text-[#C59B4B] uppercase tracking-[0.25em]">Di Sản Ẩm Thực Việt Nam</span>
                    <h3 className="font-serif-playfair font-black text-3xl md:text-4xl text-[#8B1E1E] leading-tight mt-1">{selectedFoodModal.name}</h3>
                  </div>

                  {/* 1. LỊCH SỬ VỀ MÓN ĂN */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#8B1E1E] text-xs font-bold font-sans uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-[#C59B4B]" />
                      <span>Lịch Sử & Giai Thoại Món Ăn</span>
                    </div>
                    <p className="font-sans text-xs md:text-[13px] text-[#2C221E]/85 leading-relaxed pl-4 border-l-2 border-[#8B1E1E]/40">
                      {selectedFoodModal.story}
                    </p>
                  </div>

                  {/* 2. CÁCH THƯỞNG THỨC ĐÚNG VỊ */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#1C4329] text-xs font-bold font-sans uppercase tracking-wider">
                      <Utensils className="w-4 h-4 text-[#1C4329]" />
                      <span>Cách Thưởng Thức Chuẩn Vị</span>
                    </div>
                    <p className="font-sans text-xs md:text-[13px] text-[#2C221E]/85 leading-relaxed pl-4 border-l-2 border-[#1C4329]/40">
                      {selectedFoodModal.tastingTip}
                    </p>
                  </div>

                  {/* 3. THỰC ĐƠN TIẾNG ANH */}
                  <div className="space-y-2 bg-white p-4.5 rounded-2xl border border-[#C59B4B]/35 shadow-sm">
                    <div className="flex items-center gap-2 text-[#8B1E1E] text-xs font-bold font-sans uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-[#C59B4B]" />
                      <span>International English Menu</span>
                    </div>
                    <p className="font-serif-playfair text-xs md:text-[13px] text-[#2C221E]/85 leading-relaxed italic pl-4 border-l-2 border-[#C59B4B]/40">
                      {selectedFoodModal.englishMenu}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setSelectedFoodModal(null)}
                    className="w-full bg-[#8B1E1E] text-white py-3.5 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest shadow-editorial hover:bg-[#6D1414] transition-all cursor-pointer focus-ring-accessible"
                  >
                    Đóng Khám Phá
                  </button>
                </div>
              </div>
            </div>
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
                <label className="block text-xs font-bold font-sans-montserrat text-[#8B0000] uppercase tracking-wider mb-2">Số ngày trải nghiệm</label>
                <select value={customDays} onChange={(event) => setCustomDays(Number(event.target.value))} className="w-full rounded-2xl border bg-[#FAF6EE] p-3.5 font-serif-lora text-sm">
                  <option value={1}>1 ngày</option><option value={2}>2 ngày</option><option value={3}>3 ngày</option>
                </select>
                <p className="mt-1 text-xs text-[#2C221E]/60">Tạo lịch trình từ 1 đến 3 ngày theo nhu cầu của bạn.</p>
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
                  <span>50.000đ</span>
                  <span>500.000đ</span>
                  <span>1.000.000đ+</span>
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
              <span className="text-[10px] font-black font-sans-montserrat text-[#8B0000] bg-[#D4B872]/20 px-4 py-1.5 rounded-full uppercase tracking-widest">34 Tỉnh Thành • Food Tour</span>
            </div>

            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="font-serif-playfair text-4xl lg:text-5xl font-bold text-[#2C221E]">Khám Phá <span className="text-[#8B0000] italic">34 Tỉnh Thành</span> Việt Nam</h2>
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

            <div className="flex flex-wrap items-center justify-center gap-3 -mt-6">
              <button
                type="button"
                onClick={() => setShowSavedTours((current) => !current)}
                aria-pressed={showSavedTours}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${showSavedTours ? 'border-[#8B0000] bg-[#8B0000] text-white' : 'border-[#D4B872]/50 bg-white text-[#8B0000]'}`}
              >
                <Bookmark className="h-4 w-4" />
                {showSavedTours ? 'Đang xem tour đã lưu' : `Tour đã lưu (${savedTourIds.length + savedCustomTours.length})`}
              </button>
              <span className="text-xs text-[#2C221E]/60">Lịch trình lưu trên trình duyệt này. Chọn một lịch trình để mở lại.</span>
            </div>

            {/* TOURS GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTours.map(tour => (
                <div key={`${tour.id}-${tour.savedId || 'catalog'}`} className="relative bg-white rounded-[35px] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-[#D4B872]/30 group">
                  <button type="button" onClick={() => tour.savedId ? (setActiveTour(tour), setActiveStopIndex(0), setSelectedItineraryDay(1), changeStep('render-details')) : handleSelectThemeTour(tour)} aria-label={`Xem lịch trình ${tour.title}`} className="block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#8B0000]/30">
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
                    </div>
                    <p className="text-xs text-[#2C221E]/65">Mức ăn tham khảo: <strong className="text-[#8B0000]">{getTourCostCoverage(tour) ? `${getTourEstimatedCost(tour).toLocaleString('vi-VN')}đ / người` : 'Chưa có dữ liệu giá'}</strong>{getTourCostCoverage(tour) > 0 && getTourCostCoverage(tour) < tour.stops.length ? ` · đã có giá ${getTourCostCoverage(tour)}/${tour.stops.length} điểm` : ''}</p>
                  </div>
                  </button>
                  <button type="button" aria-label={tour.savedId ? 'Bỏ lưu lịch trình' : savedTourIds.includes(tour.id) ? 'Bỏ lưu tour' : 'Lưu tour'} aria-pressed={tour.savedId ? true : savedTourIds.includes(tour.id)} onClick={() => tour.savedId ? setSavedCustomTours((current) => current.filter((saved) => saved.savedId !== tour.savedId)) : toggleSavedTour(tour.id)} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#8B0000] shadow transition-transform hover:scale-105">
                    <Bookmark className={`h-5 w-5 ${tour.savedId || savedTourIds.includes(tour.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>

            {visibleTours.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[40px] border border-[#D4B872]/20 space-y-3">
                <Utensils className="w-12 h-12 text-[#D4B872] mx-auto opacity-30" />
                <p className="font-serif-lora italic text-[#2C221E]/50">Không tìm thấy tỉnh thành phù hợp với tìm kiếm của bạn.</p>
                <button type="button" onClick={() => { setShowSavedTours(false); setSearchProvince(''); setSelectedRegion('Tất cả'); }} className="mt-2 text-sm font-bold text-[#8B0000] underline">Xóa bộ lọc và xem tất cả tour</button>
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
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#1E5631]" /> 1. Vị trí khởi hành / Tỉnh thành (34 tỉnh, thành phố)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetecting}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${locMode === 'gps' ? 'border-[#1E5631] bg-[#1E5631]/5 text-[#1E5631]' : 'border-[#D4B872]/30 text-[#2C221E]/70 hover:bg-[#D4B872]/10'}`}
                    >
                      <span className="flex items-center gap-2 font-bold text-xs"><Navigation className="w-4 h-4" /> {isDetecting ? 'Đang lấy GPS...' : 'Dùng GPS'}</span>
                      <span className="block mt-1 text-[10px] font-normal opacity-70">Lấy vị trí hiện tại</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocMode('manual')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${locMode === 'manual' ? 'border-[#1E5631] bg-[#1E5631]/5 text-[#1E5631]' : 'border-[#D4B872]/30 text-[#2C221E]/70 hover:bg-[#D4B872]/10'}`}
                    >
                      <span className="flex items-center gap-2 font-bold text-xs"><MapPin className="w-4 h-4" /> Tự nhập địa điểm</span>
                      <span className="block mt-1 text-[10px] font-normal opacity-70">Chọn tỉnh hoặc nhập địa chỉ</span>
                    </button>
                  </div>
                  {locMode === 'gps' ? (
                    <div className="p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm text-[#1E5631]">
                      <span className="font-bold">Vị trí khởi hành:</span> {customLocation}
                    </div>
                  ) : <>
                  
                  <input 
                    type="text" 
                    value={customLocation} 
                    onChange={(e) => setCustomLocation(e.target.value)} 
                    placeholder="Hoặc nhập địa điểm cụ thể (VD: Quận 1, Sài Gòn / Phố Cổ Hà Nội)..." 
                    className="w-full p-4 bg-[#FAF6EE] border rounded-2xl font-serif-lora text-sm focus:outline-none focus:border-[#1E5631]"
                  />
                  </>}
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
                  <label className="block text-xs font-bold font-sans-montserrat text-[#1E5631] uppercase tracking-wider mb-2">Số ngày trải nghiệm</label>
                  <select value={customDays} onChange={(event) => setCustomDays(Number(event.target.value))} className="w-full rounded-2xl border bg-[#FAF6EE] p-4 font-serif-lora text-sm">
                    <option value={1}>1 ngày</option><option value={2}>2 ngày</option><option value={3}>3 ngày</option>
                  </select>
                  <p className="mt-1 text-xs text-[#2C221E]/60">Xem đầy đủ các ngày trong lịch trình AI sau khi tạo.</p>
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
                    <span>50.000đ</span>
                    <span>500.000đ</span>
                    <span>1.000.000đ+</span>
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
                <div className="min-w-0 flex-1">
                <button onClick={() => changeStep(activeTour.id === 'custom-tour-result' || activeTour.id.startsWith('ai-') || Boolean(activeTour.savedId?.startsWith('ai-')) ? 'custom-tour' : 'themed-tour')} className="text-[10px] font-black font-sans-montserrat uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
                <h2 className="font-serif-playfair text-4xl font-black text-[#8B0000]">{activeTour.title}</h2>
                <p className="font-serif-lora text-xs text-[#2C221E]/70 italic mt-1">{activeTour.desc}</p>
              </div>
              <div className="print-hidden flex flex-wrap items-center gap-2">
        {paidBookingConfirmation && <div role="status" className="mb-6 rounded-2xl border border-[#1E5631]/20 bg-green-50 p-4 text-sm text-[#1E5631]">TasteTrip đã xác nhận thanh toán đơn <strong>{paidBookingConfirmation.id}</strong> cho ngày <strong>{new Date(`${paidBookingConfirmation.date}T00:00:00`).toLocaleDateString('vi-VN')}</strong> ({paidBookingConfirmation.guests} khách). Đây là lịch trình cụ thể của tour bạn đã đặt.</div>}
                <button type="button" onClick={toggleSaveActiveTour} aria-pressed={activeTour.id === 'custom-tour-result' ? activeCustomSaved : savedTourIds.includes(activeTour.id)} className="inline-flex items-center gap-2 rounded-xl border border-[#D4B872]/50 bg-[#FAF6EE] px-4 py-3 text-xs font-bold text-[#8B0000] hover:bg-[#D4B872]/20">
                  <Bookmark className={`h-4 w-4 ${(activeTour.id === 'custom-tour-result' ? activeCustomSaved : savedTourIds.includes(activeTour.id)) ? 'fill-current' : ''}`} />
                  {(activeTour.id === 'custom-tour-result' ? activeCustomSaved : savedTourIds.includes(activeTour.id)) ? 'Đã lưu' : 'Lưu lịch trình'}
                </button>
                <button type="button" disabled={shareLoading} onClick={shareActiveTour} className="inline-flex items-center gap-2 rounded-xl border border-[#D4B872]/50 bg-[#FAF6EE] px-4 py-3 text-xs font-bold text-[#8B0000] hover:bg-[#D4B872]/20 disabled:opacity-60">
                  <Share2 className="h-4 w-4" /> Chia sẻ
                </button>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[#D4B872]/50 bg-[#FAF6EE] px-4 py-3 text-xs font-bold text-[#8B0000] hover:bg-[#D4B872]/20">
                  <Printer className="h-4 w-4" /> In lịch trình
                </button>
              </div>
            </div>

            {sharedItineraryLoading && <p role="status" className="rounded-xl bg-white p-4 text-sm text-[#1E5631]">Đang tải lịch trình được chia sẻ…</p>}

            {isMultiDayItinerary && <nav aria-label="Chọn ngày trong lịch trình" className="print-hidden flex flex-wrap gap-2 rounded-2xl border border-[#D4B872]/30 bg-white p-3">
              {Array.from({ length: itineraryDayCount }, (_, index) => index + 1).map((day) => {
                const locked = day > 1 && unlockedTourId !== activeTour.id;
                return <button key={day} type="button" aria-pressed={selectedItineraryDay === day} onClick={() => {
                  setSelectedItineraryDay(day);
                  const firstStop = activeTour.stops.findIndex((stop) => (stop.day || 1) === day);
                  if (firstStop >= 0) setActiveStopIndex(firstStop);
                }} className={`rounded-xl px-5 py-3 text-sm font-bold ${selectedItineraryDay === day ? 'bg-[#8B0000] text-white' : 'bg-[#FAF6EE] text-[#8B0000] hover:bg-[#D4B872]/20'}`}>
                  Ngày {day}{locked ? ' 🔒' : day === 1 ? ' · Miễn phí' : ''}
                </button>;
              })}
            </nav>}

            {/* DASHBOARD TỔNG KẾT HÀNH TRÌNH (KHỐI 4.3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[30px] border border-[#D4B872]/30 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-[#8B0000]/10 rounded-2xl flex items-center justify-center text-[#8B0000]">
                  <Navigation className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold font-sans-montserrat text-[#2C221E]/60 uppercase tracking-widest">Tổng Quãng Đường</div>
                  <div className="text-2xl font-black font-sans-montserrat text-[#8B0000]">{selectedDayIsLocked ? '🔒 Đã khóa' : isMultiDayItinerary ? `${selectedDayStops.length} điểm · Ngày ${selectedItineraryDay}` : activeTour.totalDistance || '2.4 km'}</div>
                  <div className="text-[10px] text-[#1E5631] font-semibold">✓ Đã lọc trong bán kính tối đa</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[30px] border border-[#D4B872]/30 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-[#D4B872]/20 rounded-2xl flex items-center justify-center text-[#8B0000]">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold font-sans-montserrat text-[#2C221E]/60 uppercase tracking-widest">Tiền ăn tham khảo / người</div>
                  <div className="text-2xl font-black font-sans-montserrat text-[#8B0000]">{currentDayFoodCost ? `${currentDayFoodCost.toLocaleString('vi-VN')}đ / người` : 'Chưa có dữ liệu giá'}</div>
                  <div className="text-[10px] text-[#2C221E]/60">{selectedDayStops.filter((stop) => stop.priceNum || Number(String(stop.price || '').replace(/\D/g, ''))).length}/{selectedDayStops.length} điểm có giá · chưa gồm di chuyển.</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* TIMELINE, CULTURE, MENU */}
              <div className="lg:col-span-2 space-y-8">
                {<>
                <div className="bg-white p-8 rounded-[40px] border border-[#D4B872]/30 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-serif-playfair font-bold text-xl text-[#8B0000] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#D4B872]" /> Chi Tiết Lịch Trình & Văn Hóa
                    </h3>
                    <span className="text-[10px] font-black font-sans-montserrat bg-[#8B0000] text-[#D4B872] px-3.5 py-1 rounded-full">Sắp xếp: Sáng → Trưa → Tối</span>
                  </div>

                  <div className="space-y-8 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-[#D4B872]/40">
                    {selectedDayStops.map((stop, dayStopIndex) => {
                      const idx = activeTour.stops.indexOf(stop);
                      const stopVouchers = partnerVouchers.filter((voucher) => voucher.stopIndex === idx && voucher.tourId === activeTour.id);
                      return <div key={idx} className="relative flex gap-6 items-start pl-2">
                        <div className="w-9 h-9 rounded-full bg-[#8B0000] text-[#D4B872] font-black text-xs flex items-center justify-center shrink-0 z-10 shadow border border-[#D4B872]">
                          {dayStopIndex + 1}
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
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                              <h4 className="font-serif-playfair font-bold text-2xl text-[#8B1E1E]">{stop.name}</h4>
                              <span className="font-sans text-sm font-extrabold text-[#8B1E1E]">{stop.price}</span>
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + ' ' + stop.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#6B5E57] hover:text-[#8B1E1E] hover:underline transition-colors group"
                              title="Xem vị trí trên Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#8B1E1E] shrink-0 group-hover:scale-110 transition-transform" />
                              <span>{stop.address}</span>
                              <span className="text-[10px] text-[#C59B4B] bg-[#C59B4B]/10 px-2 py-0.5 rounded-full font-semibold ml-1">Chỉ đường ↗</span>
                            </a>
                            {stopVouchers.length > 0 ? <div className="space-y-2" aria-label="Ưu đãi đối tác tại điểm ăn này">
                              {stopVouchers.map((voucher) => <div key={voucher.id} className="rounded-2xl border border-[#1E5631]/20 bg-white p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#1E5631]">Ưu đãi đối tác · {voucher.restaurantName}</p>
                                <p className="mt-1 text-sm font-bold text-[#8B0000]">{voucher.title}: {voucher.benefit}</p>
                                {voucher.terms && <p className="mt-1 text-xs text-[#2C221E]/65">{voucher.terms}</p>}
                                <div className="mt-2 flex items-center justify-between gap-2"><code className="text-xs font-bold text-[#8B0000]">{voucher.code}</code><button type="button" onClick={() => handleCopyVoucherCode(voucher.code)} className="rounded-lg bg-[#1E5631] px-3 py-2 text-xs font-bold text-white">Sao chép mã</button></div>
                              </div>)}
                            </div> : <p className="inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2C221E]/60">Chưa có ưu đãi</p>}
                            
                            {/* 1. Câu chuyện văn hóa & Di sản */}
                            <div className="text-xs bg-white p-4.5 rounded-2xl border border-[#C59B4B]/30 text-[#2C221E] space-y-1.5 shadow-sm leading-relaxed">
                              <span className="font-bold font-sans text-[#8B1E1E] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                                <BookOpen className="w-3.5 h-3.5 text-[#C59B4B]" />
                                💡 Câu chuyện văn hóa & Di sản:
                              </span> 
                              <p className="text-[#2C221E]/85 pl-4 border-l-2 border-[#8B1E1E]/30 leading-relaxed">{stop.cultureStory || 'Món ăn truyền thống đặc sắc mang đậm bản sắc văn hóa ẩm thực địa phương.'}</p>
                            </div>

                            {/* 2. Mẹo thưởng thức chuẩn vị */}
                            <div className="text-xs bg-[#1C4329]/5 p-4.5 rounded-2xl border border-[#1C4329]/20 text-[#2C221E] space-y-1.5 shadow-sm leading-relaxed">
                              <span className="font-bold font-sans text-[#1C4329] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                                <Utensils className="w-3.5 h-3.5 text-[#1C4329]" />
                                ✨ Mẹo thưởng thức chuẩn vị:
                              </span> 
                              <p className="text-[#2C221E]/85 pl-4 border-l-2 border-[#1C4329]/40 leading-relaxed">{stop.tastingTip || 'Thưởng thức khi còn nóng hổi cùng các gia vị kèm theo để cảm nhận trọn vẹn hương vị.'}</p>
                            </div>

                            {/* 3. Thực đơn tiếng Anh quốc tế */}
                            {stop.englishMenu && (
                              <div className="text-xs bg-[#FAF7F2] p-4.5 rounded-2xl border border-[#C59B4B]/35 text-[#2C221E] space-y-1.5 shadow-sm leading-relaxed">
                                <span className="font-bold font-sans text-[#8B1E1E] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                                  <Globe className="w-3.5 h-3.5 text-[#C59B4B]" />
                                  🌐 International English Menu:
                                </span> 
                                <p className="italic text-[#2C221E]/80 pl-4 border-l-2 border-[#C59B4B]/50 font-serif-playfair text-[13px]">{stop.englishMenu}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>;
                    })}
                  </div>
                </div>
                </>}
              </div>

              {/* ROADMAP & ACTION MENU */}
              <div className="print-hidden space-y-8">
                {selectedDayIsLocked ? <div className="rounded-[30px] border border-[#D4B872]/40 bg-white p-6 text-center text-sm text-[#2C221E]/70">Lộ trình và địa chỉ của ngày này sẽ hiện sau khi mở khóa.</div> : <div className="bg-white p-6 rounded-[35px] border border-[#D4B872]/30 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-playfair font-bold text-base text-[#8B0000] flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#D4B872]" /> Roadmap Dẫn Đường
                    </h3>
                    <span className="text-[10px] font-black font-sans-montserrat bg-[#8B0000]/10 text-[#8B0000] px-3 py-1 rounded-full">
                      {selectedDayActiveStopPosition + 1} / {selectedDayStops.length}
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
                        onClick={() => setActiveStopIndex(prev => Math.max(selectedDayFirstStopIndex, prev - 1))}
                        disabled={selectedDayActiveStopPosition === 0}
                        className="flex-1 bg-white hover:bg-gray-50 text-[#8B0000] border border-[#8B0000]/30 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
                      >
                        ← Điểm trước
                      </button>
                      <button 
                        onClick={() => setActiveStopIndex(prev => Math.min(selectedDayFirstStopIndex + selectedDayStops.length - 1, prev + 1))}
                        disabled={selectedDayActiveStopPosition >= selectedDayStops.length - 1}
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
                    <a href={getFullRouteUrl({ ...activeTour, stops: selectedDayStops })} target="_blank" rel="noreferrer" className="w-full border border-[#1E5631]/30 bg-white text-[#1E5631] text-xs font-sans-poppins font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 hover:bg-[#1E5631]/5 focus-ring-accessible text-center">
                      <MapPinned className="w-3.5 h-3.5" /> Mở cả tuyến trên Google Maps
                    </a>
                  </div>
                </div>}

                {!selectedDayIsLocked && partnerVouchers.some((voucher) => voucher.stopIndex === null) && <section className="rounded-[30px] border border-[#D4B872]/50 bg-[#FAF6EE] p-6 shadow-sm" aria-labelledby="partner-vouchers-title">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-[#1E5631]">Ưu đãi do quán xác nhận</p>
                    <h3 id="partner-vouchers-title" className="mt-1 font-serif-playfair text-xl font-bold text-[#8B0000]">Quyền lợi trên tuyến này</h3>
                  </div>
                  <div className="space-y-3">
                    {partnerVouchers.filter((voucher) => voucher.stopIndex === null).map((voucher) => <article key={voucher.id} className="rounded-2xl border border-[#D4B872]/30 bg-white p-4">
                      <p className="text-xs font-bold text-[#1E5631]">{voucher.restaurantName}</p>
                      <h4 className="mt-1 font-serif-playfair font-bold text-[#8B0000]">{voucher.title}</h4>
                      <p className="mt-2 text-sm font-semibold">{voucher.benefit}</p>
                      {voucher.terms && <p className="mt-1 text-xs leading-relaxed text-[#2C221E]/65">{voucher.terms}</p>}
                      <p className="mt-2 text-[11px] text-[#2C221E]/55">Có hiệu lực đến {new Date(`${voucher.validTo}T00:00:00`).toLocaleDateString('vi-VN')}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#FAF6EE] px-3 py-2">
                        <code className="break-all text-xs font-bold text-[#8B0000]">{voucher.code}</code>
                        <button type="button" onClick={() => handleCopyVoucherCode(voucher.code)} className="shrink-0 rounded-lg bg-[#1E5631] px-3 py-2 text-xs font-bold text-white hover:bg-[#2E8B57] focus-ring-accessible">Sao chép mã</button>
                      </div>
                    </article>)}
                  </div>
                  {voucherNotice && <p role="status" className="mt-3 text-xs text-[#1E5631]">{voucherNotice}</p>}
                </section>}

                {tourActionNotice && <p role="status" className="rounded-2xl border border-[#1E5631]/20 bg-[#1E5631]/5 p-4 text-xs text-[#1E5631]">{tourActionNotice}</p>}

                <section className="space-y-4 rounded-[30px] border border-[#D4B872]/40 bg-white p-6 shadow-sm" aria-labelledby="next-actions-title">
                  <h3 id="next-actions-title" className="font-serif-playfair text-2xl font-bold text-[#8B0000]">Gợi ý cho chuyến đi</h3>
                  {[
                    { title: 'Lưu Trú', description: activeProvinceId && PARTNER_DESTINATION_NAMES[activeProvinceId] ? `Tìm chốn nghỉ thuận tiện để thong thả khám phá ${PARTNER_DESTINATION_NAMES[activeProvinceId]}.` : 'Tìm chốn nghỉ thuận tiện cho hành trình của bạn.', category: 'hotel' as const, links: activeHotelLinks, providers: ['Traveloka', 'Trip.com', 'Agoda', 'Booking.com', 'Go2Joy'], placement: 'hotel' as const },
                    { title: 'Di Chuyển', description: activeProvinceId && PARTNER_DESTINATION_NAMES[activeProvinceId] ? `Chọn ${PARTNER_DESTINATION_NAMES[activeProvinceId]} làm điểm đến và ngày đi; bạn có thể bổ sung nơi khởi hành sau.` : 'Chọn điểm đến và ngày đi; nơi khởi hành có thể bổ sung sau.', category: 'transport' as const, links: activeTransportLinks, providers: ['Traveloka', 'Trip.com', 'Klook'], placement: 'transport' as const },
                    { title: 'Khám Phá Cùng Người Bản Địa', description: 'Chọn tour và hoạt động có hướng dẫn để cảm nhận thêm nét riêng của vùng đất.', category: 'tour' as const, links: activeTourLinks, providers: ['Klook'], placement: 'guided_tour' as const },
                  ].map((group) => <article key={group.title} className="rounded-2xl border border-[#D4B872]/30 bg-[#FAF6EE] p-4">
                    <h4 className="font-serif-playfair text-lg font-bold text-[#8B0000]">{group.title}</h4>
                    <p className="mt-1 text-xs text-[#2C221E]/70">{group.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.providers.map((partner) => {
                        const affiliateLink = group.links.find((link) => link.partner === partner);
                        const publicWebsite = PARTNER_PUBLIC_WEBSITES[partner];
                        if (!publicWebsite) return null;
                        const categoryUrl = getPartnerCategoryUrl(partner, group.category, activeProvinceId);
                        const href = affiliateLink?.url || categoryUrl || publicWebsite.url;
                        return <a key={`${group.title}-${partner}`} href={href} target="_blank" rel={affiliateLink ? 'sponsored noopener noreferrer' : 'noopener noreferrer'} onClick={() => { if (affiliateLink && activeProvinceId) void logAffiliateClick(partner, activeProvinceId, group.placement); }} aria-label={`Mở ${partner} trong nhóm ${group.title}`} className="inline-flex items-center gap-2 rounded-xl border border-[#D4B872]/50 bg-white px-3 py-2.5 text-xs font-bold text-[#2C221E] shadow-sm hover:border-[#8B0000]/40 hover:bg-[#FAF6EE]">
                          <img src={`https://www.google.com/s2/favicons?domain=${publicWebsite.logoDomain}&sz=64`} alt={`Logo ${partner}`} loading="lazy" className="h-7 w-7 rounded-md object-contain" />
                          <span>{partner}</span>
                        </a>;
                      })}
                    </div>
                  </article>)}
                  {activeHotelLinks.length + activeTransportLinks.length + activeTourLinks.length > 0 && <p className="text-[11px] leading-relaxed text-[#2C221E]/60">Liên kết đối tác: TasteTrip có thể nhận hoa hồng khi bạn đặt qua link này, giá không đổi với bạn.</p>}
                </section>

                <div className="rounded-2xl border border-[#D4B872]/30 bg-white p-4">
                  <button onClick={() => changeStep('themed-tour')} className="w-full rounded-xl border border-[#D4B872]/50 px-4 py-3 text-xs font-bold text-[#8B0000] hover:bg-[#FAF6EE]">Quay lại</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ADMIN BOOKINGS */}
        {step === 'admin' && (
          <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12 my-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-[#1E5631]">TasteTrip</p>
                <h2 className="font-serif-playfair text-3xl sm:text-4xl font-bold text-[#8B0000]">Cơ sở dữ liệu TasteTrip</h2>
              </div>
              <button onClick={() => changeStep('start')} className="text-sm text-[#8B0000] hover:underline">Về trang chủ</button>
            </div>
            {!adminLoggedIn ? (
              <form onSubmit={handleAdminLogin} className="max-w-lg bg-white p-6 sm:p-8 rounded-3xl shadow border border-[#D4B872]/30 space-y-4">
                <p className="text-sm text-[#2C221E]/70">Nhập token quản trị trong server/.env để xem dữ liệu SQLite, đơn đặt tour và voucher.</p>
                <label className="block text-sm font-semibold">Admin token
                  <input required type="password" autoComplete="current-password" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3" />
                </label>
                {adminError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{adminError}</p>}
                <button disabled={adminLoading} className="w-full rounded-xl bg-[#1E5631] px-5 py-3 font-bold text-white disabled:opacity-60">{adminLoading ? 'Đang xác thực...' : 'Đăng nhập quản trị'}</button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Đối soát trước khi xác nhận:</strong> kiểm tra sao kê ngân hàng có đúng số tiền báo giá và nội dung <code className="font-bold">TASTETRIP + mã đơn</code>. Chỉ chuyển trạng thái sang “Đã xác nhận đã thu” khi cả hai khớp. Website hiện chưa kết nối API ngân hàng nên bước này do quản trị viên kiểm tra thủ công.</div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={handleAdminRefresh} disabled={adminLoading} className="rounded-xl bg-[#1E5631] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{adminLoading ? 'Đang tải...' : 'Tải lại dữ liệu'}</button>
                  <button onClick={() => { setAdminLoggedIn(false); setAdminToken(''); setAdminBookings([]); setAdminVouchers([]); setAdminDatabaseOverview(null); setAffiliateClickReport([]); }} className="rounded-xl border border-[#8B0000]/30 px-4 py-2.5 text-sm font-bold text-[#8B0000]">Đăng xuất</button>
                  <span className="text-sm text-[#2C221E]/60">{adminBookings.length} yêu cầu</span>
                </div>
                <section className="rounded-3xl border border-[#D4B872]/35 bg-white p-5 sm:p-7 shadow-sm space-y-4" aria-labelledby="database-overview-title">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 id="database-overview-title" className="font-serif-playfair text-2xl font-bold text-[#8B0000]">Dữ liệu đang lưu</h3>
                      <p className="mt-1 text-sm text-[#2C221E]/65">Tổng quan các bảng trong cơ sở dữ liệu {adminDatabaseOverview?.database || 'SQLite'}.</p>
                    </div>
                    <span className="rounded-full bg-[#1E5631]/10 px-3 py-1 text-xs font-bold text-[#1E5631]">Chỉ quản trị viên</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(adminDatabaseOverview?.tables || []).map((table) => (
                      <div key={table.id} className="rounded-2xl border border-[#D4B872]/25 bg-[#FAF6EE] p-4">
                        <p className="text-sm text-[#2C221E]/70">{table.name}</p>
                        <strong className="mt-1 block text-2xl text-[#8B0000]">{table.rowCount.toLocaleString('vi-VN')}</strong>
                        <span className="text-xs text-[#2C221E]/55">bản ghi</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-3xl border border-[#D4B872]/35 bg-white p-5 sm:p-7 shadow-sm space-y-4" aria-labelledby="affiliate-report-title">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 id="affiliate-report-title" className="font-serif-playfair text-2xl font-bold text-[#8B0000]">Lượt nhấn liên kết đối tác</h3>
                      <p className="mt-1 text-sm text-[#2C221E]/65">Thống kê theo đối tác, tỉnh và vị trí nút.</p>
                    </div>
                    <strong className="text-xl text-[#1E5631]">{affiliateClickReport.reduce((sum, row) => sum + row.clickCount, 0).toLocaleString('vi-VN')} lượt</strong>
                  </div>
                  {affiliateClickReport.length === 0 ? <p className="rounded-xl bg-[#FAF6EE] p-4 text-sm text-[#2C221E]/65">Chưa có lượt nhấn liên kết được ghi nhận.</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead><tr className="border-b border-[#D4B872]/30 text-xs text-[#2C221E]/60"><th className="py-2 pr-4">Đối tác</th><th className="py-2 pr-4">Tỉnh</th><th className="py-2 pr-4">Vị trí</th><th className="py-2 pr-4">Lượt nhấn</th><th className="py-2">Gần nhất</th></tr></thead>
                        <tbody>{affiliateClickReport.map((row) => (
                          <tr key={`${row.partner}-${row.provinceId}-${row.placement}`} className="border-b border-[#D4B872]/15 last:border-0">
                            <td className="py-3 pr-4 font-semibold text-[#8B0000]">{row.partner}</td>
                            <td className="py-3 pr-4">{THEMED_TOURS.find((tour) => tour.id === (LEGACY_PROVINCE_TO_CURRENT[row.provinceId] || row.provinceId))?.title || row.provinceId}</td>
                            <td className="py-3 pr-4">{{ primary_tour: 'Nút xem tour', hotel: 'Ở đâu', transport: 'Đến bằng gì', guided_tour: 'Tour có hướng dẫn', assistant_chat: 'Trợ lý AI' }[row.placement] || row.placement}</td>
                            <td className="py-3 pr-4 font-bold">{row.clickCount.toLocaleString('vi-VN')}</td>
                            <td className="py-3 text-xs text-[#2C221E]/65">{new Date(row.lastClickedAt).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </section>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-white border border-[#D4B872]/30 p-4"><div className="text-xs text-[#2C221E]/60">Đơn mới</div><strong className="text-2xl text-[#8B0000]">{adminBookings.filter((item) => item.status === 'new').length}</strong></div>
                  <div className="rounded-2xl bg-white border border-[#D4B872]/30 p-4"><div className="text-xs text-[#2C221E]/60">Đã xác nhận</div><strong className="text-2xl text-[#8B0000]">{adminBookings.filter((item) => item.status === 'confirmed').length}</strong></div>
                  <div className="rounded-2xl bg-white border border-[#D4B872]/30 p-4"><div className="text-xs text-[#2C221E]/60">Đã hoàn thành</div><strong className="text-2xl text-[#8B0000]">{adminBookings.filter((item) => item.status === 'completed').length}</strong></div>
                  <div className="rounded-2xl bg-white border border-[#D4B872]/30 p-4"><div className="text-xs text-[#2C221E]/60">Đã thu theo xác nhận thủ công</div><strong className="text-lg text-[#1E5631]">{adminBookings.filter((item) => item.paymentStatus === 'paid').reduce((sum, item) => sum + (item.quotedTotalVnd || 0), 0).toLocaleString('vi-VN')} đ</strong></div>
                </div>                {adminNotice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{adminNotice}</p>}
                {adminError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{adminError}</p>}
                {adminBookings.length === 0 ? (
                  <div className="rounded-3xl border border-[#D4B872]/30 bg-white p-8 text-center text-[#2C221E]/70">Chưa có yêu cầu đặt tour.</div>
                ) : adminBookings.map((booking) => (
                  <article key={booking.id} className="bg-white p-5 sm:p-7 rounded-3xl shadow border border-[#D4B872]/25 space-y-5">
                    <div className="flex flex-wrap justify-between gap-3 border-b border-[#D4B872]/20 pb-4">
                      <div>
                        <h3 className="font-serif-playfair text-xl font-bold text-[#8B0000]">{booking.tourTitle}</h3>
                        <p className="mt-1 text-xs text-[#2C221E]/60">Mã {booking.id} · nhận lúc {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{booking.paymentStatus === 'not_paid' ? 'Chưa thanh toán' : booking.paymentStatus}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <p><strong>Khách:</strong> {booking.customerName}</p>
                      <p><strong>Điện thoại:</strong> <a className="text-[#1E5631] underline" href={`tel:${booking.phone}`}>{booking.phone}</a></p>
                      <p><strong>Email:</strong> {booking.email || 'Không cung cấp'}</p>
                      <p><strong>Ngày đi:</strong> {new Date(`${booking.date}T00:00:00`).toLocaleDateString('vi-VN')}</p>
                      <p><strong>Số khách:</strong> {booking.guests}</p>
                      <p><strong>Hình thức:</strong> {booking.kind === 'guided' ? 'Có local guide' : 'Tự túc'}</p>
                      <p><strong>Ăn uống tham khảo:</strong> {booking.estimatedFoodCostPerPerson?.toLocaleString('vi-VN') || 'Chưa có'} đ/người</p>
                      <p><strong>Số tiền cần khớp:</strong> {booking.quotedTotalVnd?.toLocaleString('vi-VN') || 'Chưa báo giá'} đ</p>
                      <p className="break-all"><strong>Nội dung cần khớp:</strong> TASTETRIP{booking.id.replace(/[^a-zA-Z0-9]/g, '')}</p>
                    </div>
                    {booking.notes && <p className="rounded-xl bg-[#FAF6EE] p-3 text-sm"><strong>Ghi chú của khách:</strong> {booking.notes}</p>}
                    <div className="grid sm:grid-cols-3 gap-3">
                      <label className="text-xs font-semibold">Trạng thái
                        <select value={booking.status} onChange={(event) => setAdminBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: event.target.value as BookingStatus } : item))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm">
                          <option value="new">Mới nhận</option><option value="contacted">Đã liên hệ</option><option value="confirmed">Đã xác nhận</option><option value="completed">Hoàn thành</option><option value="cancelled">Đã hủy</option>
                        </select>
                      </label>
                      <label className="text-xs font-semibold">Giá báo cuối cùng (VNĐ)
                        <input type="number" min="0" step="1000" value={booking.quotedTotalVnd ?? ''} onChange={(event) => setAdminBookings((current) => current.map((item) => item.id === booking.id ? { ...item, quotedTotalVnd: event.target.value ? Number(event.target.value) : null } : item))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" placeholder="Chưa báo giá" />
                      </label>
                      <label className="text-xs font-semibold">Payment status
                        <select value={booking.paymentStatus} onChange={(event) => setAdminBookings((current) => current.map((item) => item.id === booking.id ? { ...item, paymentStatus: event.target.value as BookingRecord['paymentStatus'] } : item))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm">
                          <option value="not_paid">Chưa thanh toán</option><option value="awaiting_payment">Đang đối soát</option><option value="paid">Đã xác nhận đã thu</option><option value="refunded">Đã hoàn tiền</option>
                        </select>
                      </label>
                      <label className="text-xs font-semibold">Guide được phân công
                        <input maxLength={100} value={booking.guideName || ''} onChange={(event) => setAdminBookings((current) => current.map((item) => item.id === booking.id ? { ...item, guideName: event.target.value } : item))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" placeholder="Tên local guide" />
                      </label>
                      <label className="text-xs font-semibold">Điện thoại guide
                        <input maxLength={30} value={booking.guidePhone || ''} onChange={(event) => setAdminBookings((current) => current.map((item) => item.id === booking.id ? { ...item, guidePhone: event.target.value } : item))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" placeholder="Số liên hệ hướng dẫn viên" />
                      </label>
                      <label className="text-xs font-semibold">Ghi chú nội bộ
                        <input maxLength={1000} value={booking.adminNote || ''} onChange={(event) => setAdminBookings((current) => current.map((item) => item.id === booking.id ? { ...item, adminNote: event.target.value } : item))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" placeholder="Trao đổi với khách, guide..." />
                      </label>
                    </div>
                    <button onClick={() => handleAdminUpdate(booking)} className="rounded-xl bg-[#8B0000] px-5 py-3 text-sm font-bold text-white hover:bg-[#A52A2A]">Lưu cập nhật đơn</button>
                  </article>
                ))}
                <section className="rounded-3xl border border-[#D4B872]/35 bg-white p-5 sm:p-7 shadow-sm space-y-5" aria-labelledby="admin-vouchers-title">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#1E5631]">Đối tác ẩm thực</p>
                      <h3 id="admin-vouchers-title" className="mt-1 font-serif-playfair text-2xl font-bold text-[#8B0000]">Quản lý voucher</h3>
                      <p className="mt-1 max-w-2xl text-sm text-[#2C221E]/65">Chỉ nhập quyền lợi và mã đã được quán xác nhận. Voucher đang bật và còn hạn sẽ xuất hiện công khai ở chi tiết tour.</p>
                    </div>
                    <span className="rounded-full bg-[#FAF6EE] px-3 py-1 text-xs font-bold text-[#1E5631]">{adminVouchers.filter((voucher) => voucher.active).length} đang bật</span>
                  </div>
                  <form onSubmit={handleCreateVoucher} className="grid gap-3 rounded-2xl bg-[#FAF6EE] p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs font-semibold sm:col-span-2">Áp dụng cho tour
                      <select value={voucherDraft.tourId} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, tourId: event.target.value, stopIndex: event.target.value === '*' ? null : 0 }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm">
                        <option value="*">Tất cả tour</option>
                        {THEMED_TOURS.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
                      </select>
                    </label>
                    {voucherDraft.tourId !== '*' && <label className="text-xs font-semibold sm:col-span-2">Gắn ưu đãi vào điểm ăn
                      <select value={voucherDraft.stopIndex ?? ''} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, stopIndex: event.target.value === '' ? null : Number(event.target.value) }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm">
                        <option value="">Áp dụng chung cho cả tour</option>
                        {THEMED_TOURS.find((tour) => tour.id === voucherDraft.tourId)?.stops.map((stop, index) => <option key={`${index}-${stop.name}`} value={index}>{stop.mealType}: {stop.name}</option>)}
                      </select>
                    </label>}
                    <label className="text-xs font-semibold sm:col-span-2">Tên quán
                      <input required maxLength={120} value={voucherDraft.restaurantName} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, restaurantName: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm" placeholder="Tên đối tác đã xác nhận" />
                    </label>
                    <label className="text-xs font-semibold sm:col-span-2">Tên ưu đãi
                      <input required maxLength={160} value={voucherDraft.title} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm" placeholder="Ví dụ: Tặng một đồ uống" />
                    </label>
                    <label className="text-xs font-semibold sm:col-span-2">Quyền lợi
                      <input required maxLength={240} value={voucherDraft.benefit} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, benefit: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm" placeholder="Giảm giá hoặc món được tặng" />
                    </label>
                    <label className="text-xs font-semibold sm:col-span-2">Mã voucher
                      <input required maxLength={80} value={voucherDraft.code} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, code: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm uppercase" placeholder="Ví dụ: TASTE10" />
                    </label>
                    <label className="text-xs font-semibold">Có hiệu lực từ
                      <input required type="date" value={voucherDraft.validFrom} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, validFrom: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm" />
                    </label>
                    <label className="text-xs font-semibold">Đến hết ngày
                      <input required type="date" min={voucherDraft.validFrom} value={voucherDraft.validTo} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, validTo: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm" />
                    </label>
                    <label className="text-xs font-semibold sm:col-span-2 lg:col-span-3">Điều kiện sử dụng
                      <input maxLength={500} value={voucherDraft.terms} onChange={(event) => setVoucherDraft((draft) => ({ ...draft, terms: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 bg-white p-3 text-sm" placeholder="Ví dụ: Áp dụng cho một hóa đơn, không dùng cùng ưu đãi khác" />
                    </label>
                    <button disabled={voucherSubmitting} className="self-end rounded-xl bg-[#1E5631] px-5 py-3 text-sm font-bold text-white hover:bg-[#2E8B57] disabled:opacity-60">{voucherSubmitting ? 'Đang lưu...' : 'Thêm voucher'}</button>
                  </form>
                  {adminVouchers.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-[#D4B872]/60 p-5 text-center text-sm text-[#2C221E]/65">Chưa có ưu đãi đối tác. Chỉ thêm voucher sau khi quán xác nhận quyền lợi và điều kiện.</p>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {adminVouchers.map((voucher) => {
                        const tour = THEMED_TOURS.find((item) => item.id === voucher.tourId);
                        const tourTitle = voucher.tourId === '*' ? 'Tất cả tour' : tour?.title || 'Tour đã lưu';
                        const stopTitle = voucher.stopIndex === null ? '' : tour?.stops[voucher.stopIndex]?.name;
                        return <article key={voucher.id} className="rounded-2xl border border-[#D4B872]/30 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#1E5631]">{voucher.restaurantName} · {tourTitle}{stopTitle ? ` · ${stopTitle}` : ''}</p>
                              <h4 className="mt-1 font-bold text-[#8B0000]">{voucher.title}</h4>
                              <p className="mt-1 text-sm">{voucher.benefit}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${voucher.active ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{voucher.active ? 'Đang bật' : 'Đã ẩn'}</span>
                          </div>
                          <div className="mt-3 space-y-1 text-xs text-[#2C221E]/65">
                            <p>Mã: <strong className="text-[#2C221E]">{voucher.code}</strong></p>
                            <p>Hạn: {new Date(`${voucher.validFrom}T00:00:00`).toLocaleDateString('vi-VN')} – {new Date(`${voucher.validTo}T00:00:00`).toLocaleDateString('vi-VN')}</p>
                            {voucher.terms && <p>Điều kiện: {voucher.terms}</p>}
                          </div>
                          <button type="button" onClick={() => handleVoucherActiveChange(voucher)} className="mt-3 rounded-lg border border-[#1E5631]/30 px-3 py-2 text-xs font-bold text-[#1E5631] hover:bg-[#1E5631]/5">{voucher.active ? 'Tạm ẩn voucher' : 'Bật lại voucher'}</button>
                        </article>;
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>
        )}
        {/* BOOKING REQUEST */}
        {step === 'payment' && (
          <section className="max-w-2xl mx-auto px-5 sm:px-8 py-12 my-10">
            <div className="bg-white p-6 sm:p-9 rounded-3xl shadow-xl border border-[#D4B872]/30 space-y-6">
              <div><p className="text-xs uppercase tracking-widest font-bold text-[#1E5631]">TasteTrip · Đơn đặt tour</p><h2 className="mt-2 font-serif-playfair text-3xl font-bold text-[#8B0000]">Tra cứu đơn đặt tour</h2><p className="mt-2 text-sm text-[#2C221E]/70">Nhập số điện thoại đã dùng khi đặt tour để tìm lại mã đơn và xem lịch trình, trạng thái hoặc thông tin thanh toán.</p></div>
              <form onSubmit={handleCustomerBookingLookup} className="grid gap-3">
                <label className="block text-xs font-semibold">Số điện thoại đặt tour<input required type="tel" maxLength={30} value={paymentLookupPhone} onChange={(event) => { setPaymentLookupPhone(event.target.value); setCustomerBookingMatches([]); setCustomerBooking(null); setPaymentLookupError(''); }} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" /></label>
                <button disabled={paymentLookupLoading} className="rounded-xl bg-[#1E5631] px-5 py-3 font-bold text-white disabled:opacity-60">{paymentLookupLoading ? 'Đang tìm đơn...' : 'Tìm đơn bằng số điện thoại'}</button>
              </form>
              {paymentLookupError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{paymentLookupError}</p>}
              {customerBookingMatches.length > 0 && !customerBooking && <section className="space-y-3" aria-label="Các đơn tìm thấy">
                <p className="text-sm font-semibold text-[#2C221E]">Tìm thấy {customerBookingMatches.length} đơn gần đây. Chọn đơn để xem mã và chi tiết:</p>
                {customerBookingMatches.map((booking) => (
                  <article key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4B872]/30 bg-[#FAF6EE] p-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#8B0000]">{booking.tourTitle}</h3>
                      <p className="mt-1 text-xs text-[#2C221E]/65">{booking.id} · {new Date(`${booking.date}T00:00:00`).toLocaleDateString('vi-VN')} · {booking.guests} khách</p>
                    </div>
                    <button type="button" disabled={paymentLookupLoading} onClick={() => handleSelectCustomerBooking(booking)} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1E5631] shadow-sm disabled:opacity-60">{paymentLookupLoading ? 'Đang tải...' : 'Xem đơn'}</button>
                  </article>
                ))}
              </section>}
              {customerBooking && <article className="rounded-2xl border border-[#D4B872]/35 bg-[#FAF6EE] p-5 space-y-4">
                {customerBookingMatches.length > 0 && <button type="button" onClick={() => setCustomerBooking(null)} className="text-sm font-bold text-[#1E5631] hover:underline">Quay lại</button>}
                <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif-playfair text-xl font-bold text-[#8B0000]">{customerBooking.tourTitle}</h3><p className="text-xs text-[#2C221E]/60">Mã {customerBooking.id} · {new Date(`${customerBooking.date}T00:00:00`).toLocaleDateString('vi-VN')} · {customerBooking.guests} khách</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold">{customerBooking.status === 'new' ? 'Đang tiếp nhận' : customerBooking.status === 'contacted' ? 'Đang trao đổi' : customerBooking.status === 'confirmed' ? 'Đã xác nhận' : customerBooking.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}</span></div>
                <section className="rounded-2xl border border-[#D4B872]/25 bg-white p-4 sm:p-5 space-y-3" aria-label="Thông tin tour đã chọn">
                  <h4 className="font-bold text-[#1E5631]">Thông tin tour bạn đã chọn</h4>
                  {customerBooking.itinerary.length > 0 ? (
                    <ol className="space-y-3">
                      {customerBooking.itinerary.map((stop, index) => (
                        <li key={`${stop.day || 1}-${index}-${stop.name}`} className="flex gap-3 border-l-2 border-[#D4B872]/60 pl-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#1E5631]">{stop.day ? `Ngày ${stop.day} · ` : ''}{stop.mealType}{stop.time ? ` · ${stop.time}` : ''}</p>
                            <p className="font-bold text-[#8B0000]">{stop.name}</p>
                            {stop.address && <p className="text-xs text-[#2C221E]/65">{stop.address}</p>}
                            {stop.price && <p className="mt-1 text-xs text-[#2C221E]/65">Giá tham khảo: {stop.price}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : customerBooking.tourTitle.startsWith('Mở khóa lịch trình: ') && customerBooking.paymentStatus !== 'paid' ? (
                    <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Các ngày đã mở khóa sẽ xuất hiện sau khi TasteTrip xác nhận thanh toán.</p>
                  ) : (
                    <p className="text-sm text-[#2C221E]/65">Đơn này chưa có danh sách điểm dừng được lưu.</p>
                  )}
                </section>
                <p className="text-sm">Thanh toán: <strong>{customerBooking.paymentStatus === 'paid' ? 'Đã được TasteTrip xác nhận' : customerBooking.paymentStatus === 'awaiting_payment' ? 'Đang chờ TasteTrip đối soát' : customerBooking.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}</strong></p>
                {customerBooking.tourTitle.startsWith('Yêu cầu Local Buddy: ') && customerBooking.status !== 'confirmed' && <p className="rounded-xl bg-[#1E5631]/5 p-3 text-sm text-[#1E5631]">Yêu cầu đã được ghi nhận. TasteTrip sẽ xác nhận người dẫn và báo giá trước khi gửi thông tin thanh toán.</p>}
                {customerBooking.quotedTotalVnd !== null && <p className="text-lg">Tổng báo giá: <strong className="text-[#8B0000]">{customerBooking.quotedTotalVnd.toLocaleString('vi-VN')} đ</strong></p>}
                {customerBooking.guideName && <p className="text-sm">Local guide: <strong>{customerBooking.guideName}</strong>{customerBooking.guidePhone && <> · <a className="text-[#1E5631] underline" href={`tel:${customerBooking.guidePhone}`}>{customerBooking.guidePhone}</a></>}</p>}
                {customerBooking.payment && customerBooking.paymentStatus !== 'paid' && customerBooking.paymentStatus !== 'refunded' && <div className="grid sm:grid-cols-[220px_1fr] gap-5 items-center rounded-xl bg-white p-4">
                  <img src={customerBooking.payment.qrUrl} alt="Mã QR chuyển khoản TasteTrip" className="w-full max-w-[220px] rounded-xl border border-gray-100" />
                  <div className="space-y-2 text-sm"><h4 className="font-bold text-[#1E5631]">Thông tin thanh toán</h4><p>Ngân hàng: <strong>{customerBooking.payment.bankId || 'Theo QR'}</strong></p><p>Số tài khoản: <strong>{customerBooking.payment.accountNo || 'Quét mã QR'}</strong></p><p>Chủ tài khoản: <strong>{customerBooking.payment.accountName || 'Theo QR'}</strong></p><p>Số tiền: <strong>{customerBooking.payment.amount.toLocaleString('vi-VN')} đ</strong></p><p>Nội dung: <strong className="break-all">{customerBooking.payment.reference}</strong></p><p className="text-xs text-amber-800">Trước khi xác nhận trên ứng dụng ngân hàng, hãy kiểm tra đúng số tiền và nội dung ở trên. Nếu QR không tự điền, nhập thủ công.</p></div>
                </div>}
                {!customerBooking.payment && customerBooking.status === 'confirmed' && customerBooking.quotedTotalVnd && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Đơn đã được báo giá. Thông tin QR chưa được cấu hình; vui lòng liên hệ TasteTrip để nhận hướng dẫn chuyển khoản.</p>}
                {customerBooking.payment && customerBooking.paymentStatus !== 'paid' && customerBooking.paymentStatus !== 'awaiting_payment' && customerBooking.paymentStatus !== 'refunded' && <button type="button" onClick={handleCustomerPaymentReport} disabled={paymentLookupLoading} className="w-full rounded-xl bg-[#8B0000] px-5 py-3 font-bold text-white disabled:opacity-60">{paymentLookupLoading ? 'Đang gửi yêu cầu...' : 'Yêu cầu đối soát thanh toán'}</button>}
              {customerBooking.paymentStatus === 'awaiting_payment' && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">TasteTrip đang đối soát giao dịch. Khi xác nhận đúng số tiền và nội dung, lịch trình sẽ tự mở tại đây.</p>}
              </article>}
              <button type="button" onClick={() => changeStep('start')} className="text-sm font-bold text-[#8B0000] hover:underline">Về trang chủ</button>
            </div>
          </section>
        )}

        {step === 'checkout' && (
          <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-[40px] shadow-2xl border border-[#D4B872]/20 space-y-7 animate-motion-floatIn my-16">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => changeStep('render-details')} className="text-[10px] font-black uppercase tracking-widest text-[#8B0000] hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <span className="text-[10px] font-black text-[#1E5631] bg-[#1E5631]/10 px-3 py-1 rounded-full">Thanh toán trực tiếp</span>
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-serif-playfair text-3xl font-bold text-[#8B0000]">{checkoutProduct === 'buddy' ? 'Yêu cầu Local Buddy' : checkoutProduct === 'unlock' ? 'Mở khóa lịch trình' : 'Xác nhận tour & thanh toán'}</h2>
              <p className="font-serif-lora text-xs text-[#2C221E]/60">{checkoutProduct === 'buddy' ? 'Gửi thông tin để TasteTrip xác nhận hướng dẫn viên. Bạn chưa phải thanh toán ở bước này.' : 'Nhập thông tin một lần. Mã đơn và QR sẽ hiện ngay sau khi tạo đơn.'}</p>
            </div>
            <div className="bg-[#FAF6EE] p-5 rounded-3xl space-y-3 border border-[#D4B872]/30 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#2C221E]/70">Tour:</span><strong className="text-right text-[#8B0000]">{activeTour.title}</strong></div>
              {checkoutProduct === 'unlock' ? <><div className="flex justify-between"><span className="text-[#2C221E]/70">Quyền lợi:</span><strong>Mở toàn bộ các ngày còn lại</strong></div><div className="border-t border-[#D4B872]/30 pt-3 flex justify-between gap-4 font-bold"><span>Phí mở khóa:</span><strong className="text-[#8B0000]">49.000 đ</strong></div></> : checkoutProduct === 'buddy' ? <><div className="flex justify-between"><span className="text-[#2C221E]/70">Dịch vụ:</span><strong>Local Buddy · Ngày 1</strong></div><div className="border-t border-[#D4B872]/30 pt-3 text-sm">Mức tham khảo 150.000đ/buổi. TasteTrip xác nhận tình trạng người dẫn và báo giá trước khi tạo QR.</div></> : <><div className="flex justify-between"><span className="text-[#2C221E]/70">Điểm dừng:</span><strong>{activeTour.stops.length}</strong></div><div className="border-t border-[#D4B872]/30 pt-3 flex justify-between gap-4"><span>Ăn uống tham khảo:</span><strong className="text-[#8B0000]">{activeTour.totalCost || 'Chưa có dữ liệu'} / người</strong></div><div className="border-t border-[#D4B872]/30 pt-3 flex justify-between gap-4 font-bold"><span>Tổng dự toán ({bookingGuests} khách):</span><strong className="text-[#8B0000]">{estimatedTripTotalVnd.toLocaleString('vi-VN')} đ</strong></div></>}
</div>
            {!customerBooking && (
            <form onSubmit={handleBookingSubmit} className="space-y-4">

              {checkoutProduct !== 'unlock' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-[#2C221E]">{checkoutProduct === 'buddy' ? 'Ngày muốn có Local Buddy' : 'Ngày trải nghiệm'}
                  <input required type="date" min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" />
                </label>
                {checkoutProduct === 'tour' && <label className="block text-xs font-semibold text-[#2C221E]">Số khách (1–20)
                  <input required type="number" min="1" max="20" value={bookingGuests} onChange={(event) => setBookingGuests(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" />
                </label>}
              </div>}
              <label className="block text-xs font-semibold text-[#2C221E]">Họ và tên
                <input required maxLength={100} value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" />
              </label>
              <div className="block">
                <label className="block text-xs font-semibold text-[#2C221E]">Số điện thoại
                  <input required type="tel" maxLength={30} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} autoComplete="tel" className="mt-1 w-full rounded-xl border border-[#D4B872]/50 p-3 text-sm" />
                </label>
                
              </div>
              
              {bookingError && <p ref={bookingErrorRef} role="alert" aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{bookingError}</p>}
              <button type="submit" disabled={bookingSubmitting} className="w-full bg-[#1E5631] hover:bg-[#2E8B57] disabled:opacity-60 text-white py-4 rounded-2xl font-sans-poppins font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 focus-ring-accessible">{bookingSubmitting ? 'Đang tạo đơn...' : checkoutProduct === 'buddy' ? 'Gửi yêu cầu Local Buddy' : checkoutProduct === 'unlock' ? 'Tạo đơn & hiện QR 49.000đ' : 'Xác nhận & thanh toán'}</button>
              <p className="text-[11px] text-[#2C221E]/60">{checkoutProduct === 'buddy' ? 'Chưa thu tiền ở bước gửi yêu cầu; QR chỉ được tạo sau khi TasteTrip xác nhận hướng dẫn viên và báo giá.' : checkoutProduct === 'unlock' ? 'Ngày 2 và các ngày còn lại chỉ mở sau khi TasteTrip xác nhận khoản chuyển 49.000đ.' : 'Tổng tiền là dự toán ăn uống theo lịch trình nhân với số khách; không gồm xe hoặc hướng dẫn viên.'}</p>
            </form>
            )}
            {customerBooking && <section ref={bookingPaymentRef} tabIndex={-1} className="rounded-3xl border border-[#1E5631]/20 bg-[#FAF6EE] p-5 sm:p-7 space-y-5 focus:outline-none" aria-live="polite">
              {bookingRecoveryNotice && !(customerBooking.tourTitle.startsWith('Yêu cầu Local Buddy: ') && customerBooking.status === 'confirmed') && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{bookingRecoveryNotice}</p>}
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-[#1E5631]" />
                <h3 className="mt-3 font-serif-playfair text-2xl font-bold text-[#8B0000]">{customerBooking.tourTitle.startsWith('Yêu cầu Local Buddy: ') ? 'Đã gửi yêu cầu Local Buddy' : 'Đơn tour đã được tạo'}</h3>
                <p className="mt-1 text-sm text-[#2C221E]/70">Mã đơn: <strong className="text-[#8B0000]">{customerBooking.id}</strong></p>
              </div>
              {customerBooking.quotedTotalVnd !== null ? <div className="flex items-center justify-between border-y border-[#D4B872]/30 py-3 text-sm"><span>{customerBooking.tourTitle.startsWith('Mở khóa lịch trình: ') ? 'Phí mở khóa' : `Tổng dự toán cho ${customerBooking.guests} khách`}</span><strong className="text-lg text-[#8B0000]">{customerBooking.quotedTotalVnd.toLocaleString('vi-VN')} đ</strong></div> : customerBooking.tourTitle.startsWith('Yêu cầu Local Buddy: ') && <p className="rounded-xl border-y border-[#D4B872]/30 py-3 text-sm">TasteTrip sẽ xác nhận người dẫn và báo giá trước khi gửi thông tin thanh toán.</p>}
              {customerBooking.payment ? <div className="grid sm:grid-cols-[220px_1fr] gap-5 items-center rounded-2xl bg-white p-4">
                <img src={customerBooking.payment.qrUrl} alt="QR chuyển khoản TasteTrip" className="w-full max-w-[220px] rounded-xl border border-gray-100" />
                <div className="space-y-2 text-sm"><h4 className="font-bold text-[#1E5631]">Thông tin thanh toán</h4><p>Ngân hàng: <strong>{customerBooking.payment.bankId}</strong></p><p>Số tài khoản: <strong>{customerBooking.payment.accountNo}</strong></p><p>Chủ tài khoản: <strong>{customerBooking.payment.accountName}</strong></p><p>Số tiền: <strong>{customerBooking.payment.amount.toLocaleString('vi-VN')} đ</strong></p><p>Nội dung: <strong className="break-all">{customerBooking.payment.reference}</strong></p><p className="text-xs text-amber-800">Trước khi xác nhận trên ứng dụng ngân hàng, hãy kiểm tra đúng số tiền và nội dung ở trên. Nếu QR không tự điền, nhập thủ công.</p></div>
              </div> : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Đơn đã được lưu nhưng QR chưa khả dụng. Vui lòng liên hệ TasteTrip để hoàn tất thanh toán.</p>}
              <p className="text-xs leading-relaxed text-[#2C221E]/65">Số tiền được tính từ dự toán ăn uống trong lịch trình nhân với số khách; chưa gồm xe và hướng dẫn viên. Đơn sẽ được TasteTrip xác nhận thanh toán sau khi đối soát.</p>
              {customerBooking.paymentStatus === 'not_paid' && customerBooking.payment && <button type="button" onClick={handleCustomerPaymentReport} disabled={paymentLookupLoading} className="w-full rounded-2xl bg-[#1E5631] px-5 py-4 font-sans-poppins text-sm font-bold text-white disabled:opacity-60">{paymentLookupLoading ? 'Đang gửi yêu cầu...' : 'Yêu cầu đối soát thanh toán'}</button>}
              {customerBooking.paymentStatus === 'awaiting_payment' && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">TasteTrip đang đối soát giao dịch. Khi xác nhận đúng số tiền và nội dung, lịch trình sẽ tự mở tại đây.</p>}
              {customerBooking.paymentStatus === 'paid' && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">TasteTrip đã xác nhận thanh toán.</p>}
            </section>}
          </div>
        )}
        {/* BOOKING CONFIRMATION */}

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
          className="fixed bottom-6 right-6 z-[160] flex items-center gap-3 bg-[#1C4329] hover:bg-[#285E3A] text-white px-5 py-3 rounded-full shadow-editorial-lg border-2 border-[#C59B4B]/60 hover:scale-105 active:scale-95 transition-all duration-300 group focus-ring-accessible cursor-pointer"
          title="Trò chuyện cùng Trợ lý AI TasteTrip"
          aria-label="Mở chatbox Trợ lý AI"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#1C4329] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#E0BA6A]">Trợ Lý AI</div>
            <div className="text-xs font-semibold leading-tight text-white font-sans">Hỏi đáp ẩm thực 24/7</div>
          </div>
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 z-[160] w-[92vw] sm:w-[410px] h-[570px] max-h-[85vh] bg-white rounded-[28px] shadow-editorial-lg border border-[#C59B4B]/35 flex flex-col overflow-hidden animate-motion-floatIn">
          {/* POPUP HEADER */}
          <div className="bg-[#1C4329] text-white p-4 flex items-center justify-between border-b border-[#C59B4B]/25 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#1C4329] flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-serif-playfair font-bold text-sm tracking-wide flex items-center gap-1.5 text-white">
                  Trợ Lý Ẩm Thực TasteTrip
                  <Sparkles className="w-3.5 h-3.5 text-[#E0BA6A]" />
                </h3>
                <p className="text-[10px] text-white/80 flex items-center gap-1 font-sans">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Trực tuyến • Tư vấn du lịch ẩm thực
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
          <div className="px-3.5 py-2.5 bg-[#FAF7F2] border-b border-[#C59B4B]/20 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              'Phở ngon nhất ở Hà Nội?',
              'Đặc sản miền Trung nên thử?',
              'Gợi ý ăn sáng Sài Gòn',
              'Ăn gì ở Đà Lạt?'
            ].map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChatInput(hint)}
                className="whitespace-nowrap text-[11px] font-sans px-3 py-1 rounded-full bg-white border border-[#C59B4B]/30 text-[#2C221E]/80 hover:bg-[#8B1E1E] hover:text-white hover:border-[#8B1E1E] transition-all cursor-pointer shadow-xs"
              >
                💡 {hint}
              </button>
            ))}
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed shadow-editorial ${
                    msg.role === 'user'
                      ? 'bg-[#8B1E1E] text-white rounded-br-xs'
                      : 'bg-white text-[#2C221E] border border-[#C59B4B]/30 rounded-bl-xs'
                  }`}
                >
                  {formatChatLines(msg.text).map((line, lIdx) => {
                    if (!line.text) return <div key={lIdx} className="h-2" aria-hidden="true" />;
                    if (line.kind === 'heading') {
                      return <div key={lIdx} className="font-bold text-sm mt-2 first:mt-0 font-serif-playfair">{renderChatText(line.text)}</div>;
                    }
                    if (line.kind === 'bullet') {
                      return <div key={lIdx} className="flex gap-1.5 pl-1"><span aria-hidden="true">•</span><span>{renderChatText(line.text)}</span></div>;
                    }
                    if (line.kind === 'number') {
                      return <div key={lIdx} className="pl-1">{renderChatText(line.text)}</div>;
                    }
                    return <div key={lIdx}>{renderChatText(line.text)}</div>;
                  })}
                  {msg.partnerLinks && msg.partnerLinks.length > 0 && <div className="mt-3 flex flex-wrap gap-2 border-t border-[#C59B4B]/30 pt-3">
                    {msg.partnerLinks.map((link) => <a key={`${link.partner}-${link.provinceId}`} href={link.url} target="_blank" rel="sponsored noopener noreferrer" onClick={() => { void logAffiliateClick(link.partner, link.provinceId, 'assistant_chat'); }} className="rounded-lg border border-[#1C4329]/20 bg-[#FAF7F2] px-3 py-1.5 text-[11px] font-bold text-[#1C4329] hover:bg-white transition-colors">Xem trên {link.partner} ↗</a>)}
                  </div>}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#2C221E] p-3.5 rounded-2xl rounded-bl-xs border border-[#C59B4B]/30 text-xs flex items-center gap-2 shadow-editorial">
                  <div className="w-2 h-2 bg-[#8B1E1E] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#8B1E1E] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-[#8B1E1E] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-[#2C221E]/65 ml-1 font-sans italic">AI đang chắt lọc gợi ý ẩm thực...</span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-[#C59B4B]/20 flex gap-2 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Hỏi món ngon, quán ăn, văn hóa..."
              className="flex-1 px-4 py-2.5 bg-[#FAF7F2] border border-[#C59B4B]/30 rounded-xl font-sans text-xs text-[#2C221E] focus:outline-none focus:border-[#8B1E1E] transition-colors"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-[#8B1E1E] hover:bg-[#6D1414] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-editorial focus-ring-accessible flex items-center justify-center cursor-pointer"
              title="Gửi tin nhắn"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
