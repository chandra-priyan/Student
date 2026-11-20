require('dotenv').config();
const connectDatabase = require('../config/db');
const Complaint = require('../models/Complaint');

async function seed() {
  await connectDatabase();
  if (await Complaint.exists({})) {
    console.log('Complaints already exist; no sample records were added.');
    return;
  }

  await Complaint.insertMany([
    {
      studentName: 'Aarav Sharma',
      department: 'Computer Science',
      category: 'Wi-Fi',
      description: 'The Wi-Fi connection in the engineering block is frequently disconnecting.',
    },
    {
      studentName: 'Maya Patel',
      department: 'Electrical Engineering',
      category: 'Classroom',
      description: 'Several ceiling lights in classroom E-204 are not working.',
      status: 'In Progress',
    },
    {
      studentName: 'Rohan Das',
      department: 'Mechanical Engineering',
      category: 'Laboratory Equipment',
      description: 'The digital caliper in the materials lab needs calibration.',
      status: 'Resolved',
    },
  ]);
  console.log('Three sample complaints added.');
}

seed()
  .catch((error) => {
    console.error('Unable to add sample complaints:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
