import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Applications.module.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationAPI.getAll();
      setApplications(res.data.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    setActionLoading(appId);
    try {
      await applicationAPI.updateStatus(appId, status);
      setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      setError('Failed to update application status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    
    setActionLoading(appId);
    try {
      await applicationAPI.delete(appId);
      setApplications(applications.filter(a => a.id !== appId));
    } catch (err) {
      setError('Failed to delete application');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      applied: styles.badgeApplied,
      rejected: styles.badgeRejected,
      selected: styles.badgeSelected,
    };
    return badges[status] || '';
  };

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/applications">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/applications">
      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.tableContainer}>
        <h3>Application Management</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Candidate Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.empty}>No applications found</td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td>{app.job_title}</td>
                  <td>{app.user_name}</td>
                  <td>{app.user_email}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(app.status)}`}>
                      {app.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {app.status !== 'selected' && (
                        <button
                          className={styles.btnSuccess}
                          onClick={() => handleStatusChange(app.id, 'selected')}
                          disabled={actionLoading === app.id}
                        >
                          ✓ Select
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          disabled={actionLoading === app.id}
                        >
                          ✕ Reject
                        </button>
                      )}
                      <button
                        className={styles.btnDanger}
                        onClick={() => handleDelete(app.id)}
                        disabled={actionLoading === app.id}
                        style={{ marginLeft: '8px' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Applications;
