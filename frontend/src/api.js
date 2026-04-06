const DEMO_STATE_KEY = 'hirehub_demo_state_v1';
const DEMO_PENDING_USER_KEY = 'hirehub_demo_pending_user_v1';
const OTP_CODE = '123456';

const now = () => new Date().toISOString();

const createInitialState = () => ({
  users: [
    { id: 1, name: 'Super Admin', email: 'admin@hirehub.com', role: 'admin', is_blocked: false, created_at: '2026-03-01T10:00:00.000Z', phone: '+1 555-100-0001', department: 'Administration', bio: 'Platform super admin', photo_url: '', demoPassword: 'admin123' },
    { id: 2, name: 'Portal Manager', email: 'manager@hirehub.com', role: 'manager', is_blocked: false, created_at: '2026-03-05T09:00:00.000Z', phone: '+1 555-100-0002', department: 'Hiring Operations', bio: 'Handles interviews, tests and onboarding updates.', photo_url: '', demoPassword: 'Manager12' },
    { id: 3, name: 'Ava Patel', email: 'ava.patel@hirehub.com', role: 'admin', is_blocked: false, created_at: '2026-03-08T08:00:00.000Z', demoPassword: 'demo123' },
    { id: 4, name: 'Noah Kim', email: 'noah.kim@hirehub.com', role: 'admin', is_blocked: false, created_at: '2026-03-11T08:00:00.000Z', demoPassword: 'demo123' },
    { id: 5, name: 'Sophia Wilson', email: 'sophia.wilson@hirehub.com', role: 'admin', is_blocked: true, created_at: '2026-03-15T08:00:00.000Z', demoPassword: 'demo123' }
  ],
  companies: [
    { id: 1, name: 'Nova Tech Labs', owner_id: 3, owner_name: 'Ava Patel', owner_email: 'ava.patel@hirehub.com', email: 'hello@novatech.com', status: 'approved', created_at: '2026-03-10T09:00:00.000Z' },
    { id: 2, name: 'BluePeak Solutions', owner_id: 4, owner_name: 'Noah Kim', owner_email: 'noah.kim@hirehub.com', email: 'hello@bluepeak.com', status: 'pending', created_at: '2026-03-12T10:00:00.000Z' },
    { id: 3, name: 'BrightPath Digital', owner_id: 5, owner_name: 'Sophia Wilson', owner_email: 'sophia.wilson@hirehub.com', email: 'team@brightpath.com', status: 'blocked', created_at: '2026-03-15T11:00:00.000Z' }
  ],
  jobs: [
    { id: 1, company_id: 1, title: 'Frontend Engineer', description: 'Build React UI', status: 'open', created_at: '2026-03-14T09:00:00.000Z' },
    { id: 2, company_id: 1, title: 'Backend Engineer', description: 'Node and APIs', status: 'closed', created_at: '2026-03-16T09:00:00.000Z' },
    { id: 3, company_id: 2, title: 'QA Automation Engineer', description: 'Automation pipelines', status: 'open', created_at: '2026-03-17T09:00:00.000Z' },
    { id: 4, company_id: 3, title: 'UI Designer', description: 'Design system', status: 'open', created_at: '2026-03-19T09:00:00.000Z' }
  ],
  applications: [
    { id: 1, job_id: 1, user_id: 4, status: 'applied', applied_at: '2026-03-20T09:00:00.000Z' },
    { id: 2, job_id: 1, user_id: 5, status: 'selected', applied_at: '2026-03-21T09:00:00.000Z' },
    { id: 3, job_id: 3, user_id: 3, status: 'rejected', applied_at: '2026-03-22T09:00:00.000Z' },
    { id: 4, job_id: 4, user_id: 4, status: 'applied', applied_at: '2026-03-23T09:00:00.000Z' }
  ],
  subscriptions: [
    { id: 1, company_id: 1, plan_name: 'Pro', amount: 79, price: 79, start_date: '2026-03-01T00:00:00.000Z', expiry_date: '2026-04-01T00:00:00.000Z', status: 'active' },
    { id: 2, company_id: 2, plan_name: 'Basic', amount: 29, price: 29, start_date: '2026-03-05T00:00:00.000Z', expiry_date: '2026-04-05T00:00:00.000Z', status: 'active' },
    { id: 3, company_id: 3, plan_name: 'Enterprise', amount: 199, price: 199, start_date: '2026-02-01T00:00:00.000Z', expiry_date: '2026-03-01T00:00:00.000Z', status: 'expired' }
  ],
  logs: [
    { id: 1, action: 'Approved Company', entity_type: 'company', entity_id: 1, created_at: '2026-03-20T09:00:00.000Z' },
    { id: 2, action: 'Blocked User', entity_type: 'user', entity_id: 5, created_at: '2026-03-21T10:00:00.000Z' },
    { id: 3, action: 'Updated Job Status', entity_type: 'job', entity_id: 2, created_at: '2026-03-22T11:00:00.000Z' }
  ],
  testLinks: [
    { id: 1, application_id: 1, job_id: 1, candidate_email: 'noah.kim@hirehub.com', link_url: 'https://demo.assessments.io/frontend-1', notes: 'React round', link_status: 'sent', created_at: '2026-03-24T10:00:00.000Z', updated_at: '2026-03-24T10:00:00.000Z' },
    { id: 2, application_id: 2, job_id: 1, candidate_email: 'sophia.wilson@hirehub.com', link_url: 'https://demo.assessments.io/frontend-2', notes: 'Final round', link_status: 'completed', created_at: '2026-03-24T12:00:00.000Z', updated_at: '2026-03-25T10:00:00.000Z' }
  ],
  testLinkUpdates: [
    { id: 1, test_link_id: 2, changed_by_name: 'Portal Manager', changed_by_email: 'manager@hirehub.com', previous_status: 'sent', new_status: 'completed', previous_link: 'https://demo.assessments.io/frontend-2', new_link: 'https://demo.assessments.io/frontend-2', previous_notes: 'Final round', new_notes: 'Final round completed', updated_at: '2026-03-25T10:00:00.000Z' }
  ],
  interviews: [
    { id: 1, job_id: 1, candidate_email: 'noah.kim@hirehub.com', interview_type: 'Technical', interviewer_name: 'Alex Turner', scheduled_at: '2026-04-08T09:30:00.000Z', mode: 'Google Meet', meeting_link: 'https://meet.google.com/demo-tech-1', status: 'scheduled', notes: 'Focus on React architecture', created_at: '2026-04-06T08:00:00.000Z', updated_at: '2026-04-06T08:00:00.000Z' },
    { id: 2, job_id: 3, candidate_email: 'ava.patel@hirehub.com', interview_type: 'HR', interviewer_name: 'Mia Reed', scheduled_at: '2026-04-09T12:00:00.000Z', mode: 'Zoom', meeting_link: 'https://zoom.us/demo-hr-2', status: 'completed', notes: 'Strong communication', created_at: '2026-04-06T08:15:00.000Z', updated_at: '2026-04-06T10:00:00.000Z' }
  ],
  interviewUpdates: [
    { id: 1, interview_id: 2, candidate_email: 'ava.patel@hirehub.com', previous_status: 'scheduled', new_status: 'completed', message: 'Interview marked as completed by manager', updated_at: '2026-04-06T10:00:00.000Z' }
  ],
  offboardingLetters: [
    { id: 1, candidate_email: 'ava.patel@hirehub.com', job_id: 3, status: 'sent', sent_at: '2026-04-06T11:00:00.000Z', notes: 'Final offboarding initiated for rejected process.' }
  ]
});

const parseState = () => {
  try {
    const raw = localStorage.getItem(DEMO_STATE_KEY);
    if (!raw) return createInitialState();
    return JSON.parse(raw);
  } catch {
    return createInitialState();
  }
};

let state = parseState();

const ensureCollections = () => {
  const defaults = createInitialState();
  const keys = Object.keys(defaults);
  keys.forEach((key) => {
    if (!Array.isArray(defaults[key])) return;
    if (!Array.isArray(state[key])) {
      state[key] = defaults[key];
    }
  });
};

ensureCollections();

const persistState = () => {
  localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { demoPassword, ...safe } = user;
  return safe;
};

const nextId = (collection) => {
  if (!collection.length) return 1;
  return Math.max(...collection.map((item) => Number(item.id) || 0)) + 1;
};

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = async (payload) => {
  await delay();
  return { data: payload };
};

const fail = async (message, status = 400) => {
  await delay();
  return Promise.reject({
    response: {
      status,
      data: { message }
    }
  });
};

const tokenToUser = (token) => {
  if (!token || typeof token !== 'string') return null;
  const id = Number(token.replace('demo-token-', ''));
  return state.users.find((u) => u.id === id) || null;
};

const getAuthUser = () => {
  const token = localStorage.getItem('token');
  return tokenToUser(token);
};

const addLog = (action, entityType, entityId) => {
  state.logs.unshift({
    id: nextId(state.logs),
    action,
    entity_type: entityType,
    entity_id: entityId,
    created_at: now()
  });
};

const ensureDemoAccount = (email, password, role, name) => {
  let user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: nextId(state.users),
      name,
      email,
      role,
      is_blocked: false,
      created_at: now(),
      demoPassword: password
    };
    state.users.push(user);
  } else {
    user.demoPassword = password;
    user.role = role;
    user.name = name;
    user.is_blocked = false;
  }
  return user;
};

export const authAPI = {
  register: async ({ name, email, password, role = 'admin' }) => {
    const existing = state.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (existing) return fail('User already exists');

    const allowedRoles = ['admin', 'manager', 'superadmin'];
    if (!allowedRoles.includes(role)) return fail('Invalid role selected');

    const user = {
      id: nextId(state.users),
      name,
      email,
      role,
      is_blocked: false,
      created_at: now(),
      demoPassword: password
    };
    state.users.push(user);
    persistState();
    return ok({
      message: 'User registered successfully',
      user: sanitizeUser(user)
    });
  },

  login: async ({ email, password }) => {
    // Self-heal demo credentials so showcase never breaks due to stale localStorage data.
    ensureDemoAccount('admin@hirehub.com', 'admin123', 'admin', 'Super Admin');
    ensureDemoAccount('manager@hirehub.com', 'Manager12', 'manager', 'Portal Manager');

    const user = state.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user || user.demoPassword !== password) return fail('Invalid credentials', 401);
    if (user.is_blocked) return fail('User is blocked', 403);

    persistState();
    localStorage.setItem(DEMO_PENDING_USER_KEY, String(user.id));
    return ok({
      message: 'OTP sent to email. Please verify.',
      userId: user.id,
      email: user.email
    });
  },

  verifyOTP: async ({ userId, otp }) => {
    const pendingId = Number(localStorage.getItem(DEMO_PENDING_USER_KEY));
    if (!pendingId || pendingId !== Number(userId) || String(otp) !== OTP_CODE) {
      return fail('Invalid or expired OTP', 401);
    }

    const user = state.users.find((u) => u.id === Number(userId));
    if (!user) return fail('User not found', 404);

    const token = `demo-token-${user.id}`;
    localStorage.removeItem(DEMO_PENDING_USER_KEY);
    return ok({
      message: 'OTP verified successfully',
      token,
      user: sanitizeUser(user)
    });
  },

  getCurrentUser: async () => {
    const user = getAuthUser();
    if (!user) return fail('No token provided', 401);
    return ok({ user: sanitizeUser(user) });
  }
};

export const companyAPI = {
  getAll: async () => {
    return ok({ message: 'Companies fetched successfully', data: state.companies });
  },

  getById: async (id) => {
    const company = state.companies.find((c) => c.id === Number(id));
    if (!company) return fail('Company not found', 404);
    return ok({ message: 'Company fetched successfully', data: company });
  },

  getDetails: async (id) => {
    const company = state.companies.find((c) => c.id === Number(id));
    if (!company) return fail('Company not found', 404);

    const jobs = state.jobs
      .filter((j) => j.company_id === company.id)
      .map((job) => ({
        ...job,
        applications_count: state.applications.filter((a) => a.job_id === job.id).length
      }));

    const subscription = state.subscriptions.find((s) => s.company_id === company.id) || null;

    return ok({
      message: 'Company details fetched successfully',
      data: {
        company,
        jobs,
        subscription,
        stats: {
          total_jobs_posted: jobs.length,
          total_applications_received: jobs.reduce((sum, j) => sum + j.applications_count, 0)
        }
      }
    });
  },

  updateStatus: async (id, status) => {
    const company = state.companies.find((c) => c.id === Number(id));
    if (!company) return fail('Company not found', 404);
    company.status = status;
    addLog(`Updated Company Status to ${status}`, 'company', company.id);
    persistState();
    return ok({ message: 'Company status updated successfully', data: company });
  },

  approve: async (id) => companyAPI.updateStatus(id, 'approved'),
  reject: async (id) => companyAPI.updateStatus(id, 'rejected'),
  block: async (id) => companyAPI.updateStatus(id, 'blocked')
};

export const userAPI = {
  getAll: async () => ok({ message: 'Users fetched successfully', data: state.users.map(sanitizeUser) }),

  getById: async (id) => {
    const user = state.users.find((u) => u.id === Number(id));
    if (!user) return fail('User not found', 404);
    return ok({ message: 'User fetched successfully', data: sanitizeUser(user) });
  },

  block: async (id) => {
    const user = state.users.find((u) => u.id === Number(id));
    if (!user) return fail('User not found', 404);
    user.is_blocked = true;
    addLog('Blocked User', 'user', user.id);
    persistState();
    return ok({ message: 'User blocked successfully', data: sanitizeUser(user) });
  },

  unblock: async (id) => {
    const user = state.users.find((u) => u.id === Number(id));
    if (!user) return fail('User not found', 404);
    user.is_blocked = false;
    addLog('Unblocked User', 'user', user.id);
    persistState();
    return ok({ message: 'User unblocked successfully', data: sanitizeUser(user) });
  }
};

export const jobAPI = {
  getAll: async () => {
    const data = state.jobs.map((job) => ({
      ...job,
      company_name: state.companies.find((c) => c.id === job.company_id)?.name || 'N/A'
    }));
    return ok({ message: 'Jobs fetched successfully', data });
  },

  getById: async (id) => {
    const job = state.jobs.find((j) => j.id === Number(id));
    if (!job) return fail('Job not found', 404);
    return ok({ message: 'Job fetched successfully', data: job });
  },

  updateStatus: async (id, status) => {
    const job = state.jobs.find((j) => j.id === Number(id));
    if (!job) return fail('Job not found', 404);
    job.status = status;
    addLog('Updated Job Status', 'job', job.id);
    persistState();
    return ok({ message: 'Job status updated successfully', data: job });
  },

  delete: async (id) => {
    const index = state.jobs.findIndex((j) => j.id === Number(id));
    if (index < 0) return fail('Job not found', 404);
    const [deleted] = state.jobs.splice(index, 1);
    state.applications = state.applications.filter((a) => a.job_id !== deleted.id);
    addLog('Deleted Job', 'job', deleted.id);
    persistState();
    return ok({ message: 'Job deleted successfully', data: deleted });
  }
};

export const applicationAPI = {
  getAll: async () => {
    const data = state.applications.map((app) => {
      const job = state.jobs.find((j) => j.id === app.job_id);
      const user = state.users.find((u) => u.id === app.user_id);
      return {
        ...app,
        job_title: job?.title || 'N/A',
        company_name: state.companies.find((c) => c.id === job?.company_id)?.name || 'N/A',
        user_name: user?.name || 'N/A',
        user_email: user?.email || 'N/A'
      };
    });
    return ok({ message: 'Applications fetched successfully', data });
  },

  updateStatus: async (id, status) => {
    const app = state.applications.find((a) => a.id === Number(id));
    if (!app) return fail('Application not found', 404);
    app.status = status;
    addLog(`Updated Application Status to ${status}`, 'application', app.id);
    persistState();
    return ok({ message: 'Application status updated successfully', data: app });
  }
};

export const subscriptionAPI = {
  getAll: async () => {
    const data = state.subscriptions.map((sub) => ({
      ...sub,
      company_name: state.companies.find((c) => c.id === sub.company_id)?.name || 'N/A'
    }));
    return ok({ message: 'Subscriptions fetched successfully', data });
  },

  getById: async (id) => {
    const sub = state.subscriptions.find((s) => s.id === Number(id));
    if (!sub) return fail('Subscription not found', 404);
    return ok({ message: 'Subscription fetched successfully', data: sub });
  },

  updateStatus: async (id, status) => {
    const sub = state.subscriptions.find((s) => s.id === Number(id));
    if (!sub) return fail('Subscription not found', 404);
    sub.status = status;
    addLog(`Updated Subscription Status to ${status}`, 'subscription', sub.id);
    persistState();
    return ok({ message: 'Subscription status updated successfully', data: sub });
  }
};

export const dashboardAPI = {
  getStats: async () => {
    const totalRevenue = state.subscriptions.reduce((sum, sub) => sum + Number(sub.amount || sub.price || 0), 0);
    return ok({
      message: 'Dashboard stats fetched successfully',
      data: {
        totalCompanies: state.companies.length,
        totalUsers: state.users.length,
        totalJobs: state.jobs.length,
        totalApplications: state.applications.length,
        totalRevenue
      }
    });
  },

  getCharts: async () => {
    const jobsPerCompany = state.companies.map((company) => ({
      company_name: company.name,
      total_jobs: state.jobs.filter((job) => job.company_id === company.id).length
    }));

    const applicationsOverTime = [
      { period: 'Jan 2026', total_applications: 5 },
      { period: 'Feb 2026', total_applications: 7 },
      { period: 'Mar 2026', total_applications: 10 },
      { period: 'Apr 2026', total_applications: state.applications.length }
    ];

    const usersGrowth = [
      { period: 'Jan 2026', total_users: 2 },
      { period: 'Feb 2026', total_users: 3 },
      { period: 'Mar 2026', total_users: 5 },
      { period: 'Apr 2026', total_users: state.users.length }
    ];

    return ok({
      message: 'Dashboard charts fetched successfully',
      data: { jobsPerCompany, applicationsOverTime, usersGrowth }
    });
  }
};

export const logsAPI = {
  getAll: async () => ok({ message: 'Logs fetched successfully', data: state.logs })
};

export const managerAPI = {
  getProfile: async () => {
    const user = getAuthUser();
    if (!user) return fail('No token provided', 401);
    return ok({ message: 'Manager profile fetched successfully', data: sanitizeUser(user) });
  },

  updateProfile: async (payload) => {
    const user = getAuthUser();
    if (!user) return fail('No token provided', 401);

    const editableFields = ['name', 'phone', 'department', 'bio', 'photo_url'];
    editableFields.forEach((field) => {
      if (payload[field] !== undefined) {
        user[field] = payload[field];
      }
    });
    user.updated_at = now();
    addLog('Manager Updated Profile', 'user', user.id);
    persistState();
    return ok({ message: 'Manager profile updated successfully', data: sanitizeUser(user) });
  },

  getUsers: async () => ok({ message: 'Users fetched successfully', data: state.users.map(sanitizeUser) }),

  updateUserBlockStatus: async (id, isBlocked) => {
    const user = state.users.find((u) => u.id === Number(id));
    if (!user) return fail('User not found', 404);
    user.is_blocked = Boolean(isBlocked);
    addLog(Boolean(isBlocked) ? 'Manager Blocked User' : 'Manager Unblocked User', 'user', user.id);
    persistState();
    return ok({ message: 'User block status updated', data: sanitizeUser(user) });
  },

  getJobs: async () => {
    const jobs = state.jobs.map((job) => ({
      ...job,
      company_name: state.companies.find((c) => c.id === job.company_id)?.name || 'N/A'
    }));
    return ok({ message: 'Jobs fetched successfully', data: jobs });
  },

  updateJobStatus: async (id, status) => {
    const job = state.jobs.find((j) => j.id === Number(id));
    if (!job) return fail('Job not found', 404);
    job.status = status;
    addLog('Manager Updated Job Status', 'job', job.id);
    persistState();
    return ok({ message: 'Job status updated successfully', data: job });
  },

  getTestLinks: async () => {
    const data = state.testLinks.map((link) => ({
      ...link,
      job_title: state.jobs.find((j) => j.id === link.job_id)?.title || 'N/A',
      application_status: state.applications.find((a) => a.id === link.application_id)?.status || 'N/A'
    }));
    return ok({ message: 'Test links fetched successfully', data });
  },

  createTestLink: async (payload) => {
    if (!payload?.linkUrl) return fail('linkUrl is required');
    const user = getAuthUser();
    const item = {
      id: nextId(state.testLinks),
      application_id: payload.applicationId ? Number(payload.applicationId) : null,
      job_id: payload.jobId ? Number(payload.jobId) : null,
      candidate_email: payload.candidateEmail || null,
      link_url: payload.linkUrl,
      notes: payload.notes || null,
      link_status: payload.linkStatus || 'pending',
      created_at: now(),
      updated_at: now()
    };
    state.testLinks.unshift(item);
    addLog('Manager Created Test Link', 'manager_test_link', item.id);

    state.testLinkUpdates.unshift({
      id: nextId(state.testLinkUpdates),
      test_link_id: item.id,
      candidate_email: item.candidate_email,
      changed_by_name: user?.name || 'Manager',
      changed_by_email: user?.email || 'manager@hirehub.com',
      previous_status: null,
      new_status: item.link_status,
      previous_link: null,
      new_link: item.link_url,
      previous_notes: null,
      new_notes: item.notes,
      updated_at: now()
    });
    persistState();
    return ok({ message: 'Test link created successfully', data: item });
  },

  updateTestLink: async (id, payload) => {
    const user = getAuthUser();
    const link = state.testLinks.find((l) => l.id === Number(id));
    if (!link) return fail('Test link not found', 404);

    const previous = { ...link };
    if (payload.linkStatus) link.link_status = payload.linkStatus;
    if (payload.linkUrl) link.link_url = payload.linkUrl;
    if (payload.notes !== undefined) link.notes = payload.notes;
    link.updated_at = now();

    state.testLinkUpdates.unshift({
      id: nextId(state.testLinkUpdates),
      test_link_id: link.id,
      candidate_email: link.candidate_email,
      changed_by_name: user?.name || 'Manager',
      changed_by_email: user?.email || 'manager@hirehub.com',
      previous_status: previous.link_status || null,
      new_status: link.link_status || null,
      previous_link: previous.link_url || null,
      new_link: link.link_url || null,
      previous_notes: previous.notes || null,
      new_notes: link.notes || null,
      updated_at: now()
    });

    addLog('Manager Updated Test Link', 'manager_test_link', link.id);
    persistState();
    return ok({ message: 'Test link updated successfully', data: link });
  },

  getTestLinkUpdates: async () => {
    return ok({ message: 'Test link updates fetched successfully', data: state.testLinkUpdates });
  },

  getInterviews: async () => {
    const data = state.interviews.map((item) => ({
      ...item,
      job_title: state.jobs.find((j) => j.id === item.job_id)?.title || 'N/A'
    }));
    return ok({ message: 'Interviews fetched successfully', data });
  },

  createInterview: async (payload) => {
    if (!payload?.candidateEmail || !payload?.scheduledAt || !payload?.interviewType) {
      return fail('candidateEmail, interviewType and scheduledAt are required');
    }

    const interview = {
      id: nextId(state.interviews),
      job_id: payload.jobId ? Number(payload.jobId) : null,
      candidate_email: payload.candidateEmail,
      interview_type: payload.interviewType,
      interviewer_name: payload.interviewerName || 'Hiring Panel',
      scheduled_at: payload.scheduledAt,
      mode: payload.mode || 'Google Meet',
      meeting_link: payload.meetingLink || '',
      status: 'scheduled',
      notes: payload.notes || '',
      created_at: now(),
      updated_at: now()
    };

    state.interviews.unshift(interview);
    state.interviewUpdates.unshift({
      id: nextId(state.interviewUpdates),
      interview_id: interview.id,
      candidate_email: interview.candidate_email,
      previous_status: null,
      new_status: 'scheduled',
      message: `Interview scheduled for ${interview.candidate_email}`,
      updated_at: now()
    });
    addLog('Manager Scheduled Interview', 'interview', interview.id);
    persistState();
    return ok({ message: 'Interview scheduled successfully', data: interview });
  },

  updateInterviewStatus: async (id, status) => {
    const interview = state.interviews.find((i) => i.id === Number(id));
    if (!interview) return fail('Interview not found', 404);

    const previousStatus = interview.status;
    interview.status = status;
    interview.updated_at = now();

    state.interviewUpdates.unshift({
      id: nextId(state.interviewUpdates),
      interview_id: interview.id,
      candidate_email: interview.candidate_email,
      previous_status: previousStatus,
      new_status: status,
      message: `Status changed from ${previousStatus} to ${status}`,
      updated_at: now()
    });
    addLog('Manager Updated Interview Status', 'interview', interview.id);
    persistState();
    return ok({ message: 'Interview status updated successfully', data: interview });
  },

  getInterviewUpdates: async () => {
    return ok({ message: 'Interview updates fetched successfully', data: state.interviewUpdates });
  },

  getOffboardingLetters: async () => {
    const data = state.offboardingLetters.map((item) => ({
      ...item,
      job_title: state.jobs.find((j) => j.id === item.job_id)?.title || 'N/A'
    }));
    return ok({ message: 'Offboarding letters fetched successfully', data });
  },

  sendOffboardingLetter: async (payload) => {
    if (!payload?.candidateEmail) return fail('candidateEmail is required');
    const letter = {
      id: nextId(state.offboardingLetters),
      candidate_email: payload.candidateEmail,
      job_id: payload.jobId ? Number(payload.jobId) : null,
      status: 'sent',
      sent_at: now(),
      notes: payload.notes || 'Auto-generated by manager.'
    };
    state.offboardingLetters.unshift(letter);
    addLog('Manager Sent Offboarding Letter', 'offboarding_letter', letter.id);
    persistState();
    return ok({ message: 'Offboarding letter sent successfully', data: letter });
  },

  getStats: async () => {
    const totalApplications = state.applications.length;
    const totalOpenings = state.jobs.filter((j) => j.status === 'open').length;
    const completedTests = state.testLinks.filter((l) => l.link_status === 'completed');
    const completedInterviews = state.interviews.filter((i) => i.status === 'completed');

    const testCandidates = new Set(completedTests.map((l) => l.candidate_email).filter(Boolean));
    const interviewCandidates = new Set(completedInterviews.map((i) => i.candidate_email).filter(Boolean));
    let clearedBoth = 0;
    testCandidates.forEach((email) => {
      if (interviewCandidates.has(email)) clearedBoth += 1;
    });

    return ok({
      message: 'Manager stats fetched successfully',
      data: {
        totalApplications,
        totalOpenings,
        clearedTests: completedTests.length,
        clearedInterviews: completedInterviews.length,
        clearedBoth,
        offboardingLettersSent: state.offboardingLetters.filter((o) => o.status === 'sent').length
      }
    });
  },

  getRecentUpdates: async () => {
    const testUpdates = state.testLinkUpdates.map((u) => ({
      id: `test-${u.id}`,
      type: 'Test',
      candidate_email: u.candidate_email || state.testLinks.find((l) => l.id === u.test_link_id)?.candidate_email || 'candidate@hirehub.com',
      message: u.new_status === 'completed'
        ? 'Candidate completed exam'
        : `Candidate test status updated to ${u.new_status || 'N/A'}`,
      updated_at: u.updated_at
    }));

    const interviewUpdates = state.interviewUpdates.map((u) => ({
      id: `interview-${u.id}`,
      type: 'Interview',
      candidate_email: u.candidate_email || 'candidate@hirehub.com',
      message: u.new_status === 'completed'
        ? 'Candidate completed interview'
        : (u.message || `Interview status changed to ${u.new_status}`),
      updated_at: u.updated_at
    }));

    const offboardingUpdates = state.offboardingLetters.map((o) => ({
      id: `offboarding-${o.id}`,
      type: 'Offboarding',
      candidate_email: o.candidate_email,
      message: 'Offboarding letter sent',
      updated_at: o.sent_at
    }));

    const data = [...testUpdates, ...interviewUpdates, ...offboardingUpdates]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 20);

    return ok({ message: 'Recent updates fetched successfully', data });
  }
};

const api = {};
export default api;
