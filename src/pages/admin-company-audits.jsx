// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, CheckCircle, XCircle, FileText, Building2, Clock, Search, Filter, Eye, User, Calendar } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Textarea, useToast } from '@/components/ui';

export default function AdminCompanyAudits(props) {
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
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // 管理员权限检查
  if (!currentUser || !currentUser.isAdmin) {
    return <div className="min-h-screen bg-[#2D3748] flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-20 h-20 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">权限不足</h2>
          <p className="text-gray-300">此页面仅限管理员访问</p>
        </div>
      </div>;
  }

  // 加载修改申请列表
  const loadAudits = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let query = {};
      if (filterStatus !== 'all') {
        query.status = filterStatus === 'pending' ? '待审核' : filterStatus === 'approved' ? '已通过' : '已拒绝';
      }
      const result = await db.collection('company_modifications').where(query).get();
      setAudits(result.data || []);
    } catch (error) {
      console.error('加载修改申请失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载修改申请',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAudits();
  }, [filterStatus]);

  // 过滤申请
  const filteredAudits = audits.filter(audit => {
    return audit.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || audit.newCompanyName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 查看申请详情
  const viewAudit = async audit => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取申请人信息
      const userResult = await db.collection('users').doc(audit.userId).get();
      const applicant = userResult.data[0];

      // 获取原始企业信息
      const companyResult = await db.collection('companies').where({
        companyId: audit.companyId
      }).get();
      const originalCompany = companyResult.data[0];
      setSelectedAudit({
        ...audit,
        applicant,
        originalCompany
      });
      setViewDialogOpen(true);
    } catch (error) {
      console.error('获取申请详情失败:', error);
      toast({
        title: '获取失败',
        description: error.message || '无法获取申请详情',
        variant: 'destructive'
      });
    }
  };

  // 通过申请并应用修改
  const approveAudit = async (auditId, companyId, newCompanyData) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新申请状态
      await db.collection('company_modifications').doc(auditId).update({
        status: '已通过',
        updatedAt: Date.now()
      });

      // 应用修改到企业信息
      const {
        modificationId,
        status,
        createdAt,
        updatedAt,
        ...dataToUpdate
      } = newCompanyData;
      await db.collection('companies').where({
        companyId: companyId
      }).update({
        ...dataToUpdate,
        updatedAt: Date.now()
      });
      toast({
        title: '审核通过',
        description: '已通过企业信息修改申请'
      });
      setViewDialogOpen(false);
      setSelectedAudit(null);
      loadAudits();
    } catch (error) {
      console.error('审核失败:', error);
      toast({
        title: '审核失败',
        description: error.message || '无法完成审核',
        variant: 'destructive'
      });
    }
  };

  // 拒绝申请
  const rejectAudit = async auditId => {
    if (!rejectReason.trim()) {
      toast({
        title: '请输入拒绝原因',
        description: '拒绝申请时需要填写拒绝原因',
        variant: 'destructive'
      });
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新申请状态
      await db.collection('company_modifications').doc(auditId).update({
        status: '已拒绝',
        rejectReason: rejectReason,
        updatedAt: Date.now()
      });
      toast({
        title: '已拒绝申请',
        description: '已拒绝企业信息修改申请'
      });
      setRejectDialogOpen(false);
      setRejectReason('');
      setViewDialogOpen(false);
      setSelectedAudit(null);
      loadAudits();
    } catch (error) {
      console.error('拒绝失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法拒绝申请',
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
            <h1 className="text-2xl font-bold text-white">企业信息审核</h1>
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
                <Input placeholder="搜索企业名称" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[#2D3748] border-gray-600 text-white" />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-[#2D3748] border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 申请列表 */}
        {loading ? <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mb-4"></div>
            <p className="text-gray-400">加载中...</p>
          </div> : filteredAudits.length === 0 ? <div className="text-center py-12">
            <FileText className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">暂无修改申请数据</p>
          </div> : <div className="space-y-4">
            {filteredAudits.map((audit, index) => <div key={audit._id || index} className="bg-[#4A5568] rounded-lg p-6 border border-gray-600 hover:border-[#F59E0B] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${audit.status === '待审核' ? 'bg-yellow-500' : audit.status === '已通过' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {audit.status === '待审核' && <Clock className="w-5 h-5 text-white" />}
                        {audit.status === '已通过' && <CheckCircle className="w-5 h-5 text-white" />}
                        {audit.status === '已拒绝' && <XCircle className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {audit.newCompanyName || audit.companyName}
                        </h3>
                        <p className="text-sm text-gray-400">申请时间: {new Date(audit.createdAt || Date.now()).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>申请编号: {audit.modificationId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>企业ID: {audit.companyId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          状态: 
                          <span className={`ml-2 font-semibold ${audit.status === '待审核' ? 'text-yellow-400' : audit.status === '已通过' ? 'text-green-400' : 'text-red-400'}`}>
                            {audit.status}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {audit.status === '已拒绝' && audit.rejectReason && <div className="mt-3 p-3 bg-red-900/30 border border-red-600 rounded">
                        <p className="text-red-300 text-sm">拒绝原因: {audit.rejectReason}</p>
                      </div>}
                    
                    {/* 修改摘要 */}
                    <div className="mt-4 p-3 bg-[#2D3748] rounded">
                      <p className="text-sm text-gray-400 mb-2">修改摘要:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {audit.newCompanyName !== audit.companyName && <div>
                            <span className="text-gray-500">企业名称:</span>
                            <span className="text-white ml-2">
                              <span className="line-through text-gray-600">{audit.companyName}</span>
                              <span className="ml-2 text-green-400">→</span>
                              <span className="text-green-400 ml-2">{audit.newCompanyName}</span>
                            </span>
                          </div>}
                        {audit.newCategory !== audit.category && <div>
                            <span className="text-gray-500">分类:</span>
                            <span className="text-white ml-2">
                              <span className="line-through text-gray-600">{audit.category}</span>
                              <span className="ml-2 text-green-400">→</span>
                              <span className="text-green-400 ml-2">{audit.newCategory}</span>
                            </span>
                          </div>}
                        {audit.newOneLineDesc !== audit.oneLineDesc && <div className="col-span-2">
                            <span className="text-gray-500">一句话介绍:</span>
                            <span className="text-white ml-2">
                              <span className="line-through text-gray-600">{audit.oneLineDesc}</span>
                              <span className="ml-2 text-green-400">→</span>
                              <span className="text-green-400 ml-2">{audit.newOneLineDesc}</span>
                            </span>
                          </div>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => viewAudit(audit)} className="bg-gray-600 hover:bg-gray-700 text-white">
                      <Eye className="w-4 h-4 mr-1" />
                      查看详情
                    </Button>
                    {audit.status === '待审核' && <>
                        <Button size="sm" onClick={() => {
                  setSelectedAudit(audit);
                  viewAudit(audit);
                }} className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          通过
                        </Button>
                        <Button size="sm" onClick={() => {
                  setSelectedAudit(audit);
                  setRejectDialogOpen(true);
                }} className="bg-red-500 hover:bg-red-600 text-white">
                          <XCircle className="w-4 h-4 mr-1" />
                          拒绝
                        </Button>
                      </>}
                  </div>
                </div>
              </div>)}
          </div>}
      </main>

      {/* 查看详情对话框 */}
      {selectedAudit && <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="bg-[#4A5568] text-white border-gray-600 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>修改申请详情</DialogTitle>
              <DialogDescription className="text-gray-300">
                申请编号: {selectedAudit.modificationId}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 申请人信息 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">申请人信息</h3>
                <div className="bg-[#2D3748] rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">申请人: {selectedAudit.applicant?.name || '未知'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">手机号: {selectedAudit.applicant?.phone || '未知'}</span>
                  </div>
                </div>
              </div>
              
              {/* 原始信息 vs 新信息对比 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">信息对比</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-400 mb-2">原始信息</p>
                    <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">企业名称</p>
                        <p className="text-white">{selectedAudit.originalCompany?.name || selectedAudit.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">分类</p>
                        <p className="text-white">{selectedAudit.originalCompany?.category || selectedAudit.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">一句话介绍</p>
                        <p className="text-white">{selectedAudit.originalCompany?.oneLineDesc || selectedAudit.oneLineDesc}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Logo</p>
                        {selectedAudit.originalCompany?.logo ? <img src={selectedAudit.originalCompany.logo} alt="原始Logo" className="w-20 h-20 object-contain rounded bg-white" /> : <p className="text-gray-400">暂无Logo</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-green-400 mb-2">修改后信息</p>
                    <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">企业名称</p>
                        <p className="text-white">{selectedAudit.newCompanyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">分类</p>
                        <p className="text-white">{selectedAudit.newCategory}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">一句话介绍</p>
                        <p className="text-white">{selectedAudit.newOneLineDesc}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Logo</p>
                        {selectedAudit.newLogo ? <img src={selectedAudit.newLogo} alt="新Logo" className="w-20 h-20 object-contain rounded bg-white" /> : <p className="text-gray-400">未修改Logo</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 详细介绍对比 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">详细介绍对比</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                    <p className="text-sm text-red-400 mb-2">原始介绍</p>
                    <div className="text-sm text-white whitespace-pre-wrap">
                      {selectedAudit.originalCompany?.introduction || selectedAudit.introduction}
                    </div>
                  </div>
                  <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                    <p className="text-sm text-green-400 mb-2">修改后介绍</p>
                    <div className="text-sm text-white whitespace-pre-wrap">
                      {selectedAudit.newIntroduction}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedAudit.status === '待审核' && <div className="flex space-x-2 pt-4">
                  <Button onClick={() => approveAudit(selectedAudit._id, selectedAudit.companyId, selectedAudit)} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    通过并应用修改
                  </Button>
                  <Button onClick={() => {
              setRejectDialogOpen(true);
            }} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                    <XCircle className="w-4 h-4 mr-2" />
                    拒绝申请
                  </Button>
                </div>}
            </div>
          </DialogContent>
        </Dialog>}

      {/* 拒绝原因对话框 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-[#4A5568] text-white border-gray-600">
          <DialogHeader>
            <DialogTitle>拒绝申请</DialogTitle>
            <DialogDescription className="text-gray-300">
              请填写拒绝原因，该原因将告知申请人
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea placeholder="请输入拒绝原因..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="bg-[#2D3748] border-gray-600 text-white min-h-[100px]" />
            
            <div className="flex space-x-2">
              <Button onClick={() => {
              if (selectedAudit) {
                rejectAudit(selectedAudit._id);
              }
            }} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                确认拒绝
              </Button>
              <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason('');
            }} className="flex-1 border-gray-600 text-white hover:bg-gray-700">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}