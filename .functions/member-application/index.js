const tcb = require('@cloudbase/node-sdk');

const app = tcb.init();
const db = app.database();

// 状态枚举
const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// 验证手机号格式
function validatePhone(phone) {
  if (!phone) return false;
  return /^1[3-9]\d{9}$/.test(phone);
}

// 生成申请ID
function generateApplicationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `app_${timestamp}_${random}`;
}

// 提交会员认证申请
async function submitApplication(data) {
  const {
    applicantId,
    applicantName,
    applicantPhone,
    applicantCompany,
    applicationReason,
    proofMaterials
  } = data;

  // 参数验证
  if (!applicantId || typeof applicantId !== 'string') {
    return {
      success: false,
      message: '申请人ID不能为空',
      error: 'INVALID_APPLICANT_ID'
    };
  }

  if (!applicantName || typeof applicantName !== 'string') {
    return {
      success: false,
      message: '申请人姓名不能为空',
      error: 'INVALID_APPLICANT_NAME'
    };
  }

  if (!applicantPhone || !validatePhone(applicantPhone)) {
    return {
      success: false,
      message: '申请人电话格式不正确',
      error: 'INVALID_APPLICANT_PHONE'
    };
  }

  if (!applicationReason || typeof applicationReason !== 'string') {
    return {
      success: false,
      message: '申请理由不能为空',
      error: 'INVALID_APPLICATION_REASON'
    };
  }

  if (!proofMaterials || !Array.isArray(proofMaterials) || proofMaterials.length === 0) {
    return {
      success: false,
      message: '证明材料不能为空',
      error: 'INVALID_PROOF_MATERIALS'
    };
  }

  const applicationId = generateApplicationId();
  const createdAt = new Date();

  try {
    const result = await db.collection('member_applications').add({
      applicationId,
      applicantId,
      applicantName,
      applicantPhone,
      applicantCompany: applicantCompany || '',
      applicationReason,
      proofMaterials,
      applicationStatus: STATUS.PENDING,
      reviewerId: '',
      reviewComment: '',
      reviewedAt: '',
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString()
    });

    return {
      success: true,
      message: '申请提交成功',
      application: {
        _id: result._id,
        applicationId,
        applicantId,
        applicantName,
        applicantPhone,
        applicantCompany,
        applicationReason,
        proofMaterials,
        applicationStatus: STATUS.PENDING,
        createdAt: createdAt.toISOString()
      }
    };
  } catch (err) {
    return {
      success: false,
      message: '申请提交失败',
      error: 'DATABASE_ERROR',
      details: err.message
    };
  }
}

// 查询申请列表
async function queryApplications(data) {
  const {
    applicantId,
    applicationStatus,
    reviewerId
  } = data;

  // 参数验证：至少提供一个查询条件
  if (!applicantId && !applicationStatus && !reviewerId) {
    return {
      success: false,
      message: '至少提供一个查询条件',
      error: 'INVALID_QUERY_PARAMS'
    };
  }

  try {
    const collection = db.collection('member_applications');

    // 构建查询条件
    let where = {};
    if (applicantId) {
      where.applicantId = applicantId;
    }
    if (applicationStatus) {
      where.applicationStatus = applicationStatus;
    }
    if (reviewerId) {
      where.reviewerId = reviewerId;
    }

    const result = await collection.where(where).orderBy('createdAt', 'desc').get();

    const applications = result.data || [];

    return {
      success: true,
      message: '查询成功',
      total: applications.length,
      applications
    };
  } catch (err) {
    return {
      success: false,
      message: '查询失败',
      error: 'DATABASE_ERROR',
      details: err.message
    };
  }
}

// 查询单个申请详情
async function queryApplicationDetail(data) {
  const { applicationId } = data;

  if (!applicationId || typeof applicationId !== 'string') {
    return {
      success: false,
      message: '申请ID不能为空',
      error: 'INVALID_APPLICATION_ID'
    };
  }

  try {
    const result = await db.collection('member_applications').where({
      applicationId: applicationId
    }).get();

    if (result.data.length === 0) {
      return {
        success: false,
        message: '申请记录不存在',
        error: 'APPLICATION_NOT_FOUND'
      };
    }

    return {
      success: true,
      message: '查询成功',
      application: result.data[0]
    };
  } catch (err) {
    return {
      success: false,
      message: '查询失败',
      error: 'DATABASE_ERROR',
      details: err.message
    };
  }
}

// 更新申请审核状态
async function updateReviewStatus(data) {
  const {
    applicationId,
    applicationStatus,
    reviewerId,
    reviewComment
  } = data;

  // 参数验证
  if (!applicationId || typeof applicationId !== 'string') {
    return {
      success: false,
      message: '申请ID不能为空',
      error: 'INVALID_APPLICATION_ID'
    };
  }

  if (!applicationStatus || typeof applicationStatus !== 'string') {
    return {
      success: false,
      message: '审核状态不能为空',
      error: 'INVALID_APPLICATION_STATUS'
    };
  }

  if (!Object.values(STATUS).includes(applicationStatus)) {
    return {
      success: false,
      message: '审核状态不合法',
      error: 'INVALID_STATUS_VALUE'
    };
  }

  if (!reviewerId || typeof reviewerId !== 'string') {
    return {
      success: false,
      message: '审核人ID不能为空',
      error: 'INVALID_REVIEWER_ID'
    };
  }

  try {
    // 先查询申请是否存在
    const existResult = await db.collection('member_applications').where({
      applicationId: applicationId
    }).get();

    if (existResult.data.length === 0) {
      return {
        success: false,
        message: '申请记录不存在',
        error: 'APPLICATION_NOT_FOUND'
      };
    }

    const existingApplication = existResult.data[0];

    // 检查申请状态，已审核的申请不能再审核
    if (existingApplication.applicationStatus !== STATUS.PENDING) {
      return {
        success: false,
        message: '该申请已完成审核，无法再次审核',
        error: 'APPLICATION_ALREADY_REVIEWED'
      };
  }

    const updatedAt = new Date();

    // 更新审核信息
    const updateResult = await db.collection('member_applications').doc(
      existingApplication._id
    ).update({
      applicationStatus,
      reviewerId,
      reviewComment: reviewComment || '',
      reviewedAt: updatedAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });

    return {
      success: true,
      message: applicationStatus === STATUS.APPROVED ? '审核通过' : '审核拒绝',
      application: {
        applicationId,
        applicationStatus,
        reviewerId,
        reviewComment,
        reviewedAt: updatedAt.toISOString()
      }
    };
  } catch (err) {
    return {
      success: false,
      message: '审核失败',
      error: 'DATABASE_ERROR',
      details: err.message
    };
  }
}

exports.main = async (event, context) => {
  const { action, data } = event;

  // 参数验证
  if (!action || typeof action !== 'string') {
    return {
      success: false,
      message: '操作类型不能为空',
      error: 'INVALID_ACTION'
    };
  }

  // 根据不同的操作类型执行相应的业务逻辑
  switch (action) {
    case 'submit':
      return await submitApplication(data);

    case 'list':
      return await queryApplications(data);

    case 'detail':
      return await queryApplicationDetail(data);

    case 'review':
      return await updateReviewStatus(data);

    default:
      return {
        success: false,
        message: '不支持的操作类型',
        error: 'UNSUPPORTED_ACTION'
      };
  }
};