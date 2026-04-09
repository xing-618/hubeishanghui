// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast, Button, Card } from '@/components/ui';
// @ts-ignore;
import { Database, ArrowRight } from 'lucide-react';

/**
 * 数据初始化页面
 * 用于将示例数据导入到云数据库
 * 注意：此页面应在开发环境使用，生产环境应通过管理后台导入数据
 */
export default function InitDataPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [logs, setLogs] = useState([]);
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, {
      timestamp,
      message,
      type
    }]);
  };
  const clearLogs = () => {
    setLogs([]);
  };

  /**
   * 初始化轮播图数据
   */
  const initBanners = async tcb => {
    try {
      addLog('开始初始化轮播图数据...', 'info');
      const db = tcb.database();
      const collection = db.collection('banners');

      // 先清空现有数据
      const {
        data: existing
      } = await collection.get();
      if (existing && existing.length > 0) {
        addLog(`清空现有 ${existing.length} 条轮播图数据`, 'warning');
        await existing.forEach(item => {
          collection.doc(item._id).remove();
        });
      }

      // 插入示例数据
      const bannersData = [{
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
        title: '专业建材供应商',
        description: '为您提供高品质的建筑材料和服务',
        link: '/companies',
        order: 1,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920',
        title: '优质装修服务',
        description: '一站式装修解决方案，让您的家更美好',
        link: '/companies',
        order: 2,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920',
        title: '会员专享服务',
        description: '加入会员，享受更多专属权益和优惠',
        link: '/member-certification',
        order: 3,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920',
        title: '企业入驻计划',
        description: '诚邀优质企业加入，共建商业生态',
        link: '/my-company',
        order: 4,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920',
        title: '品质保证',
        description: '严格筛选，为您推荐最优质的合作伙伴',
        link: '/companies',
        order: 5,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      // 批量插入
      const results = await collection.add(bannersData);
      addLog(`✅ 成功插入 ${results.ids.length} 条轮播图数据`, 'success');
      return results.ids.length;
    } catch (error) {
      addLog(`❌ 轮播图数据初始化失败: ${error.message}`, 'error');
      throw error;
    }
  };

  /**
   * 初始化企业数据
   */
  const initCompanies = async tcb => {
    try {
      addLog('开始初始化企业数据...', 'info');
      const db = tcb.database();
      const collection = db.collection('companies');

      // 先清空现有数据
      const {
        data: existing
      } = await collection.get();
      if (existing && existing.length > 0) {
        addLog(`清空现有 ${existing.length} 条企业数据`, 'warning');
        await existing.forEach(item => {
          collection.doc(item._id).remove();
        });
      }

      // 插入示例数据
      const companiesData = [{
        companyId: 'company_001',
        logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
        name: '辉煌建材城',
        category: ['建材'],
        introduction: '专业建筑材料供应商，提供各类建材产品，品质保证，价格合理。',
        oneLineDesc: '专业建材供应商，品质保证',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_002',
        logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        name: '优品装修公司',
        category: ['装修'],
        introduction: '专业室内装修设计团队，提供设计、施工、材料一体化服务，让装修更省心。',
        oneLineDesc: '专业室内装修设计，一站式服务',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_003',
        logo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
        name: '烟草经营部',
        category: ['烟行'],
        introduction: '正规烟草经营，各类香烟齐全，品质保证，价格公道。',
        oneLineDesc: '正规烟草经营，品种齐全',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_004',
        logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        name: '美食餐厅',
        category: ['餐饮'],
        introduction: '本地特色美食餐厅，提供各种地道菜品，环境舒适，服务周到。',
        oneLineDesc: '本地特色美食，环境舒适',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_005',
        logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        name: '时尚服装店',
        category: ['服装'],
        introduction: '时尚服装品牌，提供各类男女装、童装，款式新颖，价格实惠。',
        oneLineDesc: '时尚服装品牌，款式新颖',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_006',
        logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        name: '快捷物流',
        category: ['物流'],
        introduction: '专业物流配送服务，快捷、安全、可靠，覆盖全国主要城市。',
        oneLineDesc: '专业物流配送，快捷可靠',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_007',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
        name: '金融服务',
        category: ['金融'],
        introduction: '专业金融服务提供商，提供贷款、理财、保险等金融服务。',
        oneLineDesc: '专业金融服务，全方位支持',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_008',
        logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
        name: '教育培训机构',
        category: ['教育'],
        introduction: '专业教育培训机构，提供各类课程培训，师资力量雄厚，教学质量保证。',
        oneLineDesc: '专业教育培训，师资雄厚',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        companyId: 'company_009',
        logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
        name: '综合服务中心',
        category: ['其他'],
        introduction: '综合性服务中心，提供各类便民服务，满足您的生活需求。',
        oneLineDesc: '综合服务中心，便民利民',
        ownerId: '',
        status: 'active',
        isPublished: true,
        isRecommended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      // 批量插入
      const results = await collection.add(companiesData);
      addLog(`✅ 成功插入 ${results.ids.length} 条企业数据`, 'success');
      return results.ids.length;
    } catch (error) {
      addLog(`❌ 企业数据初始化失败: ${error.message}`, 'error');
      throw error;
    }
  };

  /**
   * 执行数据初始化
   */
  const initializeData = async () => {
    try {
      setIsInitializing(true);
      clearLogs();
      addLog('=================================', 'info');
      addLog('开始数据初始化流程', 'info');
      addLog('=================================', 'info');
      const tcb = await $w.cloud.getCloudInstance();

      // 初始化轮播图
      const bannersCount = await initBanners(tcb);

      // 初始化企业
      const companiesCount = await initCompanies(tcb);
      addLog('=================================', 'info');
      addLog('数据初始化完成！', 'success');
      addLog(`轮播图: ${bannersCount} 条`, 'info');
      addLog(`企业: ${companiesCount} 条`, 'info');
      addLog('=================================', 'info');
      toast({
        title: '数据初始化成功',
        description: `已初始化 ${bannersCount} 条轮播图和 ${companiesCount} 条企业数据`,
        variant: 'success'
      });

      // 3秒后跳转到首页
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        });
      }, 3000);
    } catch (error) {
      console.error('数据初始化失败:', error);
      addLog(`❌ 数据初始化失败: ${error.message}`, 'error');
      toast({
        title: '数据初始化失败',
        description: error.message || '请查看日志了解详情',
        variant: 'destructive'
      });
    } finally {
      setIsInitializing(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8" />
            <h1 className="text-2xl font-bold">数据初始化</h1>
          </div>
          <p className="text-blue-100 text-sm">
            将示例数据导入到云数据库，确保应用正常运行
          </p>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📝</span>
            操作说明
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <p>点击下方按钮开始初始化数据</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <p>系统将清空现有数据并导入新的示例数据</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <p>初始化完成后自动跳转到首页</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠️</span>
              <p className="text-red-600">注意：此操作将覆盖现有数据，请谨慎操作</p>
            </div>
          </div>
        </Card>

        {/* 初始化按钮 */}
        <Button onClick={initializeData} disabled={isInitializing} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-14 text-lg font-semibold rounded-xl shadow-lg transition-all">
          {isInitializing ? <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>初始化中...</span>
            </div> : <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <span>开始初始化数据</span>
            </div>}
        </Button>

        {/* 操作日志 */}
        {logs.length > 0 && <Card className="bg-gray-900 rounded-xl p-4 mt-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span>📋</span>
                操作日志
              </h3>
              <button onClick={clearLogs} className="text-xs text-gray-400 hover:text-white transition-colors">
                清空
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.map((log, index) => <div key={index} className={`text-sm font-mono ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className="ml-2">{log.message}</span>
                </div>)}
            </div>
          </Card>}

        {/* 返回首页按钮 */}
        {!isInitializing && <Button variant="outline" onClick={() => $w.utils.navigateTo({
        pageId: 'home',
        params: {}
      })} className="w-full mt-4 h-12 rounded-xl flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>返回首页</span>
          </Button>}
      </div>
    </div>;
}