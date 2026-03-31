import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAlignedPhotos } from '../utils/storage';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH - 64;

export default function TimelapseScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300); // ms per frame
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const files = await getAlignedPhotos();
        setPhotos(files);
        setCurrentIndex(0);
      })();

      // Pause playback when navigating away
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setPlaying(false);
      };
    }, []),
  );

  useEffect(() => {
    if (playing && photos.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, speed);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, speed, photos.length]);

  const togglePlayback = () => {
    if (photos.length < 2) return;
    setPlaying((p) => !p);
  };

  const adjustSpeed = (delta: number) => {
    setSpeed((s) => Math.max(50, Math.min(2000, s + delta)));
  };

  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Timelapse</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="play-circle-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptyText}>
            Capture at least 2 photos to generate a timelapse
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timelapse</Text>
        <Text style={styles.subtitle}>
          {photos.length} frames · {speed}ms/frame
        </Text>
      </View>

      {/* Photo display */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photos[currentIndex] }}
          style={styles.image}
        />
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / photos.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Playback controls */}
      <View style={styles.controls}>
        {/* Speed down */}
        <TouchableOpacity
          style={styles.speedBtn}
          onPress={() => adjustSpeed(50)}
        >
          <Ionicons name="remove" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Rewind */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            setPlaying(false);
            setCurrentIndex(0);
          }}
        >
          <Ionicons name="play-skip-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={[styles.playBtn, photos.length < 2 && { opacity: 0.4 }]}
          onPress={togglePlayback}
          disabled={photos.length < 2}
        >
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={30}
            color={colors.background}
          />
        </TouchableOpacity>

        {/* Forward to end */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => {
            setPlaying(false);
            setCurrentIndex(photos.length - 1);
          }}
        >
          <Ionicons name="play-skip-forward" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Speed up */}
        <TouchableOpacity
          style={styles.speedBtn}
          onPress={() => adjustSpeed(-50)}
        >
          <Ionicons name="add" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.speedLabel}>
        {playing ? 'Playing' : 'Paused'} · Speed:{' '}
        {(1000 / speed).toFixed(1)} fps
      </Text>
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
    paddingBottom: 12,
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
  imageContainer: {
    alignSelf: 'center',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginTop: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedLabel: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
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
});
