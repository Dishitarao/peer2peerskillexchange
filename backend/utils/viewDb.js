const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const config = require('../config/config');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const viewDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('\n=============================================================');
    console.log(`  MONGODB DATABASE: ${mongoose.connection.name.toUpperCase()}`);
    console.log(`  HOST: ${mongoose.connection.host}`);
    console.log('=============================================================\n');

    // 1. Users
    const users = await User.find().select('firstName lastName email role rating isSuspended');
    console.log(`📌 USERS COLLECTION (${users.length} documents):`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString().slice(-6),
        Name: `${u.firstName} ${u.lastName}`,
        Email: u.email,
        Role: u.role,
        Rating: `${u.rating?.average || 0}★ (${u.rating?.count || 0})`,
        Suspended: u.isSuspended ? 'YES' : 'NO'
      }))
    );

    // 2. Wallets
    const wallets = await Wallet.find().populate('userId', 'firstName lastName');
    console.log(`\n💳 WALLETS COLLECTION (${wallets.length} documents):`);
    console.table(
      wallets.map((w) => ({
        User: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'N/A',
        'Current Balance': `${w.currentBalance} cr`,
        'Total Earned': `+${w.totalEarned} cr`,
        'Total Spent': `-${w.totalSpent} cr`
      }))
    );

    // 3. Skills
    const skills = await Skill.find().populate('userId', 'firstName lastName');
    console.log(`\n📚 SKILLS COLLECTION (${skills.length} documents):`);
    console.table(
      skills.map((s) => ({
        ID: s._id.toString().slice(-6),
        Title: s.title.length > 25 ? s.title.slice(0, 22) + '...' : s.title,
        Category: s.category,
        Level: s.level,
        Credits: `${s.creditsPerHour} cr`,
        Mentor: s.userId ? `${s.userId.firstName} ${s.userId.lastName}` : 'N/A',
        Active: s.isActive ? 'YES' : 'NO'
      }))
    );

    // 4. Sessions
    const sessions = await Session.find()
      .populate('learnerId', 'firstName lastName')
      .populate('mentorId', 'firstName lastName')
      .populate('skillId', 'title');
    console.log(`\n🗓️  SESSIONS COLLECTION (${sessions.length} documents):`);
    console.table(
      sessions.map((s) => ({
        ID: s._id.toString().slice(-6),
        Skill: s.skillId?.title?.slice(0, 20) || 'N/A',
        Learner: s.learnerId?.firstName || 'N/A',
        Mentor: s.mentorId?.firstName || 'N/A',
        Status: s.status,
        'Mentor Confirmed': s.mentorConfirmedCompletion ? '✓' : '✗',
        'Learner Confirmed': s.learnerConfirmedCompletion ? '✓' : '✗',
        'Credits Transferred': s.creditsTransferred ? '✓' : '✗'
      }))
    );

    // 5. Transactions
    const transactions = await Transaction.find().populate('userId', 'firstName lastName').limit(10);
    console.log(`\n💰 TRANSACTIONS LEDGER (Showing latest ${transactions.length}):`);
    console.table(
      transactions.map((t) => ({
        User: t.userId?.firstName || 'N/A',
        Type: t.type,
        Amount: t.amount > 0 ? `+${t.amount}` : `${t.amount}`,
        'Balance After': `${t.balanceAfter} cr`,
        Description: t.description.slice(0, 35) + '...'
      }))
    );

    // 6. Reviews & Reports
    const reviewsCount = await Review.countDocuments();
    const notifsCount = await Notification.countDocuments();
    const reportsCount = await Report.countDocuments();
    console.log('\n📊 OTHER COLLECTIONS SUMMARY:');
    console.table([
      { Collection: 'Reviews', TotalDocuments: reviewsCount },
      { Collection: 'Notifications', TotalDocuments: notifsCount },
      { Collection: 'Reports & Disputes', TotalDocuments: reportsCount }
    ]);

    console.log('=============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error viewing database:', error);
    process.exit(1);
  }
};

viewDatabase();
