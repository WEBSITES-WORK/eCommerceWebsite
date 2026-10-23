import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, MapPin, Package, Shield, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/ui/Button';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile({ name, phone, avatar });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          My Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal details, credentials, and preferences
        </p>
      </div>

      {/* Nav shortcuts */}
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        <Link
          to="/profile"
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-2xs whitespace-nowrap"
        >
          Profile Details
        </Link>
        <Link
          to="/profile/addresses"
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition whitespace-nowrap shadow-2xs"
        >
          Saved Addresses
        </Link>
        <Link
          to="/orders"
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition whitespace-nowrap shadow-2xs"
        >
          My Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Personal Info Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-50">
            <User className="w-4 h-4 text-emerald-600" />
            Personal Details
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Email cannot be changed directly</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Avatar Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={savingProfile}
            >
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-50">
            <Lock className="w-4 h-4 text-emerald-600" />
            Security & Password
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white font-medium transition"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="md"
              fullWidth
              loading={changingPassword}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
