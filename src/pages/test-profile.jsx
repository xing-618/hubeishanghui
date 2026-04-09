// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export default function TestProfilePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [testResults, setTestResults] = useState([]);
  const runTests = async () => {
    const results = [];
    try {
      // 测试1：查询所有用户
      const allUsersResult = await $w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 10,
          pageNumber: 1
        }
      });
      results.push({
        name: '测试1：查询所有用户',
        success: allUsersResult.success,
        data: allUsersResult.data,
        count: allUsersResult.data?.records?.length || 0
      });

      // 测试2：使用 _id 查询
      if (allUsersResult.data?.records?.[0]?._id) {
        const userId = allUsersResult.data.records[0]._id;
        const byIdResult = await $w.cloud.callDataSource({
          dataSourceName: 'users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: userId
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
        results.push({
          name: `测试2：使用 _id 查询 (${userId})`,
          success: byIdResult.success,
          data: byIdResult.data,
          count: byIdResult.data?.records?.length || 0
        });
      }

      // 测试3：使用 $or 条件查询
      if (allUsersResult.data?.records?.[0]?._id) {
        const userId = allUsersResult.data.records[0]._id;
        const orResult = await $w.cloud.callDataSource({
          dataSourceName: 'users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                $or: [{
                  userId: {
                    $eq: userId
                  }
                }, {
                  _id: {
                    $eq: userId
                  }
                }]
              }
            },
            select: {
              $master: true
            },
            pageSize: 1,
            pageNumber: 1
          }
        });
        results.push({
          name: `测试3：使用 $or 条件查询 (${userId})`,
          success: orResult.success,
          data: orResult.data,
          count: orResult.data?.records?.length || 0,
          user: orResult.data?.records?.[0] || null
        });
      }

      // 测试4：使用手机号查询
      if (allUsersResult.data?.records?.[0]?.phone) {
        const phone = allUsersResult.data.records[0].phone;
        const byPhoneResult = await $w.cloud.callDataSource({
          dataSourceName: 'users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                phone: {
                  $eq: phone
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
        results.push({
          name: `测试4：使用手机号查询 (${phone})`,
          success: byPhoneResult.success,
          data: byPhoneResult.data,
          count: byPhoneResult.data?.records?.length || 0,
          user: byPhoneResult.data?.records?.[0] || null
        });
      }

      // 测试5：检查 localStorage
      const storedUserId = localStorage.getItem('currentUserId');
      results.push({
        name: '测试5：检查 localStorage',
        success: !!storedUserId,
        data: {
          currentUserId: storedUserId
        }
      });
    } catch (error) {
      results.push({
        name: '测试错误',
        success: false,
        data: {
          error: error.message
        }
      });
    }
    setTestResults(results);
  };
  return <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile 页面诊断</h1>
        
        <Button onClick={runTests} className="mb-6 bg-[#F59E0B] hover:bg-[#E59208] text-white">
          开始测试
        </Button>
        
        <div className="space-y-4">
          {testResults.map((result, index) => <div key={index} className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <h3 className="font-bold mb-2">{result.name}</h3>
              <div className={`mb-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                记录数: {result.count}
              </div>
              {result.user && <div className="bg-white p-3 rounded mt-2">
                  <div className="font-bold mb-2">用户数据:</div>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.user, null, 2)}
                  </pre>
                </div>}
              {result.data && <div className="bg-white p-3 rounded mt-2">
                  <div className="font-bold mb-2">完整数据:</div>
                  <pre className="text-xs overflow-auto max-h-60">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>}
            </div>)}
        </div>
      </div>
    </div>;
}