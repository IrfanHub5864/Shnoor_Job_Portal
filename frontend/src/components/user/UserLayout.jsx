import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './UserLayout.module.css';

const UserLayout = ({ children, currentPage, pageTitle, currentSubSection }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(currentPage === '/user/my-profile');

  const profileSubSections = useMemo(
    () => [
      { key: 'profile-header', label: 'Profile Header' },
      { key: 'basic', label: 'Basic Details' },
      { key: 'education', label: 'Education Details' },
      { key: 'internships-work', label: 'Internships & Work' },
      { key: 'skills', label: 'Skills & Languages' },
      { key: 'projects', label: 'Projects' },
      { key: 'accomplishments', label: 'Accomplishments' },
      { key: 'extracurricular', label: 'Extra Curricular' },
      { key: 'resume', label: 'Resume' },
      { key: 'view-saved', label: 'View Saved Data' }
    ],
    []
  );

  const menuItems = useMemo(
    () => [
      { name: 'Home', path: '/user/home', icon: 'HM' },
      { name: 'Job Profiles', path: '/user/job-profiles', icon: 'JP' },
      { name: 'My Profile', path: '/user/my-profile', icon: 'MP', children: profileSubSections },
      { name: 'Interviews', path: '/user/interviews', icon: 'IV' },
      { name: 'Test Updates', path: '/user/assessments', icon: 'AS' },
      { name: 'Events', path: '/user/events', icon: 'EV' },
      { name: 'Competitions', path: '/user/competitions', icon: 'CP' },
      { name: 'Resume', path: '/user/resume', icon: 'RS' },
      { name: 'Help', path: '/user/help', icon: 'HP' }
    ],
    [profileSubSections]
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileMenuClick = () => {
    if (currentPage !== '/user/my-profile') {
      navigate('/user/my-profile?section=profile-header');
      setProfileExpanded(true);
      return;
    }

    setProfileExpanded((prev) => !prev);
  };

  const handleProfileSubSectionClick = (sectionKey) => {
    navigate(`/user/my-profile?section=${sectionKey}`);
  };

  const derivedTitle = pageTitle || menuItems.find((item) => item.path === currentPage)?.name || 'User Panel';

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <div>
            <p className={styles.logo}>Shnoor</p>
            {sidebarOpen && <p className={styles.logoSub}>Career Portal</p>}
          </div>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? '<<' : '>>'}
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = currentPage === item.path;
            const isProfileItem = item.path === '/user/my-profile';

            return (
              <div key={item.path}>
                <button
                  type="button"
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={isProfileItem ? handleProfileMenuClick : () => navigate(item.path)}
                  title={item.name}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {sidebarOpen && <span className={styles.label}>{item.name}</span>}
                  {isProfileItem && sidebarOpen && (
                    <span className={styles.expandIcon}>{profileExpanded ? 'v' : '>'}</span>
                  )}
                </button>

                {isProfileItem && sidebarOpen && profileExpanded && (
                  <div className={styles.subMenu}>
                    {item.children.map((subItem) => (
                      <button
                        key={subItem.key}
                        type="button"
                        className={`${styles.subNavItem} ${currentSubSection === subItem.key ? styles.subActive : ''}`}
                        onClick={() => handleProfileSubSectionClick(subItem.key)}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name || 'User'}</p>
              <p className={styles.userEmail}>{user?.email || ''}</p>
            </div>
          )}
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            {sidebarOpen ? 'Logout' : 'LO'}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2>{derivedTitle}</h2>
          <span className={styles.userBadge}>{(user?.role || 'user').toUpperCase()}</span>
        </header>
        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
};

export default UserLayout;
