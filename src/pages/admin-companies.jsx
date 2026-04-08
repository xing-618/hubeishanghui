// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, Plus, Search, Edit, Trash2, Building2, Filter, TrendingUp, Eye, EyeOff } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Textarea, useToast } from '@/components/ui';

export default function AdminCompanies(props) {
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
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    category: '建材',
    oneLineDesc: '',
    introduction: '',
    logo: '',
    ownerId: '',
    isRecommended: false,
    isPublished: true
  });
  const categories = ['建材', '装修', '烟行', '机械', '物流', '其他'];

  // 管理员权限检查
  if (!currentUser || !currentUser.isAdmin) {
    return <div className="min-h-screen bg-[#2D3748] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-20 h-20 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">权限不足</h2>
          <p className="text-gray-300">此页面仅限管理员访问</p>
        </div>
      </div>;
  }

  // 加载企业列表
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('companies').get();
      setCompanies(result.data || []);
    } catch (error) {
      console.error('加载企业列表失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载企业列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCompanies();
  }, []);

  // 过滤企业
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) || company.oneLineDesc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || company.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || filterStatus === 'published' && company.isPublished || filterStatus === 'unpublished' && !company.isPublished || filterStatus === 'recommended' && company.isRecommended;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 打开新增/编辑对话框
  const openDialog = (company = null) => {
    if (company) {
      setFormData({
        name: company.name || '',
        category: company.category || '建材',
        oneLineDesc: company.oneLineDesc || '',
        introduction: company.introduction || '',
        logo: company.logo || '',
        ownerId: company.ownerId || '',
        isRecommended: company.isRecommended || false,
        isPublished: company.isPublished !== false
      });
      setSelectedCompany(company);
    } else {
      setFormData({
        name: '',
        category: '建材',
        oneLineDesc: '',
        introduction: '',
        logo: '',
        ownerId: '',
        isRecommended: false,
        isPublished: true
      });
      setSelectedCompany(null);
    }
    setDialogOpen(true);
  };

  // 保存企业信息
  const saveCompany = async () => {
    if (!formData.name.trim()) {
      toast({
        title: '请填写企业名称',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      if (selectedCompany) {
        // 更新
        await db.collection('companies').doc(selectedCompany._id).update({
          ...formData,
          updatedAt: Date.now()
        });
        toast({
          title: '更新成功',
          description: '企业信息已更新'
        });
      } else {
        // 新增
        const companyId = `company_${Date.now()}`;
        await db.collection('companies').add({
          ...formData,
          companyId,
          status: '已发布',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast({
          title: '添加成功',
          description: '企业信息已添加'
        });
      }
      setDialogOpen(false);
      loadCompanies();
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '无法保存企业信息',
        variant: 'destructive'
      });
    }
  };

  // 删除企业
  const deleteCompany = async companyId => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('companies').doc(companyId).remove();
      toast({
        title: '删除成功',
        description: '企业信息已删除'
      });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '无法删除企业信息',
        variant: 'destructive'
      });
    }
  };

  // 切换推荐状态
  const toggleRecommended = async (companyId, isRecommended) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('companies').doc(companyId).update({
        isRecommended: !isRecommended,
        updatedAt: Date.now()
      });
      toast({
        title: '操作成功',
        description: isRecommended ? '已取消推荐' : '已设为推荐'
      });
      loadCompanies();
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法更新推荐状态',
        variant: 'destructive'
      });
    }
  };

  // 切换发布状态
  const togglePublished = async (companyId, isPublished) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('companies').doc(companyId).update({
        isPublished: !isPublished,
        status: !isPublished ? '待审核' : '已发布',
        updatedAt: Date.now()
      });
      toast({
        title: '操作成功',
        description: isPublished ? '已取消发布' : '已发布'
      });
      loadCompanies();
    } catch (error) {
      console.error('更新失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法更新发布状态',
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
            <h1 className="text-2xl font-bold text-white">企业信息管理</h1>
          </div>
          <Button onClick={() => openDialog()} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
            <Plus className="w-5 h-5 mr-2" />
            新增企业
          </Button>
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
                <Input placeholder="搜索企业名称或简介" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[#2D3748] border-gray-600 text-white" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-[#2D3748] border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-[#2D3748] border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="unpublished">未发布</SelectItem>
                  <SelectItem value="recommended">推荐</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 企业列表 */}
        {loading ? <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mb-4"></div>
            <p className="text-gray-400">加载中...</p>
          </div> : filteredCompanies.length === 0 ? <div className="text-center py-12">
            <Building2 className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">暂无企业数据</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => <div key={company._id || index} className="bg-[#4A5568] rounded-lg overflow-hidden border border-gray-600 hover:border-[#F59E0B] transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <img src={company.logo || 'https://via.placeholder.com/80'} alt={company.name} className="w-16 h-16 rounded-lg object-cover bg-white" />
                    <div className="flex flex-col space-y-1">
                      {company.isRecommended && <span className="bg-[#F59E0B] text-white text-xs px-2 py-1 rounded text-center">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          推荐
                        </span>}
                      <span className={`text-xs px-2 py-1 rounded text-center ${company.isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {company.isPublished ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                        {company.isPublished ? '已发布' : '未发布'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{company.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{company.category}</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{company.oneLineDesc || company.introduction}</p>
                </div>
                
                <div className="px-6 py-4 bg-[#2D3748] border-t border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => toggleRecommended(company._id, company.isRecommended)} className={company.isRecommended ? 'text-[#F59E0B] hover:text-[#F59E0B]/80' : 'text-gray-300 hover:text-white'}>
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => togglePublished(company._id, company.isPublished)} className={company.isPublished ? 'text-green-400 hover:text-green-400/80' : 'text-gray-300 hover:text-white'}>
                        {company.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openDialog(company)} className="text-blue-400 hover:text-blue-400/80">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                  setCompanyToDelete(company);
                  setDeleteDialogOpen(true);
                }} className="text-red-400 hover:text-red-400/80">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}
      </main>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#4A5568] text-white border-gray-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCompany ? '编辑企业信息' : '新增企业信息'}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedCompany ? '修改企业信息' : '添加新的企业信息'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">企业名称 *</label>
                <Input value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} placeholder="请输入企业名称" className="bg-[#2D3748] border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">企业分类 *</label>
                <Select value={formData.category} onValueChange={value => setFormData({
                ...formData,
                category: value
              })}>
                  <SelectTrigger className="bg-[#2D3748] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">一句话介绍</label>
              <Input value={formData.oneLineDesc} onChange={e => setFormData({
              ...formData,
              oneLineDesc: e.target.value
            })} placeholder="请输入一句话介绍" className="bg-[#2D3748] border-gray-600 text-white" />
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">企业介绍（支持HTML）</label>
              <Textarea value={formData.introduction} onChange={e => setFormData({
              ...formData,
              introduction: e.target.value
            })} placeholder="请输入企业介绍，支持HTML格式" className="bg-[#2D3748] border-gray-600 text-white min-h-[150px]" />
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">企业Logo URL</label>
              <Input value={formData.logo} onChange={e => setFormData({
              ...formData,
              logo: e.target.value
            })} placeholder="请输入Logo图片URL" className="bg-[#2D3748] border-gray-600 text-white" />
            </div>
            
            <div className="flex items-center space-x-4 pt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({
                ...formData,
                isRecommended: e.target.checked
              })} className="w-4 h-4 accent-[#F59E0B]" />
                <span className="text-sm text-gray-300">设为推荐</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({
                ...formData,
                isPublished: e.target.checked
              })} className="w-4 h-4 accent-[#F59E0B]" />
                <span className="text-sm text-gray-300">立即发布</span>
              </label>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button onClick={saveCompany} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white">
                保存
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-gray-600 text-white hover:bg-gray-700">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#4A5568] text-white border-gray-600">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription className="text-gray-300">
              确定要删除企业「{companyToDelete?.name}」吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex space-x-2">
            <Button onClick={() => {
            if (companyToDelete) {
              deleteCompany(companyToDelete._id);
            }
          }} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
              确认删除
            </Button>
            <Button variant="outline" onClick={() => {
            setDeleteDialogOpen(false);
            setCompanyToDelete(null);
          }} className="flex-1 border-gray-600 text-white hover:bg-gray-700">
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}