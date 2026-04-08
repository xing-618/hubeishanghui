// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Building2, Star } from 'lucide-react';

export function CompanyCard({
  company,
  onClick,
  isFavorited,
  onToggleFavorite
}) {
  return <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-l-4 border-[#F59E0B]" onClick={() => onClick && onClick(company)}>
      {/* 企业 Logo */}
      <div className="h-48 overflow-hidden">
        <img src={company.logo || 'https://images.unsplash.com/photo-1497215827241-093531dd8847?w=400'} alt={company.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {company.isRecommended && <div className="absolute top-4 right-4 bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3" />
            推荐
          </div>}
      </div>

      {/* 企业信息 */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-[#2D3748] font-serif mb-1">
              {company.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-[#4A5568]">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{company.category}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-[#4A5568] leading-relaxed line-clamp-2">
          {company.oneLineDesc || '暂无简介'}
        </p>
      </div>

      {/* 收藏按钮 */}
      {onToggleFavorite && <button onClick={e => {
      e.stopPropagation();
      onToggleFavorite(company);
    }} className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-300 ${isFavorited ? 'bg-[#F59E0B] text-white' : 'bg-white/90 text-[#4A5568] hover:bg-[#F59E0B] hover:text-white'} shadow-lg`}>
          <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>}
    </div>;
}
export default CompanyCard;