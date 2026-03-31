import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 3;

interface PhotoCardProps {
  uri: string;
  date?: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function PhotoCard({
  uri,
  date,
  onPress,
  onDelete,
}: PhotoCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri }} style={styles.image} />
      {date && <Text style={styles.date}>{date}</Text>}
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="close-circle" size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  date: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: colors.text,
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 3,
    fontWeight: '500',
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
