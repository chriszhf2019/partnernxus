// ─── API 请求封装 ──────────────────────────────────
const app = getApp();

const request = (url, method = 'GET', data = {}) => app.request(url, method, data);

// ─── 活动相关 ──────────────────────────────────────
const eventAPI = {
  // 获取活动列表
  list: (params = {}) => request('/events', 'GET', params),
  // 获取活动详情
  detail: (eventId) => request(`/events/${eventId}`),
  // 报名
  register: (eventId) => request(`/events/${eventId}/register`, 'POST'),
  // 签到
  checkin: (eventId, location) => request(`/events/${eventId}/checkin`, 'POST', { location }),
  // 提问
  askQuestion: (eventId, content, isAnonymous = false) =>
    request(`/events/${eventId}/questions`, 'POST', { content, isAnonymous }),
  // 获取提问列表
  questions: (eventId) => request(`/events/${eventId}/questions`),
  // 抽奖
  lottery: (eventId) => request(`/events/${eventId}/lottery`, 'POST'),
  // 设置提醒
  setReminder: (eventId) => request(`/events/${eventId}/reminder`, 'POST'),
};

// ─── 积分相关 ──────────────────────────────────────
const scoreAPI = {
  // 我的积分
  myScore: () => request('/scores/mine'),
  // 积分明细
  history: (page = 1) => request('/scores/history', 'GET', { page }),
  // 积分排行榜
  leaderboard: (eventId) => request(`/scores/leaderboard/${eventId}`),
};

// ─── 兑换相关 ──────────────────────────────────────
const storeAPI = {
  // 礼品列表
  gifts: () => request('/store/gifts'),
  // 兑换礼品
  redeem: (giftId) => request('/store/redeem', 'POST', { giftId }),
  // 兑换记录
  orders: () => request('/store/orders'),
};

// ─── 用户相关 ──────────────────────────────────────
const userAPI = {
  // 获取用户资料
  profile: () => request('/user/profile'),
  // 更新用户资料
  updateProfile: (data) => request('/user/profile', 'PUT', data),
  // 绑定公司
  bindCompany: (companyId) => request('/user/bind-company', 'POST', { companyId }),
};

// ─── 分享相关 ──────────────────────────────────────
const shareAPI = {
  // 生成分享链接
  generateLink: (eventId) => request('/share/generate', 'POST', { eventId }),
  // 记录分享
  recordShare: (eventId, shareId) => request('/share/record', 'POST', { eventId, shareId }),
};

module.exports = { eventAPI, scoreAPI, storeAPI, userAPI, shareAPI };
