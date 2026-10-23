import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UserList = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/users?search=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const toggleUserBlock = async (user) => {
    try {
      const res = await api.put(`/auth/users/${user._id}`, {
        isBlocked: !user.isBlocked,
      });
      if (res.success) {
        showToast(`User ${user.isBlocked ? 'unblocked' : 'suspended'} successfully`, 'info');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">Customer Accounts</h1>
        <p className="text-xs text-[#707887]">Manage registered shopper accounts, roles, and security standing</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#151922] border border-[#252B35] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#707887]" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-[#F5F7FA] placeholder-[#707887]"
        />
      </div>

      <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252B35] bg-[#101318]/90 text-[#707887] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#707887]">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#707887]">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1B2029]/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#F5F7FA]">{u.name}</p>
                          <p className="text-[10px] text-[#707887]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#A5ACB8]">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-950/60 text-purple-400 border border-purple-800/60'
                            : 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#707887]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.isBlocked
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserBlock(u)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                            u.isBlocked
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/80'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/60 hover:bg-rose-900/80'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
