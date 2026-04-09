// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Building2, Filter, X } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { CompanyCard } from '@/components/CompanyCard';
import { TabBar } from '@/components/TabBar';

// 企业分类
const CATEGORIES = ['全部', '建材', '装修', '烟行', '餐饮', '服装', '物流', '金融', '教育', '其他'];
export default function CompaniesPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // 加载数据
  useEffect(() => {
    loadCompanies();
    loadCurrentUser();
  }, []);

  // 过滤企业
  useEffect(() => {
    if (selectedCategory === '全部') {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(companies.filter(company => company.category === selectedCategory));
    }
  }, [selectedCategory, companies]);
  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'companies',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              isPublished: {
                $eq: true
              }
            }
          },
          orderBy: [{
            updatedAt: 'desc'
          }],
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      });
      console.log('企业列表返回结果:', result);
      if (result.success && result.data && result.data.records) {
        console.log('设置企业数量:', result.data.records.length);
        setCompanies(result.data.records);
      } else {
        console.error('企业数据获取失败:', result);
        setCompanies([]);
      }
    } catch (error) {
      console.error('加载企业异常:', error);
      toast({
        title: '加载企业失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loadCurrentUser = async () => {
    try {
      const user = await $w.auth.getUserInfo();
      if (user && user.currentUser) {
        setCurrentUser(user.currentUser);
        if (user.currentUser.userId) {
          await loadFavorites(user.currentUser.userId);
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };
  const loadFavorites = async userId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'favorites',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result.success) {
        setFavorites(result.data.records);
      }
    } catch (error) {
      console.error('加载收藏失败:', error);
    }
  };

  // 处理企业点击
  const handleCompanyClick = company => {
    $w.utils.navigateTo({
      pageId: 'company_detail',
      params: {
        companyId: company.companyId
      }
    });
  };

  // 处理收藏/取消收藏
  const handleToggleFavorite = async company => {
    if (!currentUser) {
      toast({
        title: '请先登录',
        description: '登录后才能收藏企业',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    const isFavorited = favorites.some(f => f.companyId === company.companyId);
    try {
      if (isFavorited) {
        const favorite = favorites.find(f => f.companyId === company.companyId);
        await $w.cloud.callDataSource({
          dataSourceName: 'favorites',
          methodName: 'wedaDeleteV2',
          params: {
            _id: favorite._id
          }
        });
        setFavorites(favorites.filter(f => f.companyId !== company.companyId));
        toast({
          title: '已取消收藏',
          description: `已取消收藏 ${company.name}`
        });
      } else {
        await $w.cloud.callDataSource({
          dataSourceName: 'favorites',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              favoriteId: `favorite_${Date.now()}`,
              userId: currentUser.userId,
              companyId: company.companyId,
              createdAt: new Date()
            }
          }
        });
        setFavorites([...favorites, {
          companyId: company.companyId
        }]);
        toast({
          title: '收藏成功',
          description: `已收藏 ${company.name}`
        });
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const isCompanyFavorited = company => {
    return favorites.some(f => f.companyId === company.companyId);
  };

  // 获取企业数量统计
  const getCategoryCount = category => {
    if (category === '全部') {
      return companies.length;
    }
    return companies.filter(c => c.category === category).length;
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* 顶部标题栏 */}
      <div className="bg-[#2D3748] text-white py-6 px-4 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#F59E0B]" />
              <div>
                <h1 className="text-2xl font-bold font-serif">企业列表</h1>
                <p className="text-sm text-white/70">共 {companies.length} 家企业</p>
              </div>
            </div>
            
            {/* 移动端分类按钮 */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden bg-[#F59E0B] hover:bg-[#E59208] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
              <Filter className="w-5 h-5" />
              <span>筛选</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 左侧分类导航 - 桌面端 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              <h3 className="text-lg font-bold text-[#2D3748] mb-4 font-serif">
                企业分类
              </h3>
              <nav className="space-y-2">
                {CATEGORIES.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-300 flex items-center justify-between group ${selectedCategory === category ? 'bg-[#F59E0B] text-white shadow-lg scale-105' : 'bg-gray-50 text-[#4A5568] hover:bg-[#F59E0B] hover:text-white'}`}>
                    <span className="font-medium">{category}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${selectedCategory === category ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'}`}>
                      {getCategoryCount(category)}
                    </span>
                  </button>)}
              </nav>
            </div>
          </aside>

          {/* 右侧企业列表 */}
          <div className="flex-1">
            {/* 当前分类标题 */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#2D3748] font-serif">
                  {selectedCategory}
                </h2>
                <p className="text-sm text-[#4A5568]">
                  共 {filteredCompanies.length} 家企业
                </p>
              </div>
            </div>

            {/* 企业列表 */}
            {isLoading ? <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#4A5568]">加载中...</p>
                </div>
              </div> : filteredCompanies.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <Building2 className="w-16 h-16 text-[#4A5568] mx-auto mb-4" />
                <p className="text-[#4A5568] text-lg">
                  {selectedCategory === '全部' ? '暂无企业' : `暂无${selectedCategory}类企业`}
                </p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCompanies.map(company => <CompanyCard key={company.companyId} company={company} onClick={handleCompanyClick} isFavorited={isCompanyFavorited(company)} onToggleFavorite={handleToggleFavorite} />)}
              </div>}
          </div>
        </div>
      </div>

      {/* 移动端分类侧边栏 */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-[#2D3748] text-white p-6 sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-serif">企业分类</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {CATEGORIES.map(category => <button key={category} onClick={() => {
            setSelectedCategory(category);
            setIsSidebarOpen(false);
          }} className={`w-full px-4 py-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group ${selectedCategory === category ? 'bg-[#F59E0B] text-white shadow-lg' : 'bg-gray-50 text-[#4A5568] hover:bg-[#F59E0B] hover:text-white'}`}>
                  <span className="font-medium">{category}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${selectedCategory === category ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-white/20'}`}>
                    {getCategoryCount(category)}
                  </span>
                </button>)}
            </nav>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <TabBar $w={$w} currentPage="companies" />
    </div>;
}