import { useRef, useEffect } from 'react';

/**
 * A reusable video background component.
 * @param {string} src - The URL or path to the video.
 * @param {number} overlayOpacity - Opacity of the dark overlay (0 to 1).
 * @param {string} className - Optional extra class names.
 */
export default function VideoBackground({ src, overlayOpacity = 0.6, className = "" }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.8; // Subtle slow motion for premium feel
        }
    }, []);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover select-none"
                style={{ filter: 'contrast(1.1) brightness(0.9)' }}
            >
                <source src={src} type={src.endsWith('.mov') ? 'video/quicktime' : src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                {/* Fallback for browsers that don't support video */}
                Your browser does not support the video tag.
            </video>

            {/* Dark Overlay for Readability */}
            <div
                className="absolute inset-0"
                style={{
                    background: `rgba(0, 0, 0, ${overlayOpacity})`,
                    backdropFilter: 'blur(2px)' // Optional slight blur for text separation
                }}
            />

            {/* Ambient Top/Bottom Gradients */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)'
            }} />
        </div>
    );
}
