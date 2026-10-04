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

export async function generateItinerary(prompt: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    const response = await fetch(`${API_BASE}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (response.status === 429 || (data && (data.error === 'QUOTA_EXHAUSTED' || (data.message && data.message.toLowerCase().includes('quota'))))) {
      throw new Error('Đã đến giới hạn sử dụng AI (Hết token), vui lòng thử lại sau.');
    }

    if (!response.ok) {
      if (data && data.message && data.message.includes('Hết token')) {
        throw new Error('Đã đến giới hạn sử dụng AI (Hết token), vui lòng thử lại sau.');
      }
      throw new Error('Chưa kết nối được đến với server.');
    }

    return data.tour;
  } catch (err: any) {
    console.warn('Itinerary API connection error:', err);
    if (err.message && err.message.includes('Hết token')) {
      throw err;
    }
    throw new Error('Chưa kết nối được đến với server.');
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
