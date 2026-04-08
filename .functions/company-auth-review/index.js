const cloudbase = require('@cloudbase/node-sdk');

// 初始化 CloudBase
const app = cloudbase.init({
  env: process.env.TCB_ENV || cloudbase.defaultEnv
});

// 数据模型名称
const DATAMODEL_NAME = 'company_auth_applications';

/**
 * 参数验证函数
 */
function validateParams(action, data) {
  const errors = [];

  if (!action) {
    errors.push('操作类型不能为空');
  }

  const validActions = ['list', 'detail', 'review'];
  if (action && !validActions.includes(action)) {
    errors.push(`不支持的操作类型: ${action}`);
  }

  if (action === 'detail') {
    if (!data || !data.applicationId) {
      errors.push('申请ID不能为空');
    }
  }

  if (action === 'review') {
    if (!data || !data.applicationId) {
      errors.push('申请ID不能为空');
    }
    if (!data || !data.applicationStatus) {
      errors.push('审核状态不能为空');
    }
    const validStatuses = ['approved', 'rejected'];
    if (data.applicationStatus && !validStatuses.includes(data.applicationStatus)) {
      errors.push(`不支持的审核状态: ${data.applicationStatus}`);
    }
    if (!data || !data.reviewerId) {
      errors.push('审核人ID不能为空');
    }
    if (data.applicationStatus === 'rejected' && (!data || !data.rejectionReason)) {
      errors.push('驳回时必须提供驳回原因');
    }
  }

  return errors;
}

/**
 * 生成申请ID
 */
function generateApplicationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `app_${timestamp}_${random}`;
}

/**
 * 查询申请列表
 */
async function queryApplicationList(data) {
  try {
    const db = app.database();
    const collection = db.collection(DATAMODEL_NAME);

    // 构建查询条件
    let where = {};

    if (data.applicantId) {
      where.applicantId = data.applicantId;
    }

    if (data.applicationStatus) {
      where.applicationStatus = data.applicationStatus;
    }

    if (data.reviewerId) {
      where.reviewerId = data.reviewerId;
    }

    // 执行查询，按创建时间降序排列
    const query = where;
    const result = await collection
      .where(query)
      .orderBy('createdAt', 'desc')
      .get();

    const total = result.data.length;
    const applications = result.data;

    return {
      success: true,
      message: '查询成功',
      total: total,
      applications: applications
    };
  } catch (error) {
    console.error('查询申请列表失败:', error);
    return {
      success: false,
      message: '查询申请列表失败',
      error: 'QUERY_LIST_FAILED',
      details: error.message
    };
  }
}

/**
 * 查询申请详情
 */
async function queryApplicationDetail(applicationId) {
  try {
    const db = app.database();
    const collection = db.collection(DATAMODEL_NAME);

    const result = await collection
      .where({ applicationId: applicationId })
      .get();

    if (result.data.length === 0) {
      return {
        success: false,
        message: '申请记录不存在',
        error: 'APPLICATION_NOT_FOUND'
      };
    }

    const application = result.data[0];

    return {
      success: true,
      message: '查询成功',
      application: application
    };
  } catch (error) {
    console.error('查询申请详情失败:', error);
    return {
      success: false,
      message: '查询申请详情失败',
      error: 'QUERY_DETAIL_FAILED',
      details: error.message
    };
  }
}

/**
 * 审核申请
 */
async function reviewApplication(data) {
  try {
    // 先查询申请是否存在
    const detailResult = await queryApplicationDetail(data.applicationId);

    if (!detailResult.success) {
      return detailResult;
    }

    const application = detailResult.application;

    // 检查申请状态
    if (application.applicationStatus !== 'pending') {
      return {
        success: false,
        message: '该申请已完成审核，无法再次审核',
        error: 'APPLICATION_ALREADY_REVIEWED'
      };
    }

    // 更新申请状态
    const db = app.database();
    const collection = db.collection(DATAMODEL_NAME);

    const updateData = {
      applicationStatus: data.applicationStatus,
      reviewerId: data.reviewerId,
      reviewerName: data.reviewerName,
      reviewComment: data.reviewComment,
      rejectionReason: data.applicationStatus === 'rejected' ? data.rejectionReason : null,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
  };

  const updateResult = await collection
    .where({ applicationId: data.applicationId })
    .update(updateData);

  // 返回更新后的申请信息
  const updatedApplication = {
    ...application,
    ...updateData
  };

  return {
    success: true,
    message: data.applicationStatus === 'approved' ? '审核通过' : '审核驳回',
    application: updatedApplication
  };

} catch (error) {
  console.error('审核申请失败:', error);
  return {
    success: false,
    message: '审核申请失败',
    error: 'REVIEW_FAILED',
    details: error.message
  };
}
}

/**
 * 主函数
 */
async function main(event, context) {
  const { action, data } = event;

  // 参数验证
  const validationErrors = validateParams(action, data);
  if (validationErrors.length > 0) {
    return {
      success: false,
      message: validationErrors.join(', '),
      error: 'INVALID_PARAMS'
    };
  }

  // 根据操作类型执行相应功能
  switch (action) {
    case 'list':
      return await queryApplicationList(data);

    case 'detail':
      return await queryApplicationDetail(data.applicationId);

    case 'review':
      return await reviewApplication(data);

    default:
      return {
        success: false,
        message: '不支持的操作类型',
        error: 'INVALID_ACTION'
      };
  }
}

// 导出主函数
module.exports = { main };