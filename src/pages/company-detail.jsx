// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Heart, Share2, Phone, MapPin, Star, FileText } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

import RichTextDisplay from '@/components/RichTextDisplay';
import { callDataSource } from '@/lib/dataSource';
export default function CompanyDetail(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const {
    $w
  } = props;
  const {
    page
  } = $w;
  const {
    params
  } = page.dataset;
  const companyId = params.companyId;
  const currentUser = $w.auth.currentUser;
  useEffect(() => {
    if (companyId) {
      fetchCompanyDetail();
    }
  }, [companyId]);
  const fetchCompanyDetail = async () => {
    try {
      setLoading(true);
      const result = await callDataSource({
        dataSourceName: 'companies',
        params: {
          operation: 'get',
          condition: {
            companyId: companyId
          }
        }
      });
      if (result && result.data && result.data.length > 0) {
        setCompany(result.data[0]);
        if (currentUser && currentUser.userId) {
          checkFavoriteStatus(result.data[0].companyId);
        }
      } else {
        toast({
          title: '企业信息不存在',
          description: '未找到该企业的详细信息',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('获取企业详情失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '获取企业信息失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const checkFavoriteStatus = async companyId => {
    try {
      const result = await callDataSource({
        dataSourceName: 'favorites',
        params: {
          operation: 'list',
          condition: {
            userId: currentUser.userId,
            companyId: companyId
          }
        }
      });
      if (result && result.data && result.data.length > 0) {
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };
  const toggleFavorite = async () => {
    if (!currentUser || !currentUser.userId) {
      toast({
        title: '请先登录',
        description: '收藏功能需要登录后使用',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    if (favoriteLoading) return;
    try {
      setFavoriteLoading(true);
      if (isFavorited) {
        const result = await callDataSource({
          dataSourceName: 'favorites',
          params: {
            operation: 'delete',
            condition: {
              userId: currentUser.userId,
              companyId: company.companyId
            }
          }
        });
        if (result && result.success) {
          setIsFavorited(false);
          toast({
            title: '已取消收藏',
            description: '该企业已从收藏中移除'
          });
        }
      } else {
        const result = await callDataSource({
          dataSourceName: 'favorites',
          params: {
            operation: 'add',
            data: {
              favoriteId: `fav_${Date.now()}`,
              userId: currentUser.userId,
              companyId: company.companyId
            }
          }
        });
        if (result && result.success) {
          setIsFavorited(true);
          toast({
            title: '收藏成功',
            description: '该企业已添加到收藏夹'
          });
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '收藏操作失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setFavoriteLoading(false);
    }
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company.name,
        text: company.oneLineDesc || '查看这个企业',
        url: window.location.href
      }).catch(error => {
        console.log('分享失败:', error);
      });
    } else {
      toast({
        title: '分享',
        description: '当前浏览器不支持分享功能'
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D3748] mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>;
  }
  if (!company) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">企业信息不存在</p>
          <Button onClick={() => $w.utils.navigateBack()} className="bg-[#2D3748] hover:bg-[#4A5568]">
            返回
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
          <h1 className="text-lg font-semibold text-[#2D3748]">企业详情</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFavorite} disabled={favoriteLoading} className={isFavorited ? 'text-[#F59E0B] hover:bg-orange-50' : 'text-gray-400 hover:bg-gray-100'}>
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-[#2D3748] hover:bg-gray-100">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-[#2D3748] to-[#4A5568]">
            <div className="flex items-start gap-4">
              {company.logo ? <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-lg object-cover bg-white shadow-lg" /> : <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl font-bold">
                    {company.name?.charAt(0) || '企'}
                  </span>
                </div>}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {company.name || '企业名称'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-[#F59E0B] text-white text-xs font-medium rounded-full">
                    {company.category || '未分类'}
                  </span>
                  {company.isRecommended && <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      <Star className="w-3 h-3 mr-1" />
                      推荐
                    </span>}
                </div>
              </div>
            </div>

            {company.oneLineDesc && <p className="mt-4 text-gray-200 text-sm italic">
                &quot;{company.oneLineDesc}&quot;
              </p>}
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#2D3748] mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              企业介绍
            </h3>
            <RichTextDisplay content={company.introduction} className="mt-4" />
          </div>

          <div className="px-6 pb-6">
            <Button onClick={toggleFavorite} disabled={favoriteLoading} className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${isFavorited ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#F59E0B] hover:bg-[#D97706]'}`}>
              <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? '已收藏' : '收藏企业'}
            </Button>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#2D3748] mb-4">联系信息</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3 text-[#F59E0B]" />
              <span>联系方式请通过商会获取</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-[#F59E0B]" />
              <span>地址信息请通过商会获取</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
}