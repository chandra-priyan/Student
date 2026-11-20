const mongoose = require('mongoose');
const { randomBytes } = require('node:crypto');

const CATEGORIES = [
  'Classroom',
  'Projector',
  'Wi-Fi',
  'Drinking Water',
  'Laboratory Equipment',
  'Washroom',
  'Hostel Maintenance',
  'Others',
];

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
      default: () => `SC-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`,
    },
    studentName: { type: String, required: true, trim: true, maxlength: 100 },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: CATEGORIES },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: STATUSES, default: 'Pending' },
  },
  { timestamps: true, versionKey: false }
);

complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ studentName: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
