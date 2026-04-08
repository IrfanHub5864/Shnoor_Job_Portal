import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { useSettings } from '../context/SettingsContext';
import styles from './Settings.module.css';

const buildFormSettings = (globalSettings) => ({
  platformName: globalSettings.platform_name || 'HireHub',
  companyEmail: globalSettings.company_email || 'support@hirehub.com',
  companyPhone: globalSettings.company_phone || '+1 (555) 123-4567',
  address: globalSettings.address || '123 Business Street, Suite 100, New York, NY 10001',
});

const Settings = () => {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [settings, setSettings] = useState(() => buildFormSettings(globalSettings));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  const baselineSettings = useMemo(() => buildFormSettings(globalSettings), [globalSettings]);
  const isDirty = useMemo(() => (
    settings.platformName !== baselineSettings.platformName
    || settings.companyEmail !== baselineSettings.companyEmail
    || settings.companyPhone !== baselineSettings.companyPhone
    || settings.address !== baselineSettings.address
  ), [baselineSettings, settings]);

  useEffect(() => {
    if (saving) return;
    setSettings(baselineSettings);
  }, [baselineSettings, saving]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!isDirty) {
      setSaveMessage({ type: 'info', text: 'No changes to save.' });
      return;
    }

    setSaving(true);
    setSaveMessage({ type: '', text: '' });

    try {
      await updateSettings({
        platform_name: settings.platformName,
        company_email: settings.companyEmail,
        company_phone: settings.companyPhone,
        address: settings.address,
      });
      setSaving(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (error) {
      setSaving(false);
      const message = error?.response?.data?.message || 'Failed to save settings.';
      setSaveMessage({ type: 'error', text: message });
    }
  };

  return (
    <AdminLayout currentPage="/admin/settings">
      <div className={styles.container}>
        <div className={styles.settingsCard}>
          <h3>Platform Settings</h3>

          {saveMessage.text && (
            <p
              className={`${styles.saveMessage} ${
                saveMessage.type === 'error'
                  ? styles.saveMessageError
                  : saveMessage.type === 'info'
                    ? styles.saveMessageInfo
                    : ''
              }`}
            >
              {saveMessage.text}
            </p>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="platformName">Platform Name</label>
            <input
              type="text"
              id="platformName"
              name="platformName"
              value={settings.platformName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="companyEmail">Company Email</label>
            <input
              type="email"
              id="companyEmail"
              name="companyEmail"
              value={settings.companyEmail}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="companyPhone">Company Phone</label>
            <input
              type="tel"
              id="companyPhone"
              name="companyPhone"
              value={settings.companyPhone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
            {isDirty && (
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setSaveMessage({ type: '', text: '' });
                  setSettings(baselineSettings);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className={styles.settingsCard}>
          <h3>Subscription Plans</h3>
          <div className={styles.plansGrid}>
            <div className={styles.planCard}>
              <h4>Basic</h4>
              <p className={styles.price}>$29<span>/month</span></p>
              <ul>
                <li>✓ Up to 10 Job Postings</li>
                <li>✓ Basic Analytics</li>
                <li>✓ Email Support</li>
              </ul>
            </div>

            <div className={styles.planCard}>
              <h4>Pro</h4>
              <p className={styles.price}>$79<span>/month</span></p>
              <ul>
                <li>✓ Up to 50 Job Postings</li>
                <li>✓ Advanced Analytics</li>
                <li>✓ Priority Support</li>
              </ul>
            </div>

            <div className={styles.planCard}>
              <h4>Enterprise</h4>
              <p className={styles.price}>$199<span>/month</span></p>
              <ul>
                <li>✓ Unlimited Job Postings</li>
                <li>✓ Custom Analytics</li>
                <li>✓ Dedicated Support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
