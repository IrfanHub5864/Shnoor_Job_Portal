import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import styles from './AdminLayout.module.css';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  manager: 'Manager',
  company_manager: 'Company Manager',
  user: 'User',
};

const normalizeRole = (role) => role || 'user';

const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || ROLE_LABELS.user;

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'SA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (text, searchTerm) => {
  if (!searchTerm) return text;

  const query = searchTerm.trim();
  if (!query) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig');
  return String(text).split(regex).map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return <mark key={`${part}-${index}`} className={styles.searchHighlight}>{part}</mark>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const AdminLayout = ({ children, currentPage, pageTitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(true);
  const profileMenuRef = useRef(null);
  const isAdminRole = ['admin', 'superadmin'].includes(normalizeRole(user?.role));
  const [searchData, setSearchData] = useState({
    users: [],
  });

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'DB' },
    { name: 'Openings', path: '/admin/openings', icon: 'OP' },
    { name: 'Applications', path: '/admin/applications', icon: 'AP' },
    { name: 'Users', path: '/admin/users', icon: 'US' },
    { name: 'My Profile', path: '/admin/profile', icon: 'PR' },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: 'SB' },
    { name: 'Logs', path: '/admin/logs', icon: 'LG' },
    { name: 'Settings', path: '/admin/settings', icon: 'ST' },
  ];
  const visibleMenuItems = menuItems;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSearchData = async () => {
      try {
        const usersRes = await userAPI.getAll();
        const userRows = usersRes.data.data || [];

        const normalizedUsers = userRows
          .filter((userItem) => ['manager', 'company_manager', 'user'].includes(userItem.role))
          .map((userItem) => ({
          ...userItem,
          role_label: getRoleLabel(userItem.role),
        }));

        if (isMounted) {
          setSearchData({
            users: normalizedUsers,
          });
        }
      } catch (error) {
        if (isMounted) {
          setSearchData({ users: [] });
        }
      } finally {
        if (isMounted) {
          setSearchLoading(false);
        }
      }
    };

    loadSearchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedSearchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return { users: [] };

    const matches = (items, fields, mapItem) => items
      .filter((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(query)))
      .slice(0, 4)
      .map(mapItem);

    return {
      users: matches(searchData.users, ['name', 'email', 'role', 'role_label'], (userItem) => ({
        id: userItem.id,
        label: userItem.name,
        meta: `${getRoleLabel(userItem.role)} · ${userItem.email}`,
        route: '/admin/users',
      })),
    };
  }, [searchData, searchTerm]);

  const hasSearchResults = groupedSearchResults.users.length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSelect = (route) => {
    setSearchTerm('');
    setSearchOpen(false);
    navigate(route);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <div>
            <p className={styles.logo}>{sidebarOpen ? (settings.platform_name || 'HireHub') : 'HH'}</p>
            {sidebarOpen && <p className={styles.logoSub}>Admin Portal</p>}
          </div>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '<<' : '>>'}
          </button>
        </div>

        <nav className={styles.nav}>
          {visibleMenuItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.navItem} ${currentPage === item.path ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.label}>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h2>{pageTitle || currentPage.split('/').pop().toUpperCase()}</h2>

          <div className={styles.headerRight}>
            <div className={styles.searchWrap}>
              <div className={styles.searchInputWrap}>
                <input
                  id="global-search"
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search users"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>

              {searchOpen && searchTerm.trim() && (
                <div className={styles.searchResults}>
                  {searchLoading ? (
                    <div className={styles.searchEmpty}>Loading search data...</div>
                  ) : hasSearchResults ? (
                    <>
                      {groupedSearchResults.users.length > 0 && (
                        <div className={styles.searchGroup}>
                          <h4>Users</h4>
                          {groupedSearchResults.users.map((item) => (
                            <button key={`user-${item.id}`} type="button" className={styles.searchResult} onClick={() => handleSearchSelect(item.route)}>
                              <span className={styles.searchResultTitle}>{renderHighlightedText(item.label, searchTerm)}</span>
                              <span className={styles.searchResultMeta}>{renderHighlightedText(item.meta, searchTerm)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                    </>
                  ) : (
                    <div className={styles.searchEmpty}>No matches found.</div>
                  )}
                </div>
              )}
            </div>

            {isAdminRole && currentPage === '/admin/users' && (
              <div className={styles.profileMenuWrap} ref={profileMenuRef}>
                <button
                  type="button"
                  className={styles.profileAvatarBtn}
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <span className={styles.profileAvatar}>{getInitials(user?.name || 'Super Admin')}</span>
                </button>

                {profileMenuOpen && (
                  <div className={styles.profileMenu} role="menu" aria-label="Profile menu">
                    <button type="button" className={styles.profileMenuItem} onClick={() => handleSearchSelect('/admin/profile')}>
                      My Profile
                    </button>
                    <button type="button" className={styles.profileMenuItem} onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
