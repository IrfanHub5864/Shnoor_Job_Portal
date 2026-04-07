import React, { useEffect, useState } from 'react';
import { userPortalAPI } from '../../api';
import UserLayout from '../../components/user/UserLayout';
import styles from './UserCommon.module.css';

const UserInterviews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await userPortalAPI.getInterviews();
        setItems(response.data.data || []);
      } catch (err) {
        setError('Unable to fetch interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <UserLayout currentPage="/user/interviews" pageTitle="Interviews">
      {error && <div className={styles.alert}>{error}</div>}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <section className={styles.card}>
          <h3>Interview Pipeline</h3>
          {!items.length ? (
            <p className={styles.empty}>No interviews yet. You will see updates after shortlisting.</p>
          ) : (
            <div className={styles.list}>
              {items.map((item) => (
                <div className={styles.item} key={item.id}>
                  <p className={styles.itemTitle}>{item.jobTitle}</p>
                  <p className={styles.itemSub}>{item.companyName}</p>
                  <p className={styles.itemMeta}>
                    {item.scheduledAt ? `Scheduled at ${new Date(item.scheduledAt).toLocaleString()}` : 'Schedule pending from manager'}
                  </p>
                  {item.interviewType && <p className={styles.itemMeta}>Type: {item.interviewType}</p>}
                  {item.mode && <p className={styles.itemMeta}>Mode: {item.mode}</p>}
                  {item.meetingLink && (
                    <p className={styles.itemMeta}>
                      Meeting Link:{' '}
                      <a href={item.meetingLink} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                        Join Interview
                      </a>
                    </p>
                  )}
                  <span className={styles.badge}>{item.status.replaceAll('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </UserLayout>
  );
};

export default UserInterviews;
