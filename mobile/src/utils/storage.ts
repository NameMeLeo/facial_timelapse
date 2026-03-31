import { Paths, Directory, File } from 'expo-file-system';

const PHOTOS_DIR_NAME = 'aligned_photos';

function getPhotosDir(): Directory {
  return new Directory(Paths.document, PHOTOS_DIR_NAME);
}

export function ensureDirectoryExists(): void {
  const dir = getPhotosDir();
  if (!dir.exists) {
    dir.create();
  }
}

export async function saveAlignedPhoto(uri: string): Promise<string> {
  ensureDirectoryExists();
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const filename = `face_${year}${month}${day}_${hours}${mins}${secs}.jpg`;
  const source = new File(uri);
  const dest = new File(getPhotosDir(), filename);
  source.copy(dest);
  return dest.uri;
}

export async function getAlignedPhotos(): Promise<string[]> {
  ensureDirectoryExists();
  const dir = getPhotosDir();
  const entries = dir.list();
  return entries
    .filter((entry): entry is File => {
      if (!(entry instanceof File)) return false;
      const name = entry.uri.toLowerCase();
      return (
        name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
      );
    })
    .map((f) => f.uri)
    .sort();
}

export async function deletePhoto(uri: string): Promise<void> {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

export async function deleteAllPhotos(): Promise<void> {
  const dir = getPhotosDir();
  if (dir.exists) {
    dir.delete();
  }
  ensureDirectoryExists();
}

export async function getPhotoCount(): Promise<number> {
  const photos = await getAlignedPhotos();
  return photos.length;
}
