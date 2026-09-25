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

const authService = require('../services/authService');
const skillService = require('../services/skillService');
const sessionService = require('../services/sessionService');
const walletService = require('../services/walletService');
const reviewService = require('../services/reviewService');
const reportService = require('../services/reportService');
const adminService = require('../services/adminService');

const runTests = async () => {
  console.log('====================================================');
  console.log(' STARTING END-TO-END INTEGRATION TEST SUITE          ');
  console.log('====================================================');

  await mongoose.connect(config.mongoUri);

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // TEST 1: User Registration with Welcome Bonus Wallet
    console.log('\n[1] Testing User Registration & Wallet Initialization...');
    const testLearnerEmail = `learner_test_${Date.now()}@example.com`;
    const testMentorEmail = `mentor_test_${Date.now()}@example.com`;

    const learnerReg = await authService.register({
      firstName: 'Alice',
      lastName: 'Learner',
      email: testLearnerEmail,
      phone: '+1 555 9901',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: 'Enthusiastic beginner student.',
      skillsToLearn: ['TypeScript', 'Data Science']
    });

    assert(learnerReg.token, 'Registration returns JWT auth token');
    assert(learnerReg.user.walletBalance === 100, 'New user receives 100 initial bonus credits');

    const mentorReg = await authService.register({
      firstName: 'Bob',
      lastName: 'Mentor',
      email: testMentorEmail,
      phone: '+1 555 9902',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: 'Experienced TypeScript and React instructor.'
    });

    // TEST 2: User Login
    console.log('\n[2] Testing Authentication Login...');
    const loginRes = await authService.login(testLearnerEmail, 'Password123!');
    assert(loginRes.token && loginRes.user.email === testLearnerEmail, 'Login successfully authenticates valid user');

    // TEST 3: Skill Creation & Search
    console.log('\n[3] Testing Skill Listing & Search Filtering...');
    const skill = await skillService.createSkill(mentorReg.user.id, {
      title: 'Advanced TypeScript Architecture',
      category: 'Programming & Tech',
      level: 'Advanced',
      description: 'Master generics, utility types, and AST transformations.',
      creditsPerHour: 25,
      tags: ['TypeScript', 'JavaScript', 'Architecture']
    });
    assert(skill.title === 'Advanced TypeScript Architecture', 'Mentor can list a new teaching skill');

    const searchResults = await skillService.searchSkills({ search: 'TypeScript' });
    assert(searchResults.skills.some((s) => s._id.toString() === skill._id.toString()), 'Skill is discoverable via keyword search');

    // TEST 4: Session Request & Conflict Prevention
    console.log('\n[4] Testing Session Request & Double Booking Prevention...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionReq = await sessionService.requestSession(learnerReg.user.id, {
      mentorId: mentorReg.user.id,
      skillId: skill._id,
      sessionDate: tomorrow,
      startTime: '10:00',
      durationMinutes: 60,
      notes: 'Need deep explanation of conditional types.'
    });
    assert(sessionReq.status === 'REQUESTED', 'Session created with REQUESTED status');
    assert(!sessionReq.mentorConfirmedCompletion && !sessionReq.learnerConfirmedCompletion, 'Both confirmation flags initialize to false');

    // Conflict test: Attempt to book overlapping time slot with same mentor
    let conflictCaught = false;
    try {
      await sessionService.requestSession(learnerReg.user.id, {
        mentorId: mentorReg.user.id,
        skillId: skill._id,
        sessionDate: tomorrow,
        startTime: '10:30', // Overlaps 10:00 - 11:00
        durationMinutes: 60
      });
    } catch (err) {
      conflictCaught = true;
    }
    assert(conflictCaught, 'Double-booking conflict correctly prevented with meaningful error');

    // TEST 5: Mentor Accepts Session
    console.log('\n[5] Testing Mentor Acceptance...');
    const acceptedSession = await sessionService.acceptSession(sessionReq._id, mentorReg.user.id);
    assert(acceptedSession.status === 'ACCEPTED', 'Mentor successfully accepts session');

    // TEST 6: MANUAL DUAL CONFIRMATION WORKFLOW (CRITICAL)
    console.log('\n[6] Testing Manual Dual Confirmation Completion Workflow...');
    
    // Step 6a: Mentor confirms completion first
    const mentorConfirm = await sessionService.confirmCompletion(sessionReq._id, mentorReg.user.id);
    assert(!mentorConfirm.isFullyCompleted, 'Single confirmation by mentor does NOT complete the session');
    assert(mentorConfirm.session.status === 'ACCEPTED', 'Session status remains ACCEPTED while awaiting peer');
    assert(mentorConfirm.session.mentorConfirmedCompletion === true, 'Mentor confirmation flag recorded');
    assert(mentorConfirm.session.learnerConfirmedCompletion === false, 'Learner confirmation flag remains false');

    // Verify credits NOT transferred yet
    const preLearnerWallet = await walletService.getWallet(learnerReg.user.id);
    const preMentorWallet = await walletService.getWallet(mentorReg.user.id);
    assert(preLearnerWallet.currentBalance === 100, 'Learner balance unchanged before dual confirmation');
    assert(preMentorWallet.currentBalance === 100, 'Mentor balance unchanged before dual confirmation');

    // Step 6b: Learner confirms completion
    const learnerConfirm = await sessionService.confirmCompletion(sessionReq._id, learnerReg.user.id);
    assert(learnerConfirm.isFullyCompleted, 'Dual confirmation by BOTH parties marks session COMPLETED');
    assert(learnerConfirm.session.status === 'COMPLETED', 'Session status updated to COMPLETED');
    assert(learnerConfirm.session.creditsTransferred === true, 'Credits transferred flag set to true');

    // Verify credits transferred atomically
    const postLearnerWallet = await walletService.getWallet(learnerReg.user.id);
    const postMentorWallet = await walletService.getWallet(mentorReg.user.id);
    assert(postLearnerWallet.currentBalance === 75, 'Learner deducted 25 credits (100 -> 75)');
    assert(postMentorWallet.currentBalance === 125, 'Mentor credited 25 credits (100 -> 125)');

    // Step 6c: Duplicate completion prevention check
    const duplicateConfirm = await sessionService.confirmCompletion(sessionReq._id, learnerReg.user.id);
    assert(duplicateConfirm.isFullyCompleted, 'Subsequent completion call is safely handled and idempotent');
    const postLearnerWallet2 = await walletService.getWallet(learnerReg.user.id);
    assert(postLearnerWallet2.currentBalance === 75, 'Duplicate completion does NOT double-deduct credits');

    // TEST 7: Reviews and Rating Recalculation
    console.log('\n[7] Testing Post-Session Reviews & Rating...');
    const review = await reviewService.submitReview(learnerReg.user.id, {
      sessionId: sessionReq._id,
      rating: 5,
      reviewText: 'Outstanding session! Extremely knowledgeable mentor.'
    });
    assert(review.rating === 5, 'Learner can review completed session');

    const updatedMentor = await User.findById(mentorReg.user.id);
    assert(updatedMentor.rating.average === 5.0 && updatedMentor.rating.count === 1, 'Mentor average rating updated automatically');

    // Prevent duplicate review test
    let duplicateReviewCaught = false;
    try {
      await reviewService.submitReview(learnerReg.user.id, {
        sessionId: sessionReq._id,
        rating: 4,
        reviewText: 'Another review attempt'
      });
    } catch (err) {
      duplicateReviewCaught = true;
    }
    assert(duplicateReviewCaught, 'Duplicate review for the same session is prevented');

    // TEST 8: Reporting & Admin Dashboard
    console.log('\n[8] Testing Reports & Admin Controls...');
    const report = await reportService.createReport(learnerReg.user.id, {
      reportedUserId: mentorReg.user.id,
      reportType: 'DISPUTE',
      reason: 'Audio setup dispute',
      description: 'Minor dispute regarding session notes'
    });
    assert(report.status === 'PENDING', 'Report filed with PENDING status');

    const adminAnalytics = await adminService.getDashboardAnalytics();
    assert(adminAnalytics.users.total >= 2, 'Admin analytics accurately tracks total platform users');
    assert(adminAnalytics.sessions.completed >= 1, 'Admin analytics tracks completed sessions');
    assert(adminAnalytics.credits.totalExchanged >= 25, 'Admin analytics tracks total credits exchanged');

    console.log('\n====================================================');
    console.log(` ALL TESTS COMPLETED: ${passed} Passed, ${failed} Failed `);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test Suite Error:', error);
    process.exit(1);
  }
};

runTests();
