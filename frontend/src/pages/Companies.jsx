import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI, userAPI } from '../api';
import AdminLayout from '../components/admin/AdminLayout';
import styles from './Companies.module.css';

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    owner_id: '',
    email: '',
    phone: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const fetchData = async () => {
    try {
      const [companiesRes, usersRes] = await Promise.all([companyAPI.getAll(), userAPI.getAll()]);
      const companyRows = companiesRes.data.data || [];
      const userRows = usersRes.data.data || [];

      setCompanies(companyRows.map((company) => ({
        ...company,
        display_manager_name: company.owner_name || 'N/A',
        display_manager_email: company.owner_email || 'N/A',
      })));
      setUsers(userRows.filter((user) => ['manager', 'company_manager', 'user'].includes(user.role)));
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCompany = async (event) => {
    event.preventDefault();
    setSavingCompany(true);
    setError('');

    try {
      const response = await companyAPI.create(companyForm);
      const createdCompany = response.data.data;
      setCompanies((prev) => [
        {
          ...createdCompany,
          display_manager_name: users.find((user) => Number(user.id) === Number(createdCompany.owner_id))?.name || 'N/A',
          display_manager_email: users.find((user) => Number(user.id) === Number(createdCompany.owner_id))?.email || 'N/A',
        },
        ...prev,
      ]);
      setCompanyForm({
        name: '',
        owner_id: '',
        email: '',
        phone: '',
        website: '',
        description: '',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create company');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleApprove = async (companyId) => {
    setActionLoading(companyId);
    try {
      await companyAPI.approve(companyId);
      setCompanies(companies.map(c => c.id === companyId ? { ...c, status: 'approved' } : c));
    } catch (err) {
      setError('Failed to approve company');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (companyId) => {
    setActionLoading(companyId);
    try {
      await companyAPI.reject(companyId);
      setCompanies(companies.map(c => c.id === companyId ? { ...c, status: 'rejected' } : c));
    } catch (err) {
      setError('Failed to reject company');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (companyId) => {
    setActionLoading(companyId);
    try {
      await companyAPI.block(companyId);
      setCompanies(companies.map(c => c.id === companyId ? { ...c, status: 'blocked' } : c));
    } catch (err) {
      setError('Failed to block company');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetPending = async (companyId) => {
    setActionLoading(companyId);
    try {
      await companyAPI.updateStatus(companyId, 'pending');
      setCompanies(companies.map(c => c.id === companyId ? { ...c, status: 'pending' } : c));
    } catch (err) {
      setError('Failed to reset company status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: styles.badgePending,
      approved: styles.badgeApproved,
      rejected: styles.badgeRejected,
      blocked: styles.badgeBlocked,
    };
    return badges[status] || '';
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = [company.name, company.display_manager_name, company.display_manager_email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/companies">
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/companies">
      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.createCard}>
        <h3>Add Company</h3>
        <form className={styles.createForm} onSubmit={handleCreateCompany}>
          <input name="name" value={companyForm.name} onChange={handleFormChange} placeholder="Company name" required />
          <select name="owner_id" value={companyForm.owner_id} onChange={handleFormChange} required>
            <option value="">Select owner / manager</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} - {getRoleLabel(user.role)}</option>
            ))}
          </select>
          <input name="email" value={companyForm.email} onChange={handleFormChange} placeholder="Company email" required />
          <input name="phone" value={companyForm.phone} onChange={handleFormChange} placeholder="Phone" />
          <input name="website" value={companyForm.website} onChange={handleFormChange} placeholder="Website" />
          <textarea name="description" value={companyForm.description} onChange={handleFormChange} placeholder="Description" rows="4" />
          <button className={styles.createBtn} type="submit" disabled={savingCompany}>
            {savingCompany ? 'Creating...' : 'Create Company'}
          </button>
        </form>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="company-search">Search</label>
          <input
            id="company-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search by company, manager, or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="company-status">Status</label>
          <select
            id="company-status"
            className={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <h3>Company Management</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Company Manager</th>
              <th>Owner Email</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.empty}>No companies found</td>
              </tr>
            ) : (
              filteredCompanies.map(company => (
                <tr
                  key={company.id}
                  className={styles.clickableRow}
                  onClick={() => navigate(`/admin/company/${company.id}`)}
                >
                  <td>{company.name}</td>
                  <td>{company.display_manager_name}</td>
                  <td>{company.display_manager_email}</td>
                  <td>{formatDate(company.created_at)}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(company.status)}`}>
                      {company.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
                      {company.status === 'pending' && (
                        <>
                          <button
                            className={styles.btnSuccess}
                            onClick={() => handleApprove(company.id)}
                            disabled={actionLoading === company.id}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className={styles.btnDanger}
                            onClick={() => handleReject(company.id)}
                            disabled={actionLoading === company.id}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {company.status !== 'blocked' && (
                        <button
                          className={styles.btnWarning}
                          onClick={() => handleBlock(company.id)}
                          disabled={actionLoading === company.id}
                        >
                          🚫 Block
                        </button>
                      )}
                      {company.status !== 'pending' && (
                        <button
                          className={styles.btnSuccess}
                          onClick={() => handleSetPending(company.id)}
                          disabled={actionLoading === company.id}
                        >
                          ↺ Set Pending
                        </button>
                      )}
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

const getRoleLabel = (role) => {
  const labels = { manager: 'Manager', company_manager: 'Company Manager', user: 'User' };
  return labels[role] || 'User';
};

export default Companies;
