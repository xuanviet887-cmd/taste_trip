export interface CurrentProvince {
  id: string;
  name: string;
  /** Existing curated itinerary used as a food-tour starting point for this province. */
  sourceTourId: string;
  /** City or former provincial seat represented by the available itinerary. */
  itineraryCenter: string;
  legacyNames: string[];
}

// Current 34 province/city structure, based on Resolution 202/2025/QH15.
// The app keeps one curated itinerary per current province and reuses the
// existing food route closest to its political-administrative center.
export const CURRENT_PROVINCES: CurrentProvince[] = [
  { id: 'hanoi', name: 'Hà Nội', sourceTourId: 'hanoi', itineraryCenter: 'Hà Nội', legacyNames: [] },
  { id: 'hue', name: 'Huế', sourceTourId: 'hue', itineraryCenter: 'Huế', legacyNames: ['Thừa Thiên Huế'] },
  { id: 'laichau', name: 'Lai Châu', sourceTourId: 'laichau', itineraryCenter: 'Lai Châu', legacyNames: [] },
  { id: 'dienbien', name: 'Điện Biên', sourceTourId: 'dienbien', itineraryCenter: 'Điện Biên', legacyNames: [] },
  { id: 'sonla', name: 'Sơn La', sourceTourId: 'sonla', itineraryCenter: 'Sơn La', legacyNames: [] },
  { id: 'langson', name: 'Lạng Sơn', sourceTourId: 'langson', itineraryCenter: 'Lạng Sơn', legacyNames: [] },
  { id: 'quangninh', name: 'Quảng Ninh', sourceTourId: 'quangninh', itineraryCenter: 'Quảng Ninh', legacyNames: [] },
  { id: 'thanhhoa', name: 'Thanh Hóa', sourceTourId: 'thanhhoa', itineraryCenter: 'Thanh Hóa', legacyNames: [] },
  { id: 'nghean', name: 'Nghệ An', sourceTourId: 'nghean', itineraryCenter: 'Nghệ An', legacyNames: [] },
  { id: 'hatinh', name: 'Hà Tĩnh', sourceTourId: 'hatinh', itineraryCenter: 'Hà Tĩnh', legacyNames: [] },
  { id: 'caobang', name: 'Cao Bằng', sourceTourId: 'caobang', itineraryCenter: 'Cao Bằng', legacyNames: [] },
  { id: 'tuyenquang', name: 'Tuyên Quang', sourceTourId: 'tuyenquang', itineraryCenter: 'Tuyên Quang', legacyNames: ['Hà Giang'] },
  { id: 'laocai', name: 'Lào Cai', sourceTourId: 'yenbai', itineraryCenter: 'Yên Bái', legacyNames: ['Yên Bái'] },
  { id: 'thainguyen', name: 'Thái Nguyên', sourceTourId: 'thainguyen', itineraryCenter: 'Thái Nguyên', legacyNames: ['Bắc Kạn'] },
  { id: 'phutho', name: 'Phú Thọ', sourceTourId: 'phutho', itineraryCenter: 'Phú Thọ', legacyNames: ['Vĩnh Phúc', 'Hòa Bình'] },
  { id: 'bacninh', name: 'Bắc Ninh', sourceTourId: 'bacgiang', itineraryCenter: 'Bắc Giang', legacyNames: ['Bắc Giang'] },
  { id: 'hungyen', name: 'Hưng Yên', sourceTourId: 'hungyen', itineraryCenter: 'Hưng Yên', legacyNames: ['Thái Bình'] },
  { id: 'haiphong', name: 'Hải Phòng', sourceTourId: 'haiphong', itineraryCenter: 'Hải Phòng', legacyNames: ['Hải Dương'] },
  { id: 'ninhbinh', name: 'Ninh Bình', sourceTourId: 'ninhbinh', itineraryCenter: 'Ninh Bình', legacyNames: ['Hà Nam', 'Nam Định'] },
  { id: 'quangtri', name: 'Quảng Trị', sourceTourId: 'quangbinh', itineraryCenter: 'Quảng Bình', legacyNames: ['Quảng Bình'] },
  { id: 'danang', name: 'Đà Nẵng', sourceTourId: 'danang', itineraryCenter: 'Đà Nẵng', legacyNames: ['Quảng Nam'] },
  { id: 'quangngai', name: 'Quảng Ngãi', sourceTourId: 'quangngai', itineraryCenter: 'Quảng Ngãi', legacyNames: ['Kon Tum'] },
  { id: 'gialai', name: 'Gia Lai', sourceTourId: 'binhdinh', itineraryCenter: 'Bình Định', legacyNames: ['Bình Định'] },
  { id: 'khanhhoa', name: 'Khánh Hòa', sourceTourId: 'khanhhoa', itineraryCenter: 'Khánh Hòa', legacyNames: ['Ninh Thuận'] },
  { id: 'lamdong', name: 'Lâm Đồng', sourceTourId: 'lamdong', itineraryCenter: 'Lâm Đồng', legacyNames: ['Đắk Nông', 'Bình Thuận'] },
  { id: 'daklak', name: 'Đắk Lắk', sourceTourId: 'daklak', itineraryCenter: 'Đắk Lắk', legacyNames: ['Phú Yên'] },
  { id: 'tphcm', name: 'Thành phố Hồ Chí Minh', sourceTourId: 'tphcm', itineraryCenter: 'Thành phố Hồ Chí Minh', legacyNames: ['Bà Rịa - Vũng Tàu', 'Bình Dương'] },
  { id: 'dongnai', name: 'Đồng Nai', sourceTourId: 'dongnai', itineraryCenter: 'Đồng Nai', legacyNames: ['Bình Phước'] },
  { id: 'tayninh', name: 'Tây Ninh', sourceTourId: 'longan', itineraryCenter: 'Long An', legacyNames: ['Long An'] },
  { id: 'cantho', name: 'Cần Thơ', sourceTourId: 'cantho', itineraryCenter: 'Cần Thơ', legacyNames: ['Sóc Trăng', 'Hậu Giang'] },
  { id: 'vinhlong', name: 'Vĩnh Long', sourceTourId: 'vinhlong', itineraryCenter: 'Vĩnh Long', legacyNames: ['Bến Tre', 'Trà Vinh'] },
  { id: 'dongthap', name: 'Đồng Tháp', sourceTourId: 'tiengiang', itineraryCenter: 'Tiền Giang', legacyNames: ['Tiền Giang'] },
  { id: 'camau', name: 'Cà Mau', sourceTourId: 'camau', itineraryCenter: 'Cà Mau', legacyNames: ['Bạc Liêu'] },
  { id: 'angiang', name: 'An Giang', sourceTourId: 'kiengiang', itineraryCenter: 'Kiên Giang', legacyNames: ['Kiên Giang'] },
];

export const CURRENT_PROVINCE_BY_ID = Object.fromEntries(
  CURRENT_PROVINCES.map((province) => [province.id, province]),
) as Record<string, CurrentProvince>;

const LEGACY_PROVINCE_GROUPS: Record<string, string[]> = {
  hanoi: ['hanoi'], haiphong: ['haiphong', 'haiduong'], hanam: ['ninhbinh'], haiduong: ['haiphong'], hungyen: ['hungyen'],
  namdinh: ['ninhbinh'], ninhbinh: ['ninhbinh'], thaibinh: ['hungyen'], vinhphuc: ['phutho'], bacninh: ['bacninh'],
  bacgiang: ['bacninh'], backan: ['thainguyen'], caobang: ['caobang'], hagiang: ['tuyenquang'], langson: ['langson'],
  phutho: ['phutho'], quangninh: ['quangninh'], thainguyen: ['thainguyen'], tuyenquang: ['tuyenquang'], dienbien: ['dienbien'],
  hoabinh: ['phutho'], laichau: ['laichau'], laocai: ['laocai'], sonla: ['sonla'], yenbai: ['laocai'], thanhhoa: ['thanhhoa'],
  nghean: ['nghean'], hatinh: ['hatinh'], quangbinh: ['quangtri'], quangtri: ['quangtri'], hue: ['hue'], danang: ['danang'],
  quangnam: ['danang'], quangngai: ['quangngai'], binhdinh: ['gialai'], phuyen: ['daklak'], khanhhoa: ['khanhhoa'],
  ninhthuan: ['khanhhoa'], binhthuan: ['lamdong'], daklak: ['daklak'], daknong: ['lamdong'], gialai: ['gialai'], kontum: ['quangngai'],
  lamdong: ['lamdong'], vungtau: ['tphcm'], binhduong: ['tphcm'], binhphuoc: ['dongnai'], dongnai: ['dongnai'], tphcm: ['tphcm'],
  tayninh: ['tayninh'], angiang: ['angiang'], baclieu: ['camau'], bentre: ['vinhlong'], camau: ['camau'], cantho: ['cantho'],
  dongthap: ['dongthap'], haugiang: ['cantho'], kiengiang: ['angiang'], longan: ['tayninh'], soctrang: ['cantho'], tiengiang: ['dongthap'],
  travinh: ['vinhlong'], vinhlong: ['vinhlong'],
};

export const LEGACY_PROVINCE_TO_CURRENT: Record<string, string> = Object.fromEntries(
  Object.entries(LEGACY_PROVINCE_GROUPS).map(([legacyId, [currentId]]) => [legacyId, currentId]),
);
