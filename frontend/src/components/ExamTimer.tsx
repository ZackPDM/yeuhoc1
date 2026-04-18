'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ExamTimerProps {
    durationMinutes: number;
    onTimeUp: () => void;
    isPaused?: boolean;
}

export default function ExamTimer({ durationMinutes, onTimeUp, isPaused = false }: ExamTimerProps) {
    const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, onTimeUp]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const percentage = (secondsLeft / (durationMinutes * 60)) * 100;

    const getTimeColor = () => {
        if (percentage <= 10) return 'text-red-400';
        if (percentage <= 25) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const getBarColor = () => {
        if (percentage <= 10) return 'bg-red-500';
        if (percentage <= 25) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="flex items-center gap-3">
            <div className={`
        flex items-center gap-2 px-4 py-2 rounded-xl
        bg-gray-800/80 border border-gray-700 backdrop-blur-sm
        ${percentage <= 10 ? 'animate-pulse border-red-500/50' : ''}
      `}>
                <svg className={`w-4 h-4 ${getTimeColor()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono text-lg font-bold ${getTimeColor()} tabular-nums`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
            </div>

            {/* Progress bar */}
            <div className="hidden sm:block w-32 h-2 rounded-full bg-gray-700 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${getBarColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
