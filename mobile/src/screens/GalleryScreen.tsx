import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAlignedPhotos, deletePhoto } from '../utils/storage';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 48) / 3;

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const files = await getAlignedPhotos();
    setPhotos(files);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  const handleDelete = (uri: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePhoto(uri);
          setSelectedPhoto(null);
          loadPhotos();
        },
      },
    ]);
  };

  /** Extract a display date from the filename, e.g. face_20240312_091523.jpg */
  const extractDate = (uri: string): string => {
    const match = uri.match(/face_(\d{4})(\d{2})(\d{2})_/);
    if (match) {
      return `${match[2]}/${match[3]}/${match[1]}`;
    }
    return '';
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedPhoto(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item }} style={styles.thumbnail} />
      <Text style={styles.cardDate}>{extractDate(item)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.subtitle}>
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptyText}>
            Take your first photo from the Camera tab
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full-size photo modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.fullImage}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setSelectedPhoto(null)}
              >
                <Ionicons name="close" size={22} color={colors.text} />
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.deleteBtn]}
                onPress={() => selectedPhoto && handleDelete(selectedPhoto)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                <Text style={[styles.modalBtnText, { color: colors.danger }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardDate: {
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 32,
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH - 48,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  modalBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
