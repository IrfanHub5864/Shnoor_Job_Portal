import React, { useEffect, useMemo, useState } from 'react';
import { managerAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ManagerLayout from '../components/manager/ManagerLayout';
import styles from './ManagerDashboard.module.css';

const APPLY_MODE_OPTIONS = [
  { value: 'direct_profile', label: 'Send Directly (Profile + Resume)' },
  { value: 'predefined_form', label: 'Add Form (Predefined)' },
  { value: 'google_form', label: 'Google Form Link' },
  { value: 'custom_form', label: 'Website Custom Form' }
];

const APPLY_MODE_LABELS = {
  direct_profile: 'Send Directly',
  predefined_form: 'Add Form',
  google_form: 'Google Form',
  custom_form: 'Website Custom Form'
};

const buildAtsFallbackScore = (application) => {
  const values = application?.submitted_details?.values || {};
  const joinedValues = Object.values(values)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .map((value) => String(value).trim())
    .join(' ');

  let score = 35;
  if (application.user_resume_url) score += 30;
  if (joinedValues) score += Math.min(25, joinedValues.length / 8);
  if (application.user_display_name || application.user_name) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const emptyJobForm = () => ({
  companyId: '',
  title: '',
  description: '',
  location: 'Remote',
  applyMode: 'direct_profile',
  predefinedFormKey: 'basic_screening',
  googleFormUrl: '',
  managerInstructions: '',
  customFormFields: [{ label: '', key: '', type: 'text', required: false }]
});

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [testLinks, setTestLinks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offboardingLetters, setOffboardingLetters] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [atsJobId, setAtsJobId] = useState('');
  const [atsShortlistCount, setAtsShortlistCount] = useState(2);
  const [atsScores, setAtsScores] = useState({});

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', department: '', bio: '', photo_url: '' });
  const [newJobForm, setNewJobForm] = useState(emptyJobForm);
  const [newInterviewForm, setNewInterviewForm] = useState({
    jobId: '', candidateEmail: '', interviewType: 'Technical', interviewerName: '', scheduledAt: '', mode: 'Google Meet', meetingLink: '', notes: ''
  });
  const [newOffboardingForm, setNewOffboardingForm] = useState({ candidateEmail: '', jobId: '', notes: '' });

  const visibleUsers = useMemo(() => users.filter((u) => u.role !== 'superadmin'), [users]);
  const applicationJobs = useMemo(() => {
    const seen = new Set();
    return applications.filter((application) => {
      const key = Number(application.job_id);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [applications]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, statsRes, usersRes, jobsRes, appRes, linksRes, ivRes, offRes, updatesRes] = await Promise.all([
        managerAPI.getProfile(),
        managerAPI.getStats(),
        managerAPI.getUsers(),
        managerAPI.getJobs(),
        managerAPI.getApplications(),
        managerAPI.getTestLinks(),
        managerAPI.getInterviews(),
        managerAPI.getOffboardingLetters(),
        managerAPI.getRecentUpdates()
      ]);
      const profile = profileRes.data.data || {};
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        bio: profile.bio || '',
        photo_url: profile.photo_url || ''
      });
      setStats(statsRes.data.data || null);
      setUsers(usersRes.data.data || []);
      setJobs(jobsRes.data.data || []);
      setApplications(appRes.data.data || []);
      setTestLinks(linksRes.data.data || []);
      setInterviews(ivRes.data.data || []);
      setOffboardingLetters(offRes.data.data || []);
      setRecentUpdates(updatesRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const withSave = async (fn, fallback) => {
    setSaving(true);
    setError('');
    try {
      await fn();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || fallback);
    } finally {
      setSaving(false);
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    await withSave(async () => {
      await managerAPI.createJob({
        companyId: newJobForm.companyId ? Number(newJobForm.companyId) : null,
        title: newJobForm.title,
        description: newJobForm.description,
        location: newJobForm.location,
        applyMode: newJobForm.applyMode,
        predefinedFormKey: newJobForm.applyMode === 'predefined_form' ? newJobForm.predefinedFormKey : null,
        googleFormUrl: newJobForm.applyMode === 'google_form' ? newJobForm.googleFormUrl : null,
        managerInstructions: newJobForm.managerInstructions,
        customFormFields: newJobForm.applyMode === 'custom_form' ? newJobForm.customFormFields : []
      });
      setNewJobForm(emptyJobForm());
    }, 'Failed to create job');
  };

  const sendTestLink = async (application) => {
    const linkUrl = window.prompt(`Enter test link URL for ${application.user_email}:`);
    if (!linkUrl) return;
    const notes = window.prompt('Optional notes for candidate:') || '';
    const passPercentage = Number(window.prompt('Pass percentage (default 75):', '75')) || 75;
    const quizQuestionCount = Number(window.prompt('Question count (default 10):', '10')) || 10;
    await withSave(() => managerAPI.shortlistAndSendTestLink(application.id, {
      linkUrl, notes, linkStatus: 'sent', passPercentage, quizQuestionCount
    }), 'Failed to send test link');
  };

  const callInterview = async (link) => {
    const suggested = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString().slice(0, 16);
    const scheduledAt = window.prompt('Interview schedule (YYYY-MM-DDTHH:mm):', suggested);
    if (!scheduledAt) return;
    const meetingLink = window.prompt('Meeting link (optional):') || '';
    await withSave(() => managerAPI.callCandidateForInterview(link.id, { scheduledAt, meetingLink }), 'Failed to send interview call');
  };

  const runAtsShortlist = async () => {
    if (!atsJobId) {
      setError('Select a job before running ATS shortlist');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await managerAPI.atsShortlistApplications(atsJobId, { shortlistCount: atsShortlistCount });
      const ranked = response.data?.data?.rankedApplications || [];
      const nextScores = {};
      ranked.forEach((application) => {
        nextScores[application.id] = {
          score: application.atsScore,
          reason: application.atsReason
        };
      });
      setAtsScores(nextScores);
      await loadData();
    } catch (err) {
      const routeMissing = err.response?.status === 404 && err.response?.data?.message === 'Route not found';
      if (!routeMissing) {
        setError(err.response?.data?.message || 'Failed to run ATS shortlist');
        setSaving(false);
        return;
      }

      const ranked = applications
        .filter((application) => Number(application.job_id) === Number(atsJobId))
        .map((application) => ({
          ...application,
          atsScore: buildAtsFallbackScore(application),
          atsReason: application.user_resume_url
            ? 'Resume and submitted details matched in fallback ATS'
            : 'Submitted details matched in fallback ATS'
        }))
        .sort((left, right) => right.atsScore - left.atsScore || new Date(left.applied_at) - new Date(right.applied_at));

      const nextScores = {};
      ranked.forEach((application) => {
        nextScores[application.id] = {
          score: application.atsScore,
          reason: application.atsReason
        };
      });

      for (const application of ranked.slice(0, atsShortlistCount)) {
        if (application.status !== 'selected') {
          await managerAPI.updateApplicationStatus(application.id, 'selected');
        }
      }

      setAtsScores(nextScores);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const renderApplicationDetails = (application) => {
    const data = application.submitted_details;
    if (!data || typeof data !== 'object') return <span className={styles.mutedText}>No details</span>;
    const values = data.values && typeof data.values === 'object' ? data.values : {};
    const keys = Object.keys(values).slice(0, 4);
    return (
      <details className={styles.inlineDetails}>
        <summary>View Submitted Data</summary>
        <div className={styles.detailsBody}>
          <p><strong>Type:</strong> {data.applyModeLabel || APPLY_MODE_LABELS[data.applyMode] || 'N/A'}</p>
          {keys.map((key) => <p key={`${application.id}-${key}`}><strong>{key}:</strong> {String(values[key] || 'N/A')}</p>)}
          {(data.profileSnapshot?.resumeUrl || application.user_resume_url) && (
            <a href={data.profileSnapshot?.resumeUrl || application.user_resume_url} target="_blank" rel="noreferrer" className={styles.inlineLink}>View Resume</a>
          )}
        </div>
      </details>
    );
  };

  const getApplicationCandidateName = (application) => {
    const values = application?.submitted_details?.values || {};
    return values.fullName || values.displayName || application.user_display_name || application.user_name || 'N/A';
  };

  const tableLoading = loading ? <div className={styles.loading}><div className={styles.spinner}></div></div> : null;

  const renderSection = () => {
    if (loading) return tableLoading;

    if (activeSection === 'dashboard') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}><h3>Applications</h3><p className={styles.bigNumber}>{stats?.totalApplications || 0}</p></div>
          <div className={styles.card}><h3>Openings</h3><p className={styles.bigNumber}>{stats?.totalOpenings || 0}</p></div>
          <div className={styles.card}><h3>Cleared Tests</h3><p className={styles.bigNumber}>{stats?.clearedTests || 0}</p></div>
          <div className={styles.card}><h3>Cleared Interviews</h3><p className={styles.bigNumber}>{stats?.clearedInterviews || 0}</p></div>
        </div>
      );
    }

    if (activeSection === 'profile') {
      return (
        <div className={styles.card}>
          <h3>Manager Profile</h3>
          <div className={styles.form}>
            <input value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
            <input value={profileForm.department} onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))} placeholder="Department" />
            <textarea value={profileForm.bio} onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" />
            <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => withSave(() => managerAPI.updateProfile(profileForm), 'Failed to update profile')}>Save Profile</button>
          </div>
        </div>
      );
    }

    if (activeSection === 'users') {
      return (
        <div className={styles.card}>
          <h3>User Management</h3>
          <table className={styles.table}><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{visibleUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.is_blocked ? 'Blocked' : 'Active'}</td>
                <td><button type="button" className={u.is_blocked ? styles.btnSuccess : styles.btnDanger} disabled={saving || u.id === user?.id} onClick={() => withSave(() => managerAPI.updateUserBlockStatus(u.id, !u.is_blocked), 'Failed to update user status')}>{u.is_blocked ? 'Unblock' : 'Block'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    }

    if (activeSection === 'jobs') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Create Job</h3>
            <form onSubmit={createJob} className={styles.form}>
              <input type="number" placeholder="Company ID (optional)" value={newJobForm.companyId} onChange={(e) => setNewJobForm((p) => ({ ...p, companyId: e.target.value }))} />
              <input type="text" placeholder="Job Title" value={newJobForm.title} onChange={(e) => setNewJobForm((p) => ({ ...p, title: e.target.value }))} required />
              <textarea placeholder="Job Description" value={newJobForm.description} onChange={(e) => setNewJobForm((p) => ({ ...p, description: e.target.value }))} />
              <input type="text" placeholder="Location" value={newJobForm.location} onChange={(e) => setNewJobForm((p) => ({ ...p, location: e.target.value }))} />
              <select value={newJobForm.applyMode} onChange={(e) => setNewJobForm((p) => ({ ...p, applyMode: e.target.value }))}>{APPLY_MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              {newJobForm.applyMode === 'predefined_form' && <select value={newJobForm.predefinedFormKey} onChange={(e) => setNewJobForm((p) => ({ ...p, predefinedFormKey: e.target.value }))}><option value="basic_screening">Basic Screening</option><option value="developer_screening">Developer Screening</option></select>}
              {newJobForm.applyMode === 'google_form' && <input type="url" placeholder="Google Form Link" value={newJobForm.googleFormUrl} onChange={(e) => setNewJobForm((p) => ({ ...p, googleFormUrl: e.target.value }))} required />}
              {newJobForm.applyMode === 'custom_form' && (
                <textarea
                  placeholder="Custom field labels (comma separated). Example: Portfolio URL, Current CTC, Notice Period"
                  value={newJobForm.customFormFields.map((field) => field.label).filter(Boolean).join(', ')}
                  onChange={(e) => {
                    const fields = e.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((label) => ({ label, key: '', type: 'text', required: true }));
                    setNewJobForm((p) => ({ ...p, customFormFields: fields.length ? fields : [{ label: '', key: '', type: 'text', required: false }] }));
                  }}
                />
              )}
              <textarea placeholder="Manager instructions (optional)" value={newJobForm.managerInstructions} onChange={(e) => setNewJobForm((p) => ({ ...p, managerInstructions: e.target.value }))} />
              <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Create Opening'}</button>
            </form>
          </div>
          <div className={styles.card}>
            <h3>Job Updates</h3>
            <table className={styles.table}><thead><tr><th>Title</th><th>Company</th><th>Apply Type</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td><td>{job.company_name}</td><td>{APPLY_MODE_LABELS[job.apply_mode] || 'Send Directly'}</td><td>{job.status}</td>
                  <td><button type="button" className={job.status === 'open' ? styles.btnWarning : styles.btnSuccess} disabled={saving} onClick={() => withSave(() => managerAPI.updateJobStatus(job.id, job.status === 'open' ? 'closed' : 'open'), 'Failed to update job status')}>{job.status === 'open' ? 'Close' : 'Open'}</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeSection === 'applications') {
      return (
        <div className={styles.card}>
          <h3>Applications</h3>
          <div className={styles.toolbarRow}>
            <select value={atsJobId} onChange={(e) => setAtsJobId(e.target.value)}>
              <option value="">Select Job For ATS</option>
              {applicationJobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>{job.job_title}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={atsShortlistCount}
              onChange={(e) => setAtsShortlistCount(Math.max(1, Number(e.target.value) || 2))}
              placeholder="Shortlist Count"
            />
            <button type="button" className={styles.btnPrimary} disabled={saving || !atsJobId} onClick={runAtsShortlist}>
              ATS Shortlist Top {atsShortlistCount}
            </button>
          </div>
          <table className={styles.table}><thead><tr><th>Job</th><th>Candidate</th><th>Email</th><th>ATS Score</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{applications.length === 0 ? <tr><td colSpan="6" className={styles.empty}>No applications found</td></tr> : applications.map((a) => (
              <tr key={a.id}>
                <td>{a.job_title}</td>
                <td>{getApplicationCandidateName(a)}{renderApplicationDetails(a)}</td>
                <td>{a.user_email}</td>
                <td>
                  {atsScores[a.id] ? (
                    <div>
                      <strong>{atsScores[a.id].score}%</strong>
                      <p className={styles.mutedText}>{atsScores[a.id].reason}</p>
                    </div>
                  ) : 'N/A'}
                </td>
                <td>{a.status}</td>
                <td><div className={styles.actionsRow}>
                  <button type="button" className={styles.btnSuccess} disabled={saving || a.status === 'selected'} onClick={() => withSave(() => managerAPI.updateApplicationStatus(a.id, 'selected'), 'Failed to shortlist')}>Shortlist</button>
                  <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => sendTestLink(a)}>Send Test Link</button>
                  <button type="button" className={styles.btnDanger} disabled={saving || a.status === 'rejected'} onClick={() => withSave(() => managerAPI.updateApplicationStatus(a.id, 'rejected'), 'Failed to reject')}>Reject</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    }

    if (activeSection === 'test-links') {
      return (
        <div className={styles.card}>
          <h3>Test Updates</h3>
          <table className={styles.table}><thead><tr><th>ID</th><th>Candidate</th><th>Status</th><th>Score</th><th>Result</th><th>Updated</th><th>Action</th></tr></thead>
            <tbody>{testLinks.length === 0 ? <tr><td colSpan="7" className={styles.empty}>No test updates yet</td></tr> : testLinks.map((link) => (
              <tr key={link.id}>
                <td>{link.id}</td>
                <td>{link.candidate_email || 'N/A'}</td>
                <td>{link.link_status}</td>
                <td>{link.latest_score ?? 'N/A'}{link.latest_score !== null && link.latest_score !== undefined ? '%' : ''}</td>
                <td>{link.is_passed ? <span className={styles.passTag}>Passed</span> : link.attempted_at ? <span className={styles.failTag}>Not Cleared</span> : <span className={styles.pendingTag}>Pending</span>}</td>
                <td>{formatDateTime(link.updated_at)}</td>
                <td><div className={styles.actionsRow}>
                  <button type="button" className={styles.btnSuccess} disabled={saving || link.link_status === 'completed'} onClick={() => withSave(() => managerAPI.updateTestLink(link.id, { linkStatus: 'completed' }), 'Failed to update test link')}>Mark Completed</button>
                  <button type="button" className={styles.btnPrimary} disabled={saving || !link.is_passed || link.interview_called} onClick={() => callInterview(link)}>{link.interview_called ? 'Interview Called' : 'Call for Interview'}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    }

    if (activeSection === 'interviews') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Generate Interview</h3>
            <form onSubmit={(e) => { e.preventDefault(); withSave(() => managerAPI.createInterview({ ...newInterviewForm, jobId: newInterviewForm.jobId ? Number(newInterviewForm.jobId) : null }), 'Failed to schedule interview'); }} className={styles.form}>
              <input type="number" placeholder="Job ID (optional)" value={newInterviewForm.jobId} onChange={(e) => setNewInterviewForm((p) => ({ ...p, jobId: e.target.value }))} />
              <input type="email" placeholder="Candidate Email" value={newInterviewForm.candidateEmail} onChange={(e) => setNewInterviewForm((p) => ({ ...p, candidateEmail: e.target.value }))} required />
              <input type="datetime-local" value={newInterviewForm.scheduledAt} onChange={(e) => setNewInterviewForm((p) => ({ ...p, scheduledAt: e.target.value }))} required />
              <button type="submit" className={styles.btnPrimary} disabled={saving}>Generate Interview</button>
            </form>
          </div>
          <div className={styles.card}>
            <h3>Interview Details</h3>
            <table className={styles.table}><thead><tr><th>Candidate</th><th>Type</th><th>Schedule</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{interviews.map((i) => <tr key={i.id}><td>{i.candidate_email}</td><td>{i.interview_type}</td><td>{formatDateTime(i.scheduled_at)}</td><td>{i.status}</td><td><button type="button" className={styles.btnSuccess} disabled={saving || i.status === 'completed'} onClick={() => withSave(() => managerAPI.updateInterviewStatus(i.id, 'completed'), 'Failed to update interview status')}>Complete</button></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeSection === 'offboarding') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Send Offboarding Letter</h3>
            <form onSubmit={(e) => { e.preventDefault(); withSave(() => managerAPI.sendOffboardingLetter({ candidateEmail: newOffboardingForm.candidateEmail, jobId: newOffboardingForm.jobId ? Number(newOffboardingForm.jobId) : null, notes: newOffboardingForm.notes }), 'Failed to send offboarding letter'); }} className={styles.form}>
              <input type="email" placeholder="Candidate Email" value={newOffboardingForm.candidateEmail} onChange={(e) => setNewOffboardingForm((p) => ({ ...p, candidateEmail: e.target.value }))} required />
              <input type="number" placeholder="Job ID (optional)" value={newOffboardingForm.jobId} onChange={(e) => setNewOffboardingForm((p) => ({ ...p, jobId: e.target.value }))} />
              <textarea placeholder="Letter notes" value={newOffboardingForm.notes} onChange={(e) => setNewOffboardingForm((p) => ({ ...p, notes: e.target.value }))} />
              <button type="submit" className={styles.btnPrimary} disabled={saving}>Send Letter</button>
            </form>
          </div>
          <div className={styles.card}>
            <h3>Offboarding Letters</h3>
            <table className={styles.table}><thead><tr><th>Candidate</th><th>Job</th><th>Status</th><th>Sent At</th></tr></thead>
              <tbody>{offboardingLetters.map((o) => <tr key={o.id}><td>{o.candidate_email}</td><td>{o.job_title || 'N/A'}</td><td>{o.status}</td><td>{formatDateTime(o.sent_at)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeSection === 'updates') {
      return (
        <div className={styles.card}>
          <h3>Recent Updates</h3>
          <table className={styles.table}><thead><tr><th>Type</th><th>Candidate</th><th>Update</th><th>Time</th></tr></thead>
            <tbody>{recentUpdates.map((u) => <tr key={u.id}><td>{u.type}</td><td>{u.candidate_email}</td><td>{u.message}</td><td>{formatDateTime(u.updated_at)}</td></tr>)}</tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <ManagerLayout activeSection={activeSection} onChangeSection={setActiveSection}>
      {error && <div className={styles.alert}>{error}</div>}
      {renderSection()}
    </ManagerLayout>
  );
};

export default ManagerDashboard;
