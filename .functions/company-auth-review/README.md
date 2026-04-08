# 企业认证审核云函数

## 功能说明

该云函数实现企业认证申请的审核管理功能，包括：

- **申请列表查询**：管理员查看所有企业认证申请
- **申请详情查询**：查看单个申请的详细信息（包括营业执照、logo等）
- **审核操作**：管理员审核通过或驳回申请

## 数据模型

对接数据模型：`company_auth_applications`

## 调用示例

### 1. 查询待审核的申请列表

```javascript
wx.cloud.callFunction({
  name: 'company-auth-review',
  data: {
    action: 'list',
    data: {
      applicationStatus: 'pending'  // 查询待审核状态
    }
  },
  success: res => {
    console.log('待审核列表:', res.result);
  }
});
```

### 2. 查询申请详情

```javascript
wx.cloud.callFunction({
  name: 'company-auth-review',
  data: {
    action: 'detail',
    data: {
      applicationId: 'app_xxx_xxx'  // 申请ID
    }
  },
  success: res => {
    console.log('申请详情:', res.result);
  }
});
```

### 3. 审核通过

```javascript
wx.cloud.callFunction({
  name: 'company-auth-review',
  data: {
    action: 'review',
    data: {
      applicationId: 'app_xxx_xxx',
      applicationStatus: 'approved',  // 审核通过
      reviewerId: 'admin12345',
      reviewerName: '管理员姓名',
      reviewComment: '营业执照齐全，企业信息完整'
    }
  },
  success: res => {
    console.log('审核通过:', res.result);
  }
});
```

### 4. 审核驳回

```javascript
wx.cloud.callFunction({
  name: 'company-auth-review',
  data: {
    action: 'review',
    data: {
      applicationId: 'app_xxx_xxx',
      applicationStatus: 'rejected',  // 审核驳回
      reviewerId: 'admin12345',
      reviewerName: '管理员姓名',
      reviewComment: '营业执照信息不完整',
      rejectionReason: '营业执照上的企业名称与申请信息不符'  // 必填
    }
  },
  success: res => {
    console.log('审核驳回:', res.result);
  }
});
```

## 状态说明

- `pending` - 待审核
- `approved` - 已通过
- `rejected` - 已驳回

## 安全规则

建议在数据模型安全规则中设置管理员权限，仅管理员可调用此云函数。