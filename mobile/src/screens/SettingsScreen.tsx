import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelReminder,
  getReminderSettings,
} from '../utils/notifications';
import { getPhotoCount, deleteAllPhotos } from '../utils/storage';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const settings = await getReminderSettings();
        setReminderEnabled(settings.enabled);
        setHour(settings.hour);
        setMinute(settings.minute);
        setPhotoCount(await getPhotoCount());
      })();
    }, []),
  );

  const toggleReminder = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to use daily reminders.',
        );
        return;
      }
      await scheduleDailyReminder(hour, minute);
      setReminderEnabled(true);
    } else {
      await cancelReminder();
      setReminderEnabled(false);
    }
  };

  const adjustTime = async (field: 'hour' | 'minute', delta: number) => {
    let newHour = hour;
    let newMinute = minute;

    if (field === 'hour') {
      newHour = (hour + delta + 24) % 24;
      setHour(newHour);
    } else {
      newMinute = (minute + delta + 60) % 60;
      setMinute(newMinute);
    }

    if (reminderEnabled) {
      await scheduleDailyReminder(newHour, newMinute);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Photos',
      `This will permanently delete all ${photoCount} photos. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await deleteAllPhotos();
            setPhotoCount(0);
          },
        },
      ],
    );
  };

  const formatTime = (h: number, m: number): string => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Daily Reminder Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Reminder</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.primary}
              />
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowLabel}>Enable Reminder</Text>
                <Text style={styles.rowDescription}>
                  Get a daily notification to take your photo
                </Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: colors.surfaceLight, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          {/* Time Picker */}
          <View style={[styles.timePicker, !reminderEnabled && { opacity: 0.4 }]}>
            <Text style={styles.timeLabel}>Reminder Time</Text>
            <View style={styles.timeControls}>
              {/* Hour */}
              <View style={styles.timeUnit}>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => adjustTime('hour', 1)}
                  disabled={!reminderEnabled}
                >
                  <Ionicons name="chevron-up" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {String(hour % 12 || 12).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => adjustTime('hour', -1)}
                  disabled={!reminderEnabled}
                >
                  <Ionicons name="chevron-down" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              {/* Minute */}
              <View style={styles.timeUnit}>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => adjustTime('minute', 5)}
                  disabled={!reminderEnabled}
                >
                  <Ionicons name="chevron-up" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {String(minute).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => adjustTime('minute', -5)}
                  disabled={!reminderEnabled}
                >
                  <Ionicons name="chevron-down" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* AM/PM */}
              <TouchableOpacity
                style={styles.ampmBtn}
                onPress={() => adjustTime('hour', hour >= 12 ? -12 : 12)}
                disabled={!reminderEnabled}
              >
                <Text style={styles.ampmText}>
                  {hour >= 12 ? 'PM' : 'AM'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.timePreview}>
              Reminder set for {formatTime(hour, minute)}
            </Text>
          </View>
        </View>
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="folder-outline"
                size={22}
                color={colors.secondary}
              />
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowLabel}>Saved Photos</Text>
                <Text style={styles.rowDescription}>
                  {photoCount} {photoCount === 1 ? 'photo' : 'photos'} stored
                  locally on device
                </Text>
              </View>
            </View>
          </View>
          {photoCount > 0 && (
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={handleClearData}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.danger}
              />
              <Text style={styles.dangerBtnText}>Clear All Photos</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={colors.accent}
              />
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowLabel}>Facial Timelapse</Text>
                <Text style={styles.rowDescription}>
                  Version 1.0.0 · All processing done locally
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.aboutDetails}>
            <Text style={styles.aboutText}>
              📱 Works completely offline{'\n'}
              🔒 Photos never leave your device{'\n'}
              🤖 On-device face detection {"&"} alignment{'\n'}
              ⏰ Daily reminders to stay consistent
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom padding */}
      <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  rowDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  timePicker: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  timeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeBtn: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 4,
    minWidth: 50,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  ampmBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  ampmText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  timePreview: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 6,
  },
  dangerBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  aboutDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
  },
});
