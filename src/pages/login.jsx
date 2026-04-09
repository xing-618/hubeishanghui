// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Building2, ArrowRight, CheckCircle, User, Lock, Eye, EyeOff, Smartphone } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { callDataSource } from '@/lib/dataSource';
export default function LoginPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [loginType, setLoginType] = useState('phone'); // 'phone' 或 'wechat'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const handleWeChatLogin = async () => {
    try {
      setIsLoading(true);
      const tcb = await $w.cloud.getCloudInstance();

      // 跳转到托管登录页
      tcb.auth().toDefaultLoginPage({
        config_version: "env",
        redirect_uri: window.location.href,
        // 登录后返回当前页
        query: {
          s_domain: $w.utils.resolveStaticResourceUrl("/").replace(/^https?:\/\//, "").split("/")[0]
        }
      });
    } catch (error) {
      toast({
        title: '登录失败',
        description: error.message || '跳转登录页面失败，请稍后重试',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  const handlePhoneLogin = async () => {
    if (!formData.phone.trim()) {
      toast({
        title: '请输入手机号',
        description: '手机号不能为空',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.password) {
      toast({
        title: '请输入密码',
        description: '密码不能为空',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              phone: {
                $eq: formData.phone
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
      console.log('手机号登录查询结果:', result);
      if (result.success && result.data && result.data.records && result.data.records.length > 0) {
        const user = result.data.records[0];
        console.log('查询到用户:', user);

        // 兼容处理：如果没有 userId 字段，使用 _id 作为 userId
        const userId = user.userId || user._id;
        console.log('使用 userId:', userId, '(来源:', user.userId ? 'userId字段' : '_id字段', ')');

        // 简单的密码验证（生产环境应该使用加密后的密码比较）
        if (user.password === formData.password) {
          toast({
            title: '登录成功',
            description: '欢迎回来！'
          });

          // 登录成功后保存 userId 到 localStorage，用于 profile 页面查询
          localStorage.setItem('currentUserId', userId);
          console.log('登录成功，保存用户ID到 localStorage:', userId);

          // 登录成功后跳转到首页
          setTimeout(() => {
            $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            });
          }, 1000);
        } else {
          console.error('密码验证失败: 用户密码=', user.password, '输入密码=', formData.password);
          toast({
            title: '登录失败',
            description: '手机号或密码错误',
            variant: 'destructive'
          });
        }
      } else {
        console.error('未找到该手机号的用户');
        toast({
          title: '登录失败',
          description: '手机号或密码错误',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: error.message || '登录失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // 检查是否刚登录成功
    const checkLoginSuccess = async () => {
      const currentUser = $w.auth.currentUser;
      if (currentUser && currentUser.userId) {
        try {
          // 调用微信鉴权云函数记录用户信息
          const tcb = await $w.cloud.getCloudInstance();
          const result = await tcb.callFunction({
            name: 'wechat-auth',
            data: {
              userIdentifier: currentUser.userId,
              phoneNumber: currentUser.phoneNumber || '',
              // 微信登录时可能没有手机号
              userInfo: {
                nickName: currentUser.nickName || '',
                avatarUrl: currentUser.avatarUrl || '',
                name: currentUser.name || ''
              }
            }
          });
          if (result && result.result && result.result.authStatus) {
            // 登录成功，查询用户信息并保存
            const userResult = await $w.cloud.callDataSource({
              dataSourceName: 'users',
              methodName: 'wedaGetRecordsV2',
              params: {
                filter: {
                  where: {
                    userId: {
                      $eq: currentUser.userId
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
            if (userResult.success && userResult.data && userResult.data.records && userResult.data.records.length > 0) {
              const userId = userResult.data.records[0].userId;
              localStorage.setItem('currentUserId', userId);
              console.log('微信登录成功，保存用户ID到 localStorage:', userId);
            }

            // 登录成功，跳转到首页
            $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            });
          }
        } catch (error) {
          console.error('记录用户信息失败:', error);
          // 即使记录失败也跳转到首页
          $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          });
        }
      }
    };
    checkLoginSuccess();
  }, [$w.auth.currentUser, $w.cloud, $w.utils]);
  return <div className="min-h-screen bg-gradient-to-br from-[#2D3748] via-[#4A5568] to-[#2D3748] flex items-center justify-center relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Logo 和标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F59E0B] rounded-2xl mb-6 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white font-serif mb-3">
            商会管理系统
          </h1>
          <p className="text-lg text-white/80 font-sans">
            连接企业，共创未来
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 font-serif">
                欢迎登录
              </h2>
              <p className="text-sm text-white/70">
                选择您喜欢的登录方式
              </p>
            </div>

            {/* 登录方式切换 */}
            <div className="flex gap-2 bg-white/5 rounded-xl p-1">
              <button onClick={() => setLoginType('phone')} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loginType === 'phone' ? 'bg-[#F59E0B] text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                <Smartphone className="w-4 h-4" />
                手机号登录
              </button>
              <button onClick={() => setLoginType('wechat')} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loginType === 'wechat' ? 'bg-[#07C160] text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1-.177-.554C23.238 19.874 24 18.229 24 16.398c0-3.68-3.134-6.652-7.062-6.652zm-2.036 2.97c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                </svg>
                微信登录
              </button>
            </div>

            {/* 手机号密码登录表单 */}
            {loginType === 'phone' && <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    手机号
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="tel" value={formData.phone} onChange={e => setFormData({
                  ...formData,
                  phone: e.target.value
                })} placeholder="请输入手机号" maxLength={11} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({
                  ...formData,
                  password: e.target.value
                })} placeholder="请输入密码" className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button onClick={handlePhoneLogin} disabled={isLoading} className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5">
                  {isLoading ? <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      登录中...
                    </span> : <>
                      登录
                      <ArrowRight className="w-5 h-5" />
                    </>}
                </button>
              </div>}

            {/* 微信登录按钮 */}
            {loginType === 'wechat' && <button onClick={handleWeChatLogin} disabled={isLoading} className="w-full bg-[#07C160] hover:bg-[#06AD56] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1-.177-.554C23.238 19.874 24 18.229 24 16.398c0-3.68-3.134-6.652-7.062-6.652zm-2.036 2.97c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                </svg>
                <span className="text-lg">
                  {isLoading ? '登录中...' : '微信登录'}
                </span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>}

            {/* 底部链接 */}
            <div className="text-center">
              <p className="text-white/70 text-sm">
                还没有账号？
                <button onClick={() => $w.utils.navigateTo({
                pageId: 'register',
                params: {}
              })} className="text-[#F59E0B] hover:text-[#FBBF24] font-medium ml-1 transition-colors">
                  立即注册
                </button>
              </p>
            </div>

            {/* 说明文字 */}
            <div className="text-center">
              <p className="text-xs text-white/60 leading-relaxed">
                登录即表示您同意我们的
                <a href="#" className="text-[#F59E0B] hover:underline">服务条款</a>
                和
                <a href="#" className="text-[#F59E0B] hover:underline">隐私政策</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}