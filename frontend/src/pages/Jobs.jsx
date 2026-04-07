import React, { useEffect, useMemo, useState } from 'react';
import { jobAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Jobs.module.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const fetchJobs = async () => {
    try {
      const res = await jobAPI.getAll();
      setJobs(res.data.data);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    setActionLoading(jobId);
    try {
      await jobAPI.delete(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      setError('Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (jobId, status) => {
    setActionLoading(jobId);
    try {
      await jobAPI.updateStatus(jobId, status);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status } : j));
    } catch (err) {
      setError('Failed to update job status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'open' ? styles.badgeOpen : styles.badgeClosed;
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = [job.title, job.company_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/jobs">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/jobs">
      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="job-search">Search</label>
          <input
            id="job-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search by job title or company"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="job-status">Status</label>
          <select
            id="job-status"
            className={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <h3>Job Management</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company Name</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.empty}>No jobs found</td>
              </tr>
            ) : (
              filteredJobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company_name}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(job.status)}`}>
                      {job.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDate(job.created_at)}</td>
                  <td>
                    <div className={styles.actions}>
                      {job.status === 'open' ? (
                        <button
                          className={styles.btnWarning}
                          onClick={() => handleStatusChange(job.id, 'closed')}
                          disabled={actionLoading === job.id}
                        >
                          ⊗ Close Job
                        </button>
                      ) : (
                        <button
                          className={styles.btnSuccess}
                          onClick={() => handleStatusChange(job.id, 'open')}
                          disabled={actionLoading === job.id}
                        >
                          ✓ Open Job
                        </button>
                      )}
                      <button
                        className={styles.btnDanger}
                        onClick={() => handleDelete(job.id)}
                        disabled={actionLoading === job.id}
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

export default Jobs;
