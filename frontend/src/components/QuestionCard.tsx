'use client';

import React, { useState } from 'react';
import LatexRenderer from './LatexRenderer';
import ImageZoomModal from './ImageZoomModal';
import { Question } from '@/types';
import { getImageUrl } from '@/lib/api';

interface QuestionCardProps {
    question: Question;
    mode: 'preview' | 'exam';
    selectedAnswer?: string;
    onSelectAnswer?: (questionId: number, answer: string) => void;
    showResult?: boolean;
}

export default function QuestionCard({
    question,
    mode,
    selectedAnswer,
    onSelectAnswer,
    showResult = false,
}: QuestionCardProps) {
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const optionLabels = ['A', 'B', 'C', 'D'];

    const getOptionStyle = (label: string) => {
        const base = 'w-full p-4 rounded-xl text-left transition-all duration-200 border';

        if (showResult) {
            if (label === question.answer) {
                return `${base} bg-emerald-500/10 border-emerald-500/50 text-emerald-300`;
            }
            if (label === selectedAnswer && label !== question.answer) {
                return `${base} bg-red-500/10 border-red-500/50 text-red-300`;
            }
            return `${base} bg-gray-800/50 border-gray-700/50 text-gray-500`;
        }

        if (mode === 'exam') {
            if (selectedAnswer === label) {
                return `${base} bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10`;
            }
            return `${base} bg-gray-800/50 border-gray-700 text-gray-300 hover:border-indigo-500/30 hover:bg-gray-800 cursor-pointer`;
        }

        // Preview mode
        if (label === question.answer) {
            return `${base} bg-emerald-500/10 border-emerald-500/30 text-emerald-300`;
        }
        return `${base} bg-gray-800/50 border-gray-700/50 text-gray-400`;
    };

    return (
        <>
            <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-6 backdrop-blur-sm hover:border-gray-700 transition-all duration-300">
                {/* Question Header */}
                <div className="flex items-start gap-4 mb-4">
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                        {question.id}
                    </span>
                    <div className="flex-1 text-gray-200 text-[15px] leading-relaxed">
                        <LatexRenderer content={question.content} />
                    </div>
                </div>

                {/* Question Image */}
                {question.image_url && (
                    <div className="mb-4 ml-14">
                        <img
                            src={getImageUrl(question.image_url)}
                            alt={`Hình minh họa câu ${question.id}`}
                            className="max-w-sm rounded-xl border border-gray-700 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                            onClick={() => setZoomImage(getImageUrl(question.image_url!))}
                        />
                        <p className="text-xs text-gray-500 mt-2">📷 Nhấn vào ảnh để phóng to</p>
                    </div>
                )}

                {/* Options */}
                <div className="grid gap-2 ml-14">
                    {question.options.map((option, index) => {
                        const label = optionLabels[index];
                        // Remove leading label if already in option text
                        const optionText = option.replace(/^[A-D][.:]\s*/, '');
                        return (
                            <button
                                key={label}
                                className={getOptionStyle(label)}
                                onClick={() => mode === 'exam' && onSelectAnswer?.(question.id, label)}
                                disabled={mode === 'preview' || showResult}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${selectedAnswer === label
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-700/50 text-gray-400'
                                        }
                    ${showResult && label === question.answer ? 'bg-emerald-500 text-white' : ''}
                    ${showResult && label === selectedAnswer && label !== question.answer ? 'bg-red-500 text-white' : ''}
                  `}>
                                        {label}
                                    </span>
                                    <LatexRenderer content={optionText} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Preview mode: show answer */}
                {mode === 'preview' && (
                    <div className="mt-4 ml-14 flex items-center gap-2 text-sm text-emerald-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Đáp án đúng: <span className="font-bold">{question.answer}</span>
                    </div>
                )}
            </div>

            {/* Image Zoom Modal */}
            {zoomImage && (
                <ImageZoomModal
                    imageUrl={zoomImage}
                    onClose={() => setZoomImage(null)}
                />
            )}
        </>
    );
}
