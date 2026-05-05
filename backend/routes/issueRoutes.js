import express from 'express';
import {
  createIssue,
  getPublicIssues,
  getMyIssues,
  getIssueById,
  getAllIssuesAdmin,
  approveIssue,
  rejectIssue,
  updateIssueStatus,
  deleteIssue,
  getAdminStats,
} from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// ---- Public ----
router.get('/public', getPublicIssues);

// ---- Authenticated citizen ----
router.post('/', protect, createIssue);
router.get('/my', protect, getMyIssues);

// ---- Admin only ----
router.get('/admin/all', protect, adminMiddleware, getAllIssuesAdmin);
router.get('/admin/stats', protect, adminMiddleware, getAdminStats);
router.patch('/:id/approve', protect, adminMiddleware, approveIssue);
router.patch('/:id/reject', protect, adminMiddleware, rejectIssue);
router.patch('/:id/status', protect, adminMiddleware, updateIssueStatus);
router.delete('/:id', protect, adminMiddleware, deleteIssue);

// ---- Single issue (must be last to avoid catching /my, /admin/*, etc.) ----
router.get('/:id', getIssueById);

export default router;
