import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './OTPVerificationPage.module.css';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();

  const userId = location.state?.userId;
  const email = location.state?.email;

  if (!userId || !email) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <p>Please login first</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(userId, otp);
      if (result?.user?.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Verify OTP</h2>

        <p className={styles.subtitle}>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
        <p className={styles.demoOtp}>Demo OTP: <strong>123456</strong></p>

        {error && <div className={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              className={styles.otpInput}
            />
            <p className={styles.hint}>Use the demo OTP shown above</p>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/login')}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
