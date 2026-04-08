// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Home, Building2, User, Menu } from 'lucide-react';

export function TabBar({
  $w,
  currentPage,
  onNavigate
}) {
  const tabs = [{
    id: 'home',
    label: '首页',
    icon: Home
  }, {
    id: 'companies',
    label: '企业',
    icon: Building2
  }, {
    id: 'profile',
    label: '我的',
    icon: User
  }];
  const handleTabClick = tabId => {
    if (tabId !== currentPage) {
      $w.utils.navigateTo({
        pageId: tabId,
        params: {}
      });
    }
  };
  return <div className="fixed bottom-0 left-0 right-0 bg-[#2D3748] text-white shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;
          return <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-[#F59E0B] scale-110' : 'text-[#4A5568] hover:text-[#F59E0B]'}`}>
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>;
        })}
        </div>
      </div>
    </div>;
}
export default TabBar;