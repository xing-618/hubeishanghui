// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Building2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Textarea, useToast } from '@/components/ui';

import RichTextDisplay from '@/components/RichTextDisplay';
import { callDataSource } from '@/lib/dataSource';
export default function MyCompany(props) {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [existingModification, setExistingModification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    logo: '',
    name: '',
    category: '',
    oneLineDesc: '',
    introduction: ''
  });
  const {
    $w
  } = props;
  const currentUser = $w.auth.currentUser;
  useEffect(() => {
    if (currentUser && currentUser.userId) {
      fetchUserInfo();
    } else {
      setLoading(false);
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
        if (result.data[0].isMember) {
          await fetchCompanyInfo();
          await checkExistingModification();
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '获取用户信息失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchCompanyInfo = async () => {
    try {
      const result = await callDataSource({
        dataSourceName: 'companies',
        params: {
          operation: 'list',
          condition: {
            ownerId: currentUser.userId
          }
        }
      });
      if (result && result.data && result.data.length > 0) {
        setCompany(result.data[0]);
        setFormData({
          logo: result.data[0].logo || '',
          name: result.data[0].name || '',
          category: result.data[0].category || '',
          oneLineDesc: result.data[0].oneLineDesc || '',
          introduction: result.data[0].introduction || ''
        });
      }
    } catch (error) {
      console.error('获取企业信息失败:', error);
    }
  };
  const checkExistingModification = async () => {
    try {
      if (!company) return;
      const result = await callDataSource({
        dataSourceName: 'company_modifications',
        params: {
          operation: 'list',
          condition: {
            companyId: company.companyId,
            status: '待审核'
          }
        }
      });
      if (result && result.data && result.data.length > 0) {
        setExistingModification(result.data[0]);
      }
    } catch (error) {
      console.error('检查修改申请失败:', error);
    }
  };
  const handleSubmit = async () => {
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: '企业名称不能为空',
        description: '请输入您的企业名称',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      toast({
        title: '企业分类不能为空',
        description: '请选择您的企业分类',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.introduction || !formData.introduction.trim()) {
      toast({
        title: '企业介绍不能为空',
        description: '请输入您的企业介绍',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      if (company) {
        // 提交修改申请
        const result = await callDataSource({
          dataSourceName: 'company_modifications',
          params: {
            operation: 'add',
            data: {
              modificationId: `mod_${Date.now()}`,
              userId: currentUser.userId,
              companyId: company.companyId,
              newIntroduction: formData.introduction,
              status: '待审核'
            }
          }
        });
        if (result && result.success) {
          toast({
            title: '提交成功',
            description: '企业信息修改已提交，等待管理员审核'
          });
          setExistingModification({
            status: '待审核'
          });
          setIsEditing(false);
        }
      } else {
        // 新建企业
        const result = await callDataSource({
          dataSourceName: 'companies',
          params: {
            operation: 'add',
            data: {
              companyId: `company_${Date.now()}`,
              logo: formData.logo,
              name: formData.name,
              category: formData.category,
              oneLineDesc: formData.oneLineDesc,
              introduction: formData.introduction,
              ownerId: currentUser.userId,
              status: '待审核',
              isPublished: false,
              isRecommended: false
            }
          }
        });
        if (result && result.success) {
          toast({
            title: '提交成功',
            description: '企业信息已提交，等待管理员审核'
          });
          setCompany({
            ...result.data,
            status: '待审核',
            isPublished: false
          });
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast({
        title: '提交失败',
        description: error.message || '提交失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleLogoUpload = () => {
    toast({
      title: '上传Logo',
      description: 'Logo上传功能待实现'
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
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
  if (!user.isMember) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <p className="text-gray-500 mb-2">请先认证为会员企业</p>
          <p className="text-gray-400 text-sm mb-4">认证后可以管理您的企业信息</p>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'member-certification',
          params: {}
        })} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
            前往认证
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
          <h1 className="text-lg font-semibold text-[#2D3748]">我的企业</h1>
          {company && !existingModification && <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="text-[#F59E0B] hover:bg-orange-50">
              编辑
            </Button>}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 审核中提示 */}
        {existingModification && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">审核中</h3>
                <p className="text-sm text-yellow-700">您提交的企业信息修改正在审核中，请耐心等待</p>
              </div>
            </div>
          </div>}

        {/* 编辑模式 */}
        {isEditing ? <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-[#2D3748] mb-4">
              {company ? '修改企业信息' : '添加企业信息'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企业Logo
                </label>
                <div onClick={handleLogoUpload} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#F59E0B] transition-colors">
                  {formData.logo ? <img src={formData.logo} alt="企业Logo" className="w-24 h-24 object-cover mx-auto rounded-lg" /> : <div>
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">点击上传企业Logo</p>
                    </div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企业名称 <span className="text-red-500">*</span>
                </label>
                <Input value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="请输入企业名称" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企业分类 <span className="text-red-500">*</span>
                </label>
                <Input value={formData.category} onChange={e => setFormData({
              ...formData,
              category: e.target.value
            })} placeholder="请输入企业分类，如：建材、装修、烟行" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  一句话介绍
                </label>
                <Input value={formData.oneLineDesc} onChange={e => setFormData({
              ...formData,
              oneLineDesc: e.target.value
            })} placeholder="用一句话介绍您的企业" className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企业介绍 <span className="text-red-500">*</span>
                </label>
                <Textarea value={formData.introduction} onChange={e => setFormData({
              ...formData,
              introduction: e.target.value
            })} placeholder="请输入详细的企业介绍，支持富文本格式" rows={10} className="border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]" />
                <p className="text-xs text-gray-400 mt-1">支持 HTML 格式，如 &lt;p&gt;、&lt;strong&gt; 等</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 border-gray-300 text-[#2D3748] hover:bg-gray-50">
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white">
                {submitting ? '提交中...' : '提交审核'}
              </Button>
            </div>
          </div> : (/* 查看模式 */
      <div>
            {company ? <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-[#2D3748] to-[#4A5568]">
                  <div className="flex items-start gap-4">
                    {company.logo ? <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-lg object-cover bg-white shadow-lg" /> : <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl font-bold">
                          {company.name?.charAt(0) || '企'}
                        </span>
                      </div>}
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {company.name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 bg-[#F59E0B] text-white text-xs font-medium rounded-full">
                          {company.category}
                        </span>
                        {company.status === '待审核' && <span className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                            待审核
                          </span>}
                        {company.isPublished && <span className="inline-flex items-center px-3 py-1 bg-[#10B981] text-white text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已发布
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
              </div> : <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">还没有企业信息</h3>
                <p className="text-gray-500 mb-4">添加您的企业信息，让更多人了解您</p>
                <Button onClick={() => setIsEditing(true)} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
                  添加企业信息
                </Button>
              </div>}
          </div>)}
      </div>
    </div>;
}