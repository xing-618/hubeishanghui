// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Upload, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Textarea, useToast } from '@/components/ui';

import { callDataSource } from '@/lib/dataSource';

/**
 * 调用会员申请云函数
 * @param action 操作类型：'submit'=提交申请、'list'=查询列表、'detail'=查询详情、'review'=审核
 * @param data 参数对象
 * @returns 云函数返回结果
 */
async function callMemberApplicationCloudFunction(action, data) {
  const tcb = await window.$w.cloud.getCloudInstance();
  return await tcb.callFunction({
    name: 'member-application',
    data: {
      action,
      data
    }
  });
}
export default function MemberCertification(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    certificate: null,
    logo: null
  });
  const {
    $w
  } = props;
  const currentUser = $w.auth.currentUser;
  useEffect(() => {
    if (currentUser && currentUser.userId) {
      fetchUserInfo();
      checkExistingApplication();
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
    }
  };
  const checkExistingApplication = async () => {
    try {
      const result = await callMemberApplicationCloudFunction('list', {
        applicantId: currentUser.userId
      });
      if (result && result.result && result.result.success) {
        const applications = result.result.applications || [];
        const pendingApplication = applications.find(app => app.applicationStatus === 'pending');
        if (pendingApplication) {
          setExistingApplication({
            applicationId: pendingApplication.applicationId,
            status: pendingApplication.applicationStatus === 'pending' ? '待审核' : pendingApplication.applicationStatus === 'approved' ? '已通过' : '已拒绝',
            rejectReason: pendingApplication.reviewComment || ''
          });
        }
      }
    } catch (error) {
      console.error('检查认证申请失败:', error);
    }
  };
  const handleFileChange = (field, file) => {
    setFormData({
      ...formData,
      [field]: file
    });
  };
  const handleSubmitApplication = async () => {
    if (!formData.companyName || !formData.companyName.trim()) {
      toast({
        title: '企业名称不能为空',
        description: '请输入您的企业名称',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.certificate) {
      toast({
        title: '证明材料不能为空',
        description: '请上传营业执照等相关证明材料',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.logo) {
      toast({
        title: '企业logo不能为空',
        description: '请上传您的企业logo',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const result = await callMemberApplicationCloudFunction('submit', {
        applicantId: currentUser.userId,
        applicantName: user?.name || '',
        applicantPhone: user?.phone || '',
        applicantCompany: formData.companyName,
        applicationReason: '申请成为会员企业',
        proofMaterials: formData.certificate ? [formData.certificate] : []
      });
      if (result && result.result && result.result.success) {
        toast({
          title: '申请提交成功',
          description: '您的会员认证申请已提交，等待管理员审核'
        });
        setExistingApplication({
          applicationId: result.result.application.applicationId,
          status: '待审核'
        });
      } else {
        toast({
          title: '提交失败',
          description: result?.result?.message || '认证申请提交失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('提交认证申请失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '认证申请提交失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCertificateUpload = () => {
    toast({
      title: '上传证明材料',
      description: '证明材料上传功能待实现'
    });
  };
  const handleLogoUpload = () => {
    toast({
      title: '上传企业Logo',
      description: 'Logo上传功能待实现'
    });
  };
  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
  if (user && user.isMember) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
          <p className="text-gray-500 mb-2">您已经是认证会员企业</p>
          <p className="text-gray-400 text-sm mb-4">可以管理您的企业信息</p>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'my-company',
          params: {}
        })} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
            前往管理企业
          </Button>
        </div>
      </div>;
  }
  if (existingApplication && existingApplication.status === '待审核') {
    return <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()} className="text-[#2D3748] hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-[#2D3748]">会员认证</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <CheckCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#2D3748] mb-2">审核中</h2>
            <p className="text-gray-500 mb-4">您的会员认证申请正在审核中</p>
            <p className="text-sm text-gray-400">审核结果将通过系统通知您</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()} className="text-[#2D3748] hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#2D3748]">会员认证</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 说明信息 */}
        <div className="bg-gradient-to-r from-[#2D3748] to-[#4A5568] rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">成为会员企业</h2>
          <p className="text-gray-200 text-sm">认证后可以展示您的企业信息，与更多企业建立联系</p>
        </div>

        {/* 认证表单 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#2D3748] mb-4">企业信息</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                企业名称 <span className="text-red-500">*</span>
              </label>
              <Input value={formData.companyName} onChange={e => setFormData({
              ...formData,
              companyName: e.target.value
            })} placeholder="请输入您的企业名称" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                企业Logo <span className="text-red-500">*</span>
              </label>
              <div onClick={handleLogoUpload} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#F59E0B] transition-colors">
                {formData.logo ? <div>
                    <img src={formData.logo} alt="企业Logo" className="w-24 h-24 object-cover mx-auto mb-2 rounded-lg" />
                    <p className="text-sm text-gray-600">点击更换</p>
                  </div> : <div>
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">点击上传企业Logo</p>
                    <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
                  </div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                证明材料 <span className="text-red-500">*</span>
              </label>
              <div onClick={handleCertificateUpload} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#F59E0B] transition-colors">
                {formData.certificate ? <div>
                    <FileText className="w-12 h-12 text-[#10B981] mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">已上传：营业执照.png</p>
                    <p className="text-xs text-gray-400">点击更换</p>
                  </div> : <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">点击上传证明材料</p>
                    <p className="text-xs text-gray-400 mt-1">营业执照、组织机构代码等</p>
                  </div>}
              </div>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">注意事项</h3>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>请确保上传的信息真实有效</li>
            <li>证明材料需包含企业名称和相关信息</li>
            <li>审核通过后将收到系统通知</li>
          </ul>
        </div>

        {/* 提交按钮 */}
        <div className="mt-4">
          <Button onClick={handleSubmitApplication} disabled={loading} className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-3 font-medium">
            {loading ? '提交中...' : '提交认证申请'}
          </Button>
        </div>
      </div>
    </div>;
}