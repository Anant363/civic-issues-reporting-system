import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Garbage Overflow',
        'Road Damage',
        'Water Leakage',
        'Street Light',
        'Sewage Problem',
        'Park Maintenance',
        'Noise Pollution',
        'Other',
      ],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    // reportedBy is null for anonymous reports
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // isAnonymous = true means the user chose to hide identity publicly
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Admin approval flow
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    // Rejection flag — separate from isApproved so we can distinguish pending vs rejected
    isRejected: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Index for faster public queries
issueSchema.index({ isApproved: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1 });

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
