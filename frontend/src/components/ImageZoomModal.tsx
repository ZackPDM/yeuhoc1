'use client';

import React, { useEffect, useCallback } from 'react';

interface ImageZoomModalProps {
    imageUrl: string;
    onClose: () => void;
}

export default function ImageZoomModal({ imageUrl, onClose }: ImageZoomModalProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-10"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Image container */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Phóng to hình ảnh"
                    className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                />
                <p className="text-center text-sm text-gray-400 mt-3">
                    Nhấn ESC hoặc click bên ngoài để đóng
                </p>
            </div>
        </div>
    );
}
