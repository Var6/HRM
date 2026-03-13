'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Trash2, CheckCheck, Cake } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  birthday: '🎂',
  retirement: '🎉',
  payslip: '📋',
  attendance: '📅',
  missing_field: '⚠️',
  emergency_contact: '🚨',
  employee_created: '✅',
  employee_updated: '✏️',
  task_complete: '🏆',
  leave_request: '🗓️',
  data_change_request: '📝',
};

interface BirthdayEntry {
  name: string;
  daysLeft: number;
  dateLabel: string;  // e.g. "Mar 15"
  isToday: boolean;
  isTomorrow: boolean;
  initials: string;
}

/** Compute upcoming birthdays from employee list, within the next `windowDays` days */
function computeUpcomingBirthdays(employees: any[], windowDays = 30): BirthdayEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results: BirthdayEntry[] = [];

  for (const emp of employees) {
    if (!emp.dateOfBirth && !emp.dob) continue;
    const dob = new Date(emp.dateOfBirth || emp.dob);
    if (isNaN(dob.getTime())) continue;

    const thisYear = today.getFullYear();
    let nextBirthday = new Date(thisYear, dob.getMonth(), dob.getDate());

    // If already passed this year, push to next year
    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
    }

    const daysLeft = Math.round(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft > windowDays) continue;

    const name: string = emp.name || 'Unknown';
    results.push({
      name,
      daysLeft,
      dateLabel: nextBirthday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      isToday: daysLeft === 0,
      isTomorrow: daysLeft === 1,
      initials: name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    });
  }

  // Sort: today first, then by days ascending
  return results.sort((a, b) => a.daysLeft - b.daysLeft);
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayEntry[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Trigger check (creates new notifications + deletes expired ones)
      await fetch('/api/notifications/check-and-create', { method: 'POST' });

      // Fetch notifications and employees in parallel
      const [notifRes, empRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/employees'),
      ]);

      const notifData = await notifRes.json();
      const empData = await empRes.json();

      const notifs: any[] = notifData.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);

      const employees: any[] = empData.data || empData.employees || [];
      setUpcomingBirthdays(computeUpcomingBirthdays(employees, 30));
    } catch (err) {
      console.error('NotificationBell fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      const dropdown = document.getElementById('nb-dropdown');
      const btn = document.getElementById('nb-btn');
      if (
        dropdown && btn &&
        !dropdown.contains(e.target as Node) &&
        !btn.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const deleteOne = async (id: string, isRead: boolean) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (!isRead) setUnreadCount(c => Math.max(0, c - 1));
  };

  const clearAll = async () => {
    await fetch('/api/notifications/clear-all', { method: 'DELETE' });
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="nb-btn"
        onClick={() => setShowDropdown(v => !v)}
        className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="nb-dropdown"
          className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '38rem' }}
        >
          {/* ── Header ── */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-300 hover:text-red-100 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1">

            {/* ── Notifications list ── */}
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-9 h-9 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">You're all caught up!</p>
                <p className="text-xs mt-1 opacity-70">No notifications right now</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n._id}
                  className={`border-b border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors ${
                    !n.read ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 leading-none mt-0.5">
                      {TYPE_ICONS[n.type] || '📌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-slate-400">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {n.expiresAt && (
                          <p className="text-xs text-orange-500">
                            Expires {new Date(n.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteOne(n._id, n.read)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors shrink-0"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* ── Upcoming Birthdays Section ── */}
            {upcomingBirthdays.length > 0 && (
              <div>
                {/* Section header */}
                <div className="sticky top-0 bg-linear-to-r from-pink-50 to-rose-50 border-t border-b border-pink-200 px-5 py-2.5 flex items-center gap-2">
                  <Cake className="w-4 h-4 text-pink-500 shrink-0" />
                  <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">
                    Upcoming Birthdays
                  </span>
                  <span className="ml-auto text-xs text-pink-400">next 30 days</span>
                </div>

                {upcomingBirthdays.map((bd, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-pink-50 hover:bg-pink-50/40 transition-colors ${
                      bd.isToday ? 'bg-pink-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                        bd.isToday
                          ? 'bg-linear-to-br from-pink-500 to-rose-600 ring-2 ring-pink-300'
                          : bd.isTomorrow
                          ? 'bg-linear-to-br from-orange-400 to-pink-500'
                          : 'bg-linear-to-br from-slate-400 to-slate-500'
                      }`}
                    >
                      {bd.initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{bd.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{bd.dateLabel}</p>
                    </div>

                    {/* Badge */}
                    <div className="shrink-0">
                      {bd.isToday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500 text-white rounded-full text-xs font-bold animate-pulse">
                          🎂 Today!
                        </span>
                      ) : bd.isTomorrow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-400 text-white rounded-full text-xs font-semibold">
                          Tomorrow
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {bd.daysLeft}d
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* If absolutely nothing to show */}
            {notifications.length === 0 && upcomingBirthdays.length === 0 && (
              <div className="py-4 text-center text-slate-400 text-xs">
                No upcoming birthdays in the next 30 days
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
