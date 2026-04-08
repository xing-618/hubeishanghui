// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Building2, ArrowRight, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export default function LoginPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
                使用微信快速登录商会系统
              </p>
            </div>

            {/* 微信登录按钮 */}
            <button onClick={handleWeChatLogin} disabled={isLoading} className="w-full bg-[#07C160] hover:bg-[#06AD56] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1-.177-.554C23.238 19.874 24 18.229 24 16.398c0-3.68-3.134-6.652-7.062-6.652zm-2.036 2.97c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
              </svg>
              <span className="text-lg">
                {isLoading ? '登录中...' : '微信登录'}
              </span>
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>

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