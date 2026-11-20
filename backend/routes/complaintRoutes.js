const express = require('express');
const { z } = require('zod');
const {
  createComplaint,
  trackComplaint,
  listComplaints,
  getComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getStatistics,
} = require('../controllers/complaintController');
const Complaint = require('../models/Complaint');
const requireAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const complaintId = z.string().regex(/^SC-\d{4}-[A-F0-9]{8}$/i);
const submitSchema = z.object({
  studentName: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  category: z.enum(Complaint.CATEGORIES),
  description: z.string().trim().min(10).max(3000),
}).strict();
const statusSchema = z.object({
  status: z.enum(Complaint.STATUSES),
}).strict();
const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(Complaint.CATEGORIES).optional(),
  status: z.enum(Complaint.STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
const idParamsSchema = z.object({ complaintId }).strict();

router.post('/', validate(submitSchema), asyncHandler(createComplaint));
router.get('/track/:complaintId', validate(idParamsSchema, 'params'), asyncHandler(trackComplaint));
router.get('/', requireAdmin, validate(listSchema, 'query'), asyncHandler(listComplaints));
router.get('/stats', requireAdmin, asyncHandler(getStatistics));
router.get('/:complaintId', requireAdmin, validate(idParamsSchema, 'params'), asyncHandler(getComplaint));
router.patch(
  '/:complaintId/status',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(statusSchema),
  asyncHandler(updateComplaintStatus)
);
router.delete('/:complaintId', requireAdmin, validate(idParamsSchema, 'params'), asyncHandler(deleteComplaint));

module.exports = router;
