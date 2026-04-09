// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Building2, TrendingUp } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { Carousel } from '@/components/Carousel';
import { CompanyCard } from '@/components/CompanyCard';
import { TabBar } from '@/components/TabBar';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [banners, setBanners] = useState([]);
  const [recommendedCompanies, setRecommendedCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // 加载数据
  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);
  const loadData = async () => {
    try {
      setIsLoading(true);

      // 并行加载轮播图和推荐企业
      const [bannersResult, companiesResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'banners',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: true
              }
            }
          },
          orderBy: [{
            order: 'asc'
          }],
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'companies',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                isRecommended: {
                  $eq: true
                }
              }, {
                isPublished: {
                  $eq: true
                }
              }]
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
      })]);
      console.log('轮播图返回结果:', bannersResult);
      console.log('推荐企业返回结果:', companiesResult);
      if (bannersResult.success && bannersResult.data && bannersResult.data.records) {
        console.log('设置轮播图数量:', bannersResult.data.records.length);
        setBanners(bannersResult.data.records);
      } else {
        console.error('轮播图数据获取失败:', bannersResult);
        setBanners([]);
      }
      if (companiesResult.success && companiesResult.data && companiesResult.data.records) {
        console.log('设置推荐企业数量:', companiesResult.data.records.length);
        setRecommendedCompanies(companiesResult.data.records);
      } else {
        console.error('推荐企业数据获取失败:', companiesResult);
        setRecommendedCompanies([]);
      }
    } catch (error) {
      toast({
        title: '加载数据失败',
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

        // 如果用户已登录，加载收藏列表
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

  // 处理轮播图点击
  const handleBannerClick = banner => {
    if (banner.targetPageId) {
      $w.utils.navigateTo({
        pageId: banner.targetPageId,
        params: {}
      });
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
        // 取消收藏
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
        // 添加收藏
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

  // 检查企业是否已收藏
  const isCompanyFavorited = company => {
    return favorites.some(f => f.companyId === company.companyId);
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* 轮播图区域 */}
      <div className="w-full">
        <Carousel banners={banners} onBannerClick={handleBannerClick} />
      </div>

      {/* 推荐企业区域 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2D3748] font-serif">
              推荐企业
            </h2>
            <p className="text-sm text-[#4A5568]">精选优质会员企业</p>
          </div>
        </div>

        {isLoading ? <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#4A5568]">加载中...</p>
            </div>
          </div> : recommendedCompanies.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Building2 className="w-16 h-16 text-[#4A5568] mx-auto mb-4" />
            <p className="text-[#4A5568] text-lg">暂无推荐企业</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCompanies.map(company => <CompanyCard key={company.companyId} company={company} onClick={handleCompanyClick} isFavorited={isCompanyFavorited(company)} onToggleFavorite={handleToggleFavorite} />)}
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar $w={$w} currentPage="home" />
    </div>;
}