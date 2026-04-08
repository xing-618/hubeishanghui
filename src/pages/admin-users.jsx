// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Search, Shield, UserPlus, Edit, Trash2, MoreVertical, Filter } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';

export default function AdminUsers(props) {
  const {
    $w
  } = props;
  const {
    auth
  } = $w;
  const currentUser = auth?.currentUser;
  const {
    toast
  } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // 管理员权限检查
  if (!currentUser || !currentUser.isAdmin) {
    return <div className="min-h-screen bg-[#2D3748] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-20 h-20 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">权限不足</h2>
          <p className="text-gray-300">此页面仅限管理员访问</p>
        </div>
      </div>;
  }

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('users').get();
      setUsers(result.data || []);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载用户列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone?.includes(searchTerm);
    const matchesFilter = filterType === 'all' || filterType === 'admin' && user.isAdmin || filterType === 'member' && user.isMember || filterType === 'normal' && !user.isAdmin && !user.isMember;
    return matchesSearch && matchesFilter;
  });

  // 切换管理员状态
  const toggleAdminStatus = async (userId, isAdmin) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('users').doc(userId).update({
        isAdmin: !isAdmin,
        updatedAt: Date.now()
      });
      toast({
        title: '操作成功',
        description: isAdmin ? '已取消管理员权限' : '已授予管理员权限'
      });
      loadUsers();
    } catch (error) {
      console.error('更新管理员状态失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法更新管理员状态',
        variant: 'destructive'
      });
    }
  };

  // 切换会员状态
  const toggleMemberStatus = async (userId, isMember) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('users').doc(userId).update({
        isMember: !isMember,
        updatedAt: Date.now()
      });
      toast({
        title: '操作成功',
        description: isMember ? '已取消会员资格' : '已授予会员资格'
      });
      loadUsers();
    } catch (error) {
      console.error('更新会员状态失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法更新会员状态',
        variant: 'destructive'
      });
    }
  };
  return <div className="min-h-screen bg-[#2D3748]">
      {/* 顶部导航栏 */}
      <header className="bg-[#1A202C] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => $w.utils.navigateTo({
            pageId: 'admin-dashboard',
            params: {}
          })} className="text-white hover:bg-gray-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-white">用户管理</h1>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-6 py-8">
        {/* 搜索和过滤 */}
        <div className="bg-[#4A5568] rounded-lg p-6 mb-6 border border-gray-600">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input placeholder="搜索用户姓名、昵称或手机号" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[#2D3748] border-gray-600 text-white" />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-[#2D3748] border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="member">会员企业</SelectItem>
                  <SelectItem value="normal">普通用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        {loading ? <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mb-4"></div>
            <p className="text-gray-400">加载中...</p>
          </div> : filteredUsers.length === 0 ? <div className="text-center py-12">
            <UserPlus className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">暂无用户数据</p>
          </div> : <div className="bg-[#4A5568] rounded-lg border border-gray-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1A202C] text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">用户信息</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">手机号</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">身份</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">注册时间</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => <tr key={user._id || index} className="border-t border-gray-600 hover:bg-[#2D3748]">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatarUrl || 'https://via.placeholder.com/40'} alt="头像" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.nickName || '暂无昵称'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {user.isAdmin && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">管理员</span>}
                          {user.isMember && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">会员</span>}
                          {!user.isAdmin && !user.isMember && <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">普通用户</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant={user.isAdmin ? 'destructive' : 'default'} onClick={() => toggleAdminStatus(user._id, user.isAdmin)} className={user.isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-600'}>
                            <Shield className="w-4 h-4 mr-1" />
                            {user.isAdmin ? '取消管理' : '设为管理'}
                          </Button>
                          <Button size="sm" variant={user.isMember ? 'destructive' : 'default'} onClick={() => toggleMemberStatus(user._id, user.isMember)} className={user.isMember ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-500 hover:bg-green-600'}>
                            {user.isMember ? '取消会员' : '设为会员'}
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}
      </main>
    </div>;
}