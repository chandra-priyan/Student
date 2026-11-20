const Complaint = require('../models/Complaint');

function isDuplicateKey(error) {
  return error && error.code === 11000;
}

async function createComplaint(req, res, next) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const complaint = await Complaint.create(req.body);
      return res.status(201).json({
        message: 'Your complaint has been submitted.',
        complaint: {
          complaintId: complaint.complaintId,
          category: complaint.category,
          status: complaint.status,
          createdAt: complaint.createdAt,
        },
      });
    } catch (error) {
      if (!isDuplicateKey(error) || attempt === 2) {
        return next(error);
      }
    }
  }
}

async function trackComplaint(req, res) {
  const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
    .select('complaintId category status createdAt updatedAt');

  if (!complaint) {
    return res.status(404).json({ message: 'No complaint was found with that ID.' });
  }
  return res.json({ complaint });
}

async function listComplaints(req, res) {
  const { q, category, status, page, limit } = req.validatedQuery;
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { complaintId: { $regex: escaped, $options: 'i' } },
      { studentName: { $regex: escaped, $options: 'i' } },
    ];
  }

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);
  return res.json({ complaints, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function getComplaint(req, res) {
  const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' });
  }
  return res.json({ complaint });
}

async function updateComplaintStatus(req, res) {
  const complaint = await Complaint.findOneAndUpdate(
    { complaintId: req.params.complaintId },
    { $set: { status: req.body.status } },
    { new: true, runValidators: true }
  );

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' });
  }
  return res.json({ message: 'Complaint status updated.', complaint });
}

async function deleteComplaint(req, res) {
  const complaint = await Complaint.findOneAndDelete({ complaintId: req.params.complaintId });
  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' });
  }
  return res.json({ message: 'Complaint deleted.' });
}

async function getStatistics(req, res) {
  const [total, grouped] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(grouped.map(({ _id, count }) => [_id, count]));
  return res.json({
    total,
    pending: counts.Pending || 0,
    inProgress: counts['In Progress'] || 0,
    resolved: counts.Resolved || 0,
  });
}

module.exports = {
  createComplaint,
  trackComplaint,
  listComplaints,
  getComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getStatistics,
};
