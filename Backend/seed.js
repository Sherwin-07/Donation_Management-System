/*
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Donation = require('./src/models/Donation');

dotenv.config();

// ── Sample Data Pools ──────────────────────────────────────────────────────────

const donorNames = [
  'Aarav Sharma',     'Priya Nair',       'Rohan Mehta',      'Sneha Iyer',
  'Vikram Patel',     'Kavya Krishnan',   'Arjun Reddy',      'Divya Menon',
  'Rahul Gupta',      'Ananya Das',       'Kiran Joshi',      'Meera Pillai',
  'Siddharth Rao',    'Pooja Verma',      'Aditya Kumar',     'Lakshmi Nair',
  'Manish Singh',     'Sunita Chawla',    'Deepak Pandey',    'Ritu Agarwal',
  'Amit Tiwari',      'Preethi Suresh',   'Nikhil Kapoor',    'Swati Mishra',
  'Gaurav Bhatia',    'Nandini Pillai',   'Rajesh Khanna',    'Isha Malhotra',
  'Suresh Babu',      'Anjali Rajan',     'Harish Menon',     'Pallavi Deshpande',
  'Vinod Choudhary',  'Smitha Rao',       'Arvind Saxena',    'Geeta Nambiar',
  'Naveen Thomas',    'Rekha Srinivasan', 'Pradeep Ghosh',    'Varsha Kulkarni',
  'Shankar Murthy',   'Usha Ramachandran','Dinesh Sethi',     'Lalitha Bose',
  'Ranjit Kumar',     'Champa Devi',      'Mohan Lal',        'Sheela Joseph',
  'Prakash Pillai',   'Geetha Subramanian',
];

const donationTypes  = ['Monthly', 'One Time', 'Annual', 'Festival', 'In-Kind'];
const paymentMethods = ['Online', 'UPI', 'Cash', 'Cheque', 'Bank Transfer'];
const statuses       = ['Pending', 'Completed', 'Rejected', 'Cancelled'];

// Status weight: mostly Completed and Pending
const statusWeights = [
  ...Array(20).fill('Completed'),
  ...Array(15).fill('Pending'),
  ...Array(8).fill('Rejected'),
  ...Array(7).fill('Cancelled'),
];

// Amount ranges per type
const amountRanges = {
  'Monthly':  { min: 100,  max: 2000  },
  'One Time': { min: 500,  max: 10000 },
  'Annual':   { min: 1000, max: 25000 },
  'Festival': { min: 200,  max: 5000  },
  'In-Kind':  { min: 50,   max: 1000  },
};

// ── Utility Helpers ────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randPhone = () => {
  const prefixes = ['98', '97', '96', '95', '94', '93', '90', '87', '86', '85'];
  return pick(prefixes) + String(randInt(10000000, 99999999));
};

// Random date between Jan 2024 and today
const randDate = () => {
  const start = new Date('2024-01-01').getTime();
  const end   = new Date().getTime();
  return new Date(start + Math.random() * (end - start));
};

// Build email from name
const makeEmail = (name, index) => {
  const clean = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'];
  return `${clean}${index}@${pick(domains)}`;
};

// ── Build 50 Donations ─────────────────────────────────────────────────────────

const buildDonations = () => {
  return donorNames.map((name, i) => {
    const donationType   = pick(donationTypes);
    const range          = amountRanges[donationType];
    const donationAmount = randInt(range.min, range.max);

    return {
      donorName:      name,
      email:          makeEmail(name, i + 1),
      phone:          randPhone(),
      donationAmount,
      donationType,
      paymentMethod:  pick(paymentMethods),
      donationDate:   randDate(),
      currentStatus:  pick(statusWeights),
    };
  });
};

// ── Seed Function ──────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    const deleted = await Donation.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing donation(s)`);

    // Insert 50 sample donations
    const donations = buildDonations();
    const inserted  = await Donation.insertMany(donations);
    console.log(`Successfully seeded ${inserted.length} donations!\n`);

    // Summary breakdown
    const typeCounts = {};
    const statusCounts = {};
    inserted.forEach((d) => {
      typeCounts[d.donationType]    = (typeCounts[d.donationType]    || 0) + 1;
      statusCounts[d.currentStatus] = (statusCounts[d.currentStatus] || 0) + 1;
    });

    console.log('Breakdown by Donation Type:');
    Object.entries(typeCounts).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

    console.log('\nBreakdown by Status:');
    Object.entries(statusCounts).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

    const total = inserted.reduce((sum, d) => sum + d.donationAmount, 0);
    console.log(`\nTotal Seeded Amount: ₹${total.toLocaleString('en-IN')}`);

    console.log('\nDone! Database is ready.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
