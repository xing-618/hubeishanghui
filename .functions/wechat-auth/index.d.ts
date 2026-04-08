/**
 * 云函数事件参数接口
 */
interface CloudFunctionEvent {
  /**
   * 用户标识（微信 openid 或 unionid）
   */
  userIdentifier: string;
  /**
   * 手机号码（11位数字）
   */
  phoneNumber: string;
  /**
   * 用户基本信息对象（可选，如昵称、头像等）
   */
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
    name?: string;
  };
}

/**
 * 云函数返回结果接口
 */
interface CloudFunctionResult {
  /**
   * 用户信息对象
   */
  userInfo: {
    _id: string;
    userId: string;
    nickName?: string;
    avatarUrl?: string;
    phone?: string;
    isMember?: boolean;
    isAdmin?: boolean;
  };
  /**
   * 认证状态
   */
  authStatus: boolean;
  /**
   * 操作结果消息
   */
  message: string;
  /**
   * 错误信息（如果操作失败）
   */
  error?: string;
}

/**
 * 主函数声明
 */
export declare function main(
  event: CloudFunctionEvent,
  context: any
): Promise<CloudFunctionResult>;
