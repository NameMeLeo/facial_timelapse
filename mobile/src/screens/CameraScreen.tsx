import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { Ionicons } from '@expo/vector-icons';
import HeadOutline from '../components/HeadOutline';
import { alignAndCropFace, cropCentered } from '../utils/faceAlignment';
import { saveAlignedPhoto } from '../utils/storage';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="camera-outline"
          size={64}
          color={colors.textMuted}
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need your camera to take facial photos for your timelapse.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || processing) return;
    setProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.95,
        skipProcessing: false,
      });
      if (!photo) {
        Alert.alert('Error', 'Failed to capture photo.');
        setProcessing(false);
        return;
      }

      let alignedUri: string;
      const imgW = photo.width;
      const imgH = photo.height;

      // Try face detection on the captured image
      try {
        const detection = await FaceDetector.detectFacesAsync(photo.uri, {
          mode: FaceDetector.FaceDetectorMode.accurate,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
        });

        if (detection.faces.length > 0) {
          const face = detection.faces[0];
          alignedUri = await alignAndCropFace(
            photo.uri,
            face.bounds,
            {
              leftEyePosition: face.leftEyePosition,
              rightEyePosition: face.rightEyePosition,
              noseBasePosition: face.noseBasePosition,
              leftMouthPosition: face.leftMouthPosition,
              rightMouthPosition: face.rightMouthPosition,
            },
            imgW,
            imgH,
          );
        } else {
          // No face detected — use centered crop guided by overlay
          alignedUri = await cropCentered(photo.uri, imgW, imgH);
        }
      } catch {
        // Face detection unavailable — fallback to centered crop
        alignedUri = await cropCentered(photo.uri, imgW, imgH);
      }

      const savedUri = await saveAlignedPhoto(alignedUri);
      setLastSaved(savedUri);
      setProcessing(false);
    } catch (error: unknown) {
      setProcessing(false);
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to process photo: ${message}`);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        mode="picture"
      >
        {/* Head outline overlay for positioning guidance */}
        <HeadOutline />

        {/* Instruction text */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Align your face with the outline
          </Text>
        </View>

        {/* Success indicator */}
        {lastSaved && !processing && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
            <Text style={styles.successText}>Photo saved!</Text>
          </View>
        )}
      </CameraView>

      {/* Capture button area */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureBtn, processing && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={processing}
          activeOpacity={0.7}
        >
          {processing ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  instructionContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  successBadge: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  controls: {
    height: 110,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primaryLight,
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.text,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
