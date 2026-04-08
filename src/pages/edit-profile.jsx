// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Camera, User, Phone, Lock, Mail } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

import { callDataSource } from '@/lib/dataSource';
export default function EditProfile(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    nickName: '',
    phone: '',
    avatarUrl: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {
    $w
  } = props;
  const currentUser = $w.auth.currentUser;
  useEffect(() => {
    if (currentUser && currentUser.userId) {
      fetchUserInfo();
    }
  }, [currentUser]);
  const fetchUserInfo = async () => {
    try {
      const result = await callDataSource({
        dataSourceName: 'users',
        params: {
          operation: 'get',
          condition: {
            userId: currentUser.userId
          }
        }
      });
      if (result && result.data && result.data.length > 0) {
        setUser(result.data[0]);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '获取用户信息失败',
        variant: 'destructive'
      });
    }
  };
  const handleSaveProfile = async () => {
    if (!user.name || !user.name.trim()) {
      toast({
        title: '姓名不能为空',
        description: '请输入您的姓名',
        variant: 'destructive'
      });
      return;
    }
    if (!user.phone || !user.phone.trim()) {
      toast({
        title: '手机号不能为空',
        description: '请输入您的手机号',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const result = await callDataSource({
        dataSourceName: 'users',
        params: {
          operation: 'update',
          condition: {
            userId: currentUser.userId
          },
          data: {
            name: user.name,
            nickName: user.nickName,
            phone: user.phone,
            avatarUrl: user.avatarUrl
          }
        }
      });
      if (result && result.success) {
        toast({
          title: '保存成功',
          description: '个人信息已更新'
        });
      } else {
        toast({
          title: '保存失败',
          description: '更新个人信息失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '保存个人信息失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: '密码长度不足',
        description: '密码长度不能少于6位',
        variant: 'destructive'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: '密码不一致',
        description: '两次输入的密码不一致',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const result = await callDataSource({
        dataSourceName: 'users',
        params: {
          operation: 'update',
          condition: {
            userId: currentUser.userId
          },
          data: {
            password: newPassword
          }
        }
      });
      if (result && result.success) {
        toast({
          title: '密码修改成功',
          description: '请使用新密码重新登录'
        });
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
      } else {
        toast({
          title: '修改失败',
          description: '密码修改失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      toast({
        title: '修改失败',
        description: error.message || '修改密码失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarClick = () => {
    toast({
      title: '头像上传',
      description: '头像上传功能待实现'
    });
  };
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()} className="text-[#2D3748] hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#2D3748]">修改个人信息</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 头像区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="头像" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-[#F59E0B] transition-colors" /> : <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100 group-hover:border-[#F59E0B] transition-colors">
                  <User className="w-10 h-10 text-gray-400" />
                </div>}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">点击更换头像</p>
              <p className="text-xs text-gray-400">支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-[#2D3748] mb-4">基本信息</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                姓名 <span className="text-red-500">*</span>
              </label>
              <Input value={user.name || ''} onChange={e => setUser({
              ...user,
              name: e.target.value
            })} placeholder="请输入姓名" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                昵称
              </label>
              <Input value={user.nickName || ''} onChange={e => setUser({
              ...user,
              nickName: e.target.value
            })} placeholder="请输入昵称" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                手机号 <span className="text-red-500">*</span>
              </label>
              <Input value={user.phone || ''} onChange={e => setUser({
              ...user,
              phone: e.target.value
            })} placeholder="请输入手机号" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" disabled={false} />
              <p className="text-xs text-gray-400 mt-1">用于登录和联系</p>
            </div>
          </div>
        </div>

        {/* 账户安全 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-[#2D3748] mb-4">账户安全</h2>
          
          <Button onClick={() => setShowPasswordModal(true)} variant="outline" className="w-full border-gray-300 text-[#2D3748] hover:bg-gray-50 hover:border-[#F59E0B]">
            <Lock className="w-4 h-4 mr-2" />
            修改密码
          </Button>
        </div>

        {/* 保存按钮 */}
        <div className="space-y-3">
          <Button onClick={handleSaveProfile} disabled={loading} className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-3 font-medium">
            {loading ? '保存中...' : '保存修改'}
          </Button>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#2D3748] mb-4">修改密码</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密码
                  </label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="请输入新密码" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码
                  </label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => {
              setShowPasswordModal(false);
              setNewPassword('');
              setConfirmPassword('');
            }} variant="outline" className="flex-1 border-gray-300 text-[#2D3748] hover:bg-gray-50">
                  取消
                </Button>
                <Button onClick={handleUpdatePassword} disabled={loading} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white">
                  {loading ? '修改中...' : '确认修改'}
                </Button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}