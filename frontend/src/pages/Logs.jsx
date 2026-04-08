import React, { useEffect, useState } from 'react';
import { logsAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Logs.module.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();

    const intervalId = setInterval(() => {
      fetchLogs({ silent: true });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [entityFilter]);

  const fetchLogs = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await logsAPI.getAll({ entityFilter });
      setLogs(response.data.data);
    } catch (err) {
      if (!silent) {
        setError('Failed to load activity logs');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
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
              <option value="application">Applications</option>
              <option value="job">Jobs</option>
              <option value="interview">Interviews</option>
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
                  <td>
                    <button
                      type="button"
                      className={styles.actionLink}
                      onClick={() => setSelectedLog(log)}
                    >
                      <span className={`${styles.badge} ${getActionBadge(log.action)}`}>{log.action}</span>
                    </button>
                  </td>
                  <td>{log.entity_type}</td>
                  <td>{log.entity_id}</td>
                  <td>{formatDate(log.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedLog(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <h3>Action Details</h3>
            <p><strong>Action:</strong> {selectedLog.action}</p>
            <p><strong>Entity:</strong> {selectedLog.entity_type} #{selectedLog.entity_id}</p>
            <p><strong>Time:</strong> {formatDate(selectedLog.created_at)}</p>
            <pre className={styles.metaBox}>{JSON.stringify(selectedLog.metadata || {}, null, 2)}</pre>
            <button type="button" className={styles.closeBtn} onClick={() => setSelectedLog(null)}>Close</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Logs;