// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Building2, Clock, Search, Filter } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Textarea, useToast } from '@/components/ui';

export default function AdminMemberCertifications(props) {
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
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  // 加载认证申请列表
  const loadApplications = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let query = {};
      if (filterStatus !== 'all') {
        query.status = filterStatus === 'pending' ? '待审核' : filterStatus === 'approved' ? '已通过' : '已拒绝';
      }
      const result = await db.collection('member_applications').where(query).get();
      setApplications(result.data || []);
    } catch (error) {
      console.error('加载认证申请失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载认证申请',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  // 过滤申请
  const filteredApplications = applications.filter(app => {
    return app.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 查看申请详情
  const viewApplication = async application => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取申请人信息
      const userResult = await db.collection('users').doc(application.userId).get();
      const applicant = userResult.data[0];
      setSelectedApplication({
        ...application,
        applicant
      });
    } catch (error) {
      console.error('获取申请详情失败:', error);
      toast({
        title: '获取失败',
        description: error.message || '无法获取申请详情',
        variant: 'destructive'
      });
    }
  };

  // 通过申请
  const approveApplication = async (applicationId, userId) => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 更新申请状态
      await db.collection('member_applications').doc(applicationId).update({
        status: '已通过',
        updatedAt: Date.now()
      });

      // 设置用户为会员
      await db.collection('users').doc(userId).update({
        isMember: true,
        updatedAt: Date.now()
      });
      toast({
        title: '审核通过',
        description: '已通过会员认证申请'
      });
      setSelectedApplication(null);
      loadApplications();
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
  const rejectApplication = async (applicationId, userId) => {
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
      await db.collection('member_applications').doc(applicationId).update({
        status: '已拒绝',
        rejectReason: rejectReason,
        updatedAt: Date.now()
      });
      toast({
        title: '已拒绝申请',
        description: '已拒绝会员认证申请'
      });
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedApplication(null);
      loadApplications();
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
            <h1 className="text-2xl font-bold text-white">会员认证审核</h1>
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
          </div> : filteredApplications.length === 0 ? <div className="text-center py-12">
            <FileText className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">暂无申请数据</p>
          </div> : <div className="space-y-4">
            {filteredApplications.map((application, index) => <div key={application._id || index} className="bg-[#4A5568] rounded-lg p-6 border border-gray-600 hover:border-[#F59E0B] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${application.status === '待审核' ? 'bg-yellow-500' : application.status === '已通过' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {application.status === '待审核' && <Clock className="w-5 h-5 text-white" />}
                        {application.status === '已通过' && <CheckCircle className="w-5 h-5 text-white" />}
                        {application.status === '已拒绝' && <XCircle className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{application.companyName}</h3>
                        <p className="text-sm text-gray-400">申请时间: {new Date(application.createdAt || Date.now()).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-gray-300 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>申请ID: {application.applicationId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>
                          状态: 
                          <span className={`ml-2 font-semibold ${application.status === '待审核' ? 'text-yellow-400' : application.status === '已通过' ? 'text-green-400' : 'text-red-400'}`}>
                            {application.status}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {application.status === '已拒绝' && application.rejectReason && <div className="mt-3 p-3 bg-red-900/30 border border-red-600 rounded">
                        <p className="text-red-300 text-sm">拒绝原因: {application.rejectReason}</p>
                      </div>}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => viewApplication(application)} className="bg-gray-600 hover:bg-gray-700 text-white">
                      查看详情
                    </Button>
                    {application.status === '待审核' && <>
                        <Button size="sm" onClick={() => approveApplication(application._id, application.userId)} className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          通过
                        </Button>
                        <Button size="sm" onClick={() => {
                  setSelectedApplication(application);
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

      {/* 申请详情对话框 */}
      {selectedApplication && <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="bg-[#4A5568] text-white border-gray-600">
            <DialogHeader>
              <DialogTitle>申请详情</DialogTitle>
              <DialogDescription className="text-gray-300">
                申请编号: {selectedApplication.applicationId}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">企业名称</p>
                <p className="text-white font-medium">{selectedApplication.companyName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">申请信息</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">申请人: {selectedApplication.applicant?.name || '未知'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">证明材料: {selectedApplication.certificate || '未上传'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">企业Logo</p>
                {selectedApplication.logo ? <img src={selectedApplication.logo} alt="企业Logo" className="w-32 h-32 object-contain rounded-lg bg-white" /> : <p className="text-gray-400">未上传Logo</p>}
              </div>
              
              {selectedApplication.status === '待审核' && <div className="flex space-x-2 pt-4">
                  <Button onClick={() => approveApplication(selectedApplication._id, selectedApplication.userId)} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                    通过申请
                  </Button>
                  <Button onClick={() => {
              setRejectDialogOpen(true);
            }} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
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
              if (selectedApplication) {
                rejectApplication(selectedApplication._id, selectedApplication.userId);
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