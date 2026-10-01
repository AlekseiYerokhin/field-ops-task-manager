import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  scheduleTaskNotification,
  cancelTaskNotification,
  cancelAllNotifications,
} from './notificationService';

// Mock expo-notifications
jest.mock('expo-notifications');

const mockedNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerForPushNotificationsAsync', () => {
    it('returns true when permission is already granted', async () => {
      mockedNotifications.getPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted',
        expires: 'never',
      } as any);

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(true);
      expect(mockedNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission when not granted and returns true on success', async () => {
      mockedNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
        status: 'denied',
        expires: 'never',
      } as any);
      mockedNotifications.requestPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted',
        expires: 'never',
      } as any);

      const result = await registerForPushNotificationsAsync();

      expect(mockedNotifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('returns false when permission is denied', async () => {
      mockedNotifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
        status: 'denied',
        expires: 'never',
      } as any);
      mockedNotifications.requestPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
        status: 'denied',
        expires: 'never',
      } as any);

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      mockedNotifications.getPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(false);
    });
  });

  describe('scheduleTaskNotification', () => {
    const dueDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    it('schedules notification 30 min before due date', async () => {
      mockedNotifications.scheduleNotificationAsync.mockResolvedValue('notification-1');

      const result = await scheduleTaskNotification('task-1', 'Test Task', dueDate);

      expect(mockedNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Task Due Soon',
            data: { taskId: 'task-1' },
          }),
        })
      );
      expect(result).toBe('notification-1');
    });

    it('schedules notification in demo mode within 60 seconds', async () => {
      mockedNotifications.scheduleNotificationAsync.mockResolvedValue('notification-1');

      const result = await scheduleTaskNotification('task-1', 'Test Task', dueDate, true);

      const call = mockedNotifications.scheduleNotificationAsync.mock.calls[0][0];
      const triggerTime = (call.trigger as any).date as Date;
      const secondsUntilTrigger = (triggerTime.getTime() - Date.now()) / 1000;

      expect(secondsUntilTrigger).toBeGreaterThan(0);
      expect(secondsUntilTrigger).toBeLessThanOrEqual(60);
      expect(result).toBe('notification-1');
    });

    it('triggers immediately when due date is less than 30 min away', async () => {
      const soonDueDate = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
      mockedNotifications.scheduleNotificationAsync.mockResolvedValue('notification-1');

      const result = await scheduleTaskNotification('task-1', 'Test Task', soonDueDate);

      const call = mockedNotifications.scheduleNotificationAsync.mock.calls[0][0];
      const triggerTime = (call.trigger as any).date as Date;
      const secondsUntilTrigger = (triggerTime.getTime() - Date.now()) / 1000;

      expect(secondsUntilTrigger).toBeGreaterThan(0);
      expect(secondsUntilTrigger).toBeLessThanOrEqual(10);
      expect(result).toBe('notification-1');
    });

    it('returns null when scheduling fails', async () => {
      mockedNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('Schedule failed'));

      const result = await scheduleTaskNotification('task-1', 'Test Task', dueDate);

      expect(result).toBeNull();
    });
  });

  describe('cancelTaskNotification', () => {
    it('cancels notification by id', async () => {
      await cancelTaskNotification('notification-1');

      expect(mockedNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-1'
      );
    });

    it('handles errors gracefully', async () => {
      mockedNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        new Error('Cancel failed')
      );

      await expect(cancelTaskNotification('notification-1')).resolves.not.toThrow();
    });
  });

  describe('cancelAllNotifications', () => {
    it('cancels all scheduled notifications', async () => {
      await cancelAllNotifications();

      expect(mockedNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      mockedNotifications.cancelAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('Cancel all failed')
      );

      await expect(cancelAllNotifications()).resolves.not.toThrow();
    });
  });
});
