'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';
import ExamTimer from '@/components/ExamTimer';
import { Question, ExamResult } from '@/types';

export default function ExamPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [examTitle, setExamTitle] = useState('');
    const [duration, setDuration] = useState(45);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem('examQuestions');
        const title = sessionStorage.getItem('examTitle');
        const dur = sessionStorage.getItem('examDuration');
        if (stored) {
            setQuestions(JSON.parse(stored));
            setExamTitle(title || 'Đề thi');
            setDuration(parseInt(dur || '45'));
        }
    }, []);

    const handleSelectAnswer = (questionId: number, answer: string) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const calculateResult = useCallback((): ExamResult => {
        let correct = 0;
        const correctMap: Record<number, string> = {};

        questions.forEach((q) => {
            correctMap[q.id] = q.answer;
            if (answers[q.id] === q.answer) correct++;
        });

        return {
            totalQuestions: questions.length,
            correctAnswers: correct,
            score: Math.round((correct / questions.length) * 10 * 100) / 100,
            answers,
            correctMap,
        };
    }, [questions, answers]);

    const handleSubmit = () => {
        const res = calculateResult();
        setResult(res);
        setSubmitted(true);
        setShowConfirmSubmit(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTimeUp = useCallback(() => {
        if (!submitted) {
            handleSubmit();
        }
    }, [submitted, calculateResult]);

    const answeredCount = Object.keys(answers).length;

    if (questions.length === 0) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📝</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-200 mb-3">Chưa có đề thi</h2>
                    <p className="text-gray-500 mb-6">Hãy upload và xem trước đề thi trước khi làm bài</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
                    >
                        ← Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {/* Sticky Header */}
            <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-200">{examTitle}</h1>
                        <p className="text-xs text-gray-500">
                            Đã trả lời: <span className="text-indigo-400">{answeredCount}</span>/{questions.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!submitted && (
                            <ExamTimer durationMinutes={duration} onTimeUp={handleTimeUp} />
                        )}

                        {!submitted ? (
                            <button
                                onClick={() => setShowConfirmSubmit(true)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-sm hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 active:scale-95"
                            >
                                Nộp bài
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/')}
                                className="px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-all duration-300"
                            >
                                Làm bài mới
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Result Banner */}
            {submitted && result && (
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                            <span className="text-3xl font-black text-white">{result.score}</span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-100 mb-1">Kết quả bài thi</h2>
                            <p className="text-gray-400">
                                Trả lời đúng <span className="text-emerald-400 font-bold">{result.correctAnswers}</span>/{result.totalQuestions} câu
                                {' '}• Điểm: <span className="text-indigo-400 font-bold">{result.score}/10</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{result.correctAnswers}</p>
                            <p className="text-xs text-emerald-400/70">Đúng</p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-2xl font-bold text-red-400">{result.totalQuestions - result.correctAnswers}</p>
                            <p className="text-xs text-red-400/70">Sai</p>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                            <p className="text-2xl font-bold text-indigo-400">{result.score}</p>
                            <p className="text-xs text-indigo-400/70">Điểm /10</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Navigator */}
            {!submitted && (
                <div className="mb-6 p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Bảng câu hỏi</p>
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q) => (
                            <a
                                key={q.id}
                                href={`#q-${q.id}`}
                                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200
                  ${answers[q.id]
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-gray-600'
                                    }
                `}
                            >
                                {q.id}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
                {questions.map((question) => (
                    <div key={question.id} id={`q-${question.id}`}>
                        <QuestionCard
                            question={question}
                            mode="exam"
                            selectedAnswer={answers[question.id]}
                            onSelectAnswer={handleSelectAnswer}
                            showResult={submitted}
                        />
                    </div>
                ))}
            </div>

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-gray-100 mb-3">Xác nhận nộp bài?</h3>
                        <p className="text-gray-400 mb-1">
                            Bạn đã trả lời <span className="text-indigo-400 font-bold">{answeredCount}</span>/{questions.length} câu.
                        </p>
                        {answeredCount < questions.length && (
                            <p className="text-amber-400 text-sm mb-6">
                                ⚠️ Còn {questions.length - answeredCount} câu chưa trả lời!
                            </p>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-medium hover:bg-gray-700 transition-all"
                            >
                                Tiếp tục làm
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all"
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
