import React, { useEffect, useMemo, useState } from 'react';
import { managerAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ManagerLayout from '../components/manager/ManagerLayout';
import styles from './ManagerDashboard.module.css';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [testLinks, setTestLinks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offboardingLetters, setOffboardingLetters] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    department: '',
    bio: '',
    photo_url: ''
  });

  const [newLinkForm, setNewLinkForm] = useState({
    applicationId: '',
    jobId: '',
    candidateEmail: '',
    linkUrl: '',
    notes: '',
    linkStatus: 'pending'
  });

  const [newInterviewForm, setNewInterviewForm] = useState({
    jobId: '',
    candidateEmail: '',
    interviewType: 'Technical',
    interviewerName: '',
    scheduledAt: '',
    mode: 'Google Meet',
    meetingLink: '',
    notes: ''
  });

  const [newOffboardingForm, setNewOffboardingForm] = useState({
    candidateEmail: '',
    jobId: '',
    notes: ''
  });

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [
        profileRes,
        statsRes,
        usersRes,
        jobsRes,
        linksRes,
        interviewsRes,
        offboardingRes,
        updatesRes
      ] = await Promise.all([
        managerAPI.getProfile(),
        managerAPI.getStats(),
        managerAPI.getUsers(),
        managerAPI.getJobs(),
        managerAPI.getTestLinks(),
        managerAPI.getInterviews(),
        managerAPI.getOffboardingLetters(),
        managerAPI.getRecentUpdates()
      ]);

      const profileData = profileRes.data.data;
      setProfile(profileData);
      setProfileForm({
        name: profileData?.name || '',
        phone: profileData?.phone || '',
        department: profileData?.department || '',
        bio: profileData?.bio || '',
        photo_url: profileData?.photo_url || ''
      });
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setJobs(jobsRes.data.data);
      setTestLinks(linksRes.data.data);
      setInterviews(interviewsRes.data.data);
      setOffboardingLetters(offboardingRes.data.data);
      setRecentUpdates(updatesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  };

  const managerVisibleUsers = useMemo(
    () => users.filter((u) => u.role !== 'superadmin'),
    [users]
  );

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleProfileChange('photo_url', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await managerAPI.updateProfile(profileForm);
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockToggle = async (targetUser) => {
    setSaving(true);
    setError('');
    try {
      await managerAPI.updateUserBlockStatus(targetUser.id, !targetUser.is_blocked);
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setSaving(false);
    }
  };

  const handleJobStatusToggle = async (job) => {
    setSaving(true);
    setError('');
    try {
      const nextStatus = job.status === 'open' ? 'closed' : 'open';
      await managerAPI.updateJobStatus(job.id, nextStatus);
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setSaving(false);
    }
  };

  const createTestLink = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await managerAPI.createTestLink({
        ...newLinkForm,
        applicationId: newLinkForm.applicationId ? Number(newLinkForm.applicationId) : null,
        jobId: newLinkForm.jobId ? Number(newLinkForm.jobId) : null
      });
      setNewLinkForm({
        applicationId: '',
        jobId: '',
        candidateEmail: '',
        linkUrl: '',
        notes: '',
        linkStatus: 'pending'
      });
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test link');
    } finally {
      setSaving(false);
    }
  };

  const markTestCompleted = async (link) => {
    setSaving(true);
    setError('');
    try {
      await managerAPI.updateTestLink(link.id, {
        linkStatus: 'completed',
        notes: link.notes ? `${link.notes} | Candidate completed exam` : 'Candidate completed exam'
      });
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update test link');
    } finally {
      setSaving(false);
    }
  };

  const createInterview = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await managerAPI.createInterview({
        ...newInterviewForm,
        jobId: newInterviewForm.jobId ? Number(newInterviewForm.jobId) : null
      });
      setNewInterviewForm({
        jobId: '',
        candidateEmail: '',
        interviewType: 'Technical',
        interviewerName: '',
        scheduledAt: '',
        mode: 'Google Meet',
        meetingLink: '',
        notes: ''
      });
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setSaving(false);
    }
  };

  const updateInterviewStatus = async (interview, status) => {
    setSaving(true);
    setError('');
    try {
      await managerAPI.updateInterviewStatus(interview.id, status);
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update interview status');
    } finally {
      setSaving(false);
    }
  };

  const sendOffboardingLetter = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await managerAPI.sendOffboardingLetter({
        candidateEmail: newOffboardingForm.candidateEmail,
        jobId: newOffboardingForm.jobId ? Number(newOffboardingForm.jobId) : null,
        notes: newOffboardingForm.notes
      });
      setNewOffboardingForm({ candidateEmail: '', jobId: '', notes: '' });
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send offboarding letter');
    } finally {
      setSaving(false);
    }
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      );
    }

    if (activeSection === 'dashboard') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}><h3>Applications</h3><p className={styles.bigNumber}>{stats?.totalApplications || 0}</p></div>
          <div className={styles.card}><h3>Openings</h3><p className={styles.bigNumber}>{stats?.totalOpenings || 0}</p></div>
          <div className={styles.card}><h3>Cleared Tests</h3><p className={styles.bigNumber}>{stats?.clearedTests || 0}</p></div>
          <div className={styles.card}><h3>Cleared Interviews</h3><p className={styles.bigNumber}>{stats?.clearedInterviews || 0}</p></div>
          <div className={styles.card}><h3>Cleared Both</h3><p className={styles.bigNumber}>{stats?.clearedBoth || 0}</p></div>
          <div className={styles.card}><h3>Offboarding Letters Sent</h3><p className={styles.bigNumber}>{stats?.offboardingLettersSent || 0}</p></div>
        </div>
      );
    }

    if (activeSection === 'profile') {
      return (
        <div className={styles.card}>
          <h3>Editable Manager Profile</h3>
          <div className={styles.profileEditor}>
            <div className={styles.profilePhotoBlock}>
              <img
                src={profileForm.photo_url || 'https://via.placeholder.com/120?text=Photo'}
                alt="Profile"
                className={styles.profilePhoto}
              />
              <input type="file" accept="image/*" onChange={handleProfilePhoto} />
            </div>
            <div className={styles.form}>
              <input value={profileForm.name} onChange={(e) => handleProfileChange('name', e.target.value)} placeholder="Name" />
              <input value={profileForm.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} placeholder="Phone" />
              <input value={profileForm.department} onChange={(e) => handleProfileChange('department', e.target.value)} placeholder="Department" />
              <textarea value={profileForm.bio} onChange={(e) => handleProfileChange('bio', e.target.value)} placeholder="Bio" />
              <button type="button" className={styles.btnPrimary} onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'users') {
      return (
        <div className={styles.card}>
          <h3>User Management</h3>
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {managerVisibleUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.is_blocked ? 'Blocked' : 'Active'}</td>
                  <td><button type="button" className={u.is_blocked ? styles.btnSuccess : styles.btnDanger} onClick={() => handleBlockToggle(u)} disabled={saving || u.id === user?.id}>{u.is_blocked ? 'Unblock' : 'Block'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === 'jobs') {
      return (
        <div className={styles.card}>
          <h3>Job Updates</h3>
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company_name}</td>
                  <td>{job.status}</td>
                  <td><button type="button" className={job.status === 'open' ? styles.btnWarning : styles.btnSuccess} onClick={() => handleJobStatusToggle(job)} disabled={saving}>{job.status === 'open' ? 'Close' : 'Open'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeSection === 'test-links') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Create Test Link</h3>
            <form onSubmit={createTestLink} className={styles.form}>
              <input type="number" placeholder="Application ID (optional)" value={newLinkForm.applicationId} onChange={(e) => setNewLinkForm((prev) => ({ ...prev, applicationId: e.target.value }))} />
              <input type="number" placeholder="Job ID (optional)" value={newLinkForm.jobId} onChange={(e) => setNewLinkForm((prev) => ({ ...prev, jobId: e.target.value }))} />
              <input type="email" placeholder="Candidate Email" value={newLinkForm.candidateEmail} onChange={(e) => setNewLinkForm((prev) => ({ ...prev, candidateEmail: e.target.value }))} required />
              <input type="url" placeholder="Test Link URL" value={newLinkForm.linkUrl} onChange={(e) => setNewLinkForm((prev) => ({ ...prev, linkUrl: e.target.value }))} required />
              <select value={newLinkForm.linkStatus} onChange={(e) => setNewLinkForm((prev) => ({ ...prev, linkStatus: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
              <textarea placeholder="Notes" value={newLinkForm.notes} onChange={(e) => setNewLinkForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Create Test Link'}</button>
            </form>
          </div>

          <div className={styles.card}>
            <h3>Test Details</h3>
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Candidate</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead>
              <tbody>
                {testLinks.map((link) => (
                  <tr key={link.id}>
                    <td>{link.id}</td>
                    <td>{link.candidate_email || 'N/A'}</td>
                    <td>{link.link_status}</td>
                    <td>{formatDateTime(link.updated_at)}</td>
                    <td><button type="button" className={styles.btnSuccess} onClick={() => markTestCompleted(link)} disabled={saving || link.link_status === 'completed'}>Mark Completed</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeSection === 'interviews') {
      return (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Generate Interview</h3>
            <form onSubmit={createInterview} className={styles.form}>
              <input type="number" placeholder="Job ID (optional)" value={newInterviewForm.jobId} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, jobId: e.target.value }))} />
              <input type="email" placeholder="Candidate Email" value={newInterviewForm.candidateEmail} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, candidateEmail: e.target.value }))} required />
              <select value={newInterviewForm.interviewType} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, interviewType: e.target.value }))}>
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Managerial">Managerial</option>
              </select>
              <input type="text" placeholder="Interviewer Name" value={newInterviewForm.interviewerName} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, interviewerName: e.target.value }))} />
              <input type="datetime-local" value={newInterviewForm.scheduledAt} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, scheduledAt: e.target.value }))} required />
              <input type="text" placeholder="Mode" value={newInterviewForm.mode} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, mode: e.target.value }))} />
              <input type="url" placeholder="Meeting Link" value={newInterviewForm.meetingLink} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, meetingLink: e.target.value }))} />
              <textarea placeholder="Interview notes" value={newInterviewForm.notes} onChange={(e) => setNewInterviewForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Generate Interview'}</button>
            </form>
          </div>

          <div className={styles.card}>
            <h3>Interview Details</h3>
            <table className={styles.table}>
              <thead><tr><th>Candidate</th><th>Type</th><th>Schedule</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {interviews.map((item) => (
                  <tr key={item.id}>
                    <td>{item.candidate_email}</td>
                    <td>{item.interview_type}</td>
                    <td>{formatDateTime(item.scheduled_at)}</td>
                    <td>{item.status}</td>
                    <td>
                      <div className={styles.actionsRow}>
                        <button type="button" className={styles.btnSuccess} disabled={saving || item.status === 'completed'} onClick={() => updateInterviewStatus(item, 'completed')}>Complete</button>
                        <button type="button" className={styles.btnWarning} disabled={saving || item.status === 'rescheduled'} onClick={() => updateInterviewStatus(item, 'rescheduled')}>Reschedule</button>
                        <button type="button" className={styles.btnDanger} disabled={saving || item.status === 'cancelled'} onClick={() => updateInterviewStatus(item, 'cancelled')}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
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
            <form onSubmit={sendOffboardingLetter} className={styles.form}>
              <input type="email" placeholder="Candidate Email" value={newOffboardingForm.candidateEmail} onChange={(e) => setNewOffboardingForm((prev) => ({ ...prev, candidateEmail: e.target.value }))} required />
              <input type="number" placeholder="Job ID (optional)" value={newOffboardingForm.jobId} onChange={(e) => setNewOffboardingForm((prev) => ({ ...prev, jobId: e.target.value }))} />
              <textarea placeholder="Letter notes" value={newOffboardingForm.notes} onChange={(e) => setNewOffboardingForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? 'Sending...' : 'Send Letter'}</button>
            </form>
          </div>
          <div className={styles.card}>
            <h3>Offboarding Letters</h3>
            <table className={styles.table}>
              <thead><tr><th>Candidate</th><th>Job</th><th>Status</th><th>Sent At</th></tr></thead>
              <tbody>
                {offboardingLetters.length === 0 ? (
                  <tr><td colSpan="4" className={styles.empty}>No offboarding letters sent</td></tr>
                ) : (
                  offboardingLetters.map((o) => (
                    <tr key={o.id}>
                      <td>{o.candidate_email}</td>
                      <td>{o.job_title || 'N/A'}</td>
                      <td>{o.status}</td>
                      <td>{formatDateTime(o.sent_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeSection === 'updates') {
      return (
        <div className={styles.card}>
          <h3>Recent Updates</h3>
          <table className={styles.table}>
            <thead><tr><th>Type</th><th>Candidate</th><th>Update</th><th>Time</th></tr></thead>
            <tbody>
              {recentUpdates.length === 0 ? (
                <tr><td colSpan="4" className={styles.empty}>No updates available</td></tr>
              ) : (
                recentUpdates.map((item) => (
                  <tr key={item.id}>
                    <td>{item.type}</td>
                    <td>{item.candidate_email}</td>
                    <td>{item.message}</td>
                    <td>{formatDateTime(item.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
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
