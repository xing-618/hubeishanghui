// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Users, Building2, ShieldCheck, ListTodo, FileText, LogOut, Bell, Settings, Home as HomeIcon } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export default function AdminDashboard(props) {
  const {
    $w
  } = props;
  const {
    auth
  } = $w;
  const currentUser = auth?.currentUser;

  // 管理员权限检查
  if (!currentUser || !currentUser.isAdmin) {
    return <div className="min-h-screen bg-[#2D3748] flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-20 h-20 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">权限不足</h2>
          <p className="text-gray-300 mb-6">此页面仅限管理员访问</p>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
            返回首页
          </Button>
        </div>
      </div>;
  }
  const menuItems = [{
    icon: Users,
    title: '用户管理',
    description: '管理平台用户信息',
    color: 'bg-blue-500',
    pageId: 'admin-users'
  }, {
    icon: ShieldCheck,
    title: '会员认证审核',
    description: '审核会员认证申请',
    color: 'bg-green-500',
    pageId: 'admin-member-certifications'
  }, {
    icon: Building2,
    title: '企业信息管理',
    description: '管理所有企业信息',
    color: 'bg-purple-500',
    pageId: 'admin-companies'
  }, {
    icon: FileText,
    title: '企业信息审核',
    description: '审核企业修改申请',
    color: 'bg-orange-500',
    pageId: 'admin-company-audits'
  }, {
    icon: ListTodo,
    title: '轮播图管理',
    description: '管理首页轮播图',
    color: 'bg-pink-500',
    pageId: 'admin-banners'
  }, {
    icon: Settings,
    title: '系统设置',
    description: '系统配置管理',
    color: 'bg-gray-500',
    pageId: 'admin-settings'
  }];
  return <div className="min-h-screen bg-[#2D3748]">
      {/* 顶部导航栏 */}
      <header className="bg-[#1A202C] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="w-8 h-8 text-[#F59E0B]" />
            <div>
              <h1 className="text-2xl font-bold text-white">商会管理系统</h1>
              <p className="text-sm text-gray-400">管理后台</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-gray-700">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={() => $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          })} className="text-white hover:bg-gray-700">
              <HomeIcon className="w-5 h-5 mr-2" />
              返回首页
            </Button>
            <Button variant="ghost" onClick={() => $w.utils.navigateTo({
            pageId: 'login',
            params: {}
          })} className="text-white hover:bg-red-600">
              <LogOut className="w-5 h-5 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-6 py-8">
        {/* 欢迎信息 */}
        <div className="mb-8 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            欢迎回来，{currentUser.nickName || currentUser.name}
          </h2>
          <p className="text-orange-100">今天是管理员控制面板</p>
        </div>

        {/* 功能菜单网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
          const Icon = item.icon;
          return <button key={index} onClick={() => $w.utils.navigateTo({
            pageId: item.pageId,
            params: {}
          })} className="bg-[#4A5568] hover:bg-[#2D3748] rounded-lg p-6 text-left transition-all duration-200 hover:shadow-2xl border border-gray-600 hover:border-[#F59E0B] group">
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </button>;
        })}
        </div>

        {/* 统计信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-[#4A5568] rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">总用户数</p>
                <p className="text-3xl font-bold text-white mt-2">156</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-[#4A5568] rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">会员企业</p>
                <p className="text-3xl font-bold text-white mt-2">89</p>
              </div>
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-[#4A5568] rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">企业数量</p>
                <p className="text-3xl font-bold text-white mt-2">234</p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-[#4A5568] rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">待审核</p>
                <p className="text-3xl font-bold text-white mt-2">12</p>
              </div>
              <FileText className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>
      </main>
    </div>;
}