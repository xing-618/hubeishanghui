// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { User, Star, ShieldCheck, Building2, Settings, LogOut, ChevronRight, Phone, Crown } from 'lucide-react';
// @ts-ignore;
import { useToast, Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

import { TabBar } from '@/components/TabBar';
export default function ProfilePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadCurrentUser();
  }, []);
  const loadCurrentUser = async () => {
    try {
      // 先尝试从 auth 获取用户信息（微信登录场景）
      let user;
      try {
        user = await $w.auth.getUserInfo();
        if (user && user.currentUser) {
          setCurrentUser(user.currentUser);
          console.log('从 auth 获取用户信息成功:', user.currentUser);
          return;
        }
      } catch (authError) {
        console.log('auth 获取用户信息失败，尝试从数据库查询:', authError);
      }

      // 如果 auth 获取失败，尝试从数据库 users 表查询（手机号登录场景）
      // 注意：这种方式需要知道当前用户的标识，可能需要在登录时保存 userId 到 localStorage
      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                userId: {
                  $eq: storedUserId
                }
              }
            },
            select: {
              $master: true
            },
            pageSize: 1,
            pageNumber: 1
          }
        });
        console.log('从数据库查询用户结果:', result);
        if (result.success && result.data && result.data.records && result.data.records.length > 0) {
          setCurrentUser(result.data.records[0]);
          console.log('从数据库获取用户信息成功:', result.data.records[0]);
        } else {
          console.log('数据库中未找到用户，清除本地存储');
          localStorage.removeItem('currentUserId');
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      // 清除本地存储的用户ID
      localStorage.removeItem('currentUserId');
      console.log('已清除本地存储的用户ID');
      const tcb = await $w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await $w.auth.getUserInfo({
        force: true
      });
      setCurrentUser(null);

      // 刷新页面以清除状态
      window.location.reload();
      toast({
        title: '退出成功',
        description: '已成功退出登录'
      });
    } catch (error) {
      toast({
        title: '退出失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleNavigate = pageId => {
    if (!currentUser) {
      toast({
        title: '请先登录',
        description: '登录后才能使用此功能',
        variant: 'destructive'
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
      return;
    }
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };

  // 菜单列表
  const menuItems = [{
    icon: Settings,
    label: '修改个人信息',
    description: '修改头像、姓名、手机号',
    pageId: 'profile_edit',
    showCondition: () => !!currentUser
  }, {
    icon: Star,
    label: '查看收藏',
    description: '查看我收藏的企业',
    pageId: 'favorites',
    showCondition: () => !!currentUser
  }, {
    icon: ShieldCheck,
    label: '用户认证',
    description: '认证成为会员企业',
    pageId: 'member_certification',
    showCondition: () => !!currentUser && !currentUser.isMember
  }, {
    icon: Building2,
    label: '我的企业',
    description: '管理我的企业信息',
    pageId: 'my_company',
    showCondition: () => !!currentUser && currentUser.isMember
  }];
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4A5568]">加载中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* 用户信息头部 */}
      <div className="bg-gradient-to-r from-[#2D3748] to-[#4A5568] text-white pt-12 pb-24 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E0B]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {currentUser ? <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#F59E0B] shadow-2xl overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name || '用户头像'} />
                    <AvatarFallback className="bg-[#F59E0B] text-white text-2xl font-bold">
                      {(currentUser.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {currentUser.isMember && <div className="absolute -bottom-1 -right-1 bg-[#F59E0B] rounded-full p-2 border-2 border-white">
                    <Crown className="w-4 h-4 text-white" />
                  </div>}
              </div>
              <div>
                <h1 className="text-3xl font-bold font-serif mb-2">
                  {currentUser.name || currentUser.nickName || '未设置姓名'}
                </h1>
                <div className="flex items-center gap-3">
                  {currentUser.phone && <div className="flex items-center gap-2 text-white/80">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{currentUser.phone}</span>
                    </div>}
                  {currentUser.isMember && <span className="bg-[#F59E0B] text-white text-xs px-3 py-1 rounded-full font-bold">
                      会员企业
                    </span>}
                  {currentUser.isAdmin && <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                      管理员
                    </span>}
                </div>
              </div>
            </div> : <div className="text-center py-8">
              <User className="w-16 h-16 mx-auto mb-4 text-white/50" />
              <h1 className="text-2xl font-bold font-serif mb-2">欢迎来到商会系统</h1>
              <p className="text-white/70">登录后享受更多功能</p>
            </div>}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        {/* 登录按钮（未登录时显示） */}
        {!currentUser && <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <Button onClick={() => $w.utils.navigateTo({
          pageId: 'login',
          params: {}
        })} className="w-full bg-[#F59E0B] hover:bg-[#E59208] text-white py-6 text-lg font-bold shadow-lg">
              立即登录
            </Button>
          </div>}

        {/* 功能菜单 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#2D3748] mb-4 font-serif">
              功能菜单
            </h2>
            <div className="space-y-3">
              {menuItems.filter(item => item.showCondition()).map((item, index) => {
              const Icon = item.icon;
              return <button key={index} onClick={() => handleNavigate(item.pageId)} className="w-full p-4 bg-gradient-to-r from-gray-50 to-white hover:from-[#F59E0B]/5 hover:to-[#F59E0B]/10 rounded-xl transition-all duration-300 group hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.pageId === 'member_certification' ? 'bg-[#F59E0B]' : 'bg-[#2D3748]'}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-[#2D3748] group-hover:text-[#F59E0B] transition-colors">
                              {item.label}
                            </h3>
                            <p className="text-sm text-[#4A5568]">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#4A5568] group-hover:text-[#F59E0B] group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>;
            })}
            </div>
          </div>
        </div>

        {/* 退出登录按钮（已登录时显示） */}
        {currentUser && <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <button onClick={handleLogout} className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <span className="font-bold">退出登录</span>
            </button>
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar $w={$w} currentPage="profile" />
    </div>;
}