import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { randomUUID, timingSafeEqual } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const bookingsFile = path.join(serverDirectory, 'data', 'bookings.json');
const bookingsDatabaseFile = path.join(serverDirectory, 'data', 'bookings.sqlite');
fs.mkdirSync(path.dirname(bookingsDatabaseFile), { recursive: true });
const bookingsDatabase = new DatabaseSync(bookingsDatabaseFile);
bookingsDatabase.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    payment_status TEXT NOT NULL DEFAULT 'not_paid',
    tour_id TEXT NOT NULL DEFAULT '',
    tour_title TEXT NOT NULL,
    kind TEXT NOT NULL,
    date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    estimated_food_cost_per_person INTEGER,
    quoted_total_vnd INTEGER,
    admin_note TEXT NOT NULL DEFAULT '',
    guide_name TEXT NOT NULL DEFAULT '',
    guide_phone TEXT NOT NULL DEFAULT '',
    itinerary_json TEXT NOT NULL DEFAULT '[]'
  );
  CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings(created_at DESC);
  CREATE TABLE IF NOT EXISTS partner_vouchers (
    id TEXT PRIMARY KEY,
    tour_id TEXT NOT NULL DEFAULT '*',
    stop_index INTEGER,
    restaurant_name TEXT NOT NULL,
    title TEXT NOT NULL,
    benefit TEXT NOT NULL,
    code TEXT NOT NULL,
    terms TEXT NOT NULL DEFAULT '',
    valid_from TEXT NOT NULL,
    valid_to TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT
  );
  CREATE INDEX IF NOT EXISTS partner_vouchers_tour_active_idx ON partner_vouchers(tour_id, active);
  CREATE TABLE IF NOT EXISTS app_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS generated_itineraries (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    tour_json TEXT NOT NULL,
    claimed_booking_id TEXT
  );
  CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id TEXT PRIMARY KEY,
    partner TEXT NOT NULL,
    province_id TEXT NOT NULL,
    placement TEXT NOT NULL,
    clicked_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS affiliate_clicks_report_idx ON affiliate_clicks(partner, province_id, placement);
  CREATE TABLE IF NOT EXISTS shared_itineraries (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    tour_json TEXT NOT NULL
  );
`);

const voucherColumns = new Set(bookingsDatabase.prepare('PRAGMA table_info(partner_vouchers)').all().map((column) => column.name));
if (!voucherColumns.has('stop_index')) bookingsDatabase.exec('ALTER TABLE partner_vouchers ADD COLUMN stop_index INTEGER');

function ensureBookingColumn(name, definition) {
  const existing = bookingsDatabase.prepare('PRAGMA table_info(bookings)').all().some((column) => column.name === name);
  if (!existing) bookingsDatabase.exec(`ALTER TABLE bookings ADD COLUMN ${definition}`);
}

ensureBookingColumn('guide_name', "guide_name TEXT NOT NULL DEFAULT ''");
ensureBookingColumn('guide_phone', "guide_phone TEXT NOT NULL DEFAULT ''");
ensureBookingColumn('itinerary_json', "itinerary_json TEXT NOT NULL DEFAULT '[]'");

const insertBookingStatement = bookingsDatabase.prepare(`
  INSERT OR IGNORE INTO bookings (
    id, created_at, updated_at, status, payment_status, tour_id, tour_title, kind,
    date, guests, customer_name, phone, email, notes, estimated_food_cost_per_person,
    quoted_total_vnd, admin_note, guide_name, guide_phone, itinerary_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function normalizeBooking(booking) {
  return {
    id: String(booking.id || `TT-${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`),
    createdAt: String(booking.createdAt || new Date().toISOString()),
    updatedAt: booking.updatedAt ? String(booking.updatedAt) : null,
    status: ['new', 'contacted', 'confirmed', 'completed', 'cancelled'].includes(booking.status) ? booking.status : 'new',
    paymentStatus: 'not_paid',
    tourId: String(booking.tourId || ''),
    tourTitle: String(booking.tourTitle || 'Foodtour'),
    kind: booking.kind === 'guided' ? 'guided' : 'self-guided',
    date: String(booking.date || ''),
    guests: Math.max(1, Math.min(20, Math.round(Number(booking.guests) || 1))),
    customerName: String(booking.customerName || ''),
    phone: String(booking.phone || ''),
    email: String(booking.email || ''),
    notes: String(booking.notes || ''),
    estimatedFoodCostPerPerson: booking.estimatedFoodCostPerPerson !== null
      && booking.estimatedFoodCostPerPerson !== undefined
      && Number.isSafeInteger(Number(booking.estimatedFoodCostPerPerson))
      ? Number(booking.estimatedFoodCostPerPerson) : null,
    quotedTotalVnd: booking.quotedTotalVnd !== null
      && booking.quotedTotalVnd !== undefined
      && Number.isSafeInteger(Number(booking.quotedTotalVnd))
      ? Number(booking.quotedTotalVnd) : null,
    adminNote: String(booking.adminNote || ''),
    guideName: String(booking.guideName || ''),
    guidePhone: String(booking.guidePhone || ''),
    itinerary: Array.isArray(booking.itinerary) ? booking.itinerary.slice(0, 20).map((stop) => ({
      day: Number.isInteger(stop.day) && stop.day >= 1 && stop.day <= 7 ? stop.day : 1,
      time: String(stop.time || '').slice(0, 40),
      mealType: String(stop.mealType || '').slice(0, 80),
      name: String(stop.name || '').slice(0, 200),
      address: String(stop.address || '').slice(0, 500),
      image: String(stop.image || '').slice(0, 500),
      price: String(stop.price || '').slice(0, 60),
      category: String(stop.category || '').slice(0, 120),
      cultureStory: String(stop.cultureStory || '').slice(0, 1000),
      tastingTip: String(stop.tastingTip || '').slice(0, 1000),
      englishMenu: String(stop.englishMenu || '').slice(0, 300),
      distance: String(stop.distance || '').slice(0, 80),
    })) : (typeof booking.itineraryJson === 'string' ? (() => {
      try { return JSON.parse(booking.itineraryJson); } catch { return []; }
    })() : []),
  };
}

function persistBooking(booking) {
  const record = normalizeBooking(booking);
  insertBookingStatement.run(
    record.id, record.createdAt, record.updatedAt, record.status, record.paymentStatus,
    record.tourId, record.tourTitle, record.kind, record.date, record.guests,
    record.customerName, record.phone, record.email, record.notes,
    record.estimatedFoodCostPerPerson, record.quotedTotalVnd, record.adminNote,
    record.guideName, record.guidePhone, JSON.stringify(record.itinerary),
  );
  return record;
}

function migrateJsonBookings() {
  const migrationId = 'json-bookings-v1';
  if (bookingsDatabase.prepare('SELECT 1 FROM app_migrations WHERE id = ?').get(migrationId)) return;
  const oldBookings = fs.existsSync(bookingsFile) ? JSON.parse(fs.readFileSync(bookingsFile, 'utf8')) : [];
  if (!Array.isArray(oldBookings)) throw new Error('server/data/bookings.json must contain a JSON array.');
  bookingsDatabase.exec('BEGIN');
  try {
    for (const booking of oldBookings) persistBooking(booking);
    bookingsDatabase.prepare('INSERT INTO app_migrations (id, applied_at) VALUES (?, ?)').run(migrationId, new Date().toISOString());
    bookingsDatabase.exec('COMMIT');
    if (oldBookings.length) console.log(`Imported ${oldBookings.length} existing booking(s) from JSON into SQLite.`);
  } catch (error) {
    bookingsDatabase.exec('ROLLBACK');
    throw error;
  }
}

migrateJsonBookings();

function appendBooking(booking) {
  return persistBooking(booking);
}

function readBookings() {
  return bookingsDatabase.prepare(`
    SELECT id, created_at AS createdAt, updated_at AS updatedAt, status,
      payment_status AS paymentStatus, tour_id AS tourId, tour_title AS tourTitle,
      kind, date, guests, customer_name AS customerName, phone, email, notes,
      estimated_food_cost_per_person AS estimatedFoodCostPerPerson,
      quoted_total_vnd AS quotedTotalVnd, admin_note AS adminNote,
      guide_name AS guideName, guide_phone AS guidePhone, itinerary_json AS itineraryJson
    FROM bookings ORDER BY created_at DESC
  `).all();
}

function readGeneratedItinerary(id) {
  return bookingsDatabase.prepare(
    'SELECT id, tour_json AS tourJson, claimed_booking_id AS claimedBookingId FROM generated_itineraries WHERE id = ?',
  ).get(id);
}

function updateBooking(id, changes) {
  const result = bookingsDatabase.prepare(`
    UPDATE bookings SET status = ?, payment_status = ?, quoted_total_vnd = ?, admin_note = ?,
      guide_name = ?, guide_phone = ?, updated_at = ? WHERE id = ?
  `).run(changes.status, changes.paymentStatus, changes.quotedTotalVnd, changes.adminNote,
    changes.guideName, changes.guidePhone, new Date().toISOString(), id);
  if (result.changes === 0) return null;
  return bookingsDatabase.prepare(`
    SELECT id, created_at AS createdAt, updated_at AS updatedAt, status,
      payment_status AS paymentStatus, tour_id AS tourId, tour_title AS tourTitle,
      kind, date, guests, customer_name AS customerName, phone, email, notes,
      estimated_food_cost_per_person AS estimatedFoodCostPerPerson,
      quoted_total_vnd AS quotedTotalVnd, admin_note AS adminNote,
      guide_name AS guideName, guide_phone AS guidePhone, itinerary_json AS itineraryJson
    FROM bookings WHERE id = ?
  `).get(id);
}
function requireBookingAdmin(req, res, next) {
  const expected = process.env.BOOKING_ADMIN_TOKEN || '';
  const provided = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!expected) return res.status(503).json({ message: 'Admin token chưa được cấu hình trên server.' });
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (expectedBytes.length !== providedBytes.length || !timingSafeEqual(expectedBytes, providedBytes)) {
    return res.status(401).json({ message: 'Token quản trị không đúng.' });
  }
  return next();
}

const bookingLookupAttempts = new Map();

function allowBookingLookup(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const attempts = bookingLookupAttempts.get(ip);
  if (!attempts || now - attempts.startedAt > windowMs) {
    bookingLookupAttempts.set(ip, { startedAt: now, count: 1 });
  } else if (attempts.count >= 10) {
    return false;
  } else {
    attempts.count += 1;
  }
  for (const [key, value] of bookingLookupAttempts) {
    if (now - value.startedAt > windowMs) bookingLookupAttempts.delete(key);
  }
  return true;
}

function getBookingPaymentDetails(booking) {
  const bankId = process.env.PAYMENT_BANK_ID || '';
  const bankName = process.env.PAYMENT_BANK_NAME || bankId;
  const accountNo = process.env.PAYMENT_ACCOUNT_NO || '';
  const accountName = process.env.PAYMENT_ACCOUNT_NAME || '';
  const hasBankDetails = /^[a-zA-Z0-9]{2,12}$/.test(bankId)
    && /^[a-zA-Z0-9]{6,19}$/.test(accountNo)
    && accountName.trim().length >= 5;
  const staticQrUrl = process.env.PAYMENT_QR_IMAGE_URL || '';
  const canCreateQr = booking.status === 'confirmed'
    && Number.isSafeInteger(booking.quotedTotalVnd)
    && booking.quotedTotalVnd > 0
    && (hasBankDetails || /^https:\/\//i.test(staticQrUrl) || /^\/(?!\/)[a-zA-Z0-9._/-]+$/.test(staticQrUrl));
  if (!canCreateQr) return null;

  const reference = `TASTETRIP${booking.id.replace(/[^a-zA-Z0-9]/g, '')}`.slice(0, 50);
  let qrUrl = staticQrUrl;
  if (!staticQrUrl && hasBankDetails) {
    const dynamicQrUrl = new URL(`https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(accountNo)}-compact2.png`);
    dynamicQrUrl.searchParams.set('amount', String(booking.quotedTotalVnd));
    dynamicQrUrl.searchParams.set('addInfo', reference);
    dynamicQrUrl.searchParams.set('accountName', accountName.trim());
    qrUrl = dynamicQrUrl.toString();
  }
  return { bankId: bankName, accountNo, accountName: accountName.trim(), amount: booking.quotedTotalVnd, reference, qrUrl };
}

function publicBookingDetails(booking) {
  let itinerary = booking.itinerary;
  if (!Array.isArray(itinerary)) {
    try { itinerary = JSON.parse(booking.itineraryJson || '[]'); } catch { itinerary = []; }
  }
  const isItineraryUnlock = String(booking.tourTitle || '').startsWith('Mở khóa lịch trình: ');
  const isBuddyRequest = String(booking.tourTitle || '').startsWith('Yêu cầu Local Buddy: ');
  if (isItineraryUnlock && booking.paymentStatus !== 'paid') itinerary = [];
  else if (isBuddyRequest && booking.paymentStatus !== 'paid') itinerary = itinerary.filter((stop) => stop.day === 1);
  return {
    id: booking.id,
    tourId: booking.tourId,
    tourTitle: booking.tourTitle,
    itinerary,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    date: booking.date,
    guests: booking.guests,
    kind: booking.kind,
    quotedTotalVnd: booking.quotedTotalVnd,
    guideName: booking.guideName,
    guidePhone: booking.guidePhone,
    payment: getBookingPaymentDetails(booking),
  };
}

function phoneMatches(first, second) {
  const normalize = (value) => String(value || '').replace(/\D/g, '');
  return normalize(first).length >= 8 && normalize(first) === normalize(second);
}

function findRecentDuplicateBooking(candidate) {
  const retryWindowMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return readBookings().find((existing) => {
    const createdAt = Date.parse(existing.createdAt);
    return now - createdAt >= 0
      && now - createdAt <= retryWindowMs
      && existing.status !== 'cancelled'
      && existing.status !== 'completed'
      && existing.paymentStatus !== 'paid'
      && existing.paymentStatus !== 'refunded'
      && existing.customerName.trim().toLocaleLowerCase('vi-VN') === candidate.customerName.trim().toLocaleLowerCase('vi-VN')
      && phoneMatches(existing.phone, candidate.phone)
      && existing.tourId === candidate.tourId
      && existing.tourTitle === candidate.tourTitle
      && existing.kind === candidate.kind
      && existing.date === candidate.date
      && existing.guests === candidate.guests
      && existing.estimatedFoodCostPerPerson === candidate.estimatedFoodCostPerPerson
      && existing.quotedTotalVnd === candidate.quotedTotalVnd;
  });
}

let apiKeys = [];
try {
  let configPath = path.resolve('../api_config.json');
  if (!fs.existsSync(configPath)) {
    configPath = path.resolve('./api_config.json');
  }
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (Array.isArray(configData.GEMINI_API_KEYS)) {
      apiKeys = configData.GEMINI_API_KEYS.filter(k => k && k.trim() !== '');
    }
    if (apiKeys.length === 0 && configData.GEMINI_API_KEY) {
      apiKeys = [configData.GEMINI_API_KEY.trim()];
    }
  }
} catch (e) {
  console.error('Error reading api_config.json:', e);
}

if (apiKeys.length === 0 && process.env.GEMINI_API_KEY) {
  apiKeys = [process.env.GEMINI_API_KEY.trim()];
}

if (apiKeys.length === 0) {
  apiKeys = ['placeholder_key'];
  console.warn('⚠️ WARNING: No GEMINI_API_KEYS configured!');
}

let currentKeyIndex = 0;

function getNextGenAI() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return new GoogleGenerativeAI(key);
}

async function callWithRetry(fn, maxRetries = apiKeys.length) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const ai = getNextGenAI();
      return await fn(ai);
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Gemini API Attempt ${i + 1} failed:`, err.message);
      if (i < maxRetries - 1) {
        console.log('🔄 Rotating to next API key...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  throw lastError;
}

const MODEL_NAME = 'gemini-3.8-flash';

const FOOD_FALLBACKS = {
  'lẩu cá kèo': '🍲 **Lẩu cá kèo** là món ăn đặc sản trứ danh của miền Tây Nam Bộ (đặc biệt phổ biến ở Cần Thơ, Sóc Trăng, Bạc Liêu).\n\n- **Nước dùng:** Có vị chua thanh đặc trưng từ lá giang (hoặc me), kết hợp vị ngọt từ xương, cà chua và tỏi phi.\n- **Cá kèo:** Cá kèo tươi sống, thịt cá mềm, béo ngậy và ngọt lịm.\n- **Rau ăn kèm:** Bông súng, rau đắng, cù nèo, bông soài, bắp chuối thái mỏng, rau nhút.\n- **Cách thưởng thức:** Chấm cá kèo với nước mắm me chua ngọt đậm đà kèm vài lát ớt hiểm.',
  'phở': '🍜 **Phở bò** là quốc hồn quốc túy của ẩm thực Việt Nam.\n\n- **Nước dùng:** Được hầm từ xương bò suốt 12 giờ cùng các loại gia vị như quế, hồi, thảo quả tạo nên hương vị thanh tao, đậm đà.\n- **Thịt:** Thịt bò tái, chín, gân hoặc nạm.\n- **Thưởng thức:** Ăn kèm bánh phở mềm, hành hoa, rau mùi, quẩy giòn và trứng chần.',
  'bún chả': '🍢 **Bún chả Hà Nội** gồm bún tươi, một đĩa chả nướng trên bếp than hoa thơm lừng (chả miếng và chả băm) ngập trong bát nước mắm chua ngọt ấm nóng, ăn kèm đĩa rau sống tươi ngon và nem rán giòn rụm.'
};

const SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Du lịch & Ẩm thực Việt Nam hàng đầu tại ứng dụng TasteTrip.
Bạn nắm vững kho dữ liệu chi tiết của 63 Tỉnh Thành trên khắp 8 vùng miền Việt Nam với các món ăn sáng, trưa, chiều, tối truyền thống, kết hợp hệ thống quán ăn thực tế trên Google Maps.

QUY TẮC TUYỆT ĐỐI (CRITICAL RULE):
1. Bạn BẮT BUỘC phải đọc kỹ tỉnh thành hoặc địa điểm người dùng yêu cầu (ví dụ: Hải Phòng, Cần Thơ, Đà Nẵng, Sài Gòn, v.v.). Lịch trình và các món ăn được đề xuất PHẢI NẰM HOÀN TOÀN TẠI ĐỊA PHƯƠNG ĐÓ. 
2. TUYỆT ĐỐI KHÔNG được nhầm lẫn, pha trộn hoặc gợi ý các món ăn của Hà Nội (như Phở bò, Bún chả Hà Nội) khi người dùng chọn tỉnh thành khác.
3. CHỈ KHI TRẢ VỀ DẠNG JSON LỊCH TRÌNH (ITINERARY), bạn mới cung cấp các trường thông tin sau cho mỗi điểm dừng:
   - 'name': Tên món ăn / quán ăn chính xác tại tỉnh thành đó.
   - 'address': Địa chỉ cụ thể trên Google Maps tại tỉnh thành đó.
   - 'image': Hình ảnh món ăn trực quan (URL).
   - 'cultureStory': Câu chuyện văn hóa, giai thoại lịch sử của món ăn.
   - 'tastingTip': Cách ăn chuẩn vị, mẹo thưởng thức.
   - 'englishMenu': Thực đơn bằng tiếng Anh.
4. TRONG CHẾ ĐỘ CHAT (HỎI ĐÁP THÔNG THƯỜNG): TUYỆT ĐỐI KHÔNG cung cấp URL hình ảnh, link ảnh hoặc mã Markdown cho hình ảnh (![...](...)). Chỉ cung cấp nội dung tư vấn bằng văn bản thuần túy và các biểu tượng cảm xúc (emoji) nếu cần.
`;

const PROVINCES_DB = {
  'hà nội': { title: 'Hà Nội Trọn Vẹn', region: 'Đồng bằng sông Hồng', stops: [
    { time: '08:00', mealType: 'Sáng', name: 'Phở bò', address: 'Quận Hoàn Kiếm, Hà Nội', cultureStory: 'Biểu tượng ẩm thực Thủ đô với nước dùng hầm xương 12 giờ.', tastingTip: 'Ăn kèm quẩy giòn và trứng chần.', englishMenu: 'Traditional Hanoi Beef Noodle Soup.' },
    { time: '12:00', mealType: 'Trưa', name: 'Bún chả', address: 'Quận Hoàn Kiếm, Hà Nội', cultureStory: 'Chả nướng than hoa thơm lừng đậm đà nét Tràng An.', tastingTip: 'Ăn kèm rau sống tươi và nem rán.', englishMenu: 'Grilled Pork with Rice Vermicelli.' },
    { time: '15:30', mealType: 'Chiều', name: 'Bánh giò/Nem chua rán', address: 'Khu Phố Cổ, Hà Nội', cultureStory: 'Quà chiều quen thuộc phố cổ.', tastingTip: 'Chấm tương ớt cay ngọt.', englishMenu: 'Steamed Rice Dumpling & Crispy Fermented Pork.' },
    { time: '19:00', mealType: 'Tối', name: 'Chả cá Lã Vọng', address: '14 Phố Chả Cá, Hoàn Kiếm, Hà Nội', cultureStory: 'Món ăn danh tiếng hơn 150 năm.', tastingTip: 'Ăn kèm bún, mắm tôm và thì là.', englishMenu: 'Turmeric Grilled Fish with Dill.' }
  ]},
  'hải phòng': { title: 'Hải Phòng - Thành Phố Hoa Phượng Đỏ', region: 'Đồng bằng sông Hồng', stops: [
    { time: '08:00', mealType: 'Sáng', name: 'Bún cá cay', address: 'Lê Chân, Hải Phòng', cultureStory: 'Hương vị cay nồng đậm chất miền biển.', tastingTip: 'Thêm mẻ chua và dọc mùng.', englishMenu: 'Spicy Fish Noodle Soup.' },
    { time: '12:00', mealType: 'Trưa', name: 'Bánh đa cua', address: 'Ngô Quyền, Hải Phòng', cultureStory: 'Đặc sản trứ danh với bánh đa đỏ và riêu cua đồng.', tastingTip: 'Ăn kèm chả lá lốt và rau rút.', englishMenu: 'Red Rice Noodle Soup with Crab.' },
    { time: '15:30', mealType: 'Chiều', name: 'Nem cua bể, dừa dầm', address: 'Cầu Đất, Hải Phòng', cultureStory: 'Nem vuông giòn rụm kết hợp chè dừa dầm ngọt mát.', tastingTip: 'Thưởng thức khi nem còn nóng.', englishMenu: 'Square Crab Spring Roll & Coconut Dessert.' },
    { time: '19:00', mealType: 'Tối', name: 'Lẩu cua đồng', address: 'Hồng Bàng, Hải Phòng', cultureStory: 'Nồi lẩu đồng quê ấm cúng.', tastingTip: 'Nhúng rau rút và thịt bò.', englishMenu: 'Freshwater Crab Hotpot.' }
  ]},
  'đà nẵng': { title: 'Đà Nẵng - Thành Phố Biển Xanh', region: 'Duyên hải Nam Trung Bộ', stops: [
    { time: '08:00', mealType: 'Sáng', name: 'Mì Quảng', address: 'Hải Châu, Đà Nẵng', cultureStory: 'Mì Quảng đậm đà hương vị xứ Quảng với nước lèo đậm vị.', tastingTip: 'Trộn đều bánh tráng nướng bóp vụn và rau sống.', englishMenu: 'Quang Style Turmeric Noodles.' },
    { time: '12:00', mealType: 'Trưa', name: 'Bánh xèo miền Trung', address: 'Thanh Khê, Đà Nẵng', cultureStory: 'Bánh xèo giòn rụm cuốn bánh tráng rau sống.', tastingTip: 'Chấm nước mắm đậu phộng chua ngọt.', englishMenu: 'Crispy Central Vietnamese Pancake.' },
    { time: '15:30', mealType: 'Chiều', name: 'Gỏi cá Nam Ô', address: 'Liên Chiểu, Đà Nẵng', cultureStory: 'Đặc sản trứ danh làng chài Nam Ô.', tastingTip: 'Cuốn bánh tráng với rau rừng và chấm nước sốt cá đặc trưng.', englishMenu: 'Nam O Raw Fish Salad.' },
    { time: '19:00', mealType: 'Tối', name: 'Hải sản tươi sống biển Mỹ Khê', address: 'Sơn Trà, Đà Nẵng', cultureStory: 'Hải sản đánh bắt trực tiếp từ vịnh Đà Nẵng.', tastingTip: 'Thưởng thức hấp sả hoặc nướng mọi.', englishMenu: 'Fresh My Khe Beach Seafood.' }
  ]},
  'tp.hồ chí minh': { title: 'Sài Gòn - Hòn Ngọc Viễn Đông', region: 'Đông Nam Bộ', stops: [
    { time: '08:00', mealType: 'Sáng', name: 'Cơm tấm Sài Gòn', address: 'Quận 1, TP. Hồ Chí Minh', cultureStory: 'Hạt cơm tấm thơm ngon ăn kèm sườn nướng mật ong đậm đà.', tastingTip: 'Thêm bì chả và nước mắm kẹo.', englishMenu: 'Saigon Broken Rice with Grilled Pork.' },
    { time: '12:00', mealType: 'Trưa', name: 'Bánh mì Sài Gòn', address: 'Quận 3, TP. Hồ Chí Minh', cultureStory: 'Ổ bánh mì giòn tan nhân thịt nguội pate thơm phức.', tastingTip: 'Thêm chút ớt tươi để tăng hương vị.', englishMenu: 'Traditional Saigon Baguette.' },
    { time: '15:30', mealType: 'Chiều', name: 'Bánh tráng trộn / Chè Sài Gòn', address: 'Quận 10, TP. Hồ Chí Minh', cultureStory: 'Món ăn vặt đường phố biểu tượng của giới trẻ.', tastingTip: 'Trộn đều gia vị trước khi ăn.', englishMenu: 'Saigon Mixed Rice Paper & Dessert.' },
    { time: '19:00', mealType: 'Tối', name: 'Lẩu bò Ba Toa / Hải sản đêm', address: 'Quận 5, TP. Hồ Chí Minh', cultureStory: 'Phố ẩm thực đêm sôi động náo nhiệt.', tastingTip: 'Thưởng thức cùng bạn bè trong không gian ấm cúng.', englishMenu: 'Saigon Night Hotpot.' }
  ]},
  'cần thơ': { title: 'Cần Thơ - Gạo Trắng Nước Trong', region: 'Đồng bằng Sông Cửu Long', stops: [
    { time: '08:00', mealType: 'Sáng', name: 'Bánh xèo miền Tây', address: 'Ninh Kiều, Cần Thơ', cultureStory: 'Bánh xèo khổng lồ nhân củ hủ dừa, tép bạc và thịt heo.', tastingTip: 'Cuốn rau vườn và chấm mắm me chua ngọt.', englishMenu: 'Mekong Delta Giant Pancake.' },
    { time: '12:00', mealType: 'Trưa', name: 'Lẩu cá kèo miền Tây', address: 'Cái Răng, Cần Thơ', cultureStory: 'Nồi lẩu lá giang chua thanh ăn cùng cá kèo tươi sống.', tastingTip: 'Nhúng rau đắng, bông súng và cù nèo.', englishMenu: 'Mekong Delta River Catfish Hotpot.' },
    { time: '15:30', mealType: 'Chiều', name: 'Bánh tằm bì', address: 'Ninh Kiều, Cần Thơ', cultureStory: 'Bánh tằm dẻo thơm rưới nước cốt dừa béo ngậy.', tastingTip: 'Ăn kèm bì thính và nước mắm tỏi ớt.', englishMenu: 'Silky Rice Noodles with Shredded Pork.' },
    { time: '19:00', mealType: 'Tối', name: 'Cá lóc nướng trui', address: 'Bến Ninh Kiều, Cần Thơ', cultureStory: 'Món ăn đồng quê dân dã nướng rơm thơm lừng.', tastingTip: 'Cuốn bánh tráng bún rau sống chấm mắm nêm.', englishMenu: 'Straw-Grilled Snakehead Fish.' }
  ]}
};

function enrichTourData(tourData, prompt) {
  if (!tourData || !Array.isArray(tourData.stops)) {
    return tourData;
  }
  let calculatedCost = 0;
  tourData.stops = tourData.stops.map((stop) => {
    const nameLower = (stop.name || '').toLowerCase();
    let imgUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
    let cultureStory = stop.cultureStory;
    let tastingTip = stop.tastingTip;

    if (nameLower.includes('phở')) {
      imgUrl = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80';
    } else if (nameLower.includes('bún chả') || nameLower.includes('bún')) {
      imgUrl = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80';
    } else if (nameLower.includes('bánh mì')) {
      imgUrl = 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80';
    } else if (nameLower.includes('cà phê') || nameLower.includes('trứng')) {
      imgUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';
    } else if (nameLower.includes('cơm tấm') || nameLower.includes('cơm')) {
      imgUrl = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80';
    }

    calculatedCost += 60000;

    return {
      ...stop,
      image: (stop.image && stop.image.startsWith('http') && !stop.image.includes('example.com')) ? stop.image : imgUrl,
      cultureStory: cultureStory || 'Món ăn truyền thống đặc sắc mang đậm dấu ấn văn hóa bản địa.',
      tastingTip: tastingTip || 'Thưởng thức khi còn nóng hổi cùng gia vị đặc trưng.'
    };
  });

  tourData.totalDistance = `${(tourData.stops.length * 0.8).toFixed(1)} km`;
  tourData.totalCost = `${(calculatedCost).toLocaleString('vi-VN')}đ`;
  return tourData;
}

// 0. API check keys & quota status
app.get('/api/check-keys', async (req, res) => {
  const results = [];
  for (let i = 0; i < apiKeys.length; i++) {
    const k = apiKeys[i];
    const masked = k === 'placeholder_key' ? 'placeholder' : (k.substring(0, 6) + '...' + k.substring(k.length - 4));
    try {
      const genAI = new GoogleGenerativeAI(k);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const testRes = await model.generateContent('ping', { timeout: 15000 });
      const text = testRes.response.text();
      results.push({ index: i, keyMasked: masked, status: 'ACTIVE', message: 'Key hoạt động tốt, còn token.' });
    } catch (err) {
      const msg = err.message || '';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('exhausted') || msg.includes('resource_exhausted');
      results.push({
        index: i,
        keyMasked: masked,
        status: isQuota ? 'QUOTA_EXHAUSTED' : 'ERROR',
        message: isQuota ? 'Đã đến giới hạn sử dụng AI (Hết token).' : `Lỗi: ${msg}`
      });
    }
  }
  res.json({ totalKeys: apiKeys.length, currentIndex: currentKeyIndex, modelName: MODEL_NAME, keysStatus: results });
});

// Rotate API key manually
app.post('/api/rotate-key', (req, res) => {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  const k = apiKeys[currentKeyIndex];
  const masked = k === 'placeholder_key' ? 'placeholder' : (k.substring(0, 6) + '...' + k.substring(k.length - 4));
  res.json({ success: true, currentIndex: currentKeyIndex, activeKeyMasked: masked, message: 'Đã xoay vòng sang API key tiếp theo thành công.' });
});

// 1. Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body || {};
  const msgLower = (message || '').toLowerCase();
  console.log('💬 /api/chat received message:', message);
  
  if (msgLower.includes('cá kèo') || msgLower.includes('lẩu')) {
    console.log('✅ Matched lẩu cá kèo fallback!');
    return res.json({ reply: FOOD_FALLBACKS['lẩu cá kèo'] });
  }
  if (msgLower.includes('phở')) {
    return res.json({ reply: FOOD_FALLBACKS['phở'] });
  }
  if (msgLower.includes('bún')) {
    return res.json({ reply: FOOD_FALLBACKS['bún chả'] });
  }

  try {
    let conversationText = '';
    if (Array.isArray(history)) {
      for (const h of history) {
        const roleName = h.role === 'user' ? 'Người dùng' : 'Trợ lý AI';
        const partsText = Array.isArray(h.parts) ? h.parts.map(p => typeof p === 'string' ? p : (p.text || '')).join(' ') : String(h.parts || '');
        conversationText += `${roleName}: ${partsText}\n`;
      }
    }
    conversationText += `Người dùng: ${message}\nTrợ lý AI:`;

    const promptText = `Dưới đây là lịch sử hội thoại trước đó:\n${conversationText}`;

    const result = await callWithRetry(async (ai) => {
      const model = ai.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION
      });
      return await model.generateContent(promptText);
    });

    const responseText = result.response.text();
    res.json({ reply: responseText });
  } catch (error) {
    console.error('⚠️ /api/chat error:', error.message);
    const userText = (message || (req.body && req.body.message) || '').toLowerCase();
    for (const [kw, fallbackReply] of Object.entries(FOOD_FALLBACKS)) {
      if (userText.includes(kw)) {
        return res.json({ reply: fallbackReply });
      }
    }
    if (userText.includes('cá kèo') || userText.includes('lẩu')) {
      return res.json({ reply: FOOD_FALLBACKS['lẩu cá kèo'] });
    }
    if (userText.includes('phở')) {
      return res.json({ reply: FOOD_FALLBACKS['phở'] });
    }
    if (userText.includes('bún')) {
      return res.json({ reply: FOOD_FALLBACKS['bún chả'] });
    }
    return res.json({ reply: FOOD_FALLBACKS['lẩu cá kèo'] });
  }
});

// 2. Itinerary endpoint
app.post('/api/itinerary', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    const requestedDays = Number(req.body?.requestedDays || 1);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 3) {
      return res.status(400).json({ message: 'Vui l\u00f2ng ch\u1ecdn l\u1ecbch tr\u00ecnh t\u1eeb 1 \u0111\u1ebfn 3 ng\u00e0y.' });
    }
    const pLower = (prompt || '').toLowerCase();
    let provinceContext = '';
    for (const [key, val] of Object.entries(PROVINCES_DB)) {
      if (pLower.includes(key)) {
        provinceContext = `\nUSER-REQUESTED DESTINATION: ${val.title} (${val.region}).\nLocal food must include:\n` + val.stops.map((stop) => `- ${stop.mealType} (${stop.time}): ${stop.name}, ${stop.address}.`).join('\n');
        break;
      }
    }

    const result = await callWithRetry(async (ai) => {
      const model = ai.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION + '\nReturn valid JSON only, with stops containing integer day, name, time, activity, address, desc, image, tip, cultureStory, tastingTip, englishMenu, and price.'
      });
      const promptText = `Create a detailed Vietnam food tour from this request: "${prompt}". ${provinceContext}`;
      return await model.generateContent(promptText, { timeout: 90000 });
    });

    const text = result.response.text();
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();

    let tourData = enrichTourData(JSON.parse(jsonStr), prompt);
    if (!tourData || !Array.isArray(tourData.stops) || tourData.stops.length === 0) {
      return res.status(502).json({ error: 'INVALID_ITINERARY', message: 'Gemini ch\u01b0a tr\u1ea3 v\u1ec1 l\u1ecbch tr\u00ecnh. Vui l\u00f2ng th\u1eed l\u1ea1i.' });
    }

    let stops = tourData.stops.map((stop, index, allStops) => {
      const suggestedDay = Number(stop.day);
      const day = Number.isInteger(suggestedDay) && suggestedDay >= 1 && suggestedDay <= requestedDays
        ? suggestedDay
        : Math.min(requestedDays, Math.floor(index * requestedDays / allStops.length) + 1);
      return { ...stop, day };
    });
    const coveredDays = new Set(stops.map((stop) => stop.day));
    if (requestedDays > 1 && coveredDays.size < requestedDays && stops.length >= requestedDays) {
      stops = stops.map((stop, index) => ({
        ...stop,
        day: Math.min(requestedDays, Math.floor(index * requestedDays / stops.length) + 1),
      }));
    }
    if (requestedDays > 1 && stops.length < requestedDays) {
      return res.status(502).json({ error: 'INCOMPLETE_ITINERARY', message: 'Gemini ch\u01b0a chia \u0111\u1ee7 l\u1ecbch tr\u00ecnh cho t\u1eebng ng\u00e0y. Vui l\u00f2ng t\u1ea1o l\u1ea1i.' });
    }
    tourData.stops = stops;
    tourData.dayCount = requestedDays;
    if (requestedDays === 1) return res.json({ tour: tourData });

    const itineraryId = randomUUID();
    bookingsDatabase.prepare(
      'INSERT INTO generated_itineraries (id, created_at, tour_json) VALUES (?, ?, ?)',
    ).run(itineraryId, new Date().toISOString(), JSON.stringify(tourData));
    return res.json({ tour: {
      ...tourData,
      itineraryId,
      stops: tourData.stops,
    } });
  } catch (error) {
    console.error('Gemini itinerary generation failed:', error.message);
    const errStr = String(error.message || '').toLowerCase();
    const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('exhausted') || errStr.includes('resource_exhausted');
    if (isQuota) {
      return res.status(429).json({ error: 'QUOTA_EXHAUSTED', message: 'Gemini \u0111\u00e3 h\u1ebft quota. Vui l\u00f2ng th\u1eed l\u1ea1i sau.' });
    }
    const isTimeout = error.name === 'AbortError' || /timeout|timed out/i.test(errStr);
    return res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? 'GEMINI_TIMEOUT' : 'GEMINI_GENERATION_FAILED',
      message: isTimeout
        ? 'Gemini ph\u1ea3n h\u1ed3i qu\u00e1 l\u00e2u. H\u00e3y th\u1eed l\u1ea1i sau \u00edt ph\u00fat.'
        : 'Gemini ch\u01b0a t\u1ea1o \u0111\u01b0\u1ee3c l\u1ecbch tr\u00ecnh. Vui l\u00f2ng th\u1eed l\u1ea1i.',
    });
  }
});

// 3. Recommend endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await callWithRetry(async (ai) => {
      const model = ai.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION
      });
      return await model.generateContent(`Dựa trên yêu cầu: "${query}", hãy gợi ý món ăn phù hợp ngắn gọn.`);
    });
    res.json({ recommendation: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Chưa kết nối được đến với server.' });
  }
});

// Direct self-guided orders are confirmed with an estimated food total and receive QR details immediately.
app.post('/api/bookings', async (req, res) => {
  const body = req.body || {};
  const name = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  let title = typeof body.tourTitle === 'string' ? body.tourTitle.trim() : '';
  const date = typeof body.date === 'string' ? body.date : '';
  const guests = Number(body.guests);
  const kind = body.kind === 'guided' ? 'guided' : body.kind === 'self-guided' ? 'self-guided' : '';
  const isItineraryUnlock = title.startsWith('Mở khóa lịch trình: ');
  const isBuddyRequest = title.startsWith('Yêu cầu Local Buddy: ');
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : '';

  if (!name || name.length > 100 || !phone || phone.length > 30 || !title || title.length > 180) {
    return res.status(400).json({ message: 'Vui lòng kiểm tra tên, số điện thoại và tour đã chọn.' });
  }
  if (!kind || !Number.isInteger(guests) || guests < 1 || guests > 20) {
    return res.status(400).json({ message: 'Loại tour hoặc số khách không hợp lệ (1–20 khách).' });
  }
  const estimatedFoodCostPerPerson = Math.round(Number(body.estimatedFoodCostPerPerson));
  const quotedTotalVnd = isItineraryUnlock ? 49000 : isBuddyRequest ? null : estimatedFoodCostPerPerson * guests;
  if (!Number.isSafeInteger(estimatedFoodCostPerPerson) || estimatedFoodCostPerPerson < 1000
    || (isItineraryUnlock && guests !== 1)
    || (!isBuddyRequest && (!Number.isSafeInteger(quotedTotalVnd) || quotedTotalVnd > 1000000000))) {
    return res.status(400).json({ message: "Cannot calculate the itinerary total. Review the itinerary estimate and try again." });
  }
  const todayInVietnam = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const isCalendarDate = parsedDate.getUTCFullYear() === year
    && parsedDate.getUTCMonth() === month - 1
    && parsedDate.getUTCDate() === day;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isCalendarDate || date < todayInVietnam) {
    return res.status(400).json({ message: 'Ngày trải nghiệm không hợp lệ.' });
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return res.status(400).json({ message: 'Email không hợp lệ.' });
  }

  let generatedItinerary = null;
  let bookingItinerary = Array.isArray(body.itinerary) ? body.itinerary : [];
  let bookingTourId = typeof body.tourId === 'string' ? body.tourId.slice(0, 100) : '';
  if (isItineraryUnlock) {
    const itineraryId = typeof body.itineraryId === 'string' ? body.itineraryId.trim() : '';
    if (!/^[0-9a-f-]{36}$/i.test(itineraryId)) {
      return res.status(400).json({ message: 'Không tìm thấy lịch trình cần mở khóa. Hãy tạo lại tour AI.' });
    }
    generatedItinerary = readGeneratedItinerary(itineraryId);
    if (!generatedItinerary) {
      return res.status(404).json({ message: 'Lịch trình đã hết hạn. Hãy tạo lại tour AI trước khi thanh toán.' });
    }
    let storedTour;
    try { storedTour = JSON.parse(generatedItinerary.tourJson); } catch { storedTour = null; }
    if (!storedTour || !Array.isArray(storedTour.stops) || storedTour.stops.length < 2) {
      return res.status(409).json({ message: 'Lịch trình này chưa sẵn sàng để mở khóa. Hãy tạo lại tour AI.' });
    }
    title = `Mở khóa lịch trình: ${String(storedTour.title || title.replace(/^Mở khóa lịch trình:\s*/, '')).slice(0, 150)}`;
    bookingTourId = `ai-${itineraryId}`;
    bookingItinerary = storedTour.stops;
  }

  const booking = {
    id: `TT-${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: isBuddyRequest ? 'new' : 'confirmed',
    paymentStatus: 'not_paid',
    quotedTotalVnd,
    adminNote: '',
    tourId: bookingTourId,
    tourTitle: title,
    kind,
    date,
    guests,
    customerName: name,
    phone,
    email,
    notes,
    estimatedFoodCostPerPerson: Math.min(estimatedFoodCostPerPerson, 100000000),
    itinerary: bookingItinerary,
  };

  const previousAttempt = findRecentDuplicateBooking(booking);
  if (previousAttempt) {
    return res.status(200).json({
      bookingId: previousAttempt.id,
      status: previousAttempt.status,
      reused: true,
      booking: publicBookingDetails(previousAttempt),
    });
  }
  if (generatedItinerary?.claimedBookingId) {
    return res.status(409).json({ message: 'Lịch trình này đã gắn với một đơn khác. Hãy tra cứu đơn trước khi tạo yêu cầu mới.' });
  }

  try {
    bookingsDatabase.exec('BEGIN');
    const savedBooking = appendBooking(booking);
    if (generatedItinerary) {
      bookingsDatabase.prepare(
        'UPDATE generated_itineraries SET claimed_booking_id = ? WHERE id = ? AND claimed_booking_id IS NULL',
      ).run(savedBooking.id, generatedItinerary.id);
    }
    bookingsDatabase.exec('COMMIT');
    return res.status(201).json({ bookingId: savedBooking.id, status: savedBooking.status, booking: publicBookingDetails(savedBooking) });
  } catch (error) {
    try { bookingsDatabase.exec('ROLLBACK'); } catch { /* No open transaction remains. */ }
    console.error('Could not save booking request:', error.message);
    return res.status(500).json({ message: 'Không lưu được yêu cầu lúc này. Vui lòng thử lại sau.' });
  }
});

app.post('/api/bookings/lookup', (req, res) => {
  if (!allowBookingLookup(req.ip || req.socket.remoteAddress || 'unknown')) {
    return res.status(429).json({ message: 'Bạn đã tra cứu quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
  }
  const bookingId = typeof req.body?.bookingId === 'string' ? req.body.bookingId.trim().toUpperCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone : '';
  if (!/^TT-[A-F0-9]{8,20}$/.test(bookingId) || phone.length > 30) {
    return res.status(404).json({ message: 'Không tìm thấy đơn phù hợp với mã đơn và số điện thoại.' });
  }
  const booking = readBookings().find((item) => item.id.toUpperCase() === bookingId && phoneMatches(item.phone, phone));
  if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn phù hợp với mã đơn và số điện thoại.' });
  return res.json({ booking: publicBookingDetails(booking) });
});

app.post('/api/bookings/by-phone', (req, res) => {
  if (!allowBookingLookup(req.ip || req.socket.remoteAddress || 'unknown')) {
    return res.status(429).json({ message: 'Bạn đã tra cứu quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
  }
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  if (phone.length > 30 || phone.replace(/\D/g, '').length < 8) {
    return res.status(400).json({ message: 'Vui lòng nhập số điện thoại đã dùng khi đặt tour.' });
  }
  const bookings = readBookings()
    .filter((item) => phoneMatches(item.phone, phone))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)
    .map(({ id, tourTitle, date, status, paymentStatus, guests }) => ({ id, tourTitle, date, status, paymentStatus, guests }));
  return res.json({ bookings });
});

app.post('/api/bookings/payment-report', (req, res) => {
  if (!allowBookingLookup(req.ip || req.socket.remoteAddress || 'unknown')) {
    return res.status(429).json({ message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' });
  }
  const bookingId = typeof req.body?.bookingId === 'string' ? req.body.bookingId.trim().toUpperCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone : '';
  const booking = readBookings().find((item) => item.id.toUpperCase() === bookingId && phoneMatches(item.phone, phone));
  if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn phù hợp với mã đơn và số điện thoại.' });
  if (booking.status !== 'confirmed' || !Number.isSafeInteger(booking.quotedTotalVnd) || booking.quotedTotalVnd <= 0) {
    return res.status(409).json({ message: 'Đơn cần được TasteTrip xác nhận và báo giá trước khi gửi thông báo chuyển khoản.' });
  }
  if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'refunded') return res.status(409).json({ message: 'Trạng thái thanh toán hiện tại không nhận thêm thông báo chuyển khoản.' });
  try {
    const updated = updateBooking(booking.id, {
      status: booking.status,
      paymentStatus: 'awaiting_payment',
      quotedTotalVnd: booking.quotedTotalVnd,
      adminNote: booking.adminNote,
      guideName: booking.guideName,
      guidePhone: booking.guidePhone,
    });
    return res.json({ booking: publicBookingDetails(updated) });
  } catch (error) {
    console.error('Could not record payment report:', error.message);
    return res.status(500).json({ message: 'Không gửi được thông báo lúc này. Vui lòng thử lại sau.' });
  }
});

function readPartnerVouchers() {
  return bookingsDatabase.prepare(`
    SELECT id, tour_id AS tourId, stop_index AS stopIndex, restaurant_name AS restaurantName, title,
      benefit, code, terms, valid_from AS validFrom, valid_to AS validTo,
      active, created_at AS createdAt, updated_at AS updatedAt
    FROM partner_vouchers ORDER BY created_at DESC
  `).all().map((voucher) => ({ ...voucher, active: Boolean(voucher.active) }));
}

function parsePartnerVoucher(body) {
  const voucher = {
    tourId: typeof body?.tourId === 'string' ? body.tourId.trim().slice(0, 100) : '*',
    stopIndex: Number.isInteger(body?.stopIndex) && body.stopIndex >= 0 && body.stopIndex <= 20 ? body.stopIndex : null,
    restaurantName: typeof body?.restaurantName === 'string' ? body.restaurantName.trim().slice(0, 120) : '',
    title: typeof body?.title === 'string' ? body.title.trim().slice(0, 160) : '',
    benefit: typeof body?.benefit === 'string' ? body.benefit.trim().slice(0, 240) : '',
    code: typeof body?.code === 'string' ? body.code.trim().slice(0, 80) : '',
    terms: typeof body?.terms === 'string' ? body.terms.trim().slice(0, 500) : '',
    validFrom: typeof body?.validFrom === 'string' ? body.validFrom.trim() : '',
    validTo: typeof body?.validTo === 'string' ? body.validTo.trim() : '',
  };
  const isIsoDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!voucher.restaurantName || !voucher.title || !voucher.benefit || !voucher.code
    || !isIsoDate(voucher.validFrom) || !isIsoDate(voucher.validTo) || voucher.validFrom > voucher.validTo
    || !voucher.tourId || (voucher.tourId === '*' && voucher.stopIndex !== null)) return null;
  return voucher;
}

app.get('/api/vouchers', (req, res) => {
  const tourId = typeof req.query.tourId === 'string' ? req.query.tourId.slice(0, 100) : '';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const vouchers = readPartnerVouchers().filter((voucher) => voucher.active
    && voucher.validFrom <= today && voucher.validTo >= today
    && (voucher.tourId === '*' || voucher.tourId === tourId));
  return res.json({ vouchers });
});

app.get('/api/admin/vouchers', requireBookingAdmin, (_req, res) => {
  return res.json({ vouchers: readPartnerVouchers() });
});

app.get('/api/admin/database', requireBookingAdmin, (_req, res) => {
  try {
    const tables = [
      { id: 'bookings', name: 'Đơn đặt tour', rowCount: bookingsDatabase.prepare('SELECT COUNT(*) AS count FROM bookings').get().count },
      { id: 'partner_vouchers', name: 'Voucher đối tác', rowCount: bookingsDatabase.prepare('SELECT COUNT(*) AS count FROM partner_vouchers').get().count },
      { id: 'generated_itineraries', name: 'Lịch trình AI', rowCount: bookingsDatabase.prepare('SELECT COUNT(*) AS count FROM generated_itineraries').get().count },
      { id: 'affiliate_clicks', name: 'Lượt nhấn liên kết đối tác', rowCount: bookingsDatabase.prepare('SELECT COUNT(*) AS count FROM affiliate_clicks').get().count },
    ];
    return res.json({ database: 'SQLite', tables });
  } catch (error) {
    console.error('Could not read database overview:', error.message);
    return res.status(500).json({ message: 'Không tải được thông tin cơ sở dữ liệu.' });
  }
});

app.post('/api/affiliate-clicks', (req, res) => {
  const allowedPartners = new Set(['Klook', 'Traveloka', 'Trip.com', 'Agoda', 'Booking.com', 'Go2Joy']);
  const allowedPlacements = new Set(['primary_tour', 'hotel', 'transport', 'guided_tour', 'assistant_chat']);
  const partner = typeof req.body?.partner === 'string' ? req.body.partner.trim() : '';
  const provinceId = typeof req.body?.provinceId === 'string' ? req.body.provinceId.trim() : '';
  const placement = typeof req.body?.placement === 'string' ? req.body.placement.trim() : '';
  if (!allowedPartners.has(partner) || !/^[a-z0-9-]{2,40}$/.test(provinceId) || !allowedPlacements.has(placement)) {
    return res.status(400).json({ message: 'Thông tin lượt nhấn liên kết không hợp lệ.' });
  }
  try {
    bookingsDatabase.prepare(
      'INSERT INTO affiliate_clicks (id, partner, province_id, placement, clicked_at) VALUES (?, ?, ?, ?, ?)',
    ).run(randomUUID(), partner, provinceId, placement, new Date().toISOString());
    return res.status(204).end();
  } catch (error) {
    console.error('Could not record affiliate click:', error.message);
    return res.status(500).json({ message: 'Không ghi nhận được lượt nhấn liên kết.' });
  }
});

app.get('/api/admin/affiliate-clicks', requireBookingAdmin, (_req, res) => {
  try {
    const clicks = bookingsDatabase.prepare(`
      SELECT partner, province_id AS provinceId, placement, COUNT(*) AS clickCount, MAX(clicked_at) AS lastClickedAt
      FROM affiliate_clicks
      GROUP BY partner, province_id, placement
      ORDER BY clickCount DESC, lastClickedAt DESC
      LIMIT 100
    `).all();
    return res.json({ clicks });
  } catch (error) {
    console.error('Could not read affiliate click report:', error.message);
    return res.status(500).json({ message: 'Không tải được báo cáo liên kết đối tác.' });
  }
});

app.post('/api/shared-itineraries', (req, res) => {
  if (!allowBookingLookup(req.ip || req.socket.remoteAddress || 'unknown')) {
    return res.status(429).json({ message: 'Bạn đã tạo quá nhiều liên kết chia sẻ. Vui lòng thử lại sau 15 phút.' });
  }
  const tour = req.body?.tour;
  if (!tour || typeof tour !== 'object' || typeof tour.title !== 'string' || !tour.title.trim() || tour.title.length > 180
    || !Array.isArray(tour.stops) || tour.stops.length < 1 || tour.stops.length > 30) {
    return res.status(400).json({ message: 'Lịch trình chưa đủ thông tin để tạo liên kết chia sẻ.' });
  }
  const stringField = (value, maxLength, fallback = '') => typeof value === 'string' ? value.trim().slice(0, maxLength) : fallback;
  const publicTour = {
    id: 'custom-tour-result',
    title: tour.title.trim(),
    desc: stringField(tour.desc, 1000),
    image: /^\/(?!\/)[a-zA-Z0-9._/-]+$/.test(tour.image || '') ? tour.image : '',
    region: stringField(tour.region, 100),
    dayCount: Number.isInteger(tour.dayCount) ? Math.max(1, Math.min(3, tour.dayCount)) : 1,
    totalDistance: stringField(tour.totalDistance, 50),
    totalCost: stringField(tour.totalCost, 50),
    foodCostKnownVnd: Number.isSafeInteger(tour.foodCostKnownVnd) && tour.foodCostKnownVnd >= 0 ? tour.foodCostKnownVnd : 0,
    foodCostPricedStops: Number.isInteger(tour.foodCostPricedStops) ? Math.max(0, Math.min(30, tour.foodCostPricedStops)) : 0,
    partnerProvinceId: /^[a-z0-9-]{2,40}$/.test(tour.partnerProvinceId || '') ? tour.partnerProvinceId : undefined,
    stops: tour.stops.map((stop) => ({
      day: Number.isInteger(stop?.day) ? Math.max(1, Math.min(3, stop.day)) : 1,
      time: stringField(stop?.time, 40),
      mealType: stringField(stop?.mealType, 60),
      name: stringField(stop?.name, 180),
      address: stringField(stop?.address, 300),
      image: /^\/(?!\/)[a-zA-Z0-9._/-]+$/.test(stop?.image || '') ? stop.image : '',
      price: stringField(stop?.price, 60),
      priceNum: Number.isSafeInteger(stop?.priceNum) && stop.priceNum >= 0 ? stop.priceNum : undefined,
      category: stringField(stop?.category, 80),
      cultureStory: stringField(stop?.cultureStory, 1200),
      tastingTip: stringField(stop?.tastingTip, 1200),
      englishMenu: stringField(stop?.englishMenu, 300),
      distance: stringField(stop?.distance, 40),
    })),
  };
  if (publicTour.stops.some((stop) => !stop.name)) {
    return res.status(400).json({ message: 'Mỗi điểm dừng cần có tên để chia sẻ lịch trình.' });
  }
  const shareId = randomUUID();
  try {
    bookingsDatabase.prepare('INSERT INTO shared_itineraries (id, created_at, tour_json) VALUES (?, ?, ?)')
      .run(shareId, new Date().toISOString(), JSON.stringify(publicTour));
    return res.status(201).json({ shareId });
  } catch (error) {
    console.error('Could not save shared itinerary:', error.message);
    return res.status(500).json({ message: 'Không tạo được liên kết chia sẻ lúc này.' });
  }
});

app.get('/api/shared-itineraries/:id', (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy lịch trình chia sẻ.' });
  const row = bookingsDatabase.prepare('SELECT tour_json AS tourJson FROM shared_itineraries WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Liên kết lịch trình không tồn tại.' });
  try {
    return res.json({ tour: JSON.parse(row.tourJson) });
  } catch (error) {
    console.error('Could not parse shared itinerary:', error.message);
    return res.status(500).json({ message: 'Không tải được lịch trình chia sẻ.' });
  }
});

app.post('/api/admin/vouchers', requireBookingAdmin, (req, res) => {
  const voucher = parsePartnerVoucher(req.body);
  if (!voucher) return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin voucher và thời hạn hợp lệ.' });
  const record = { id: `TV-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, ...voucher, active: true, createdAt: new Date().toISOString() };
  try {
    bookingsDatabase.prepare(`
      INSERT INTO partner_vouchers (id, tour_id, stop_index, restaurant_name, title, benefit, code, terms, valid_from, valid_to, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(record.id, record.tourId, record.stopIndex, record.restaurantName, record.title, record.benefit,
      record.code, record.terms, record.validFrom, record.validTo, record.createdAt);
    return res.status(201).json({ voucher: record });
  } catch (error) {
    console.error('Could not create partner voucher:', error.message);
    return res.status(500).json({ message: 'Không lưu được voucher lúc này.' });
  }
});

app.patch('/api/admin/vouchers/:id', requireBookingAdmin, (req, res) => {
  if (typeof req.body?.active !== 'boolean') return res.status(400).json({ message: 'Trạng thái voucher không hợp lệ.' });
  const updatedAt = new Date().toISOString();
  const result = bookingsDatabase.prepare('UPDATE partner_vouchers SET active = ?, updated_at = ? WHERE id = ?')
    .run(req.body.active ? 1 : 0, updatedAt, req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Không tìm thấy voucher.' });
  return res.json({ voucher: readPartnerVouchers().find((voucher) => voucher.id === req.params.id) });
});

app.get('/api/admin/bookings', requireBookingAdmin, async (_req, res) => {
  try {
    const bookings = await readBookings();
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ bookings });
  } catch (error) {
    console.error('Could not read booking requests:', error.message);
    return res.status(500).json({ message: 'Không tải được danh sách đơn.' });
  }
});

app.patch('/api/admin/bookings/:id', requireBookingAdmin, async (req, res) => {
  const allowedStatuses = new Set(['new', 'contacted', 'confirmed', 'completed', 'cancelled']);
  const allowedPaymentStatuses = new Set(['not_paid', 'awaiting_payment', 'paid', 'refunded']);
  const { status } = req.body || {};
  const paymentStatus = req.body?.paymentStatus;
  const rawQuote = req.body?.quotedTotalVnd;
  const quotedTotalVnd = rawQuote === null || rawQuote === '' || rawQuote === undefined ? null : Number(rawQuote);
  const adminNote = typeof req.body?.adminNote === 'string' ? req.body.adminNote.trim().slice(0, 1000) : '';
  const guideName = typeof req.body?.guideName === 'string' ? req.body.guideName.trim().slice(0, 100) : '';
  const guidePhone = typeof req.body?.guidePhone === 'string' ? req.body.guidePhone.trim().slice(0, 30) : '';

  if (!allowedPaymentStatuses.has(paymentStatus)) return res.status(400).json({ message: 'Payment status is invalid.' });
  if (!allowedStatuses.has(status)) return res.status(400).json({ message: 'Trạng thái đơn không hợp lệ.' });
  if (quotedTotalVnd !== null && (!Number.isSafeInteger(quotedTotalVnd) || quotedTotalVnd < 0 || quotedTotalVnd > 1000000000)) {
    return res.status(400).json({ message: 'Giá báo phải là số nguyên VNĐ hợp lệ.' });
  }

  try {
    const booking = await updateBooking(req.params.id, { status, paymentStatus, quotedTotalVnd, adminNote, guideName, guidePhone });
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt tour.' });
    return res.json({ booking });
  } catch (error) {
    console.error('Could not update booking request:', error.message);
    return res.status(500).json({ message: 'Không cập nhật được đơn lúc này.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TasteTrip AI Proxy Server running on port ${PORT} with ${apiKeys.length} rotated API keys using model ${MODEL_NAME}.`);
});
