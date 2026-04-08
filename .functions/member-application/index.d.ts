interface CloudFunctionEvent {
  action: string;
  data: any;
}

interface ApplicationData {
  applicantId?: string;
  applicantName?: string;
  applicantPhone?: string;
  applicantCompany?: string;
  applicationReason?: string;
  proofMaterials?: string[];
  applicationStatus?: string;
  reviewerId?: string;
  reviewComment?: string;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<any>;