
import { useCallback } from 'react';

export const useVideoProcessor = () => {
  const extractFrames = useCallback((videoFile: File, fps: number): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const frames: string[] = [];

      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (!context) {
          return reject(new Error('Could not get canvas context.'));
        }

        const duration = video.duration;
        const interval = 1 / fps;
        let currentTime = 0;

        const captureFrame = () => {
          video.currentTime = currentTime;
        };

        video.onseeked = () => {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          // Get base64 string, remove the data URL prefix
          const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          frames.push(base64Data);

          currentTime += interval;
          if (currentTime <= duration) {
            captureFrame();
          } else {
            URL.revokeObjectURL(video.src); // Clean up
            resolve(frames);
          }
        };

        video.onerror = (e) => {
           URL.revokeObjectURL(video.src);
           reject(new Error('Error loading video file. It might be corrupted or in an unsupported format.'));
        }

        // Start capturing
        captureFrame();
      };
    });
  }, []);

  return { extractFrames };
};
