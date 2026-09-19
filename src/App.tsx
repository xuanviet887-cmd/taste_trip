import { useState, useMemo } from 'react';
import { 
  MapPin, Utensils, Award, Store
} from 'lucide-react';
import { MOCK_RESTAURANTS } from './lib/mock-data';
import type { Restaurant } from './lib/mock-data';

export default function App() {
  const [currentStep, setCurrentStep] = useState<'home' | 'filter' | 'results' | 'detail'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const [locationInput, setLocationInput] = useState<string>('Hồ Gươm, Hà Nội');
  const [selectedCategory] = useState<string>('Tất cả');
  const [selectedFoodType] = useState<string>('Tất cả');
  const [selectedPrice] = useState<string>('Tất cả');
  const [selectedRadius] = useState<number>(0); 

  const filteredList = useMemo(() => {
    return MOCK_RESTAURANTS.filter((item) => {
      const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
      const matchFoodType = selectedFoodType === 'Tất cả' || item.foodType === selectedFoodType;
      const matchPrice = selectedPrice === 'Tất cả' || item.priceLevel === selectedPrice;
      const matchRadius = selectedRadius === 0 || item.distanceKm <= selectedRadius;
      return matchCategory && matchFoodType && matchPrice && matchRadius;
    });
  }, [selectedCategory, selectedFoodType, selectedPrice, selectedRadius]);

  const handleOpenDetail = (item: Restaurant) => {
    setSelectedRestaurant(item);
    setCurrentStep('detail');
  };

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800 font-sans antialiased">
      <header className="bg-white border-b border-rose-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div onClick={() => setCurrentStep('home')} className="flex items-center gap-2 cursor-pointer font-bold text-xl text-rose-600">
            <div className="p-1.5 bg-rose-500 text-white rounded-lg">
              <Utensils className="w-5 h-5" />
            </div>
            <span>Taste Trip</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
            <button onClick={() => setCurrentStep('home')} className="hover:text-rose-600">Trang chủ</button>
            <button onClick={() => setCurrentStep('filter')} className="hover:text-rose-600">Khám phá</button>
          </nav>
        </div>
      </header>

      {currentStep === 'home' && (
        <main>
          <section className="relative bg-slate-900 text-white py-24 px-4 text-center bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80')` }}>
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Khám phá điểm đến - Thưởng thức đúng gu
              </h1>
              <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2 max-w-xl mx-auto text-slate-800 mt-6">
                <MapPin className="w-5 h-5 text-rose-500 ml-3 shrink-0" />
                <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="Nhập địa điểm..." className="w-full bg-transparent focus:outline-none text-sm px-2" />
                <button onClick={() => setCurrentStep('filter')} className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm shrink-0">Tìm kiếm</button>
              </div>
            </div>
          </section>

          <section className="py-12 bg-white border-b border-rose-50">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[ {icon: MapPin, text: 'Đúng địa điểm'}, {icon: Utensils, text: 'Lọc theo nhu cầu'}, {icon: Store, text: 'Nhận kết quả'}, {icon: Award, text: 'Khám phá ẩm thực'} ].map((step, i) => (
                <div key={i} className="space-y-2 p-4"><step.icon className="w-8 h-8 text-rose-500 mx-auto" /><h3 className="font-bold text-sm">{step.text}</h3></div>
              ))}
            </div>
          </section>
        </main>
      )}

      {currentStep === 'filter' && (
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 space-y-6">
            <button onClick={() => setCurrentStep('results')} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-all text-sm">Tìm kiếm</button>
          </div>
        </main>
      )}

      {currentStep === 'results' && (
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {filteredList.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-rose-100 flex flex-col sm:flex-row gap-4 shadow-sm">
                <img src={item.image} alt={item.name} className="w-full sm:w-44 h-36 object-cover rounded-xl" />
                <div className="flex-1">
                  <h3 className="font-bold text-base text-slate-800">{item.name}</h3>
                  <button onClick={() => handleOpenDetail(item)} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs mt-2">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {currentStep === 'detail' && selectedRestaurant && (
        <main className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => setCurrentStep('results')} className="text-xs font-medium text-slate-500 mb-4">&larr; Quay lại</button>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">{selectedRestaurant.name}</div>
        </main>
      )}
    </div>
  );
}
