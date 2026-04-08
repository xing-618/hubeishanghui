// 企业认证申请数据接口
interface CompanyAuthApplication {
  _id?: string;
  applicationId?: string;
  applicantId: string; // 申请人ID
  applicantName: string; // 申请人姓名
  applicantPhone: string; // 申请人电话
  companyInfo: {
    companyName: string; // 企业名称
    companyCode: string; // 企业统一社会信用代码
    companyAddress: string; // 企业地址
    companyLogo?: string; // 企业Logo URL
    businessLicense?: string; // 营业执照URL
    otherDocuments?: string[]; // 其他证明材料URL数组
  };
  applicationReason?: string; // 申请理由
  proofMaterials?: string[]; // 证明材料URL数组
  applicationStatus: 'pending' | 'approved' | 'rejected'; // 申请状态
  reviewerId?: string; // 审核人ID
  reviewerName?: string; // 审核人姓名
  reviewComment?: string; // 审核意见
  rejectionReason?: string; // 驳回原因
  reviewedAt?: string; // 审核时间
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

// 云函数事件接口
interface CloudFunctionEvent {
  action: 'list' | 'detail' | 'review';
  data?: {
    // 查询列表参数
    applicantId?: string;
    applicationStatus?: string;
    reviewerId?: string;
    
    // 查询详情参数
    applicationId?: string;
    
    // 审核参数
    applicationStatus?: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewComment?: string;
    rejectionReason?: string;
  };
}

// 云函数响应接口
interface CloudFunctionResponse {
  success: boolean;
  message: string;
  error?: string;
  application?: CompanyAuthApplication;
  total?: number;
  applications?: CompanyAuthApplication[];
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;