// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';

export default function DebugLoginPage(props) {
  const {
    $w
  } = props;
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, {
      timestamp,
      message,
      data
    }]);
    console.log(`[${timestamp}] ${message}`, data || '');
  };
  const runDebugTests = async () => {
    setLogs([]);
    setIsLoading(true);
    addLog('开始调试测试...');
    try {
      // 测试1：直接查询手机号 19304052116
      addLog('测试1：直接查询手机号 19304052116');
      const result1 = await $w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              phone: {
                $eq: '19304052116'
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 10,
          pageNumber: 1
        }
      });
      addLog('测试1结果:', result1);
      if (result1.success && result1.data && result1.data.records && result1.data.records.length > 0) {
        const user = result1.data.records[0];
        addLog('查询到的用户:', {
          phone: user.phone,
          password: user.password,
          name: user.name,
          _id: user._id,
          userId: user.userId
        });
        addLog('密码比对:', {
          用户密码: user.password,
          输入密码: '123456',
          匹配: user.password === '123456'
        });
      } else {
        addLog('❌ 未找到该手机号的用户');
      }

      // 测试2：查询所有用户
      addLog('测试2：查询所有用户');
      const result2 = await $w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      });
      addLog('测试2结果:', {
        总数: result2.data?.pager?.Total || 0,
        用户数: result2.data?.records?.length || 0
      });
      if (result2.data?.records) {
        result2.data.records.forEach((user, index) => {
          addLog(`用户${index + 1}:`, {
            phone: user.phone,
            name: user.name,
            有userId: !!user.userId,
            有password: !!user.password
          });
        });
      }

      // 测试3：检查 companies 数据
      addLog('测试3：检查 companies 数据');
      const result3 = await $w.cloud.callDataSource({
        dataSourceName: 'companies',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      });
      addLog('测试3结果:', {
        总数: result3.data?.pager?.Total || 0,
        企业数: result3.data?.records?.length || 0
      });
      if (result3.data?.records) {
        result3.data.records.forEach((company, index) => {
          addLog(`企业${index + 1}:`, {
            name: company.name,
            有name: !!company.name,
            有logo: !!company.logo,
            有isPublished: !!company.isPublished,
            所有字段: Object.keys(company).join(', ')
          });
        });
      }

      // 测试4：检查 banners 数据
      addLog('测试4：检查 banners 数据');
      const result4 = await $w.cloud.callDataSource({
        dataSourceName: 'banners',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          pageSize: 100,
          pageNumber: 1
        }
      });
      addLog('测试4结果:', {
        总数: result4.data?.pager?.Total || 0,
        轮播图数: result4.data?.records?.length || 0
      });
      if (result4.data?.records) {
        result4.data.records.forEach((banner, index) => {
          addLog(`轮播图${index + 1}:`, {
            title: banner.title,
            有image: !!banner.image,
            有status: !!banner.status,
            所有字段: Object.keys(banner).join(', ')
          });
        });
      }
      addLog('✅ 所有测试完成');
    } catch (error) {
      addLog('❌ 测试失败:', error.message);
      console.error('测试失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return <div style={{
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  }}>
      <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
        <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>登录调试页面</h2>
        <p style={{
        color: '#666',
        marginBottom: '20px'
      }}>此页面用于诊断登录和数据问题</p>
        
        <Button onClick={runDebugTests} disabled={isLoading} style={{
        marginBottom: '20px'
      }}>
          {isLoading ? '测试中...' : '开始测试'}
        </Button>

        <div style={{
        maxHeight: '600px',
        overflow: 'auto',
        backgroundColor: '#f0f0f0',
        padding: '15px',
        borderRadius: '4px'
      }}>
          {logs.map((log, index) => <div key={index} style={{
          marginBottom: '10px',
          borderBottom: '1px solid #ddd',
          paddingBottom: '10px'
        }}>
              <div style={{
            color: '#666',
            fontSize: '12px',
            marginBottom: '5px'
          }}>
                [{log.timestamp}] {log.message}
              </div>
              {log.data && <pre style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
                  {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                </pre>}
            </div>)}
        </div>
      </div>
    </div>;
}