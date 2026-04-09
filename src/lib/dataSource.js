/**
 * 数据源调用工具函数
 * 统一的数据模型操作接口
 */

/**
 * 调用数据源
 * @param {Object} params - 调用参数
 * @param {string} params.dataSourceName - 数据源名称
 * @param {Object} params.params - 操作参数
 * @returns {Promise<Object>} 调用结果
 */
export async function callDataSource({ dataSourceName, params }) {
  try {
    const tcb = await window.$w?.cloud?.getCloudInstance();
    if (!tcb) {
      throw new Error('云开发实例未初始化');
    }

    const db = tcb.database();
    const collection = db.collection(dataSourceName);
    const { operation, condition, data } = params;

    let result;

    switch (operation) {
      case 'get':
        // 获取单条记录
        const getResult = await collection
          .where(condition || {})
          .get();
        result = {
          success: true,
          data: getResult.data || []
        };
        break;

      case 'list':
        // 获取记录列表
        const listResult = await collection
          .where(condition || {})
          .get();
        result = {
          success: true,
          data: listResult.data || []
        };
        break;

      case 'add':
        // 添加记录
        const addResult = await collection.add({
          ...data,
          userId: data.userId || addResult.id, // 使用传入的userId或生成的_id作为userId
          createdAt: new Date(),
          updatedAt: new Date()
        });
        result = {
          success: true,
          data: {
            ...data,
            userId: data.userId || addResult.id,
            _id: addResult.id
          }
        };
        break;

      case 'update':
        // 更新记录
        const updateResult = await collection
          .where(condition)
          .update({
            ...data,
            updatedAt: new Date()
          });
        result = {
          success: true,
          data: updateResult
        };
        break;

      case 'delete':
        // 删除记录
        const deleteResult = await collection
          .where(condition)
          .remove();
        result = {
          success: true,
          data: deleteResult
        };
        break;

      default:
        throw new Error(`不支持的操作: ${operation}`);
    }

    return result;
  } catch (error) {
    console.error('数据源调用失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default callDataSource;