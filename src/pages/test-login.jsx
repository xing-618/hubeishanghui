// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

export default function TestLoginPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [testPhone, setTestPhone] = useState('19304052116');
  const [testPassword, setTestPassword] = useState('123456');
  const [testResults, setTestResults] = useState([]);
  const addTestResult = (testName, result) => {
    setTestResults(prev => [...prev, {
      test: testName,
      ...result,
      time: new Date().toLocaleTimeString()
    }]);
  };
  const runTests = async () => {
    setTestResults([]);

    // 测试1：使用 wedaGetRecordsV2 查询用户
    try {
      const result1 = await $w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              phone: {
                $eq: testPhone
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
      addTestResult('wedaGetRecordsV2 查询用户', {
        success: result1.success,
        hasData: result1.data && result1.data.records && result1.data.records.length > 0,
        data: result1.data ? result1.data.records : null,
        message: result1.success ? '查询成功' : '查询失败'
      });
    } catch (error) {
      addTestResult('wedaGetRecordsV2 查询用户', {
        success: false,
        error: error.message
      });
    }

    // 测试2：直接使用数据库 API 查询
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result2 = await db.collection('users').where({
        phone: testPhone
      }).get();
      addTestResult('数据库直接查询', {
        success: true,
        hasData: result2.data && result2.data.length > 0,
        data: result2.data,
        count: result2.data ? result2.data.length : 0
      });
    } catch (error) {
      addTestResult('数据库直接查询', {
        success: false,
        error: error.message
      });
    }

    // 测试3：查询所有用户
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result3 = await db.collection('users').get();
      addTestResult('查询所有用户', {
        success: true,
        count: result3.data ? result3.data.length : 0,
        users: result3.data ? result3.data.map(u => ({
          phone: u.phone,
          hasPassword: !!u.password,
          hasUserId: !!u.userId
        })) : []
      });
    } catch (error) {
      addTestResult('查询所有用户', {
        success: false,
        error: error.message
      });
    }

    // 测试4：模拟注册流程
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const testUserId = 'test_user_' + Date.now();
      const result4 = await db.collection('users').add({
        userId: testUserId,
        name: '测试用户',
        phone: '13800138000',
        password: 'test123456',
        nickName: '测试用户',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        isMember: false,
        isAdmin: false,
        favorites: [],
        companyId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      addTestResult('模拟注册', {
        success: true,
        userId: testUserId,
        insertId: result4.id
      });
    } catch (error) {
      addTestResult('模拟注册', {
        success: false,
        error: error.message
      });
    }
  };
  return <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">登录诊断测试页面</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试参数</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">测试手机号</label>
              <Input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="输入测试手机号" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">测试密码</label>
              <Input value={testPassword} onChange={e => setTestPassword(e.target.value)} placeholder="输入测试密码" />
            </div>
            <Button onClick={runTests} className="w-full">
              开始测试
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          {testResults.length === 0 ? <p className="text-gray-500">点击“开始测试”查看结果</p> : <div className="space-y-4">
              {testResults.map((result, index) => <div key={index} className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{result.test}</h3>
                    <span className="text-sm text-gray-500">{result.time}</span>
                  </div>
                  <div className="text-sm">
                    {result.error ? <div className="text-red-600">错误: {result.error}</div> : <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>}
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
}