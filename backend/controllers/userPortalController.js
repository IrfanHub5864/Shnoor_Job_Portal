const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const UserProfile = require('../models/UserProfile');
const ManagerTestLink = require('../models/ManagerTestLink');
const ManagerWorkflow = require('../models/ManagerWorkflow');
const ActivityLog = require('../models/ActivityLog');
const {
  QUIZ_QUESTIONS,
  getJobFormFields,
  buildPrefilledFromProfile,
  sanitizeSubmittedDetails,
  evaluateQuizAnswers
} = require('../utils/applicationFlowUtils');

const APPLY_MODE_LABELS = {
  direct_profile: 'Send Directly',
  predefined_form: 'Add Form',
  google_form: 'Google Form Link',
  custom_form: 'Website Custom Form'
};

const stripQuizAnswers = () => QUIZ_QUESTIONS.map(({ answerIndex, ...question }) => question);

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await UserProfile.getByUserId(user);
    res.status(200).json({
      message: 'Profile fetched successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

const upsertMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await UserProfile.upsertByUserId(user, req.body || {});
    await ActivityLog.record('User Updated Profile', 'user', req.user.id);
    res.status(200).json({
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

const getUserJobs = async (req, res) => {
  try {
    const jobs = await Job.getAll();
    const openJobs = jobs.filter((job) => job.status === 'open');
    const applications = await Application.getByUserId(req.user.id);
    const appliedJobIds = new Set(applications.map((item) => item.job_id));

    const formattedJobs = openJobs.map((job) => ({
      ...job,
      applyMode: job.apply_mode || 'direct_profile',
      applyModeLabel: APPLY_MODE_LABELS[job.apply_mode || 'direct_profile'] || 'Send Directly',
      hasApplied: appliedJobIds.has(job.id)
    }));

    res.status(200).json({
      message: 'Open jobs fetched successfully',
      data: formattedJobs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

const getJobApplicationForm = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (Number.isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.getById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is not open for applications' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await UserProfile.getByUserId(user);
    const applyMode = job.apply_mode || 'direct_profile';
    const formFields = getJobFormFields(job);
    const prefilledPool = buildPrefilledFromProfile(user, profile);
    const prefilledDetails = {};
    formFields.forEach((field) => {
      prefilledDetails[field.key] = prefilledPool[field.key] || '';
    });

    res.status(200).json({
      message: 'Application form fetched successfully',
      data: {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company_name,
        applyMode,
        applyModeLabel: APPLY_MODE_LABELS[applyMode] || 'Send Directly',
        managerInstructions: job.manager_instructions || '',
        googleFormUrl: job.google_form_url || '',
        formFields,
        prefilledDetails
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application form', error: error.message });
  }
};

const applyToJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (Number.isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.getById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is not open for applications' });
    }

    const existingApplication = await Application.findByJobAndUser(jobId, req.user.id);
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await UserProfile.getByUserId(user);
    const applyMode = job.apply_mode || 'direct_profile';
    const formFields = getJobFormFields(job);
    const prefilledPool = buildPrefilledFromProfile(user, profile);
    let finalValues = {};

    if (applyMode === 'google_form') {
      const confirmed = Boolean(req.body?.confirmExternalSubmission);
      if (!confirmed) {
        return res.status(400).json({ message: 'Please confirm Google form submission before applying' });
      }

      finalValues = {
        googleFormUrl: job.google_form_url || '',
        confirmation: true,
        confirmationTime: new Date().toISOString(),
        note: String(req.body?.googleFormNote || '').trim()
      };
    } else {
      finalValues = sanitizeSubmittedDetails(formFields, req.body?.submittedDetails, prefilledPool);
      const missingRequired = formFields
        .filter((field) => field.required)
        .filter((field) => !String(finalValues[field.key] || '').trim())
        .map((field) => field.label);

      if (missingRequired.length) {
        return res.status(400).json({
          message: `Missing required fields: ${missingRequired.join(', ')}`
        });
      }
    }

    const applicationPayload = {
      applyMode,
      applyModeLabel: APPLY_MODE_LABELS[applyMode] || 'Send Directly',
      managerInstructions: job.manager_instructions || '',
      values: finalValues,
      profileSnapshot: {
        name: profile.displayName || user.name || '',
        email: user.email || '',
        phone: profile.basicDetails?.phone || '',
        headline: profile.headline || '',
        skills: profile.skills || [],
        resumeUrl: profile.resumeUrl || ''
      }
    };

    const application = await Application.create(jobId, req.user.id, {
      applySource: applyMode,
      submittedDetails: applicationPayload,
      testTotalQuestions: QUIZ_QUESTIONS.length
    });

    await ActivityLog.record('User Applied To Job', 'application', application.id, {
      userId: req.user.id,
      userEmail: user.email,
      jobId,
      jobTitle: job.title,
      companyName: job.company_name || null,
      applyMode
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying to job', error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.getByUserId(req.user.id);
    res.status(200).json({
      message: 'Applications fetched successfully',
      data: applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

const getMyHomeData = async (req, res) => {
  try {
    const jobs = await Job.getAll();
    const openJobs = jobs.filter((job) => job.status === 'open');
    const applications = await Application.getByUserId(req.user.id);

    const shortlisted = applications.filter((item) => item.status === 'selected').length;
    const rejected = applications.filter((item) => item.status === 'rejected').length;
    const testPassed = applications.filter((item) => item.test_passed).length;

    res.status(200).json({
      message: 'User dashboard data fetched successfully',
      data: {
        stats: {
          openJobs: openJobs.length,
          appliedJobs: applications.length,
          shortlisted,
          rejected,
          testPassed
        },
        recentApplications: applications.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const applications = await Application.getByUserId(req.user.id);
    const testLinks = await ManagerTestLink.getForUser(req.user.id, user.email);

    const latestTestLinkByApplicationId = new Map();
    const latestOrphanByJobId = new Map();
    const orphanTestLinks = [];

    testLinks.forEach((link) => {
      if (link.application_id) {
        if (!latestTestLinkByApplicationId.has(link.application_id)) {
          latestTestLinkByApplicationId.set(link.application_id, link);
        }
        return;
      }

      orphanTestLinks.push(link);
      if (link.job_id && !latestOrphanByJobId.has(link.job_id)) {
        latestOrphanByJobId.set(link.job_id, link);
      }
    });

    const usedOrphanLinkIds = new Set();

    const notifications = applications.map((application) => {
      let title = 'Application Submitted';
      let description = `Your application for ${application.job_title} at ${application.company_name} is submitted.`;
      const testLink = latestTestLinkByApplicationId.get(application.id) || latestOrphanByJobId.get(application.job_id);
      const usedOrphanLink = !latestTestLinkByApplicationId.get(application.id) && testLink;
      let createdAt = application.updated_at || application.applied_at;

      if (application.status === 'selected') {
        title = 'Shortlisted for Test';
        description = `You are shortlisted for ${application.job_title}.`;

        if (application.test_attempted) {
          if (application.test_passed) {
            title = 'Test Passed';
            description = `Great job. You passed the test for ${application.job_title} with ${application.test_score || 0}%.`;
          } else {
            title = 'Test Update';
            description = `Test submitted for ${application.job_title}. Score: ${application.test_score || 0}%.`;
          }
          createdAt = application.test_submitted_at || createdAt;
        } else if (testLink?.link_url) {
          title = 'Test Update: Link Shared';
          description = `Assessment link for ${application.job_title}: ${testLink.link_url}`;
          createdAt = testLink.updated_at || createdAt;
          if (usedOrphanLink?.id) {
            usedOrphanLinkIds.add(usedOrphanLink.id);
          }
        }

        if (application.interview_called) {
          title = 'Interview Call';
          description = `Interview call has been sent for ${application.job_title}. Please check Interviews section.`;
          createdAt = application.interview_called_at || createdAt;
        }
      }

      if (application.status === 'rejected') {
        title = 'Application Update';
        description = `Your application for ${application.job_title} has been closed for this role.`;
      }

      return {
        id: `application-${application.id}`,
        title,
        description,
        status: application.status,
        createdAt
      };
    });

    const linkNotifications = orphanTestLinks
      .filter((link) => !usedOrphanLinkIds.has(link.id))
      .map((link) => ({
        id: `assessment-${link.id}`,
        title: 'Test Update Shared',
        description: `Manager shared a test update for ${link.job_title || 'your application'}: ${link.link_url}`,
        status: link.link_status || 'sent',
        createdAt: link.updated_at || link.created_at
      }));

    const data = [...notifications, ...linkNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      message: 'Notifications fetched successfully',
      data
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const applications = await Application.getByUserId(req.user.id);
    const managerInterviews = await ManagerWorkflow.getInterviews();
    const normalizedEmail = (user.email || '').toLowerCase();

    const interviewItems = managerInterviews
      .filter((item) => (item.candidate_email || '').toLowerCase() === normalizedEmail)
      .map((item) => ({
        id: item.id,
        jobId: item.job_id,
        jobTitle: item.job_title || 'Job Opportunity',
        companyName: 'Hiring Team',
        status: item.status || 'scheduled',
        scheduledAt: item.scheduled_at,
        interviewType: item.interview_type,
        mode: item.mode,
        meetingLink: item.meeting_link
      }));

    const scheduledJobIds = new Set(interviewItems.map((item) => Number(item.jobId)).filter(Boolean));
    const awaitingItems = applications
      .filter((item) => item.status === 'selected' && !scheduledJobIds.has(Number(item.job_id)))
      .map((item) => ({
        id: `awaiting-${item.id}`,
        jobTitle: item.job_title,
        companyName: item.company_name,
        status: item.interview_called ? 'awaiting_schedule' : 'awaiting_call',
        scheduledAt: null
      }));

    res.status(200).json({
      message: 'Interview data fetched successfully',
      data: [...interviewItems, ...awaitingItems]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews', error: error.message });
  }
};

const getMyAssessments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const applications = await Application.getByUserId(req.user.id);
    const testLinks = await ManagerTestLink.getForUser(req.user.id, user.email);

    const latestTestLinkByApplicationId = new Map();
    const latestOrphanByJobId = new Map();
    testLinks.forEach((link) => {
      if (link.application_id && !latestTestLinkByApplicationId.has(link.application_id)) {
        latestTestLinkByApplicationId.set(link.application_id, link);
        return;
      }

      if (link.job_id && !latestOrphanByJobId.has(link.job_id)) {
        latestOrphanByJobId.set(link.job_id, link);
      }
    });

    const assessments = applications
      .filter((item) => item.status === 'selected')
      .map((item) => {
        const link = latestTestLinkByApplicationId.get(item.id) || latestOrphanByJobId.get(item.job_id);
        const testAttempted = Boolean(item.test_attempted || link?.attempted_at);
        const testPassed = Boolean(item.test_passed || link?.is_passed);
        const canTakeTest = Boolean(link?.link_url) && !testAttempted;
        const passPercentage = Number(link?.pass_percentage) || 75;
        const quizQuestionCount = Number(link?.quiz_question_count) || QUIZ_QUESTIONS.length;

        let status = 'awaiting_test_link';
        if (link?.link_url) {
          if (testAttempted && testPassed) {
            status = 'test_passed';
          } else if (testAttempted && !testPassed) {
            status = 'test_failed';
          } else {
            status = link?.link_status === 'sent' ? 'test_link_sent' : `test_${link?.link_status || 'pending'}`;
          }
        }

        return {
          id: item.id,
          jobTitle: item.job_title,
          companyName: item.company_name,
          status,
          startTime: null,
          endTime: null,
          testLink: link?.link_url || null,
          notes: link?.notes || null,
          updatedAt: link?.updated_at || item.updated_at || item.applied_at,
          testAttempted,
          testPassed,
          testScore: item.test_score ?? link?.latest_score ?? null,
          passPercentage,
          quizQuestionCount,
          canTakeTest,
          interviewCalled: Boolean(item.interview_called || link?.interview_called),
          quizQuestions: canTakeTest ? stripQuizAnswers() : []
        };
      });

    res.status(200).json({
      message: 'Assessment data fetched successfully',
      data: assessments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessments', error: error.message });
  }
};

const submitAssessmentQuiz = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.applicationId, 10);
    if (Number.isNaN(applicationId)) {
      return res.status(400).json({ message: 'Invalid application id' });
    }

    const application = await Application.getById(applicationId);
    if (!application || Number(application.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.test_attempted) {
      return res.status(400).json({ message: 'Test can be attempted only once' });
    }

    const link = await ManagerTestLink.getLatestByApplicationId(applicationId);
    if (!link?.link_url) {
      return res.status(400).json({ message: 'No active test link found for this application' });
    }

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const result = evaluateQuizAnswers(answers);
    const passPercentage = Number(link.pass_percentage) || 75;
    const passed = result.scorePercentage >= passPercentage;

    const updatedApplication = await Application.updateTestResult(applicationId, {
      testScore: result.scorePercentage,
      testTotalQuestions: result.totalQuestions,
      testPassed: passed
    });

    const updatedLink = await ManagerTestLink.update(
      link.id,
      {
        linkStatus: 'completed',
        latestScore: result.scorePercentage,
        isPassed: passed,
        attemptedAt: new Date().toISOString(),
        notes: link.notes
          ? `${link.notes} | User attempted test and scored ${result.scorePercentage}%`
          : `User attempted test and scored ${result.scorePercentage}%`
      },
      req.user.id
    );

    await ManagerTestLink.createUpdateLog(link.id, link, updatedLink, req.user.id);
    await ActivityLog.record('User Submitted Assessment', 'application', applicationId);

    res.status(200).json({
      message: passed ? 'Test passed successfully' : 'Test submitted successfully',
      data: {
        applicationId,
        score: result.scorePercentage,
        passed,
        passPercentage,
        correctAnswers: result.correctCount,
        totalQuestions: result.totalQuestions,
        updatedApplication
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assessment test', error: error.message });
  }
};

module.exports = {
  getMyProfile,
  upsertMyProfile,
  getUserJobs,
  getJobApplicationForm,
  applyToJob,
  getMyApplications,
  getMyHomeData,
  getMyNotifications,
  getMyInterviews,
  getMyAssessments,
  submitAssessmentQuiz
};
