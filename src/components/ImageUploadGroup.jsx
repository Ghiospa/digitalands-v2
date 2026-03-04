import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * ImageUploadGroup Component
 * Handles multi-image upload (max 6) to Supabase Storage.
 * 
 * @param {string} bucket - The storage bucket name ('properties' or 'activities')
 * @param {string[]} initialImages - Existing image URLs
 * @param {function} onChange - Callback when the image list changes
 */
export default function ImageUploadGroup({ bucket, initialImages = [], onChange }) {
    const [images, setImages] = useState(initialImages || []);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_IMAGES = 6;

    async function handleFileChange(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (images.length + files.length > MAX_IMAGES) {
            alert(`Puoi caricare un massimo di ${MAX_IMAGES} immagini.`);
            return;
        }

        setUploading(true);
        const newImages = [...images];

        for (const file of files) {
            try {
                // Create a unique file path
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file);

                if (error) throw error;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            } catch (err) {
                console.error('Error uploading image:', err);
                alert(`Errore nel caricamento di ${file.name}`);
            }
        }

        setImages(newImages);
        onChange(newImages);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function removeImage(index) {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onChange(newImages);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
                {images.map((url, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border">
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                        {idx === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-accent text-[8px] font-bold text-center py-0.5 text-black uppercase">
                                Copertina
                            </div>
                        )}
                    </div>
                ))}

                {images.length < MAX_IMAGES && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-border-light hover:border-accent transition-colors flex flex-col items-center justify-center gap-1 text-textMuted hover:text-accent"
                    >
                        {uploading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-t-accent rounded-full" />
                        ) : (
                            <>
                                <span className="text-xl">+</span>
                                <span className="text-[10px] uppercase font-mono tracking-tighter">Aggiungi</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
            />
            <p className="text-[10px] font-mono text-textSubtle uppercase tracking-widest">
                Max {MAX_IMAGES} immagini (JPG, PNG). La prima sarà la foto principale.
            </p>
        </div>
    );
}
