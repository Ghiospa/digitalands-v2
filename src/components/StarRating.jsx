import { useState } from 'react';

/**
 * StarRating component
 * @param {number} rating - Initial rating (0-5)
 * @param {boolean} interactive - Whether the user can change the rating
 * @param {function} onRate - Callback when rating changes
 * @param {number} size - Size of the stars in pixels
 * @param {string} color - Color of active stars
 */
export default function StarRating({ rating = 0, interactive = false, onRate, size = 18, color = 'var(--accent)' }) {
    const [hoverRating, setHoverRating] = useState(0);

    const displayRating = hoverRating || rating;

    const stars = [1, 2, 3, 4, 5];

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    onClick={() => interactive && onRate && onRate(star)}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: interactive ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => interactive && (e.currentTarget.style.transform = 'scale(0.85)')}
                    onMouseUp={e => interactive && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={star <= displayRating ? color : 'transparent'}
                        stroke={star <= displayRating ? color : 'var(--text-muted)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: star <= displayRating ? 1 : 0.4 }}
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
