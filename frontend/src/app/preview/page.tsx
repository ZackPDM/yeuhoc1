'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';
import { Question } from '@/types';

export default function PreviewPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [examTitle, setExamTitle] = useState('');
    const [duration, setDuration] = useState(45);

    useEffect(() => {
        const stored = sessionStorage.getItem('examQuestions');
        const title = sessionStorage.getItem('examTitle');
        if (stored) {
            setQuestions(JSON.parse(stored));
            setExamTitle(title || 'Đề thi');
        }
    }, []);

    const handleStartExam = () => {
        sessionStorage.setItem('examDuration', String(duration));
        router.push('/exam/');
    };

    if (questions.length === 0) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📋</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-200 mb-3">Chưa có đề thi</h2>
                    <p className="text-gray-500 mb-6">Hãy upload file đề thi từ trang chủ để bắt đầu</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
                    >
                        ← Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">Phân tích thành công</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-100 mb-2">{examTitle}</h1>
                <p className="text-gray-400">
                    Đã nhận diện <span className="text-indigo-400 font-semibold">{questions.length}</span> câu hỏi
                </p>
            </div>

            {/* Exam Settings */}
            <div className="mb-8 p-5 rounded-2xl bg-gray-900/80 border border-gray-800 animate-fade-in-up">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Cài đặt bài thi</h3>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-400">Thời gian thi:</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-center focus:border-indigo-500 focus:outline-none transition-colors"
                                min={1}
                                max={180}
                            />
                            <span className="text-sm text-gray-500">phút</span>
                        </div>
                    </div>

                    <button
                        onClick={handleStartExam}
                        className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                    >
                        ✍️ Bắt đầu làm bài
                    </button>
                </div>
            </div>

            {/* Question List */}
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div key={question.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <QuestionCard question={question} mode="preview" />
                    </div>
                ))}
            </div>
        </div>
    );
}
