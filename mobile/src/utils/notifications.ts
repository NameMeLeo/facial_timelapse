import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = '@facial_timelapse_reminder';

interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📸 Facial Timelapse',
      body: "Time to take today's photo!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'daily-reminder' : undefined,
    },
  });

  await saveReminderSettings({ enabled: true, hour, minute });
}

export async function cancelReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const current = await getReminderSettings();
  await saveReminderSettings({
    ...current,
    enabled: false,
  });
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<void> {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const stored = await AsyncStorage.getItem(REMINDER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { enabled: false, hour: 9, minute: 0 };
}
