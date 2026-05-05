import api from './api';

export const issueService = {
  // Public
  getPublicIssues: (params) => api.get('/issues/public', { params }),

  // Authenticated user
  createIssue: (data) => api.post('/issues', data),
  getMyIssues: () => api.get('/issues/my'),
  getIssueById: (id) => api.get(`/issues/${id}`),

  // Admin
  getAllIssuesAdmin: (params) => api.get('/issues/admin/all', { params }),
  getAdminStats: () => api.get('/issues/admin/stats'),
  approveIssue: (id) => api.patch(`/issues/${id}/approve`),
  rejectIssue: (id, reason) => api.patch(`/issues/${id}/reject`, { reason }),
  updateIssueStatus: (id, status) => api.patch(`/issues/${id}/status`, { status }),
  deleteIssue: (id) => api.delete(`/issues/${id}`),
};
