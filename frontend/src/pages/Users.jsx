import React, { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Users.module.css';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  company_manager: 'Company Manager',
  user: 'User',
};

const normalizeRole = (role) => (role === 'admin' ? 'superadmin' : role || 'user');

const getDisplayRoleByIndex = (index) => {
  if (index === 0) return 'superadmin';
  if (index <= 5) return 'company_manager';
  return 'user';
};

const getRoleClass = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'superadmin') return styles.roleSuperAdmin;
  if (normalizedRole === 'company_manager') return styles.roleCompanyManager;
  return styles.roleUser;
};

const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || ROLE_LABELS.user;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      const normalizedUsers = [...(res.data.data || [])]
        .sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
        .map((userItem, index) => ({
          ...userItem,
          role: getDisplayRoleByIndex(index),
        }));

      setUsers(normalizedUsers);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    setActionLoading(userId);
    try {
      await userAPI.block(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: true } : u));
    } catch (err) {
      setError('Failed to block user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (userId) => {
    setActionLoading(userId);
    try {
      await userAPI.unblock(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: false } : u));
    } catch (err) {
      setError('Failed to unblock user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = [user.name, user.email, getRoleLabel(user.role)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const userStatus = user.is_blocked ? 'blocked' : 'active';
      const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getStatusBadge = (isBlocked) => (isBlocked ? styles.badgeBlocked : styles.badgeActive);

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/users">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/users">
      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="user-search">Search</label>
          <input
            id="user-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="user-role">Role</label>
          <select
            id="user-role"
            className={styles.select}
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="company_manager">Company Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="user-status">Status</label>
          <select
            id="user-status"
            className={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <h3>User Management</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.empty}>No users found</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.role} ${getRoleClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(user.is_blocked)}`}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {user.is_blocked ? (
                      <button
                        className={styles.btnSuccess}
                        onClick={() => handleUnblock(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        ✓ Unblock
                      </button>
                    ) : (
                      <button
                        className={styles.btnDanger}
                        onClick={() => handleBlock(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        🚫 Block
                      </button>
                    )}
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

export default Users;
