import Issue from '../models/Issue.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (logged-in users only)
export const createIssue = asyncHandler(async (req, res) => {
  const { title, description, category, location, imageUrl, isAnonymous } = req.body;

  if (!title || !description || !category || !location) {
    res.status(400);
    throw new Error('Please provide title, description, category, and location');
  }

  const issue = await Issue.create({
    title,
    description,
    category,
    location,
    imageUrl: imageUrl || '',
    // Always store the actual user ID for personal dashboard tracking
    reportedBy: req.user._id,
    // isAnonymous hides the identity on the public board
    isAnonymous: isAnonymous || false,
  });

  res.status(201).json({
    success: true,
    message: 'Issue reported successfully. It will be visible after admin approval.',
    data: issue,
  });
});

// @desc    Get all approved public issues
// @route   GET /api/issues/public
// @access  Public
export const getPublicIssues = asyncHandler(async (req, res) => {
  const { category, status, page = 1, limit = 10 } = req.query;

  const filter = { isApproved: true, isRejected: false };
  if (category) filter.category = category;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Issue.countDocuments(filter);

  const issues = await Issue.find(filter)
    .populate({
      path: 'reportedBy',
      select: 'name',
      // If anonymous, we populate but the controller strips the name below
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Strip reporter identity for anonymous issues
  const sanitized = issues.map((issue) => {
    const obj = issue.toObject();
    if (obj.isAnonymous) {
      obj.reportedBy = null;
      obj.reporterName = 'Anonymous';
    } else {
      obj.reporterName = obj.reportedBy ? obj.reportedBy.name : 'Unknown';
    }
    return obj;
  });

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: sanitized,
  });
});

// @desc    Get issues reported by the logged-in user (including anonymous ones)
// @route   GET /api/issues/my
// @access  Private
export const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ reportedBy: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    total: issues.length,
    data: issues,
  });
});

// @desc    Get a single issue by ID
// @route   GET /api/issues/:id
// @access  Public (only approved) / Private (owner or admin can see all)
export const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id).populate(
    'reportedBy',
    'name email'
  );

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Non-admin and non-owner can only see approved issues
  const isOwner =
    req.user && issue.reportedBy && issue.reportedBy._id.equals(req.user._id);
  const isAdmin = req.user && req.user.role === 'admin';

  if (!issue.isApproved && !isOwner && !isAdmin) {
    res.status(403);
    throw new Error('This issue is not yet publicly available');
  }

  res.status(200).json({ success: true, data: issue });
});

// ---------------------------------------------------------------------------
// ADMIN ONLY CONTROLLERS
// ---------------------------------------------------------------------------

// @desc    Get ALL issues (pending, approved, rejected) — admin view
// @route   GET /api/issues/admin/all
// @access  Private/Admin
export const getAllIssuesAdmin = asyncHandler(async (req, res) => {
  const { status, isApproved, isRejected, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (isRejected !== undefined) filter.isRejected = isRejected === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Issue.countDocuments(filter);

  const issues = await Issue.find(filter)
    .populate('reportedBy', 'name email')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: issues,
  });
});

// @desc    Approve an issue
// @route   PATCH /api/issues/:id/approve
// @access  Private/Admin
export const approveIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  issue.isApproved = true;
  issue.isRejected = false;
  issue.rejectionReason = '';
  issue.approvedBy = req.user._id;
  await issue.save();

  res.status(200).json({
    success: true,
    message: 'Issue approved successfully',
    data: issue,
  });
});

// @desc    Reject an issue
// @route   PATCH /api/issues/:id/reject
// @access  Private/Admin
export const rejectIssue = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  issue.isApproved = false;
  issue.isRejected = true;
  issue.rejectionReason = reason || 'Does not meet submission guidelines';
  await issue.save();

  res.status(200).json({
    success: true,
    message: 'Issue rejected',
    data: issue,
  });
});

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private/Admin
export const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'In Progress', 'Resolved'];

  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  if (!issue.isApproved) {
    res.status(400);
    throw new Error('Cannot update status of an unapproved issue');
  }

  issue.status = status;
  await issue.save();

  res.status(200).json({
    success: true,
    message: `Issue status updated to "${status}"`,
    data: issue,
  });
});

// @desc    Delete an issue (admin)
// @route   DELETE /api/issues/:id
// @access  Private/Admin
export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findByIdAndDelete(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  res.status(200).json({
    success: true,
    message: 'Issue deleted successfully',
  });
});

// @desc    Get dashboard statistics for admin
// @route   GET /api/issues/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  const [total, pending, approved, rejected, inProgress, resolved] =
    await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ isApproved: false, isRejected: false }),
      Issue.countDocuments({ isApproved: true }),
      Issue.countDocuments({ isRejected: true }),
      Issue.countDocuments({ isApproved: true, status: 'In Progress' }),
      Issue.countDocuments({ isApproved: true, status: 'Resolved' }),
    ]);

  // Category breakdown
  const categoryStats = await Issue.aggregate([
    { $match: { isApproved: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      approved,
      rejected,
      inProgress,
      resolved,
      categoryStats,
    },
  });
});
