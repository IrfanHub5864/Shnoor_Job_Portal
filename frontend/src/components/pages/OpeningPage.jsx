import styles from './OpeningPage.module.css';
import { useSettings } from '../../context/SettingsContext';

const OpeningPage = ({ onGetStarted, onLogin, onRegister }) => {
  const { settings } = useSettings();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo and Title */}
        <div className={styles.header}>
          <h1 className={styles.logo}>{settings.platform_name || 'HireHub'}</h1>
          <p className={styles.tagline}>Your next job starts here</p>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <span>100+ Companies</span>
          <span>•</span>
          <span>500+ Jobs</span>
          <span>•</span>
          <span>1000+ Users</span>
        </div>

        {/* Primary Button */}
        <button className={styles.primaryBtn} onClick={onGetStarted}>
          Get Started
        </button>

        {/* Secondary Buttons */}
        <div className={styles.secondaryBtns}>
          <button className={styles.secondaryBtn} onClick={onLogin}>
            Login
          </button>
          <button className={styles.secondaryBtn} onClick={onRegister}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpeningPage;
