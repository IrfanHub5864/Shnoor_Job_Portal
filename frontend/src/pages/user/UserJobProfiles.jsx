import React, { useEffect, useState } from 'react';
import { userPortalAPI } from '../../api';
import UserLayout from '../../components/user/UserLayout';
import styles from './UserJobProfiles.module.css';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Not disclosed';
  if (min && max) return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  return `$${Number(min || max).toLocaleString()}`;
};

const APPLY_MODE_LABELS = {
  direct_profile: 'Send Directly',
  predefined_form: 'Add Form',
  google_form: 'Google Form Link',
  custom_form: 'Website Custom Form'
};

const getPredefinedFields = (key) => {
  if (key === 'developer_screening') {
    return [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'text', required: true },
      { key: 'primaryLanguage', label: 'Primary Programming Language', type: 'text', required: true },
      { key: 'githubUrl', label: 'GitHub URL', type: 'text', required: false },
      { key: 'portfolioUrl', label: 'Portfolio URL', type: 'text', required: false },
      { key: 'resumeUrl', label: 'Resume URL', type: 'text', required: true },
      { key: 'coverLetter', label: 'Why should we hire you?', type: 'textarea', required: false }
    ];
  }

  return [
    { key: 'fullName', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone Number', type: 'text', required: true },
    { key: 'currentLocation', label: 'Current Location', type: 'text', required: true },
    { key: 'experienceYears', label: 'Total Experience (Years)', type: 'number', required: true },
    { key: 'skills', label: 'Top Skills', type: 'textarea', required: true },
    { key: 'resumeUrl', label: 'Resume URL', type: 'text', required: true }
  ];
};

const buildFallbackFormConfig = (job) => {
  const applyMode = job.apply_mode || 'direct_profile';
  let formFields = [];

  if (applyMode === 'predefined_form') {
    formFields = getPredefinedFields(job.predefined_form_key || 'basic_screening');
  } else if (applyMode === 'custom_form') {
    formFields = Array.isArray(job.custom_form_fields) ? job.custom_form_fields : [];
  } else if (applyMode === 'direct_profile') {
    formFields = [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'text', required: true },
      { key: 'currentLocation', label: 'Current Location', type: 'text', required: false },
      { key: 'skills', label: 'Skills', type: 'textarea', required: false },
      { key: 'resumeUrl', label: 'Resume URL', type: 'text', required: true }
    ];
  }

  return {
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.company_name,
    applyMode,
    applyModeLabel: APPLY_MODE_LABELS[applyMode] || 'Send Directly',
    managerInstructions: job.manager_instructions || '',
    googleFormUrl: job.google_form_url || '',
    formFields,
    prefilledDetails: {}
  };
};

const renderFieldInput = (field, value, onChange) => {
  const commonProps = {
    value: value || '',
    onChange: (e) => onChange(field.key, e.target.value),
    required: field.required
  };

  if (field.type === 'textarea') {
    return <textarea {...commonProps} rows={3} />;
  }

  return <input {...commonProps} type={field.type || 'text'} />;
};

const UserJobProfiles = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    loading: false,
    job: null,
    formConfig: null,
    formValues: {},
    googleConfirmed: false
  });

  const fetchJobs = async () => {
    try {
      const response = await userPortalAPI.getJobs();
      setJobs(response.data.data || []);
    } catch (err) {
      setError('Unable to fetch job profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openApplyModal = async (job) => {
    setError('');
    setInfo('');
    setModal((prev) => ({ ...prev, open: true, loading: true, job }));
    try {
      const response = await userPortalAPI.getJobApplicationForm(job.id);
      const config = response.data.data;
      setModal({
        open: true,
        loading: false,
        job,
        formConfig: config,
        formValues: config.prefilledDetails || {},
        googleConfirmed: false
      });
    } catch (err) {
      const routeMissing = err.response?.status === 404 && err.response?.data?.message === 'Route not found';
      if (!routeMissing) {
        setModal({
          open: false,
          loading: false,
          job: null,
          formConfig: null,
          formValues: {},
          googleConfirmed: false
        });
        setError(err.response?.data?.message || 'Unable to open application form');
        return;
      }

      const fallbackConfig = buildFallbackFormConfig(job);
      setModal({
        open: true,
        loading: false,
        job,
        formConfig: fallbackConfig,
        formValues: fallbackConfig.prefilledDetails || {},
        googleConfirmed: false
      });
    }
  };

  const closeModal = () => {
    if (modal.loading || applyingId) return;
    setModal({
      open: false,
      loading: false,
      job: null,
      formConfig: null,
      formValues: {},
      googleConfirmed: false
    });
  };

  const updateField = (key, value) => {
    setModal((prev) => ({
      ...prev,
      formValues: {
        ...prev.formValues,
        [key]: value
      }
    }));
  };

  const submitApplication = async () => {
    if (!modal.job || !modal.formConfig) return;
    setApplyingId(modal.job.id);
    setError('');
    setInfo('');

    try {
      const mode = modal.formConfig.applyMode;
      const payload = mode === 'google_form'
        ? { confirmExternalSubmission: modal.googleConfirmed }
        : { submittedDetails: modal.formValues };

      await userPortalAPI.applyToJob(modal.job.id, payload);
      setInfo('Application submitted successfully.');
      setJobs((prev) => prev.map((job) => (job.id === modal.job.id ? { ...job, hasApplied: true } : job)));
      setModal({
        open: false,
        loading: false,
        job: null,
        formConfig: null,
        formValues: {},
        googleConfirmed: false
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to apply for this job');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <UserLayout currentPage="/user/job-profiles" pageTitle="Job Profiles">
      {error && <div className={styles.alertError}>{error}</div>}
      {info && <div className={styles.alertInfo}>{info}</div>}

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}></div></div>
      ) : !jobs.length ? (
        <div className={styles.empty}>No open job profiles found right now.</div>
      ) : (
        <div className={styles.grid}>
          {jobs.map((job) => (
            <article className={styles.card} key={job.id}>
              <div className={styles.cardHeader}>
                <h3>{job.title}</h3>
                <span className={styles.badge}>{job.status}</span>
              </div>
              <p className={styles.company}>{job.company_name}</p>
              <p className={styles.modeTag}>{job.applyModeLabel || 'Send Directly'}</p>
              <p className={styles.desc}>{job.description || 'No description provided by company.'}</p>
              <div className={styles.meta}>
                <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
                <p><strong>Salary:</strong> {formatSalary(job.salary_min, job.salary_max)}</p>
              </div>
              <button type="button" className={styles.applyBtn} onClick={() => openApplyModal(job)} disabled={job.hasApplied || applyingId === job.id}>
                {job.hasApplied ? 'Applied' : applyingId === job.id ? 'Applying...' : 'Apply Now'}
              </button>
            </article>
          ))}
        </div>
      )}

      {modal.open && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {modal.loading || !modal.formConfig ? (
              <div className={styles.loading}><div className={styles.spinner}></div></div>
            ) : (
              <>
                <h3>Apply: {modal.formConfig.jobTitle}</h3>
                <p className={styles.modalSub}>{modal.formConfig.applyModeLabel}</p>
                {!!modal.formConfig.managerInstructions && <p className={styles.modalSub}>{modal.formConfig.managerInstructions}</p>}

                {modal.formConfig.applyMode === 'google_form' ? (
                  <div className={styles.stack}>
                    <p>Complete this Google form first:</p>
                    <a href={modal.formConfig.googleFormUrl} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                      Open Google Form
                    </a>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={modal.googleConfirmed}
                        onChange={(e) => setModal((prev) => ({ ...prev, googleConfirmed: e.target.checked }))}
                      />
                      I have submitted the Google form.
                    </label>
                  </div>
                ) : (
                  <div className={styles.stack}>
                    {modal.formConfig.formFields.map((field) => (
                      <div key={field.key}>
                        <label>{field.label}{field.required ? ' *' : ''}</label>
                        {renderFieldInput(field, modal.formValues[field.key], updateField)}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={Boolean(applyingId)}>Cancel</button>
                  <button
                    type="button"
                    className={styles.applyBtn}
                    onClick={submitApplication}
                    disabled={Boolean(applyingId) || (modal.formConfig.applyMode === 'google_form' && !modal.googleConfirmed)}
                  >
                    {applyingId ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserJobProfiles;
