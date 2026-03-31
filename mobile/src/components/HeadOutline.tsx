import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Ellipse, Circle, Path, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_SIZE = SCREEN_WIDTH * 0.72;

/**
 * Semi-transparent head/face outline overlay displayed on the camera view.
 * Guides the user to position their face correctly for consistent timelapse photos.
 */
export default function HeadOutline() {
  const cx = OVERLAY_SIZE / 2;
  const cy = OVERLAY_SIZE / 2;
  const headRx = OVERLAY_SIZE * 0.34;
  const headRy = OVERLAY_SIZE * 0.44;

  // Facial feature positions relative to head center
  const eyeY = cy - headRy * 0.15;
  const eyeSpacing = headRx * 0.45;
  const noseY = cy + headRy * 0.15;
  const mouthY = cy + headRy * 0.4;
  const mouthWidth = headRx * 0.35;

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={OVERLAY_SIZE} height={OVERLAY_SIZE}>
        {/* Head outline - dashed ellipse */}
        <Ellipse
          cx={cx}
          cy={cy}
          rx={headRx}
          ry={headRy}
          stroke="rgba(108, 99, 255, 0.55)"
          strokeWidth={2.5}
          strokeDasharray="10,7"
          fill="none"
        />

        {/* Left eye guide */}
        <Ellipse
          cx={cx - eyeSpacing}
          cy={eyeY}
          rx={headRx * 0.15}
          ry={headRy * 0.055}
          stroke="rgba(108, 99, 255, 0.35)"
          strokeWidth={1.5}
          fill="none"
        />

        {/* Right eye guide */}
        <Ellipse
          cx={cx + eyeSpacing}
          cy={eyeY}
          rx={headRx * 0.15}
          ry={headRy * 0.055}
          stroke="rgba(108, 99, 255, 0.35)"
          strokeWidth={1.5}
          fill="none"
        />

        {/* Nose dot */}
        <Circle
          cx={cx}
          cy={noseY}
          r={3}
          fill="rgba(108, 99, 255, 0.35)"
        />

        {/* Mouth curve */}
        <Path
          d={`M ${cx - mouthWidth} ${mouthY} Q ${cx} ${mouthY + 10} ${cx + mouthWidth} ${mouthY}`}
          stroke="rgba(108, 99, 255, 0.35)"
          strokeWidth={1.5}
          fill="none"
        />

        {/* Subtle center crosshair */}
        <Line
          x1={cx - 6}
          y1={cy}
          x2={cx + 6}
          y2={cy}
          stroke="rgba(108, 99, 255, 0.18)"
          strokeWidth={1}
        />
        <Line
          x1={cx}
          y1={cy - 6}
          x2={cx}
          y2={cy + 6}
          stroke="rgba(108, 99, 255, 0.18)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
