# 企业信息审核云函数

## 功能说明

- **查询申请列表**：管理员查看所有企业新增或修改申请（支持按状态、申请人、企业ID、审核人筛选）
- **查询申请详情**：查看单个申请的详细信息（包括企业名称、Logo、一句话介绍、企业分类、详细介绍富文本等）
- **审核操作**：管理员审核通过或驳回申请，记录审核意见和驳回原因
- **状态管理**：防止重复审核，支持待审核、已通过、已驳回三种状态

## 状态说明

| 状态 | 说明 |
|------|------|
| `pending` | 待审核（申请提交后的初始状态） |
| `approved` | 已通过审核 |
| `rejected` | 已驳回审核 |

## 数据模型

对接 `company_modifications` 数据模型，包含以下字段：
- `userId`: 用户ID
- `companyId`: 企业ID
- `company_name`: 企业名称
- `logo`: 企业Logo
- `brief_introduction`: 一句话介绍
- `category`: 企业分类（数组）
- `detailed_introduction`: 详细介绍（富文本）
- `status`: 审核状态
- `rejectReason`: 拒绝原因

## 调用示例

### 1. 查询待审核的申请列表

```javascript
wx.cloud.callFunction({
  name: 'company-info-review',
  data: {
    action: 'list',
    data: {
      status: 'pending'  // 查询待审核状态
    }
  },
  success: res => {
    console.log('待审核列表:', res.result);
  }
});
```

### 2. 查询所有申请列表

```javascript
wx.cloud.callFunction({
  name: 'company-info-review',
  data: {
    action: 'list',
    data: {
      // 不指定状态，查询所有申请
    }
  },
  success: res => {
    console.log('所有申请列表:', res.result);
  }
});
```

### 3. 查询指定申请人的申请

```javascript
wx.cloud.callFunction({
  name: 'company-info-review',
  data: {
    action: 'list',
    data: {
      userId: 'user12345'
    }
  },
  success: res => {
    console.log('用户申请列表:', res.result);
  }
});
```

### 4. 查询申请详情（查看富文本内容和Logo）

```javascript
wx.cloud.callFunction({
  name: 'company-info-review',
  data: {
    action: 'detail',
    data: {
      applicationId: 'app_xxx_xxx'  // 申请ID
    }
  },
  success: res => {
    console.log('申请详情:', res.result);
    // 可以查看企业名称、Logo、一句话介绍、企业分类、详细介绍富文本等
  }
});
```

### 5. 审核通过申请

```javascript
wx.cloud.callFunction({
  name: 'company-info-review',
  data: {
    action: 'review',
    data: {
      applicationId: 'app_xxx_xxx',  // 申请ID
      status: 'approved',  // 审核通过
      reviewerId: 'admin12345',  // 审核人ID
      reviewerName: '王管理员',  // 审核人姓名
      reviewComment: '企业信息完整，富文本内容规范'  // 审核意见
    }
  },
  success: res => {
    console.log('审核通过:', res.result);
  }
});
```

### 6. 审核驳回申请

```javascript
wx.cloud.callFunction({
  name: 'company-info-review',
  data: {
    action: 'review',
    data: {
      applicationId: 'app_xxx_xxx',
      status: 'rejected',  // 审核驳回
      reviewerId: 'admin12345',
      reviewerName: '王管理员',
      reviewComment: '富文本内容不符合规范',
      rejectReason: '详细介绍中包含广告性内容，不符合平台规范，请修改后重新提交'  // 必填
    }
  },
  success: res => {
    console.log('审核驳回:', res.result);
  }
});
```

## 参数说明

### 查询列表 (action: 'list')

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userId` | string | 否 | 用户ID |
| `companyId` | string | 否 | 企业ID |
| `status` | string | 否 | 申请状态 |
| `reviewerId` | string | 否 | 审核人ID |

### 查询详情 (action: 'detail')

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `applicationId` | string | 是 | 申请ID |

### 审核申请 (action: 'review')

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `applicationId` | string | 是 | 申请ID |
| `status` | string | 是 | 审核状态（approved 或 rejected） |
| `reviewerId` | string | 是 | 审核人ID |
| `reviewerName` | string | 否 | 审核人姓名 |
| `reviewComment` | string | 否 | 审核意见 |
| `rejectReason` | string | 条件必填 | 驳回时必填 |

## 返回值说明

### 成功响应（查询列表）

```json
{
  "success": true,
  "message": "查询成功",
  "total": 10,
  "applications": [
    {
      "_id": "数据库记录ID",
      "userId": "user12345",
      "companyId": "company12345",
      "company_name": "某某科技有限公司",
      "logo": "https://example.com/logo.jpg",
      "brief_introduction": "专注云计算服务",
      "category": ["科技", "云计算"],
      "detailed_introduction": "...富文本内容...",
      "status": "pending",
      "createdAt": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

### 成功响应（审核通过）

```json
{
  "success": true,
  "message": "审核通过",
  "application": {
    "applicationId": "app_xxx_xxx",
    "status": "approved",
    "reviewerId": "admin12345",
    "reviewerName": "王管理员",
    "reviewComment": "企业信息完整",
    "rejectReason": null,
    "reviewedAt": "2025-01-15T13:00:00.000Z"
  }
}
```

## 错误处理

函数会处理以下错误情况：
- 参数验证失败
- 申请记录不存在
- 申请已审核（无法重复审核）
- 驳回时未提供拒绝原因
- 数据库操作异常

## 安全建议

建议在数据模型 `company_modifications` 的安全规则中设置：
- 仅管理员可调用审核操作（review）
- 管理员可查看所有申请（list 和 detail）
- 申请人只能查看自己的申请详情
- 仅登录用户可调用函数（auth != null）