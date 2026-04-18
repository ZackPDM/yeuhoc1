'use client';

import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
    onUpload: (file: File) => void;
    isLoading?: boolean;
}

export default function FileUpload({ onUpload, isLoading = false }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const acceptedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
    ];
    const acceptedExtensions = ['.docx', '.pdf'];

    const validateFile = (file: File): boolean => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedTypes.includes(file.type) || acceptedExtensions.includes(ext);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-12
          transition-all duration-300 ease-out
          ${isDragging
                        ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-lg shadow-indigo-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-indigo-500/50 hover:bg-gray-800/80'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4 text-center">
                    {/* Upload Icon */}
                    <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center
            transition-all duration-300
            ${isDragging
                            ? 'bg-indigo-500/20 text-indigo-400 rotate-6 scale-110'
                            : 'bg-gray-700/50 text-gray-400'
                        }
          `}>
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-lg font-semibold text-gray-200">
                            {isDragging ? 'Thả file vào đây!' : 'Kéo thả file đề thi vào đây'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            hoặc <span className="text-indigo-400 hover:text-indigo-300">chọn file từ máy tính</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                            .docx
                        </span>
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                            .pdf
                        </span>
                    </div>
                </div>
            </div>

            {/* Selected File */}
            {selectedFile && (
                <div className="mt-4 p-4 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-between animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-200">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className={`
              px-6 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-300
              ${isLoading
                                ? 'bg-gray-700 text-gray-400 cursor-wait'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95'
                            }
            `}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (
                            'Phân tích đề thi'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
