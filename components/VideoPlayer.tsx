
import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
      <video
        key={src} // Important to re-mount the component when src changes
        controls
        className="w-full h-full object-contain"
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
