const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // VS Code Port Forwarding (.app.github.dev or .githubpreview.dev)
    if (hostname.includes('.app.github.dev') || hostname.includes('.githubpreview.dev')) {
      const cleanHost = hostname.replace(/-[0-9]+(\.app\.github\.dev|\.githubpreview\.dev)/, '-3001$1');
      return `https://${cleanHost}/api`;
    }
    // VS Code Dev Tunnels with regional subdomain (e.g. .asse.devtunnels.ms)
    if (hostname.includes('.devtunnels.ms')) {
      const cleanHost = hostname.replace(/-[0-9]+(\..*\.devtunnels\.ms)/, '-3001$1');
      return `https://${cleanHost}/api`;
    }
    // Check localStorage override
    const customApi = localStorage.getItem('tastetrip_api_base');
    if (customApi) return customApi;

    // If accessed via IP or custom domain on port 5173/5174
    const origin = window.location.origin;
    if (origin.includes(':5173') || origin.includes(':5174')) {
      return `${origin.replace(/:(5173|5174)/, ':3001')}/api`;
    }
  }
  return 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

export interface BookingRequest {
  tourId: string;
  itineraryId?: string;
  tourTitle: string;
  kind: 'self-guided' | 'guided';
  date: string;
  guests: number;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  estimatedFoodCostPerPerson: number | null;
  itinerary: BookingItineraryStop[];
}

export interface BookingItineraryStop {
  day?: number;
  time: string;
  mealType: string;
  name: string;
  address: string;
  image?: string;
  price: string;
  category: string;
  cultureStory: string;
  tastingTip: string;
  englishMenu: string;
  distance: string;
}

export type BookingStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingRecord extends BookingRequest {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: BookingStatus;
  paymentStatus: 'not_paid' | 'awaiting_payment' | 'paid' | 'refunded';
  quotedTotalVnd: number | null;
  adminNote: string;
  guideName: string;
  guidePhone: string;
}

export interface CustomerBookingView {
  id: string;
  tourId: string;
  tourTitle: string;
  itinerary: BookingItineraryStop[];
  status: BookingStatus;
  paymentStatus: BookingRecord['paymentStatus'];
  date: string;
  guests: number;
  kind: BookingRecord['kind'];
  quotedTotalVnd: number | null;
  guideName: string;
  guidePhone: string;
  payment: null | {
    bankId: string;
    accountNo: string;
    accountName: string;
    amount: number;
    reference: string;
    qrUrl: string;
  };
}

export interface CustomerBookingSummary {
  id: string;
  tourTitle: string;
  date: string;
  status: BookingStatus;
  paymentStatus: BookingRecord['paymentStatus'];
  guests: number;
}

export interface PartnerVoucher {
  id: string;
  tourId: string;
  stopIndex: number | null;
  restaurantName: string;
  title: string;
  benefit: string;
  code: string;
  terms: string;
  validFrom: string;
  validTo: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminDatabaseOverview {
  database: string;
  tables: Array<{ id: string; name: string; rowCount: number }>;
}

export interface AffiliateClickReportRow {
  partner: string;
  provinceId: string;
  placement: string;
  clickCount: number;
  lastClickedAt: string;
}

export interface SharedItinerary {
  id: string;
  title: string;
  desc: string;
  image?: string;
  region: string;
  dayCount: number;
  totalDistance?: string;
  totalCost?: string;
  foodCostKnownVnd?: number;
  foodCostPricedStops?: number;
  partnerProvinceId?: string;
  stops: Array<{
    day?: number;
    time: string;
    mealType: string;
    name: string;
    address: string;
    image?: string;
    price: string;
    priceNum?: number;
    category: string;
    cultureStory: string;
    tastingTip: string;
    englishMenu: string;
    distance: string;
  }>;
}

export type PartnerVoucherInput = Pick<PartnerVoucher,
  'tourId' | 'stopIndex' | 'restaurantName' | 'title' | 'benefit' | 'code' | 'terms' | 'validFrom' | 'validTo'>;

async function customerBookingFetch(path: string, bookingId: string, phone: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, phone }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không tra cứu được đơn hàng.');
  return data as { booking: CustomerBookingView };
}

export function lookupCustomerBooking(bookingId: string, phone: string) {
  return customerBookingFetch('/bookings/lookup', bookingId, phone);
}

export async function findCustomerBookingsByPhone(phone: string) {
  const response = await fetch(`${API_BASE}/bookings/by-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không tìm được đơn theo số điện thoại.');
  return data as { bookings: CustomerBookingSummary[] };
}

export function reportCustomerPayment(bookingId: string, phone: string) {
  return customerBookingFetch('/bookings/payment-report', bookingId, phone);
}

async function adminFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thực hiện được thao tác quản trị.');
  return data as T;
}

export async function getAdminBookings(token: string) {
  return adminFetch<{ bookings: BookingRecord[] }>('/admin/bookings', token);
}

export async function updateAdminBooking(
  token: string,
  id: string,
  update: Pick<BookingRecord, 'status' | 'paymentStatus' | 'quotedTotalVnd' | 'adminNote' | 'guideName' | 'guidePhone'>,
) {
  return adminFetch<{ booking: BookingRecord }>(`/admin/bookings/${encodeURIComponent(id)}`, token, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

export async function getPartnerVouchers(tourId: string) {
  const response = await fetch(`${API_BASE}/vouchers?tourId=${encodeURIComponent(tourId)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không tải được ưu đãi của tour.');
  return data as { vouchers: PartnerVoucher[] };
}

export async function getAdminVouchers(token: string) {
  return adminFetch<{ vouchers: PartnerVoucher[] }>('/admin/vouchers', token);
}

export async function getAdminDatabaseOverview(token: string) {
  return adminFetch<AdminDatabaseOverview>('/admin/database', token);
}

export async function getAdminAffiliateClickReport(token: string) {
  return adminFetch<{ clicks: AffiliateClickReportRow[] }>('/admin/affiliate-clicks', token);
}

export async function logAffiliateClick(partner: string, provinceId: string, placement: string) {
  try {
    await fetch(`${API_BASE}/affiliate-clicks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner, provinceId, placement }),
      keepalive: true,
    });
  } catch {
    // Opening the partner link should still work if analytics is temporarily unavailable.
  }
}

export async function createSharedItinerary(tour: SharedItinerary) {
  const response = await fetch(`${API_BASE}/shared-itineraries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tour }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không tạo được liên kết chia sẻ.');
  return data as { shareId: string };
}

export async function getSharedItinerary(id: string) {
  const response = await fetch(`${API_BASE}/shared-itineraries/${encodeURIComponent(id)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không tải được lịch trình chia sẻ.');
  return data as { tour: SharedItinerary };
}

export async function createAdminVoucher(token: string, voucher: PartnerVoucherInput) {
  return adminFetch<{ voucher: PartnerVoucher }>('/admin/vouchers', token, {
    method: 'POST',
    body: JSON.stringify(voucher),
  });
}

export async function setAdminVoucherActive(token: string, id: string, active: boolean) {
  return adminFetch<{ voucher: PartnerVoucher }>(`/admin/vouchers/${encodeURIComponent(id)}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

export async function createBookingRequest(booking: BookingRequest) {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không gửi được yêu cầu đặt tour.');
  if (typeof data.bookingId !== 'string' || !/^TT-[A-F0-9]{8,20}$/i.test(data.bookingId)) {
    throw new Error('Server did not return a valid booking ID. Contact TasteTrip before retrying.');
  }
  if (!data.booking || data.booking.id !== data.bookingId) {
    throw new Error('Máy chủ chưa trả thông tin thanh toán. Vui lòng liên hệ TasteTrip để kiểm tra đơn trước khi gửi lại.');
  }
  return data as { bookingId: string; status: string; reused?: boolean; booking: CustomerBookingView };
}

export async function sendChatMessage(message: string, history: { role: string; parts: string[] }[]) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    
    if (response.status === 429 || (data && (data.error === 'QUOTA_EXHAUSTED' || (data.message && data.message.toLowerCase().includes('quota'))))) {
      return 'Đã đến giới hạn sử dụng AI (Hết token), vui lòng thử lại sau.';
    }

    if (!response.ok) {
      if (data && data.message && data.message.includes('Hết token')) {
        return 'Đã đến giới hạn sử dụng AI (Hết token), vui lòng thử lại sau.';
      }
      return 'Chưa kết nối được đến với server.';
    }

    return data.reply;
  } catch (err: any) {
    console.warn('Chat API connection error:', err);
    return 'Chưa kết nối được đến với server.';
  }
}

export async function generateItinerary(prompt: string, requestedDays = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(`${API_BASE}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, requestedDays }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 429 || data?.error === 'QUOTA_EXHAUSTED') {
      throw new Error('Gemini \u0111\u00e3 h\u1ebft quota. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
    }
    if (!response.ok) {
      throw new Error(data?.message || 'Gemini ch\u01b0a t\u1ea1o \u0111\u01b0\u1ee3c l\u1ecbch tr\u00ecnh. Vui l\u00f2ng th\u1eed l\u1ea1i.');
    }
    if (!data?.tour || !Array.isArray(data.tour.stops)) {
      throw new Error('Server ch\u01b0a tr\u1ea3 v\u1ec1 l\u1ecbch tr\u00ecnh h\u1ee3p l\u1ec7. Vui l\u00f2ng th\u1eed l\u1ea1i.');
    }
    return data.tour;
  } catch (error: any) {
    console.warn('Itinerary API request failed:', error);
    if (error.name === 'AbortError') {
      throw new Error('Gemini ph\u1ea3n h\u1ed3i qu\u00e1 l\u00e2u. L\u1ecbch tr\u00ecnh ch\u01b0a \u0111\u01b0\u1ee3c t\u1ea1o; vui l\u00f2ng th\u1eed l\u1ea1i sau \u00edt ph\u00fat.');
    }
    if (error instanceof TypeError) {
      throw new Error('Kh\u00f4ng k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c t\u1edbi TasteTrip server. H\u00e3y ki\u1ec3m tra server \u0111ang ch\u1ea1y \u1edf c\u1ed5ng 3001.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function recommendFood(query: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (response.status === 429 || (data && data.error === 'QUOTA_EXHAUSTED')) {
      return 'Đã đến giới hạn sử dụng AI (Hết token), vui lòng thử lại sau.';
    }
    if (!response.ok) {
      return 'Chưa kết nối được đến với server.';
    }
    return data.recommendation;
  } catch (err) {
    console.error('Recommend API Error:', err);
    return 'Chưa kết nối được đến với server.';
  }
}
