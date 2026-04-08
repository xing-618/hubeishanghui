const tcb = require('@cloudbase/node-sdk');

const cloud = tcb.init({
  env: tcb.getCurrentEnv()
});

const db = cloud.database();

/**
 * 生成收藏ID
 * @returns string 收藏ID
 */
function generateFavoriteId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `fav_${timestamp}_${random}`;
}

/**
 * 新增收藏
 * @param userId 用户ID
 * @param companyId 企业ID
 * @returns 收藏记录
 */
async function addFavorite(userId, companyId) {
  try {
    // 检查是否已收藏
    const existingRecord = await db
      .collection('favorites')
      .where({
        userId: userId,
        companyId: companyId
      })
      .get();

    if (existingRecord.data && existingRecord.data.length > 0) {\      
      return {
        success: false,
        message: '已收藏该企业',
        favorite: existingRecord.data[0]
      };
    }

    // 创建新的收藏记录
    const favoriteId = generateFavoriteId();
    const result = await db
      .collection('favorites')
      .add({
        favoriteId: favoriteId,
        userId: userId,
        companyId: companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

    return {
      success: true,
      message: '收藏成功',
      favorite: {
        _id: result.id,
        favoriteId: favoriteId,
        userId: userId,
        companyId: companyId,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error(`新增收藏失败: ${error.message}`);
  }
}

/**
 * 取消收藏
 * @param userId 用户ID
 * @param companyId 企业ID
 * @returns 操作结果
 */
async function removeFavorite(userId, companyId) {
  try {
    // 查找收藏记录
    const existingRecord = await db
      .collection('favorites')
      .where({
        userId: userId,
        companyId: companyId
      })
      .get();

    if (!existingRecord.data || existingRecord.data.length === 0) {\      
      return {
        success: false,
        message: '未找到该收藏记录'
      };
    }

    // 删除收藏记录
    const recordId = existingRecord.data[0]._id;
    await db
      .collection('favorites')
      .doc(recordId)
      .remove();

    return {
      success: true,
      message: '取消收藏成功',
      favoriteId: existingRecord.data[0].favoriteId
    };
  } catch (error) {
    throw new Error(`取消收藏失败: ${error.message}`);
  }
}

/**
 * 查询收藏列表
 * @param userId 用户ID
 * @returns 收藏列表
 */
async function getFavoriteList(userId) {
  try {
    const result = await db
      .collection('favorites')
      .where({
        userId: userId
      })
      .orderBy('createdAt', 'desc')
      .get();

    return {
      success: true,
      message: '查询成功',
      total: result.data.length,
      favorites: result.data.map(item => ({
        _id: item._id,
        favoriteId: item.favoriteId,
        userId: item.userId,
        companyId: item.companyId,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }))
    };
  } catch (error) {
    throw new Error(`查询收藏列表失败: ${error.message}`);
  }
}

/**
 * 主函数 - 处理收藏相关的请求
 * @param event 请求事件
 * @param context 请求上下文
 * @returns 处理结果
 */
async function main(event, context) {
  const { action, userId, companyId } = event;

  // 参数验证
  if (!userId) {
    return {
      success: false,
      message: '用户ID不能为空',
      error: 'INVALID_USER_ID'
    };
  }

  if (!action) {
    return {
      success: false,
      message: '操作类型不能为空',
      error: 'INVALID_ACTION'
    };
  }

  // 支持的操作类型
  const supportedActions = ['add', 'remove', 'list'];
  if (!supportedActions.includes(action)) {
    return {
      success: false,
      message: '不支持的操作类型',
      error: 'UNSUPPORTED_ACTION',
      supportedActions: supportedActions
    };
  }

  try {
    let result;

    switch (action) {
      case 'add':
        // 新增收藏 - 需要企业ID
        if (!companyId) {
          return {
            success: false,
            message: '企业ID不能为空',
            error: 'INVALID_COMPANY_ID'
          };
        }
        result = await addFavorite(userId, companyId);
        break;

      case 'remove':
        // 取消收藏 - 需要企业ID
        if (!companyId) {
          return {
            success: false,
            message: '企业ID不能为空',
            error: 'INVALID_COMPANY_ID'
          };
        }
        result = await removeFavorite(userId, companyId);
        break;

      case 'list':
        // 查询收藏列表
        result = await getFavoriteList(userId);
        break;

      default:
        return {
          success: false,
          message: '不支持的操作类型',
          error: 'UNSUPPORTED_ACTION'
        };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message || '操作失败',
      error: 'OPERATION_FAILED'
    };
  }
}

module.exports = { main };