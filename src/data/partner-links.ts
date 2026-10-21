export interface AffiliateLink {
  partner: string;
  url: string;
}

export interface ProvincePartnerLinks {
  tourLinks: AffiliateLink[];
  hotelLinks: AffiliateLink[];
  transportLinks: AffiliateLink[];
}

export interface PartnerPublicWebsite {
  url: string;
  logoDomain: string;
  hotelUrl?: string;
  transportUrl?: string;
  tourUrl?: string;
}

// Direct public destinations used while TasteTrip is demonstrating partner referrals.
// Replace these with affiliate URLs only after an affiliate campaign is approved.
export const PARTNER_PUBLIC_WEBSITES: Record<string, PartnerPublicWebsite> = {
  Klook: { url: 'https://www.klook.com/vi/', transportUrl: 'https://www.klook.com/vi/airport-transfers/', tourUrl: 'https://www.klook.com/vi/experiences/list/vietnam-tours-experiences/g13/', logoDomain: 'klook.com' },
  Traveloka: { url: 'https://www.traveloka.com/vi-vn', hotelUrl: 'https://www.traveloka.com/vi-vn/hotel', transportUrl: 'https://www.traveloka.com/vi-vn/bus-and-shuttle', logoDomain: 'traveloka.com' },
  'Trip.com': { url: 'https://vn.trip.com/', hotelUrl: 'https://vn.trip.com/hotels/', transportUrl: 'https://vn.trip.com/things-to-do/vietnam-100046/transport/', logoDomain: 'trip.com' },
  Agoda: { url: 'https://www.agoda.com/vi-vn/', hotelUrl: 'https://www.agoda.com/vi-vn/', logoDomain: 'agoda.com' },
  'Booking.com': { url: 'https://www.booking.com/', hotelUrl: 'https://www.booking.com/', transportUrl: 'https://www.booking.com/transportation/index.html', logoDomain: 'booking.com' },
  Go2Joy: { url: 'https://go2joy.vn/vi-vn', hotelUrl: 'https://go2joy.vn/vi-vn', logoDomain: 'go2joy.vn' },
};

// Display names are explicit so an AI itinerary and a preset itinerary use the same destination.
export const PARTNER_DESTINATION_NAMES: Record<string, string> = {
  hanoi: 'Hà Nội', hue: 'Huế', laichau: 'Lai Châu', dienbien: 'Điện Biên', sonla: 'Sơn La', langson: 'Lạng Sơn', quangninh: 'Quảng Ninh', thanhhoa: 'Thanh Hóa', nghean: 'Nghệ An', hatinh: 'Hà Tĩnh', caobang: 'Cao Bằng',
  tuyenquang: 'Tuyên Quang', laocai: 'Lào Cai', thainguyen: 'Thái Nguyên', phutho: 'Phú Thọ', bacninh: 'Bắc Ninh', hungyen: 'Hưng Yên', haiphong: 'Hải Phòng', ninhbinh: 'Ninh Bình', quangtri: 'Quảng Trị', danang: 'Đà Nẵng',
  quangngai: 'Quảng Ngãi', gialai: 'Gia Lai', khanhhoa: 'Khánh Hòa', lamdong: 'Lâm Đồng', daklak: 'Đắk Lắk', tphcm: 'Thành phố Hồ Chí Minh', dongnai: 'Đồng Nai', tayninh: 'Tây Ninh', cantho: 'Cần Thơ', vinhlong: 'Vĩnh Long',
  dongthap: 'Đồng Tháp', camau: 'Cà Mau', angiang: 'An Giang',
};

// Verified public destination codes. Partners use different IDs, and some old
// provinces no longer have a dedicated destination page on the partner site.
const TRAVELOKA_HOTEL_DESTINATIONS: Record<string, string> = {
  hanoi: 'region/hanoi-10009843', haiphong: 'region/hai-phong-10009800', caobang: 'region/cao-bang-10009997',
  tuyenquang: 'region/tuyen-quang-10009911', laocai: 'region/yen-bai-10009816', langson: 'region/lang-son-10009814',
  quangninh: 'region/quang-ninh-10009904', dienbien: 'region/dien-bien-10010201', laichau: 'region/lai-chau-10010379',
  sonla: 'region/son-la-10009798', thanhhoa: 'region/thanh-hoa-10009808', nghean: 'region/nghe-an-10009860',
  hatinh: 'region/ha-tinh-10010066', ninhbinh: 'city/ninh-binh-30010653', quangtri: 'region/quang-binh-10009827',
  hue: 'region/hue-10010312', quangngai: 'region/quang-ngai-10010040', khanhhoa: 'region/khanh-hoa-10009841',
  cantho: 'region/can-tho-10009866', camau: 'city/ca-mau-30010284', bacninh: 'region/bac-giang-10009858',
};

const TRIPCOM_HOTEL_DESTINATIONS: Record<string, string> = {
  hanoi: 'hanoi-hotels-list-286', tphcm: 'ho-chi-minh-city-hotels-list-301', danang: 'da-nang-hotels-list-1356',
  lamdong: 'dalat-hotels-list-5204', khanhhoa: 'nha-trang-hotels-list-1777', haiphong: 'haiphong-hotels-list-6942',
};

const KLOOK_CITY_CODES: Record<string, string> = {
  hanoi: 'c34-hanoi', tphcm: 'c33-ho-chi-minh-city', hue: 'c35-hue', danang: 'c74-da-nang',
  quangninh: 'c486-halong', lamdong: 'c207-da-lat', khanhhoa: 'c208-nha-trang', laocai: 'c290-sapa',
};

// Only use partner-specific destination URLs where their public URL structure is known.
export function getPartnerCategoryUrl(partner: string, category: 'hotel' | 'transport' | 'tour', provinceId?: string): string | undefined {
  const website = PARTNER_PUBLIC_WEBSITES[partner];
  if (!website) return undefined;
  const destination = provinceId ? PARTNER_DESTINATION_NAMES[provinceId] : undefined;
  if (provinceId && category === 'hotel' && partner === 'Traveloka' && TRAVELOKA_HOTEL_DESTINATIONS[provinceId]) {
    return `https://www.traveloka.com/vi-vn/hotel/vietnam/${TRAVELOKA_HOTEL_DESTINATIONS[provinceId]}`;
  }
  if (provinceId && category === 'hotel' && partner === 'Trip.com' && TRIPCOM_HOTEL_DESTINATIONS[provinceId]) {
    return `https://vn.trip.com/hotels/${TRIPCOM_HOTEL_DESTINATIONS[provinceId]}/`;
  }
  if (destination && category === 'hotel' && partner === 'Trip.com') {
    const params = new URLSearchParams({ searchWord: destination, curr: 'VND', locale: 'vi-VN' });
    return `https://vn.trip.com/hotels/list?${params.toString()}`;
  }
  if (provinceId === 'hanoi' && category === 'hotel' && partner === 'Agoda') {
    return 'https://www.agoda.com/vi-vn/city/hanoi-vn.html';
  }
  if (destination && category === 'hotel' && partner === 'Agoda') {
    // Agoda accepts textToSearch as a prefilled search term; the guest may still
    // need to choose the matching destination and dates on Agoda.
    const params = new URLSearchParams({ textToSearch: destination });
    return `https://www.agoda.com/vi-vn/?${params.toString()}`;
  }
  const klookCity = provinceId ? KLOOK_CITY_CODES[provinceId] : undefined;
  if (klookCity && category === 'tour' && partner === 'Klook') {
    return `https://www.klook.com/vi/destination/${klookCity}/1001-tours/`;
  }
  if (klookCity && category === 'transport' && partner === 'Klook') {
    return `https://www.klook.com/transport/trains/?city_id=${klookCity.match(/^c(\d+)-/)?.[1]}`;
  }
  if (destination && category === 'hotel' && partner === 'Booking.com') {
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
  }
  if (provinceId === 'hanoi' && category === 'tour' && partner === 'Klook') {
    return 'https://www.klook.com/vi/destination/c34-hanoi/1001-tours/';
  }
  return category === 'hotel' ? website.hotelUrl : category === 'transport' ? website.transportUrl : website.tourUrl;
}

export const AFFILIATE_LINK_PLACEHOLDER = 'REPLACE_WITH_MY_AFFILIATE_LINK';

const PROVINCE_IDS = [
  'hanoi', 'hue', 'laichau', 'dienbien', 'sonla', 'langson', 'quangninh', 'thanhhoa', 'nghean', 'hatinh', 'caobang',
  'tuyenquang', 'laocai', 'thainguyen', 'phutho', 'bacninh', 'hungyen', 'haiphong', 'ninhbinh', 'quangtri', 'danang',
  'quangngai', 'gialai', 'khanhhoa', 'lamdong', 'daklak', 'tphcm', 'dongnai', 'tayninh', 'cantho', 'vinhlong',
  'dongthap', 'camau', 'angiang',
] as const;

const createPlaceholderLinks = (partners: string[]): AffiliateLink[] => partners.map((partner) => ({
  partner,
  url: AFFILIATE_LINK_PLACEHOLDER,
}));

const PARTNER_LINK_TEMPLATE: ProvincePartnerLinks = {
  tourLinks: createPlaceholderLinks(['Klook']),
  hotelLinks: createPlaceholderLinks(['Traveloka', 'Trip.com', 'Agoda', 'Booking.com', 'Go2Joy']),
  transportLinks: createPlaceholderLinks(['Traveloka', 'Trip.com', 'Klook']),
};

// Fill only the partner URLs you have personally received. This keeps one province
// independent from the others; an empty array hides that group in the interface.
export const PROVINCE_PARTNER_LINK_OVERRIDES: Partial<Record<string, Partial<ProvincePartnerLinks>>> = {
  // Example after receiving an approved link:
  // hanoi: { tourLinks: [{ partner: 'Klook', url: 'REPLACE_WITH_MY_AFFILIATE_LINK' }] },
};

// Only the 34 current province/city IDs are exposed to the application.
export const PROVINCE_PARTNER_LINKS: Record<string, ProvincePartnerLinks> = Object.fromEntries(
  PROVINCE_IDS.map((provinceId) => [
    provinceId,
    {
      tourLinks: (PROVINCE_PARTNER_LINK_OVERRIDES[provinceId]?.tourLinks || PARTNER_LINK_TEMPLATE.tourLinks).map((link) => ({ ...link })),
      hotelLinks: (PROVINCE_PARTNER_LINK_OVERRIDES[provinceId]?.hotelLinks || PARTNER_LINK_TEMPLATE.hotelLinks).map((link) => ({ ...link })),
      transportLinks: (PROVINCE_PARTNER_LINK_OVERRIDES[provinceId]?.transportLinks || PARTNER_LINK_TEMPLATE.transportLinks).map((link) => ({ ...link })),
    },
  ]),
);

export function isActiveAffiliateLink(link: AffiliateLink): boolean {
  return link.url !== AFFILIATE_LINK_PLACEHOLDER && /^https:\/\//i.test(link.url);
}
