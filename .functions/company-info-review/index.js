const cloudbase = require('@cloudbase/node-sdk');

const db = cloudbase.database();

/**
 * 企业信息审核云函数
 * 功能：
 * 1. 查询企业修改申请列表
 * 2. 查询申请详情（查看富文本内容、logo等）
 * 3. 审核通过或驳回操作
 */

/**
 * 参数验证函数
 */
function validateParams(action, data) {
  const errors = [];

  switch (action) {
    case 'list':
      // 列表查询无需必填参数，所有参数都是可选的
      break;

    case 'detail':
      if (!data.applicationId || data.applicationId.trim() === '') {
        errors.push('申请ID不能为空');
      }
      break;

    case 'review':
      if (!data.applicationId || data.applicationId.trim() === '') {
        errors.push('申请ID不能为空');
      }
      if (!data.status || data.status.trim() === '') {
        errors.push('审核状态不能为空');
      }
      if (!['approved', 'rejected'].includes(data.status)) {
        errors.push('审核状态不合法，必须为 approved 或 rejected');
      }
      if (!data.reviewerId || data.reviewerId.trim() === '') {
        errors.push('审核人ID不能为空');
      }
      if (data.status === 'rejected' && (!data.rejectReason || data.rejectReason.trim() === '')) {
        errors.push('驳回时必须提供拒绝原因');
      }
      break;

    default:
      errors.push('不支持的操作类型');
  }

  return errors;
}

/**
 * 查询企业修改申请列表
 */
async function getApplicationList(data) {
  try {
    const { userId, companyId, status, reviewerId } = data;

    // 构建查询条件
    const conditions = {};
    if (userId && userId.trim() !== '') {
      conditions.userId = userId.trim();
    }
    if (companyId && companyId.trim() !== '') {
      conditions.companyId = companyId.trim();
    }
    if (status && status.trim() !== '') {
      conditions.status = status.trim();
    }
    if (reviewerId && reviewerId.trim() !== '') {
      conditions.reviewerId = reviewerId.trim();
    }

    // 执行查询
    const result = await db
      .collection('company_modifications')
      .where(conditions)
      .orderBy('createdAt', 'desc')
      .get();

    const applications = result.data || [];
    const total = applications.length;

    return {
      success: true,
      message: '查询成功',
      total,
      applications
    };
  } catch (error) {
    return {
      success: false,
      message: '查询失败',
      error: 'QUERY_ERROR',
      details: error.message
    };
  }
}

/**
 * 查询单个申请详情
 */
async function getApplicationDetail(data) {
  try {
    const { applicationId } = data;

    // 查询申请记录
    const result = await db
      .collection('company_modifications')
      .where({ _id: applicationId.trim() })
      .get();

    if (!result.data || result.data.length === 0) {
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
      application
    };
  } catch (error) {
    return {
      success: false,
      message: '查询失败',
      error: 'QUERY_ERROR',
      details: error.message
    };
  }
}

/**
 * 审核申请（通过或驳回）
 */
async function reviewApplication(data) {
  try {
    const { applicationId, status, reviewerId, reviewerName, rejectReason, reviewComment } = data;

    // 查询申请记录
    const result = await db
      .collection('company_modifications')
      .where({ _id: applicationId.trim() })
      .get();

    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        message: '申请记录不存在',
        error: 'APPLICATION_NOT_FOUND'
      };
    }

    const application = result.data[0];

    // 检查申请是否已审核
    if (application.status && ['approved', 'rejected'].includes(application.status)) {
      return {
        success: false,
        message: '该申请已完成审核，无法再次审核',
        error: 'APPLICATION_ALREADY_REVIEWED'
      };
    }

    // 构建更新数据
    const updateData = {
      status: status.trim(),
      reviewerId: reviewerId.trim(),
      reviewedAt: new Date().toISOString()
    };

    if (reviewerName && reviewerName.trim() !== '') {
      updateData.reviewerName = reviewerName.trim();
    }

    if (reviewComment && reviewComment.trim() !== '') {
      updateData.reviewComment = reviewComment.trim();
    }

    if (status === 'rejected') {
      updateData.rejectReason = rejectReason.trim();
    } else {
      updateData.rejectReason = null;\n    }

    // 执行更新
    const updateResult = await db
      .collection('company_modifications')
      .doc(applicationId.trim())
      .update(updateData);

    if (updateResult.error) {
      return {
        success: false,
        message: '审核失败',
        error: 'UPDATE_ERROR',
        details: updateResult.error.message
      };
    }

    // 返回审核结果
    const reviewResult = {
      applicationId,
      status: status.trim(),
      reviewerId: reviewerId.trim(),
      reviewerName: updateData.reviewerName || null,
      reviewComment: updateData.reviewComment || null,
      rejectReason: updateData.rejectReason || null,
      reviewedAt: updateData.reviewedAt
    };

    return {
      success: true,
      message: status === 'approved' ? '审核通过' : '审核驳回',
      application: reviewResult
    };
  } catch (error) {
    return {
      success: false,
      message: '审核失败',
      error: 'REVIEW_ERROR',
      details: error.message
    };
  }
}

/**
 * 主函数
 */
async function main(event, context) {
  const { action, data } = event;

  // 验证参数
  const validationErrors = validateParams(action, data);
  if (validationErrors.length > 0) {
    return {
      success: false,
      message: validationErrors[0],
      error: 'INVALID_PARAMS',
      details: validationErrors.join('; ')
    };
  }

  // 根据操作类型执行相应操作
  switch (action) {
    case 'list':
      return await getApplicationList(data);

    case 'detail':
      return await getApplicationDetail(data);

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

module.exports = { main };