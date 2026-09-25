const Session = require('../models/Session');
const Skill = require('../models/Skill');
const User = require('../models/User');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const { AppError } = require('../middleware/errorHandler');

class SessionService {
  // Helper: calculate end time from start time and duration in minutes
  calculateEndTime(startTime, durationMinutes = 60) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalStartMinutes = hours * 60 + minutes;
    const totalEndMinutes = totalStartMinutes + durationMinutes;

    const endHours = Math.floor((totalEndMinutes / 60) % 24);
    const endMins = totalEndMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }

  // Check if two time ranges overlap
  isTimeOverlap(start1, end1, start2, end2) {
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  // Check for scheduling conflicts for mentor or learner
  async checkDoubleBooking(userId, sessionDate, startTime, endTime, excludeSessionId = null) {
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      $or: [{ mentorId: userId }, { learnerId: userId }],
      sessionDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['REQUESTED', 'ACCEPTED'] }
    };

    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }

    const existingSessions = await Session.find(query);

    for (const s of existingSessions) {
      if (this.isTimeOverlap(startTime, endTime, s.startTime, s.endTime)) {
        return {
          hasConflict: true,
          conflictingSession: s
        };
      }
    }

    return { hasConflict: false };
  }

  // Request a session
  async requestSession(learnerId, { mentorId, skillId, sessionDate, startTime, durationMinutes = 60, notes }) {
    if (learnerId.toString() === mentorId.toString()) {
      throw new AppError('You cannot request a session with yourself.', 400);
    }

    const skill = await Skill.findById(skillId);
    if (!skill || !skill.isActive) {
      throw new AppError('The selected skill is no longer available.', 404);
    }

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.isSuspended) {
      throw new AppError('The mentor is currently unavailable.', 404);
    }

    const creditsRequired = skill.creditsPerHour; // Session rate

    // 1. Check Learner balance
    const hasEnoughBalance = await walletService.checkSufficientBalance(learnerId, creditsRequired);
    if (!hasEnoughBalance) {
      throw new AppError(
        `Insufficient credits. You need ${creditsRequired} credits to book this session.`,
        400
      );
    }

    const endTime = this.calculateEndTime(startTime, durationMinutes);

    // 2. Check Mentor Conflict
    const mentorConflict = await this.checkDoubleBooking(mentorId, sessionDate, startTime, endTime);
    if (mentorConflict.hasConflict) {
      throw new AppError('The mentor is already booked or has a pending request during this time slot.', 400);
    }

    // 3. Check Learner Conflict
    const learnerConflict = await this.checkDoubleBooking(learnerId, sessionDate, startTime, endTime);
    if (learnerConflict.hasConflict) {
      throw new AppError('You already have another session scheduled or requested at this time.', 400);
    }

    // 4. Create Session
    const session = await Session.create({
      learnerId,
      mentorId,
      skillId,
      sessionDate: new Date(sessionDate),
      startTime,
      endTime,
      durationMinutes,
      creditsExchanged: creditsRequired,
      notes: notes || '',
      status: 'REQUESTED'
    });

    const learner = await User.findById(learnerId);

    // 5. Notify Mentor
    await notificationService.createNotification({
      userId: mentorId,
      type: 'SESSION_REQUESTED',
      title: 'New Session Request',
      message: `${learner.firstName} ${learner.lastName} requested a session for "${skill.title}" on ${new Date(sessionDate).toLocaleDateString()} at ${startTime}.`,
      relatedSessionId: session._id,
      relatedSkillId: skill._id,
      relatedUserId: learnerId
    });

    return session;
  }

  // Accept session
  async acceptSession(sessionId, mentorId) {
    const session = await Session.findById(sessionId)
      .populate('skillId', 'title')
      .populate('learnerId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName');

    if (!session) {
      throw new AppError('Session not found.', 404);
    }

    if (session.mentorId._id.toString() !== mentorId.toString()) {
      throw new AppError('Only the assigned mentor can accept this session.', 403);
    }

    if (session.status !== 'REQUESTED' && session.status !== 'RESCHEDULED') {
      throw new AppError(`Cannot accept a session that is currently ${session.status}.`, 400);
    }

    // Check conflict again prior to final accept
    const conflict = await this.checkDoubleBooking(
      mentorId,
      session.sessionDate,
      session.startTime,
      session.endTime,
      session._id
    );

    if (conflict.hasConflict) {
      throw new AppError('Cannot accept: You have a conflicting session at this time slot.', 400);
    }

    session.status = 'ACCEPTED';
    await session.save();

    // Notify Learner
    await notificationService.createNotification({
      userId: session.learnerId._id,
      type: 'SESSION_ACCEPTED',
      title: 'Session Request Accepted!',
      message: `${session.mentorId.firstName} ${session.mentorId.lastName} accepted your session for "${session.skillId?.title || 'Skill Session'}" on ${new Date(session.sessionDate).toLocaleDateString()} at ${session.startTime}.`,
      relatedSessionId: session._id,
      relatedUserId: mentorId
    });

    return session;
  }

  // Reject session
  async rejectSession(sessionId, mentorId, reason = '') {
    const session = await Session.findById(sessionId)
      .populate('skillId', 'title')
      .populate('learnerId', 'firstName lastName')
      .populate('mentorId', 'firstName lastName');

    if (!session) {
      throw new AppError('Session not found.', 404);
    }

    if (session.mentorId._id.toString() !== mentorId.toString()) {
      throw new AppError('Only the assigned mentor can reject this session.', 403);
    }

    if (session.status !== 'REQUESTED') {
      throw new AppError(`Cannot reject a session that is ${session.status}.`, 400);
    }

    session.status = 'REJECTED';
    session.cancellationReason = reason || 'Declined by mentor';
    await session.save();

    // Notify Learner
    await notificationService.createNotification({
      userId: session.learnerId._id,
      type: 'SESSION_REJECTED',
      title: 'Session Request Declined',
      message: `${session.mentorId.firstName} was unable to accept your request for "${session.skillId?.title}". Reason: ${reason || 'Schedule unavailable'}`,
      relatedSessionId: session._id,
      relatedUserId: mentorId
    });

    return session;
  }

  // Cancel session
  async cancelSession(sessionId, userId, reason = '') {
    const session = await Session.findById(sessionId)
      .populate('skillId', 'title')
      .populate('learnerId', 'firstName lastName')
      .populate('mentorId', 'firstName lastName');

    if (!session) {
      throw new AppError('Session not found.', 404);
    }

    const isLearner = session.learnerId._id.toString() === userId.toString();
    const isMentor = session.mentorId._id.toString() === userId.toString();

    if (!isLearner && !isMentor) {
      throw new AppError('You are not authorized to cancel this session.', 403);
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(session.status)) {
      throw new AppError(`Cannot cancel a session that is already ${session.status}.`, 400);
    }

    session.status = 'CANCELLED';
    session.cancellationReason = reason || 'Cancelled by participant';
    session.cancelledBy = userId;
    await session.save();

    const otherUserId = isLearner ? session.mentorId._id : session.learnerId._id;
    const cancelledByName = isLearner
      ? `${session.learnerId.firstName} ${session.learnerId.lastName}`
      : `${session.mentorId.firstName} ${session.mentorId.lastName}`;

    // Notify the other party
    await notificationService.createNotification({
      userId: otherUserId,
      type: 'SESSION_CANCELLED',
      title: 'Session Cancelled',
      message: `${cancelledByName} cancelled the scheduled session for "${session.skillId?.title}". Reason: ${reason || 'No reason specified'}`,
      relatedSessionId: session._id,
      relatedUserId: userId
    });

    return session;
  }

  // Reschedule session
  async rescheduleSession(sessionId, userId, { proposedDate, proposedStartTime, durationMinutes = 60, reason = '' }) {
    const session = await Session.findById(sessionId)
      .populate('skillId', 'title')
      .populate('learnerId', 'firstName lastName')
      .populate('mentorId', 'firstName lastName');

    if (!session) {
      throw new AppError('Session not found.', 404);
    }

    const isLearner = session.learnerId._id.toString() === userId.toString();
    const isMentor = session.mentorId._id.toString() === userId.toString();

    if (!isLearner && !isMentor) {
      throw new AppError('You are not authorized to reschedule this session.', 403);
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(session.status)) {
      throw new AppError(`Cannot reschedule a session that is already ${session.status}.`, 400);
    }

    const proposedEndTime = this.calculateEndTime(proposedStartTime, durationMinutes);

    // Check conflicts for both parties for new proposed time
    const mentorConflict = await this.checkDoubleBooking(
      session.mentorId._id,
      proposedDate,
      proposedStartTime,
      proposedEndTime,
      session._id
    );
    if (mentorConflict.hasConflict) {
      throw new AppError('The mentor has a conflicting session during the new proposed time slot.', 400);
    }

    const learnerConflict = await this.checkDoubleBooking(
      session.learnerId._id,
      proposedDate,
      proposedStartTime,
      proposedEndTime,
      session._id
    );
    if (learnerConflict.hasConflict) {
      throw new AppError('The learner has a conflicting session during the new proposed time slot.', 400);
    }

    session.sessionDate = new Date(proposedDate);
    session.startTime = proposedStartTime;
    session.endTime = proposedEndTime;
    session.durationMinutes = durationMinutes;
    session.status = 'REQUESTED'; // Set back to requested for the other party to re-confirm
    session.rescheduleDetails = {
      proposedBy: userId,
      proposedDate: new Date(proposedDate),
      proposedStartTime,
      proposedEndTime,
      reason,
      createdAt: new Date()
    };
    // Reset completion confirmations if rescheduled
    session.mentorConfirmedCompletion = false;
    session.learnerConfirmedCompletion = false;

    await session.save();

    const otherUserId = isLearner ? session.mentorId._id : session.learnerId._id;
    const rescheduledByName = isLearner
      ? `${session.learnerId.firstName} ${session.learnerId.lastName}`
      : `${session.mentorId.firstName} ${session.mentorId.lastName}`;

    await notificationService.createNotification({
      userId: otherUserId,
      type: 'SESSION_RESCHEDULED',
      title: 'Session Rescheduled',
      message: `${rescheduledByName} rescheduled the session for "${session.skillId?.title}" to ${new Date(proposedDate).toLocaleDateString()} at ${proposedStartTime}. Reason: ${reason || 'Schedule adjustment'}`,
      relatedSessionId: session._id,
      relatedUserId: userId
    });

    return session;
  }

  // DUAL CONFIRMATION MANUAL COMPLETION WORKFLOW
  async confirmCompletion(sessionId, userId) {
    const session = await Session.findById(sessionId)
      .populate('skillId', 'title')
      .populate('learnerId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName email');

    if (!session) {
      throw new AppError('Session not found.', 404);
    }

    const isLearner = session.learnerId._id.toString() === userId.toString();
    const isMentor = session.mentorId._id.toString() === userId.toString();

    if (!isLearner && !isMentor) {
      throw new AppError('Only participants of this session can confirm completion.', 403);
    }

    if (session.status !== 'ACCEPTED' && session.status !== 'COMPLETED') {
      throw new AppError(`Cannot confirm completion for a session that is currently ${session.status}.`, 400);
    }

    if (session.status === 'COMPLETED' && session.creditsTransferred) {
      return {
        session,
        message: 'This session is already marked as completed and credits have been exchanged.',
        isFullyCompleted: true
      };
    }

    // Set participant's confirmation flag
    if (isMentor) {
      if (session.mentorConfirmedCompletion) {
        return {
          session,
          message: 'You have already confirmed completion. Waiting for learner confirmation.',
          isFullyCompleted: false
        };
      }
      session.mentorConfirmedCompletion = true;
      session.mentorConfirmedAt = new Date();
    } else if (isLearner) {
      if (session.learnerConfirmedCompletion) {
        return {
          session,
          message: 'You have already confirmed completion. Waiting for mentor confirmation.',
          isFullyCompleted: false
        };
      }
      session.learnerConfirmedCompletion = true;
      session.learnerConfirmedAt = new Date();
    }

    let isFullyCompleted = false;

    // Both parties have confirmed completion
    if (session.mentorConfirmedCompletion && session.learnerConfirmedCompletion) {
      session.status = 'COMPLETED';
      session.completedAt = new Date();

      // Perform atomic credit transfer
      if (!session.creditsTransferred) {
        await walletService.transferSessionCredits({
          learnerId: session.learnerId._id,
          mentorId: session.mentorId._id,
          amount: session.creditsExchanged,
          sessionId: session._id,
          sessionSkillTitle: session.skillId?.title
        });
        session.creditsTransferred = true;
      }

      isFullyCompleted = true;

      // Send completion notifications to both parties
      await notificationService.createNotification({
        userId: session.learnerId._id,
        type: 'SESSION_COMPLETED',
        title: 'Session Completed!',
        message: `Your session for "${session.skillId?.title}" is completed. ${session.creditsExchanged} credits were transferred to ${session.mentorId.firstName}. Please leave a review!`,
        relatedSessionId: session._id,
        relatedUserId: session.mentorId._id
      });

      await notificationService.createNotification({
        userId: session.mentorId._id,
        type: 'CREDIT_EARNED',
        title: 'Credits Earned!',
        message: `Your session for "${session.skillId?.title}" was completed by mutual confirmation. You received +${session.creditsExchanged} credits!`,
        relatedSessionId: session._id,
        relatedUserId: session.learnerId._id
      });
    } else {
      // Only one party has confirmed so far - notify the other party
      const otherUserId = isMentor ? session.learnerId._id : session.mentorId._id;
      const confirmedByName = isMentor
        ? `${session.mentorId.firstName} (Mentor)`
        : `${session.learnerId.firstName} (Learner)`;

      await notificationService.createNotification({
        userId: otherUserId,
        type: 'SESSION_CONFIRMATION_REMINDER',
        title: 'Please Confirm Session Completion',
        message: `${confirmedByName} has confirmed that your session for "${session.skillId?.title}" took place. Please confirm to finalize completion and credit exchange.`,
        relatedSessionId: session._id,
        relatedUserId: userId
      });
    }

    await session.save();

    return {
      session,
      isFullyCompleted,
      message: isFullyCompleted
        ? 'Session marked as COMPLETED! Credits transferred successfully.'
        : 'Your completion confirmation recorded. Waiting for the other party to confirm.'
    };
  }

  // Get single session by ID
  async getSessionById(sessionId, userId, userRole = 'user') {
    const session = await Session.findById(sessionId)
      .populate('learnerId', 'firstName lastName email profilePicture rating bio')
      .populate('mentorId', 'firstName lastName email profilePicture rating bio availability')
      .populate('skillId', 'title category level description creditsPerHour tags');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const isLearner = session.learnerId._id.toString() === userId.toString();
    const isMentor = session.mentorId._id.toString() === userId.toString();

    if (!isLearner && !isMentor && userRole !== 'admin') {
      throw new AppError('You are not authorized to view this session', 403);
    }

    return session;
  }

  // Get user's sessions (as learner or mentor, with filters)
  async getUserSessions(userId, { role = 'all', status, page = 1, limit = 10 }) {
    const query = {};

    if (role === 'learner') {
      query.learnerId = userId;
    } else if (role === 'mentor') {
      query.mentorId = userId;
    } else {
      query.$or = [{ learnerId: userId }, { mentorId: userId }];
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const total = await Session.countDocuments(query);
    const sessions = await Session.find(query)
      .sort({ sessionDate: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('learnerId', 'firstName lastName profilePicture rating')
      .populate('mentorId', 'firstName lastName profilePicture rating')
      .populate('skillId', 'title category level creditsPerHour');

    return {
      sessions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get upcoming accepted sessions
  async getUpcomingSessions(userId) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return await Session.find({
      $or: [{ learnerId: userId }, { mentorId: userId }],
      status: 'ACCEPTED',
      sessionDate: { $gte: startOfToday }
    })
      .sort({ sessionDate: 1, startTime: 1 })
      .limit(5)
      .populate('learnerId', 'firstName lastName profilePicture')
      .populate('mentorId', 'firstName lastName profilePicture')
      .populate('skillId', 'title category');
  }

  // Get pending incoming requests (as mentor)
  async getIncomingRequests(mentorId) {
    return await Session.find({
      mentorId,
      status: 'REQUESTED'
    })
      .sort({ createdAt: -1 })
      .populate('learnerId', 'firstName lastName profilePicture rating')
      .populate('skillId', 'title category creditsPerHour');
  }

  // Get pending outgoing requests (as learner)
  async getOutgoingRequests(learnerId) {
    return await Session.find({
      learnerId,
      status: 'REQUESTED'
    })
      .sort({ createdAt: -1 })
      .populate('mentorId', 'firstName lastName profilePicture rating')
      .populate('skillId', 'title category creditsPerHour');
  }
}

module.exports = new SessionService();
