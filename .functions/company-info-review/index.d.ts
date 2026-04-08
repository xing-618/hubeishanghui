// 云函数事件类型定义
interface CloudFunctionEvent {
  action: string;
  data: any;
}

// 云函数返回类型
interface ReviewResult {
  success: boolean;
  message: string;
  application?: any;
  applications?: any[];
  total?: number;
  error?: string;
  details?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<ReviewResult>;