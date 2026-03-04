import { useState } from 'react';

/**
 * ImageGallery Component
 * Displays a featured image and a grid of thumbnails.
 * 
 * @param {string[]} images - Array of image URLs
 * @param {string} alt - Alt text for images
 */
export default function ImageGallery({ images = [], alt = '' }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full bg-surface-2 flex items-center justify-center text-textSubtle font-mono text-xs">
                Nessuna immagine disponibile
            </div>
        );
    }

    const currentImage = images[activeIndex];

    return (
        <div className="flex flex-col gap-4">
            {/* Main Featured Image */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] md:aspect-[16/9] bg-surface shadow-2xl">
                <img
                    src={currentImage}
                    alt={`${alt} - View ${activeIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-700"
                />

                {/* Light gradient overlay for bottom-left text readability if needed */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Badge for multiple images */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                        {activeIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails Grid */}
            {images.length > 1 && (
                <div className="grid grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeIndex === idx
                                    ? 'border-accent ring-2 ring-accent/20'
                                    : 'border-transparent hover:border-white/20'
                                }`}
                        >
                            <img src={img} alt={`${alt} thumb ${idx}`} className="w-full h-full object-cover" />
                            {activeIndex !== idx && (
                                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
