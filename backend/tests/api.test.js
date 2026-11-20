require('dotenv').config();
const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const createApp = require('../app');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');

const databaseName = `smart_campus_test_${process.pid}`;
const app = createApp();
let token;
let createdComplaintId;

before(async () => {
  const uri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus')
    .replace(/\/[^/?]+(\?.*)?$/, `/${databaseName}$1`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await Promise.all([Admin.init(), Complaint.init()]);
  await Admin.create({
    email: 'test-admin@campus.example',
    passwordHash: await bcrypt.hash('test-password-123', 4),
  });
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('health endpoint confirms the MongoDB connection', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.database, 'connected');
});

test('complaints validate submission, generate IDs, and protect public tracking details', async () => {
  await request(app).post('/api/complaints').send({
    studentName: 'Aarav Sharma',
    department: 'Computer Science',
    category: 'Wi-Fi',
    description: 'The Wi-Fi in the library has been unavailable this morning.',
  }).expect(201).then((response) => {
    createdComplaintId = response.body.complaint.complaintId;
    assert.match(createdComplaintId, /^SC-\d{4}-[A-F0-9]{8}$/);
    assert.equal(response.body.complaint.status, 'Pending');
  });

  const tracked = await request(app).get(`/api/complaints/track/${createdComplaintId}`).expect(200);
  assert.equal(tracked.body.complaint.status, 'Pending');
  assert.equal('studentName' in tracked.body.complaint, false);
  await request(app).patch(`/api/complaints/${createdComplaintId}/status`)
    .send({ status: 'Resolved' }).expect(401);

  await request(app).get('/api/complaints/track/SC-2026-00000000').expect(404);
  await request(app).post('/api/complaints').send({
    studentName: 'A',
    department: 'Computer Science',
    category: 'Not a category',
    description: 'Short',
  }).expect(400);
});

test('admin login, protected CRUD, filters, and statistics work', async () => {
  await request(app).post('/api/auth/login').send({
    email: 'test-admin@campus.example',
    password: 'wrong-password',
  }).expect(401);

  const login = await request(app).post('/api/auth/login').send({
    email: 'test-admin@campus.example',
    password: 'test-password-123',
  }).expect(200);
  token = login.body.token;

  await request(app).get('/api/complaints').expect(401);
  await request(app).get('/api/complaints').set('Authorization', `Bearer ${token}`)
    .query({ status: 'Pending', category: 'Wi-Fi' }).expect(200)
    .then((response) => assert.equal(response.body.complaints.length, 1));

  await request(app).patch(`/api/complaints/${createdComplaintId}/status`)
    .set('Authorization', `Bearer ${token}`).send({ status: 'Resolved' }).expect(200);
  await request(app).get('/api/complaints/stats').set('Authorization', `Bearer ${token}`)
    .expect(200).then((response) => {
      assert.equal(response.body.total, 1);
      assert.equal(response.body.resolved, 1);
    });
  await request(app).get(`/api/complaints/${createdComplaintId}`)
    .set('Authorization', `Bearer ${token}`).expect(200);
  await request(app).delete(`/api/complaints/${createdComplaintId}`)
    .set('Authorization', `Bearer ${token}`).expect(200);
  await request(app).get(`/api/complaints/track/${createdComplaintId}`).expect(404);
});

test('duplicate IDs are rejected and malformed filters are validated', async () => {
  const duplicate = {
    complaintId: 'SC-2026-DEADBEEF',
    studentName: 'First Student',
    department: 'Computer Science',
    category: 'Classroom',
    description: 'The classroom door does not close properly.',
  };
  await Complaint.create(duplicate);
  await assert.rejects(Complaint.create(duplicate), { code: 11000 });

  await request(app).get('/api/complaints?status={$ne:Pending}')
    .set('Authorization', `Bearer ${token}`).expect(400);
});
