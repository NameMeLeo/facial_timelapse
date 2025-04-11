import cv2
import os
import glob
import imageio

def create_timelapse(duration):
    image_folder = 'save'
    gif_name = f"timelapse.gif"
    
    images = sorted(glob.glob(os.path.join(image_folder, '*.jpg')))
    if not images:
        raise Exception("No images found in 'save' folder.")
    
    frame_count = len(images)
    fps = frame_count / duration if duration > 0 else 5  # default to 5 if duration is 0

    frames = []
    for image in images:
        frames.append(imageio.imread(image))
    
    imageio.mimsave(gif_name, frames, fps=fps)
    return gif_name