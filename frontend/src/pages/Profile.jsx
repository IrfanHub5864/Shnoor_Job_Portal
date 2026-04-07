import React, { useMemo, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Profile.module.css';

const PROFILE_STORAGE_KEY = 'super-admin-profile';

const createAvatarDataUrl = (fullName) => {
  const initials = String(fullName || 'SA')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'SA';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" fill="none">
      <defs>
        <linearGradient id="bg" x1="32" y1="20" x2="208" y2="220" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0f172a" />
          <stop offset="1" stop-color="#2563eb" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(78 58) rotate(57) scale(150 145)">
          <stop stop-color="#60a5fa" stop-opacity="0.4" />
          <stop offset="1" stop-color="#60a5fa" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="240" height="240" rx="120" fill="url(#bg)" />
      <circle cx="72" cy="68" r="96" fill="url(#glow)" />
      <circle cx="120" cy="102" r="50" fill="#dbeafe" fill-opacity="0.18" />
      <circle cx="120" cy="90" r="34" fill="#ffffff" fill-opacity="0.92" />
      <path d="M60 200C60 162.562 86.8629 132 120 132C153.137 132 180 162.562 180 200" stroke="#ffffff" stroke-opacity="0.22" stroke-width="14" stroke-linecap="round" />
      <text x="120" y="126" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const formatDateTime = (value) => new Date(value).toLocaleString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const initialProfile = {
  fullName: 'Sameer Sohail',
  email: 'admin@hirehub.com',
  role: 'Super Admin',
  phone: '+91 98765 43210',
  location: 'Andhra Pradesh, India',
  designation: 'Platform Administrator',
  department: 'System Management',
  experience: '2',
  skills: 'Platform Operations, User Management, Security Reviews, System Monitoring',
  accountCreated: '2024-01-12T09:30:00.000Z',
  lastLogin: '2026-04-06T08:15:00.000Z',
};

const initialPasswordState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const readStoredProfile = () => {
  if (typeof window === 'undefined') return null;

  try {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    return null;
  }
};

const buildProfileState = () => {
  const storedProfile = readStoredProfile();
  const mergedProfile = {
    ...initialProfile,
    ...storedProfile,
  };

  return {
    ...mergedProfile,
    image: storedProfile?.image || createAvatarDataUrl(mergedProfile.fullName),
  };
};

const persistProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    // Best-effort persistence for the mock profile.
  }
};

const Profile = () => {
  const [profile, setProfile] = useState(() => buildProfileState());
  const [draft, setDraft] = useState(() => buildProfileState());
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(() => buildProfileState().image);
  const [passwordForm, setPasswordForm] = useState(initialPasswordState);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const skillTags = useMemo(() => (
    String(isEditing ? draft.skills : profile.skills)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  ), [draft.skills, isEditing, profile.skills]);

  const profileImage = previewImage || profile.image;

  const startEditing = () => {
    setDraft({ ...profile });
    setPreviewImage(profile.image);
    setIsEditing(true);
    setFeedback({ type: '', message: '' });
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(String(reader.result || ''));
      setFeedback({ type: '', message: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const nextProfile = {
      ...profile,
      ...draft,
      image: previewImage || profile.image,
    };

    setProfile(nextProfile);
    setDraft(nextProfile);
    setPreviewImage(nextProfile.image);
    setIsEditing(false);
    persistProfile(nextProfile);
    setFeedback({ type: 'success', message: 'Profile updated locally.' });
  };

  const handleCancelProfile = () => {
    setDraft({ ...profile });
    setPreviewImage(profile.image);
    setIsEditing(false);
    setFeedback({ type: '', message: '' });
  };

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordSave = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Please complete all password fields.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirm password must match.' });
      return;
    }

    setPasswordForm(initialPasswordState);
    setFeedback({ type: 'success', message: 'Password change saved locally.' });
  };

  return (
    <AdminLayout currentPage="/admin/profile" pageTitle="My Profile">
      <div className={styles.pageShell}>
        {feedback.message && (
          <div className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
            {feedback.message}
          </div>
        )}

        <div className={styles.heroCard}>
          <div className={styles.heroImageBlock}>
            <div className={styles.avatarFrame}>
              <img className={styles.avatarImage} src={profileImage} alt="Super admin profile" />
            </div>

            <div className={styles.uploadBlock}>
              <label htmlFor="profileImage" className={styles.fieldLabel}>Profile Image</label>
              <input id="profileImage" type="file" accept="image/*" onChange={handleImageUpload} />
              <p className={styles.helperText}>Preview updates instantly. Save keeps the image locally.</p>
            </div>
          </div>

          <div className={styles.heroContent}>
            <div>
              <p className={styles.kicker}>Super Admin profile</p>
              <h2>{profile.fullName}</h2>
              <p className={styles.subtleText}>{profile.designation} · {profile.department}</p>
            </div>

            <div className={styles.heroMetaGrid}>
              <div className={styles.metaChip}>
                <span>Role</span>
                <strong>{profile.role}</strong>
              </div>
              <div className={styles.metaChip}>
                <span>Experience</span>
                <strong>{profile.experience} years</strong>
              </div>
            </div>

            <div className={styles.actionRow}>
              {!isEditing ? (
                <button type="button" className={styles.primaryBtn} onClick={startEditing}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button type="button" className={styles.primaryBtn} onClick={handleSaveProfile}>
                    Save
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={handleCancelProfile}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Personal Information</h3>
              <span className={styles.sectionNote}>Editable profile basics</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" value={draft.fullName} onChange={handleDraftChange} disabled={!isEditing} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="email">Email</label>
                <input id="email" value={profile.email} readOnly />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="role">Role</label>
                <input id="role" value={profile.role} readOnly />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" value={draft.phone} onChange={handleDraftChange} disabled={!isEditing} />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel} htmlFor="location">Location</label>
                <input id="location" name="location" value={draft.location} onChange={handleDraftChange} disabled={!isEditing} />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Professional Information</h3>
              <span className={styles.sectionNote}>Platform leadership profile</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="designation">Designation</label>
                <input id="designation" name="designation" value={draft.designation} onChange={handleDraftChange} disabled={!isEditing} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="department">Department</label>
                <input id="department" name="department" value={draft.department} onChange={handleDraftChange} disabled={!isEditing} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="experience">Experience (years)</label>
                <input id="experience" name="experience" type="number" min="0" value={draft.experience} onChange={handleDraftChange} disabled={!isEditing} />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel} htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  name="skills"
                  rows="4"
                  value={draft.skills}
                  onChange={handleDraftChange}
                  disabled={!isEditing}
                />
                <div className={styles.tagRow}>
                  {skillTags.map((tag) => (
                    <span key={tag} className={styles.skillTag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Account Information</h3>
              <span className={styles.sectionNote}>Read-only system details</span>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span>Account Created</span>
                <strong>{formatDateTime(profile.accountCreated)}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Last Login</span>
                <strong>{formatDateTime(profile.lastLogin)}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Security Settings</h3>
              <span className={styles.sectionNote}>Mock only</span>
            </div>

            <div className={styles.securityGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFieldChange}
                />
              </div>
            </div>

            <div className={styles.actionRow}>
              <button type="button" className={styles.primaryBtn} onClick={handlePasswordSave}>
                Update Password
              </button>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;
