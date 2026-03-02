export const SEO_STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Digitalands",
    "image": "https://digitalands.it/og-image.jpg",
    "description": "Verified apartments and community for digital nomads in Sicily. High-speed internet guaranteed.",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ragusa",
        "addressRegion": "Sicilia",
        "addressCountry": "IT"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.9269,
        "longitude": 14.7255
    },
    "url": "https://digitalands.it",
    "telephone": "+390932000000",
    "priceRange": "€€"
};

/**
 * Injects JSON-LD structured data into the <head>
 */
export function injectJSONLD() {
    if (typeof window === 'undefined') return;

    // Check if already exists
    const existing = document.getElementById('json-ld-structured');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'json-ld-structured';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(SEO_STRUCTURED_DATA);
    document.head.appendChild(script);
}
