import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
3. Với mỗi điểm dừng (stop) trong lịch trình, BẮT BUỘC cung cấp đầy đủ thông tin:
   - 'name': Tên món ăn / quán ăn chính xác tại tỉnh thành đó.
   - 'address': Địa chỉ cụ thể trên Google Maps tại tỉnh thành đó.
   - 'image': Hình ảnh món ăn trực quan (URL).
   - 'cultureStory': Câu chuyện văn hóa, giai thoại lịch sử của món ăn.
   - 'tastingTip': Cách ăn chuẩn vị, mẹo thưởng thức.
   - 'englishMenu': Thực đơn bằng tiếng Anh.
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
      const testRes = await model.generateContent('ping');
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
    const { prompt } = req.body;
    const pLower = (prompt || '').toLowerCase();

    let provinceContext = '';
    for (const [key, val] of Object.entries(PROVINCES_DB)) {
      if (pLower.includes(key)) {
        provinceContext = `\nĐỊA ĐIỂM NGƯỜI DÙNG YÊU CẦU: ${val.title} (${val.region}).\nCác món ăn đặc sản chuẩn gốc bắt buộc phải có trong lịch trình:\n` + val.stops.map(s => `- ${s.mealType} (${s.time}): ${s.name} tại địa chỉ ${s.address}.`).join('\n');
        break;
      }
    }

    const result = await callWithRetry(async (ai) => {
      const model = ai.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION + "\nHãy trả về kết quả dưới dạng JSON thuần túy (không kèm markdown code blocks, chỉ đúng chuẩn JSON) với cấu trúc ThemeTour gồm: { id, title, subtitle, bgImage, desc, duration, tags, highlights: string[], stops: [ { name, time, activity, address, desc, image, tip, cultureStory, tastingTip, englishMenu } ] }"
      });

      const promptText = `Dựa trên yêu cầu sau của người dùng, hãy tạo một lịch trình tour du lịch ẩm thực thật chi tiết tại Việt Nam: "${prompt}". ${provinceContext}`;

      return await model.generateContent(promptText);
    });

    const text = result.response.text();
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let tourData = JSON.parse(jsonStr);
    tourData = enrichTourData(tourData, prompt);
    res.json({ tour: tourData });
  } catch (error) {
    console.error('⚠️ /api/itinerary error:', error.message);
    const errStr = (error.message || '').toLowerCase();
    const isQuota = errStr.includes('429') || errStr.includes('quota') || errStr.includes('exhausted') || errStr.includes('resource_exhausted');
    if (isQuota) {
      return res.status(429).json({ error: 'QUOTA_EXHAUSTED', message: 'Đã đến giới hạn sử dụng AI (Hết token), vui lòng thử lại sau.' });
    }
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Chưa kết nối được đến với server.' });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TasteTrip AI Proxy Server running on port ${PORT} with ${apiKeys.length} rotated API keys using model ${MODEL_NAME}.`);
});
