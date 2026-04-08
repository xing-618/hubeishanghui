// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Carousel({
  banners,
  onBannerClick
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);
  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };
  const handleDotClick = index => {
    setCurrentIndex(index);
  };
  if (banners.length === 0) {
    return <div className="w-full h-[400px] bg-gradient-to-r from-[#2D3748] to-[#4A5568] flex items-center justify-center">
        <p className="text-white text-lg">暂无轮播图</p>
      </div>;
  }
  const currentBanner = banners[currentIndex];
  return <div className="relative w-full h-[400px] overflow-hidden group" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      {/* 轮播图片 */}
      <div className="absolute inset-0 transition-transform duration-500 ease-out cursor-pointer" style={{
      backgroundImage: `url(${currentBanner.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transform: `translateX(-${currentIndex * 100}%)`
    }} onClick={() => onBannerClick && onBannerClick(currentBanner)}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-2 font-serif">
            {currentBanner.title}
          </h2>
          <p className="text-lg text-white/90 font-sans">
            {currentBanner.description}
          </p>
        </div>
      </div>

      {/* 左右箭头 */}
      <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0">
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0">
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* 指示点 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, index) => <button key={index} onClick={() => handleDotClick(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-[#F59E0B] w-8' : 'bg-white/50 hover:bg-white/80'}`} />)}
      </div>
    </div>;
}
export default Carousel;