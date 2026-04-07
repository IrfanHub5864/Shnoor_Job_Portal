import React, { useEffect, useState } from 'react';
import { logsAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Logs.module.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  const fetchLogs = async () => {
    try {
      const response = await logsAPI.getAll({ entityFilter });
      setLogs(response.data.data);
    } catch (err) {
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getActionBadge = (action) => {
    const normalized = action?.toLowerCase() || '';
    if (normalized.includes('approved')) return styles.badgeApproved;
    if (normalized.includes('rejected')) return styles.badgeRejected;
    if (normalized.includes('blocked')) return styles.badgeBlocked;
    if (normalized.includes('deleted')) return styles.badgeDeleted;
    return styles.badgeNeutral;
  };

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/logs" pageTitle="Activity Logs">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/logs" pageTitle="Activity Logs">
      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Activity Logs</h3>
          <div className={styles.filterWrap}>
            <select id="entityFilter" value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="user">Users</option>
              <option value="company">Companies</option>
              <option value="company_manager">Company Managers</option>
            </select>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className={styles.empty}>No logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td><span className={`${styles.badge} ${getActionBadge(log.action)}`}>{log.action}</span></td>
                  <td>{log.entity_type}</td>
                  <td>{log.entity_id}</td>
                  <td>{formatDate(log.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Logs;