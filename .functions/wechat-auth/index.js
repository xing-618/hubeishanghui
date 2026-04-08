const cloudbase = require("@cloudbase/node-sdk");

// 初始化云开发
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

// 获取数据模型实例
const models = app.models;

// 获取微信上下文信息
const wxContext = app.auth();

/**
 * 验证用户标识格式
 * @param {string} identifier - 用户标识
 * @returns {boolean} 是否合法
 */
function validateUserIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") {
    return false;
  }
  // openid 和 unionid 通常为28位或更长的字符串
  return identifier.length >= 20;
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否合法
 */
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") {
    return false;
  }
  // 中国大陆手机号：1开头，11位数字
  return /^1\d{10}$/.test(phone);
}

/**
 * 云函数主入口
 * @param {CloudFunctionEvent} event - 事件参数
 * @param {any} context - 上下文
 * @returns {Promise<CloudFunctionResult>} 返回结果
 */
async function main(event, context) {
  const { userIdentifier, phoneNumber, userInfo = {} } = event;

  try {
    // 1. 参数验证
    if (!userIdentifier) {
      return {
        userInfo: null,
        authStatus: false,
        message: "用户标识不能为空",
        error: "MISSING_USER_IDENTIFIER"
      };
    }

    if (!phoneNumber) {
      return {
        userInfo: null,
        authStatus: false,
        message: "手机号码不能为空",
        error: "MISSING_PHONE_NUMBER"
      };
    }

    // 2. 格式验证
    if (!validateUserIdentifier(userIdentifier)) {
      return {
        userInfo: null,
        authStatus: false,
        message: "用户标识格式不合法",
        error: "INVALID_USER_IDENTIFIER"
      };
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return {
        userInfo: null,
        authStatus: false,
        message: "手机号码格式不正确",
        error: "INVALID_PHONE_NUMBER"
      };
    }

    // 3. 获取微信上下文（可选，用于进一步验证）
    const wxContextInfo = wxContext.getUserInfo();
    console.log("微信上下文信息:", JSON.stringify(wxContextInfo));

    // 4. 查询用户是否已存在
    const { data: existingUser } = await models.users.list({
      filter: {
        where: {
          userId: {
            $eq: userIdentifier
          }
        }
      },
      select: {
        $master: true
      }
    });

    let userResult;
    let message;

    if (existingUser.records && existingUser.records.length > 0) {
      // 用户已存在，更新用户信息
      const userRecord = existingUser.records[0];
      const userId = userRecord._id;

      const updateData = {
        phone: phoneNumber
      };

      // 更新可选的用户信息
      if (userInfo.nickName !== undefined) {
        updateData.nickName = userInfo.nickName;
      }
      if (userInfo.avatarUrl !== undefined) {
        updateData.avatarUrl = userInfo.avatarUrl;
      }
      if (userInfo.name !== undefined) {
        updateData.name = userInfo.name;
      }

      await models.users.update({
        data: updateData,
        filter: {
          where: {
            _id: {
              $eq: userId
            }
          }
        }
      });

      // 获取更新后的用户信息
      const { data: updatedUser } = await models.users.get({
        filter: {
          where: {
            _id: {
              $eq: userId
            }
          }
        },
        select: {
          $master: true
        }
      });

      userResult = updatedUser;
      message = "用户信息更新成功";
    } else {
      // 用户不存在，创建新用户
      const newUserData = {
        userId: userIdentifier,
        phone: phoneNumber
      };

      // 添加可选的用户信息
      if (userInfo.nickName) {
        newUserData.nickName = userInfo.nickName;
      }
      if (userInfo.avatarUrl) {
        newUserData.avatarUrl = userInfo.avatarUrl;
      }
      if (userInfo.name) {
        newUserData.name = userInfo.name;
      }

      const { data: createdUser } = await models.users.create({
        data: newUserData
      });

      userResult = createdUser;
      message = "新用户注册成功";
    }

    // 5. 构造返回结果
    const responseUserInfo = {
      _id: userResult._id,
      userId: userResult.userId,
      nickName: userResult.nickName,
      avatarUrl: userResult.avatarUrl,
      phone: userResult.phone,
      isMember: userResult.isMember,
      isAdmin: userResult.isAdmin
    };

    return {
      userInfo: responseUserInfo,
      authStatus: true,
      message: message
    };

  } catch (error) {
    console.error("云函数执行错误:", error);
    
    return {
      userInfo: null,
      authStatus: false,
      message: "操作失败，请稍后重试",
      error: error.message || "UNKNOWN_ERROR"
    };
  }
}

module.exports = { main };
