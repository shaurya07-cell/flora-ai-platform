import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, RefreshCw, ShieldCheck, User, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import axiosInstance from '../lib/axios';

export const AdminUsers = () => {
  const [usersData, setUsersData] = useState({ totalUsers: 0, activeUsers: 0, users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/admin/users');
      if (res.data?.success) {
        setUsersData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      setError('Unable to retrieve user management data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-left text-brand-text">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" /> User Access Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Registered customer accounts, platform administrator roles, and access status.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} disabled={loading} onClick={fetchUsers}>
          Refresh Users
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-brand-border rounded bg-surface space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Total Accounts</span>
          <div className="text-2xl font-extrabold text-brand-text">{usersData.totalUsers}</div>
        </div>
        <div className="p-5 border border-brand-border rounded bg-surface space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-brand-muted tracking-wider">Active Sessions</span>
          <div className="text-2xl font-extrabold text-status-success">{usersData.activeUsers}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-brand-border rounded bg-surface overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-brand-muted animate-pulse">Loading user records...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-status-error font-semibold">{error}</div>
        ) : usersData.users.length === 0 ? (
          <div className="p-8 text-center text-xs text-brand-muted">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  <th className="px-6 py-3.5">User Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Provider</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {usersData.users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-brand-text flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-muted" />
                      {u.name}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-brand-secondary">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-brand-muted border border-brand-border'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-brand-muted uppercase text-[10px] font-bold">{u.provider || 'local'}</td>
                    <td className="px-6 py-3.5 text-brand-muted font-mono text-[11px]">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
