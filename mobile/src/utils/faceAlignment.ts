import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface Point {
  x: number;
  y: number;
}

interface FaceBounds {
  origin: Point;
  size: { width: number; height: number };
}

interface FaceLandmarks {
  leftEyePosition?: Point;
  rightEyePosition?: Point;
  noseBasePosition?: Point;
  leftMouthPosition?: Point;
  rightMouthPosition?: Point;
}

/**
 * Align and crop a face from an image using detected face bounds and landmarks.
 * Applies rotation correction based on eye positions and crops to a square.
 */
export async function alignAndCropFace(
  imageUri: string,
  bounds: FaceBounds,
  landmarks: FaceLandmarks,
  imageWidth: number,
  imageHeight: number,
  outputSize: number = 512,
): Promise<string> {
  const actions: Array<
    | { rotate: number }
    | { crop: { originX: number; originY: number; width: number; height: number } }
    | { resize: { width: number; height: number } }
  > = [];

  // Calculate rotation angle from eye positions
  let rotationAngle = 0;
  if (landmarks.leftEyePosition && landmarks.rightEyePosition) {
    const dx = landmarks.rightEyePosition.x - landmarks.leftEyePosition.x;
    const dy = landmarks.rightEyePosition.y - landmarks.leftEyePosition.y;
    rotationAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  }

  if (Math.abs(rotationAngle) > 0.5) {
    actions.push({ rotate: -rotationAngle });
  }

  // Calculate crop area with padding around the face
  const padding = Math.max(bounds.size.width, bounds.size.height) * 0.6;
  const centerX = bounds.origin.x + bounds.size.width / 2;
  const centerY = bounds.origin.y + bounds.size.height / 2;
  const cropSize = Math.max(bounds.size.width, bounds.size.height) + padding * 2;

  const originX = Math.max(0, Math.floor(centerX - cropSize / 2));
  const originY = Math.max(0, Math.floor(centerY - cropSize / 2));
  const clampedWidth = Math.min(Math.floor(cropSize), imageWidth - originX);
  const clampedHeight = Math.min(Math.floor(cropSize), imageHeight - originY);
  const side = Math.min(clampedWidth, clampedHeight);

  if (side > 10) {
    actions.push({
      crop: {
        originX,
        originY,
        width: side,
        height: side,
      },
    });
  }

  actions.push({ resize: { width: outputSize, height: outputSize } });

  const result = await manipulateAsync(imageUri, actions, {
    compress: 0.9,
    format: SaveFormat.JPEG,
  });

  return result.uri;
}

/**
 * Simple centered square crop when face detection is unavailable.
 * Uses the head-outline overlay position as guidance.
 */
export async function cropCentered(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
  outputSize: number = 512,
): Promise<string> {
  const side = Math.min(imageWidth, imageHeight);
  const originX = Math.floor((imageWidth - side) / 2);
  const originY = Math.floor((imageHeight - side) / 2);

  const result = await manipulateAsync(
    imageUri,
    [
      { crop: { originX, originY, width: side, height: side } },
      { resize: { width: outputSize, height: outputSize } },
    ],
    {
      compress: 0.9,
      format: SaveFormat.JPEG,
    },
  );

  return result.uri;
}
