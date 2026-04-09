// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { ArrowLeft, Building2, User, Lock, Eye, EyeOff } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

import { callDataSource } from '@/lib/dataSource';
export default function RegisterPage(props) {
  const {
    className,
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: '请输入姓名',
        description: '姓名不能为空',
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({
        title: '请输入手机号',
        description: '手机号不能为空',
        variant: 'destructive'
      });
      return false;
    }

    // 简单的手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: '手机号格式错误',
        description: '请输入正确的11位手机号',
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.password) {
      toast({
        title: '请输入密码',
        description: '密码不能为空',
        variant: 'destructive'
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        title: '密码长度不足',
        description: '密码至少需要6位',
        variant: 'destructive'
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '密码不一致',
        description: '两次输入的密码不相同',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      // 先检查手机号是否已注册
      const existingUserResult = await callDataSource({
        dataSourceName: 'users',
        params: {
          operation: 'list',
          condition: {
            phone: formData.phone
          }
        }
      });
      if (existingUserResult && existingUserResult.data && existingUserResult.data.length > 0) {
        toast({
          title: '注册失败',
          description: '该手机号已被注册，请直接登录',
          variant: 'destructive'
        });
        return;
      }

      // 创建新用户
      const registerResult = await callDataSource({
        dataSourceName: 'users',
        params: {
          operation: 'add',
          data: {
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
            // 生产环境应该加密
            nickName: formData.name,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
            // 默认头像
            isMember: false,
            isAdmin: false,
            favorites: [],
            companyId: ''
          }
        }
      });
      if (registerResult && registerResult.success) {
        // 注册成功，查询新用户信息获取userId
        const newUserResult = await callDataSource({
          dataSourceName: 'users',
          params: {
            operation: 'list',
            condition: {
              phone: formData.phone
            }
          }
        });
        if (newUserResult && newUserResult.data && newUserResult.data.length > 0) {
          const userId = newUserResult.data[0].userId;
          localStorage.setItem('currentUserId', userId);
          console.log('注册成功，保存用户ID到 localStorage:', userId);
        }
        toast({
          title: '注册成功',
          description: '账号注册成功，请登录使用'
        });

        // 跳转到登录页
        setTimeout(() => {
          $w.utils.navigateTo({
            pageId: 'login',
            params: {}
          });
        }, 1500);
      } else {
        console.error('注册返回结果:', registerResult);
        toast({
          title: '注册失败',
          description: registerResult?.error || '注册失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('注册失败:', error);
      toast({
        title: '注册失败',
        description: error.message || '注册失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-[#2D3748] via-[#4A5568] to-[#2D3748] flex items-center justify-center relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#F59E0B] rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F59E0B] rounded-full opacity-10 blur-3xl" />
      </div>

      {/* 返回按钮 */}
      <button onClick={() => $w.utils.navigateBack()} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      {/* 注册卡片 */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F59E0B] rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-serif">
            注册账号
          </h2>
          <p className="text-sm text-white/70">
            创建账号开始使用商会系统
          </p>
        </div>

        {/* 注册表单 */}
        <div className="space-y-5">
          {/* 姓名输入 */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              姓名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="请输入您的姓名" className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all" />
            </div>
          </div>

          {/* 手机号输入 */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              手机号
            </label>
            <div className="relative">
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="请输入手机号" maxLength={11} className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all" />
            </div>
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="请输入密码（至少6位）" className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 确认密码输入 */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              确认密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="请再次输入密码" className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 注册按钮 */}
          <button onClick={handleRegister} disabled={isLoading} className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5">
            {isLoading ? <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                注册中...
              </span> : '立即注册'}
          </button>
        </div>

        {/* 底部链接 */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            已有账号？
            <button onClick={() => $w.utils.navigateTo({
            pageId: 'login',
            params: {}
          })} className="text-[#F59E0B] hover:text-[#FBBF24] font-medium ml-1 transition-colors">
              立即登录
            </button>
          </p>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            注册即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>;
}