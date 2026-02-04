/**
 * Notification Helper Functions
 * This file contains utility functions for notification management
 */

export const notificationTypes = {
  BIRTHDAY: 'birthday',
  RETIREMENT: 'retirement',
  PAYSLIP: 'payslip',
  ATTENDANCE: 'attendance',
  MISSING_FIELD: 'missing_field',
  EMERGENCY_CONTACT: 'emergency_contact',
};

export const priorityLevels = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  const icons: any = {
    birthday: '🎂',
    retirement: '🎉',
    payslip: '📋',
    attendance: '📅',
    missing_field: '⚠️',
    emergency_contact: '🚨',
  };
  return icons[type] || '📌';
}

/**
 * Get notification color based on priority
 */
export function getPriorityColor(priority: string): string {
  const colors: any = {
    high: 'border-l-4 border-red-500 bg-red-50',
    medium: 'border-l-4 border-orange-500 bg-orange-50',
    low: 'border-l-4 border-blue-500 bg-blue-50',
  };
  return colors[priority] || colors.medium;
}

/**
 * Trigger notification checks (call this periodically)
 */
export async function triggerNotificationCheck() {
  try {
    const response = await fetch('/api/notifications/check-and-create', {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error triggering notification check:', error);
    return null;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    return null;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  try {
    const response = await fetch('/api/notifications/unread/count');
    const data = await response.json();
    return data.unreadCount || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
