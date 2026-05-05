/**
 * Seed script — creates admin user, sample citizen, and sample issues.
 * Run: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Issue from './models/Issue.js';
import connectDB from './config/db.js';

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Issue.deleteMany();
  console.log('🧹 Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@civicpulse.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create citizen
  const citizen = await User.create({
    name: 'Rahul Sharma',
    email: 'citizen@example.com',
    password: 'citizen123',
    role: 'citizen',
  });

  const citizen2 = await User.create({
    name: 'Priya Mehta',
    email: 'priya@example.com',
    password: 'priya123',
    role: 'citizen',
  });

  console.log('👤 Users created');

  // Sample issues
  const issues = [
    {
      title: 'Overflowing garbage bin near Main Market',
      description: 'The garbage bin at the entrance of Main Market has been overflowing for 3 days. It is causing a bad smell and attracting stray dogs.',
      category: 'Garbage Overflow',
      location: 'Main Market, Sector 14, Gurugram',
      reportedBy: citizen._id,
      isAnonymous: false,
      isApproved: true,
      approvedBy: admin._id,
      status: 'Pending',
    },
    {
      title: 'Large pothole on NH-48',
      description: 'A massive pothole has formed on NH-48 near the petrol pump. It is causing accidents and damage to vehicles.',
      category: 'Road Damage',
      location: 'NH-48, near HP Petrol Pump, Gurugram',
      reportedBy: citizen._id,
      isAnonymous: true,
      isApproved: true,
      approvedBy: admin._id,
      status: 'In Progress',
    },
    {
      title: 'Water pipeline burst in residential colony',
      description: 'A water pipeline has burst on Street No. 5, causing water to flood the road. Residents are facing water shortage.',
      category: 'Water Leakage',
      location: 'Street No. 5, DLF Phase 2, Gurugram',
      reportedBy: citizen2._id,
      isAnonymous: false,
      isApproved: true,
      approvedBy: admin._id,
      status: 'Resolved',
    },
    {
      title: 'Street lights not working for 2 weeks',
      description: 'Multiple street lights on the main road connecting Sector 10 to Sector 12 are non-functional, making the area unsafe at night.',
      category: 'Street Light',
      location: 'Sector 10-12 Connector Road, Gurugram',
      reportedBy: citizen2._id,
      isAnonymous: false,
      isApproved: true,
      approvedBy: admin._id,
      status: 'Pending',
    },
    {
      title: 'Sewage overflow on public road',
      description: 'The sewage drain is overflowing near the bus stop causing unhygienic conditions. People are unable to walk on the footpath.',
      category: 'Sewage Problem',
      location: 'Bus Stop near Civil Hospital, Gurugram',
      reportedBy: citizen._id,
      isAnonymous: false,
      isApproved: false,  // Still awaiting approval
      status: 'Pending',
    },
    {
      title: 'Park benches broken and maintenance needed',
      description: 'Most benches in the community park are broken. The garden area is also not maintained. Children play area is unsafe.',
      category: 'Park Maintenance',
      location: 'Sector 23 Community Park, Gurugram',
      reportedBy: citizen2._id,
      isAnonymous: true,
      isApproved: false,  // Awaiting approval
      status: 'Pending',
    },
  ];

  await Issue.insertMany(issues);
  console.log('Sample issues created');
  console.log('\nSeeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@civicpulse.com / admin123');
  console.log('Citizen: citizen@example.com  / citizen123');
  console.log('Citizen: priya@example.com    / priya123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
