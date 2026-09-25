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

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Session.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('Creating Admin & Users...');

    // 1. Create Admin
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@skillsync.p2p',
      phone: '+1 800 555 0199',
      password: 'AdminPassword123!',
      role: 'admin',
      bio: 'Platform Administrator overseeing P2P Skill Exchange ecosystem.',
      location: 'New York, USA',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    });
    await Wallet.create({
      userId: adminUser._id,
      currentBalance: 1000,
      totalEarned: 0,
      totalSpent: 0
    });

    // 2. Create Regular Users
    const user1 = await User.create({
      firstName: 'Swapna',
      lastName: 'Khire',
      email: 'swapna@example.com',
      phone: '+1 555 0101',
      password: 'Password123!',
      bio: 'Senior CS student passionate about Full-Stack Web Development, React, and Python.',
      location: 'San Francisco, CA',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      interests: ['React', 'Node.js', 'UI/UX Design', 'Cloud Computing'],
      skillsToLearn: ['Machine Learning', 'French Language'],
      availability: [
        { day: 'Monday', startTime: '14:00', endTime: '18:00' },
        { day: 'Wednesday', startTime: '15:00', endTime: '19:00' },
        { day: 'Friday', startTime: '10:00', endTime: '14:00' },
        { day: 'Saturday', startTime: '11:00', endTime: '16:00' }
      ]
    });

    const user2 = await User.create({
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul@example.com',
      phone: '+1 555 0102',
      password: 'Password123!',
      bio: 'Data Science enthusiast and Python tutor. Love explaining algorithmic thinking clearly.',
      location: 'Austin, TX',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      interests: ['Python', 'Machine Learning', 'Data Structures', 'Statistics'],
      skillsToLearn: ['React', 'Figma Design'],
      availability: [
        { day: 'Tuesday', startTime: '13:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '15:00' }
      ]
    });

    const user3 = await User.create({
      firstName: 'Dishita',
      lastName: 'Rao',
      email: 'dishita@example.com',
      phone: '+1 555 0103',
      password: 'Password123!',
      bio: 'UI/UX Designer and Figma specialist. Creating delightful, accessible user journeys.',
      location: 'Seattle, WA',
      profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      interests: ['Figma', 'UI/UX', 'Graphic Design', 'Design Systems'],
      skillsToLearn: ['JavaScript', 'Backend Architecture'],
      availability: [
        { day: 'Monday', startTime: '16:00', endTime: '20:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
        { day: 'Sunday', startTime: '12:00', endTime: '16:00' }
      ]
    });

    const user4 = await User.create({
      firstName: 'Navya',
      lastName: 'Tiwari',
      email: 'navya@example.com',
      phone: '+1 555 0104',
      password: 'Password123!',
      bio: 'Fluent in French and Spanish. Native educator helping students master conversational fluency.',
      location: 'Boston, MA',
      profilePicture: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      interests: ['French', 'Spanish', 'Linguistics', 'World Literature'],
      skillsToLearn: ['Web Development', 'Digital Marketing'],
      availability: [
        { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
        { day: 'Friday', startTime: '14:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '13:00', endTime: '17:00' }
      ]
    });

    const user5 = await User.create({
      firstName: 'Pratiti',
      lastName: 'Patlia',
      email: 'pratiti@example.com',
      phone: '+1 555 0105',
      password: 'Password123!',
      bio: 'Public speaker, debater, and soft skills mentor. Empowering students to speak with confidence.',
      location: 'Chicago, IL',
      profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      interests: ['Public Speaking', 'Communication', 'Leadership', 'Debate'],
      skillsToLearn: ['Python', 'Data Analytics'],
      availability: [
        { day: 'Tuesday', startTime: '16:00', endTime: '20:00' },
        { day: 'Friday', startTime: '11:00', endTime: '15:00' }
      ]
    });

    // Create Initial Wallets
    const users = [user1, user2, user3, user4, user5];
    for (const u of users) {
      await Wallet.create({
        userId: u._id,
        currentBalance: 120,
        totalEarned: 30,
        totalSpent: 10
      });
      await Transaction.create({
        userId: u._id,
        type: 'INITIAL_BONUS',
        amount: 100,
        balanceAfter: 100,
        description: 'Welcome bonus of 100 credits',
        status: 'COMPLETED'
      });
    }

    console.log('Creating Skill Listings...');

    const skill1 = await Skill.create({
      userId: user1._id,
      title: 'Modern React & Full-Stack Development',
      category: 'Programming & Tech',
      level: 'Advanced',
      description: 'Hands-on mentorship in modern React (v18+), Hooks, Redux Toolkit, and RESTful API integration. Build real-world apps with clean architecture.',
      creditsPerHour: 15,
      tags: ['React', 'JavaScript', 'Redux', 'Frontend', 'Web Development'],
      isAvailableToTeach: true,
      isActive: true
    });

    const skill2 = await Skill.create({
      userId: user2._id,
      title: 'Python for Beginners & Data Science',
      category: 'Programming & Tech',
      level: 'Expert',
      description: 'Master core Python syntax, OOP, Pandas, NumPy, and basic Machine Learning models. Perfect for beginners and aspiring data scientists.',
      creditsPerHour: 20,
      tags: ['Python', 'Data Science', 'Pandas', 'Algorithms', 'Beginner Friendly'],
      isAvailableToTeach: true,
      isActive: true
    });

    const skill3 = await Skill.create({
      userId: user3._id,
      title: 'UI/UX Design Masterclass with Figma',
      category: 'Design & Creative',
      level: 'Advanced',
      description: 'Learn end-to-end UX research, wireframing, interactive prototyping, design systems, and developer handoff using Figma.',
      creditsPerHour: 15,
      tags: ['Figma', 'UI/UX', 'Design Systems', 'Wireframing', 'Creativity'],
      isAvailableToTeach: true,
      isActive: true
    });

    const skill4 = await Skill.create({
      userId: user4._id,
      title: 'Conversational French (A1 - B2 Level)',
      category: 'Languages',
      level: 'Expert',
      description: 'Practical French speaking practice focusing on pronunciation, everyday conversations, vocabulary, and grammar nuances.',
      creditsPerHour: 10,
      tags: ['French', 'Languages', 'Conversation', 'Grammar', 'DELF Prep'],
      isAvailableToTeach: true,
      isActive: true
    });

    const skill5 = await Skill.create({
      userId: user5._id,
      title: 'Confident Public Speaking & Pitching',
      category: 'Business & Marketing',
      level: 'Advanced',
      description: 'Overcome stage fright, master vocal modulation, structure compelling presentations, and deliver persuasive pitches with confidence.',
      creditsPerHour: 12,
      tags: ['Public Speaking', 'Communication', 'Pitching', 'Soft Skills'],
      isAvailableToTeach: true,
      isActive: true
    });

    const skill6 = await Skill.create({
      userId: user2._id,
      title: 'Data Structures & Algorithms in Python',
      category: 'Academics & Science',
      level: 'Intermediate',
      description: 'Deep dive into arrays, trees, graphs, sorting, and dynamic programming with step-by-step problem-solving techniques.',
      creditsPerHour: 18,
      tags: ['DSA', 'Python', 'Algorithms', 'Coding Interviews'],
      isAvailableToTeach: true,
      isActive: true
    });

    console.log('Creating Sessions...');

    // 1. A completed session between Swapna (learner) and Rahul (mentor for Python)
    const completedSessionDate = new Date();
    completedSessionDate.setDate(completedSessionDate.getDate() - 3);

    const completedSession = await Session.create({
      learnerId: user1._id,
      mentorId: user2._id,
      skillId: skill2._id,
      sessionDate: completedSessionDate,
      startTime: '14:00',
      endTime: '15:00',
      durationMinutes: 60,
      creditsExchanged: 20,
      notes: 'Covered Python lists, dict comprehensions, and introduction to Pandas DataFrames.',
      status: 'COMPLETED',
      mentorConfirmedCompletion: true,
      mentorConfirmedAt: completedSessionDate,
      learnerConfirmedCompletion: true,
      learnerConfirmedAt: completedSessionDate,
      completedAt: completedSessionDate,
      creditsTransferred: true
    });

    // Transfer transaction records for completed session
    await Transaction.create({
      userId: user1._id,
      sessionId: completedSession._id,
      type: 'SESSION_CREDIT_SPENT',
      amount: -20,
      balanceAfter: 100,
      description: 'Spent 20 credits for learning session: Python for Beginners & Data Science',
      status: 'COMPLETED'
    });

    await Transaction.create({
      userId: user2._id,
      sessionId: completedSession._id,
      type: 'SESSION_CREDIT_EARNED',
      amount: 20,
      balanceAfter: 140,
      description: 'Earned 20 credits for mentoring session: Python for Beginners & Data Science',
      status: 'COMPLETED'
    });

    // Create Review for completed session
    await Review.create({
      sessionId: completedSession._id,
      reviewerId: user1._id,
      reviewedUserId: user2._id,
      skillId: skill2._id,
      rating: 5,
      reviewText: 'Rahul was a fantastic mentor! Clear explanations, very patient with beginner questions, and provided great real-world code snippets.'
    });

    // Update Rahul's rating
    user2.rating = { average: 5.0, count: 1 };
    await user2.save();

    // 2. An accepted upcoming session between Dishita (learner) and Swapna (mentor for React)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 2);

    await Session.create({
      learnerId: user3._id,
      mentorId: user1._id,
      skillId: skill1._id,
      sessionDate: upcomingDate,
      startTime: '15:00',
      endTime: '16:00',
      durationMinutes: 60,
      creditsExchanged: 15,
      notes: 'Need help connecting Redux Toolkit async thunks to Express backend.',
      status: 'ACCEPTED',
      mentorConfirmedCompletion: false,
      learnerConfirmedCompletion: false
    });

    // 3. A pending requested session between Navya (learner) and Pratiti (mentor for Public Speaking)
    const pendingDate = new Date();
    pendingDate.setDate(pendingDate.getDate() + 4);

    await Session.create({
      learnerId: user4._id,
      mentorId: user5._id,
      skillId: skill5._id,
      sessionDate: pendingDate,
      startTime: '16:00',
      endTime: '17:00',
      durationMinutes: 60,
      creditsExchanged: 12,
      notes: 'Preparing for an upcoming conference presentation in English.',
      status: 'REQUESTED',
      mentorConfirmedCompletion: false,
      learnerConfirmedCompletion: false
    });

    console.log('Creating Notifications...');
    await Notification.create({
      userId: user1._id,
      type: 'SESSION_ACCEPTED',
      title: 'Upcoming Session with Dishita',
      message: 'You have an accepted mentoring session for "Modern React" scheduled in 2 days.',
      relatedUserId: user3._id
    });

    await Notification.create({
      userId: user2._id,
      type: 'REVIEW_RECEIVED',
      title: 'New 5-Star Review Received!',
      message: 'Swapna Khire gave you a 5-star review for Python tutoring.',
      relatedUserId: user1._id
    });

    await Notification.create({
      userId: user5._id,
      type: 'SESSION_REQUESTED',
      title: 'New Session Request',
      message: 'Navya Tiwari requested a session for "Confident Public Speaking".',
      relatedUserId: user4._id
    });

    console.log('Creating Demo Reports...');
    await Report.create({
      reporterId: user3._id,
      reportedUserId: user4._id,
      reportType: 'DISPUTE',
      reason: 'Session scheduling discrepancy test',
      description: 'This is a sample test report showing how platform disputes and flagged issues are displayed in the admin moderation dashboard.',
      status: 'PENDING'
    });

    console.log('====================================================');
    console.log(' Database Seed Completed Successfully!              ');
    console.log('====================================================');
    console.log(' Admin Credentials:                                 ');
    console.log('   Email:    admin@skillsync.p2p                    ');
    console.log('   Password: AdminPassword123!                      ');
    console.log('----------------------------------------------------');
    console.log(' Demo User Credentials:                             ');
    console.log('   1. swapna@example.com   / Password123!           ');
    console.log('   2. rahul@example.com    / Password123!           ');
    console.log('   3. dishita@example.com  / Password123!           ');
    console.log('   4. navya@example.com    / Password123!           ');
    console.log('   5. pratiti@example.com  / Password123!           ');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed Database Error:', error);
    process.exit(1);
  }
};

seedDB();
