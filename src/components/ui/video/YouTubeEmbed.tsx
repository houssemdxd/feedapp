'use client';

import React, { useRef, useImperativeHandle, forwardRef } from "react";

type AspectRatio = "16:9" | "4:3" | "21:9" | "1:1";

export interface YouTubeEmbedRef {
  playVideo: () => void;
}

interface YouTubeEmbedProps {
  videoId: string;
  aspectRatio?: AspectRatio;
  title?: string;
  className?: string;
}

const YouTubeEmbed = forwardRef<YouTubeEmbedRef, YouTubeEmbedProps>(({
  videoId,
  aspectRatio = "16:9",
  title = "YouTube video",
  className = "",
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const aspectRatioClass = {
    "16:9": "aspect-video",
    "4:3": "aspect-4/3",
    "21:9": "aspect-21/9",
    "1:1": "aspect-square",
  }[aspectRatio];

  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (iframeRef.current) {
        // Use YouTube Player API to control video playback
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'playVideo'
          }),
          '*'
        );
      }
    }
  }));

  return (
    <div
      className={`overflow-hidden rounded-lg ${aspectRatioClass} ${className}`}
    >
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
});

YouTubeEmbed.displayName = "YouTubeEmbed";

export default YouTubeEmbed;
