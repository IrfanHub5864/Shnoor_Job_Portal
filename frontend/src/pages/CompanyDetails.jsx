import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { companyAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './CompanyDetails.module.css';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await companyAPI.getDetails(id);
      setDetails(response.data.data);
    } catch (err) {
      setError('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: styles.badgeApproved,
      pending: styles.badgePending,
      rejected: styles.badgeRejected,
      blocked: styles.badgeBlocked,
      active: styles.badgeApproved,
      inactive: styles.badgeBlocked,
    };
    return badges[status] || '';
  };

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/companies" pageTitle="Company Details">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!details) {
    return (
      <AdminLayout currentPage="/admin/companies" pageTitle="Company Details">
        <div className={styles.emptyState}>
          {error || 'Company details not found'}
          <button className={styles.backBtn} onClick={() => navigate('/admin/companies')}>Back</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/companies" pageTitle="Company Details">
      {error && <div className={styles.alert}>{error}</div>}

      <button className={styles.backBtn} onClick={() => navigate('/admin/companies')}>
        ← Back to Companies
      </button>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h4>Company</h4>
          <p>{details.company.name}</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>Company Manager</h4>
          <p>{details.company.owner_name || 'N/A'}</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>Subscription</h4>
          <p>{details.subscription?.plan_name || 'No subscription'}</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>Total Jobs</h4>
          <p>{details.stats.total_jobs_posted}</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>Applications</h4>
          <p>{details.stats.total_applications_received}</p>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <h3>Company Profile</h3>
          <div className={styles.detailList}>
            <div><span>Name:</span> {details.company.name}</div>
            <div><span>Company Manager:</span> {details.company.owner_name || 'N/A'}</div>
            <div><span>Email:</span> {details.company.email || 'N/A'}</div>
            <div><span>Status:</span> <span className={`${styles.badge} ${getStatusBadge(details.company.status)}`}>{details.company.status?.toUpperCase()}</span></div>
            <div><span>Created At:</span> {formatDate(details.company.created_at)}</div>
            <div><span>Subscription Plan:</span> {details.subscription?.plan_name || 'N/A'}</div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3>Jobs Posted</h3>
          <div className={styles.jobsTableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {details.jobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={styles.empty}>No jobs posted</td>
                  </tr>
                ) : (
                  details.jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td><span className={`${styles.badge} ${job.status === 'open' ? styles.badgeOpen : styles.badgeClosed}`}>{job.status.toUpperCase()}</span></td>
                      <td>{job.applications_count}</td>
                      <td>{formatDate(job.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CompanyDetails;