import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleTaskNotification(
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  demoMode: boolean = false
): Promise<string | null> {
  try {
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    let triggerTime: Date;

    if (demoMode) {
      // Demo mode: trigger in 30-60 seconds
      triggerTime = new Date(now.getTime() + 45000); // 45 seconds
    } else if (timeUntilDue < thirtyMinutes) {
      // Due date is less than 30 min away, trigger immediately
      triggerTime = new Date(now.getTime() + 5000); // 5 seconds
    } else {
      // Normal: trigger 30 min before due date
      triggerTime = new Date(dueDate.getTime() - thirtyMinutes);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Due Soon',
        body: `"${taskTitle}" is due at ${dueDate.toLocaleTimeString()}`,
        data: { taskId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
      },
    });

    return notificationId;
  } catch {
    return null;
  }
}

export async function cancelTaskNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Silently ignore errors
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Silently ignore errors
  }
}
