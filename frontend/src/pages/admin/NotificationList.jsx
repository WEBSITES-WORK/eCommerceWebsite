import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  Package,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const NotificationList = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.success) {
        showToast('All notifications marked as read', 'success');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      showToast(err.message || 'Failed to mark notifications', 'error');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252B35]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-[#F5F7FA] tracking-tight">
              System Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#707887] mt-1">
            Real-time administrative alerts for customer orders, support inquiries, and inventory status
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex p-0.5 bg-[#101318] border border-[#252B35] rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                filter === 'all'
                  ? 'bg-[#1B2029] text-[#F5F7FA] shadow-xs'
                  : 'text-[#707887] hover:text-[#F5F7FA]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                filter === 'unread'
                  ? 'bg-[#1B2029] text-[#F5F7FA] shadow-xs'
                  : 'text-[#707887] hover:text-[#F5F7FA]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 bg-[#1B2029] hover:bg-[#252B35] border border-[#252B35] text-[#F5F7FA] text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#151922] rounded-2xl border border-[#252B35] p-4" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
          description="Everything is quiet. When customers place orders or submit support inquiries, alerts will appear here."
          actionLabel={filter === 'unread' ? 'Show All Notifications' : undefined}
          onAction={filter === 'unread' ? () => setFilter('all') : undefined}
        />
      ) : (
        <div className="bg-[#151922] rounded-2xl border border-[#252B35] shadow-xs divide-y divide-[#252B35]/40 overflow-hidden">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-[#1B2029]/50 ${
                !notif.isRead ? 'bg-emerald-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    !notif.isRead
                      ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                      : 'bg-[#101318] border-[#252B35] text-[#707887]'
                  }`}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-bold ${
                        !notif.isRead ? 'font-black text-[#F5F7FA]' : 'text-[#A5ACB8]'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#A5ACB8] leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#707887] pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#101318] text-[#707887] border border-[#252B35] text-[10px] uppercase font-bold tracking-wider">
                      {notif.type || 'info'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {notif.link && (
                  <Link
                    to={notif.link}
                    className="px-3 py-1.5 bg-[#101318] hover:bg-[#1B2029] border border-[#252B35] text-[#F5F7FA] text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-1.5 text-[#707887] hover:text-emerald-400 hover:bg-[#1B2029] rounded-xl transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
