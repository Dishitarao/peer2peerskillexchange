import api from './api';

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, confirmPassword) =>
    api.post(`/auth/reset-password/${token}`, { password, confirmPassword })
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updateAvailability: (availability) => api.put('/users/availability', { availability }),
  getMentorProfile: (mentorId) => api.get(`/users/mentors/${mentorId}`)
};

export const skillAPI = {
  getCategories: () => api.get('/skills/categories'),
  getTrendingSkills: () => api.get('/skills/trending'),
  getRecommendations: () => api.get('/skills/recommendations'),
  searchSkills: (params) => api.get('/skills/search', { params }),
  getMySkills: () => api.get('/skills/my-skills'),
  getSkillById: (skillId) => api.get(`/skills/${skillId}`),
  createSkill: (skillData) => api.post('/skills', skillData),
  updateSkill: (skillId, skillData) => api.put(`/skills/${skillId}`, skillData),
  deleteSkill: (skillId) => api.delete(`/skills/${skillId}`)
};

export const sessionAPI = {
  requestSession: (data) => api.post('/sessions/request', data),
  getUpcomingSessions: () => api.get('/sessions/upcoming'),
  getIncomingRequests: () => api.get('/sessions/requests/incoming'),
  getOutgoingRequests: () => api.get('/sessions/requests/outgoing'),
  getMySessions: (params) => api.get('/sessions/my-sessions', { params }),
  getSessionById: (sessionId) => api.get(`/sessions/${sessionId}`),
  acceptSession: (sessionId) => api.put(`/sessions/${sessionId}/accept`),
  rejectSession: (sessionId, reason) => api.put(`/sessions/${sessionId}/reject`, { reason }),
  cancelSession: (sessionId, reason) => api.put(`/sessions/${sessionId}/cancel`, { reason }),
  rescheduleSession: (sessionId, data) => api.put(`/sessions/${sessionId}/reschedule`, data),
  confirmCompletion: (sessionId) => api.put(`/sessions/${sessionId}/confirm-completion`)
};

export const walletAPI = {
  getWallet: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  verifyBalance: (amount) => api.get(`/wallet/verify-balance/${amount}`)
};

export const reviewAPI = {
  submitReview: (data) => api.post('/reviews', data),
  getReviewsForUser: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getSessionReviewStatus: (sessionId) => api.get(`/reviews/session/${sessionId}/status`)
};

export const notificationAPI = {
  getMyNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

export const reportAPI = {
  createReport: (reportData) => api.post('/reports', reportData)
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (userId, reason) => api.put(`/admin/users/${userId}/suspend`, { reason }),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
  getAllSkills: (params) => api.get('/admin/skills', { params }),
  moderateSkill: (skillId, isActive, reason) =>
    api.put(`/admin/skills/${skillId}/moderate`, { isActive, reason }),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (reportId, data) => api.put(`/admin/reports/${reportId}/resolve`, data),
  getAllTransactions: (params) => api.get('/admin/transactions', { params }),
  adjustWallet: (data) => api.post('/admin/wallet/adjust', data)
};
