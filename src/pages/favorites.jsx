// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import { callDataSource } from '@/lib/dataSource';
export default function Favorites(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const {
    $w
  } = props;
  const currentUser = $w.auth.currentUser;
  useEffect(() => {
    if (currentUser && currentUser.userId) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [currentUser]);
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const result = await callDataSource({
        dataSourceName: 'favorites',
        params: {
          operation: 'list',
          condition: {
            userId: currentUser.userId
          }
        }
      });
      if (result && result.data) {
        setFavorites(result.data);
        if (result.data.length > 0) {
          const companyIds = result.data.map(fav => fav.companyId);
          await fetchCompanies(companyIds);
        }
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '获取收藏列表失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchCompanies = async companyIds => {
    try {
      const result = await callDataSource({
        dataSourceName: 'companies',
        params: {
          operation: 'list'
        }
      });
      if (result && result.data) {
        const filteredCompanies = result.data.filter(company => companyIds.includes(company.companyId) && company.isPublished);
        setCompanies(filteredCompanies);
      }
    } catch (error) {
      console.error('获取企业信息失败:', error);
    }
  };
  const handleRemoveFavorite = async (favoriteId, e) => {
    e.stopPropagation();
    if (deleteLoading) return;
    if (!window.confirm('确定要取消收藏这个企业吗？')) {
      return;
    }
    try {
      setDeleteLoading(favoriteId);
      const result = await callDataSource({
        dataSourceName: 'favorites',
        params: {
          operation: 'delete',
          condition: {
            favoriteId: favoriteId
          }
        }
      });
      if (result && result.success) {
        toast({
          title: '已取消收藏',
          description: '该企业已从收藏中移除'
        });
        setFavorites(favorites.filter(fav => fav.favoriteId !== favoriteId));
        const companyIds = favorites.filter(fav => fav.favoriteId !== favoriteId).map(fav => fav.companyId);
        setCompanies(companies.filter(company => companyIds.includes(company.companyId)));
      } else {
        toast({
          title: '操作失败',
          description: '取消收藏失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '取消收藏失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setDeleteLoading(null);
    }
  };
  const handleCompanyClick = company => {
    $w.utils.navigateTo({
      pageId: 'company-detail',
      params: {
        companyId: company.companyId
      }
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D3748] mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>;
  }
  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">请先登录</p>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'login',
          params: {}
        })} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
            前往登录
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()} className="text-[#2D3748] hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#2D3748]">我的收藏</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {companies.length === 0 ? <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">还没有收藏任何企业</p>
            <p className="text-gray-400 text-sm">去首页看看吧</p>
            <Button onClick={() => $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="mt-4 bg-[#F59E0B] hover:bg-[#D97706] text-white">
              前往首页
            </Button>
          </div> : <div className="space-y-3">
            {companies.map(company => {
          const favorite = favorites.find(fav => fav.companyId === company.companyId);
          return <div key={company.companyId} onClick={() => handleCompanyClick(company)} className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow group">
                  <div className="flex items-start gap-4">
                    {company.logo ? <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" /> : <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xl font-bold">
                          {company.name?.charAt(0) || '企'}
                        </span>
                      </div>}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#2D3748] mb-1 truncate">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] text-xs font-medium rounded-full">
                          {company.category || '未分类'}
                        </span>
                        {company.isRecommended && <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                            推荐
                          </span>}
                      </div>
                      {company.oneLineDesc && <p className="text-gray-500 text-sm line-clamp-2">
                          {company.oneLineDesc}
                        </p>}
                    </div>
                    
                    <Button onClick={e => handleRemoveFavorite(favorite.favoriteId, e)} disabled={deleteLoading === favorite.favoriteId} variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>;
        })}
          </div>}
      </div>
    </div>;
}