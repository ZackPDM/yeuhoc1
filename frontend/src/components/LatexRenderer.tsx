'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    content: string;
    className?: string;
}

export default function LatexRenderer({ content, className = '' }: LatexRendererProps) {
    const rendered = useMemo(() => {
        if (!content) return '';

        // Split by $$...$$ (block) and $...$ (inline)
        const parts: string[] = [];
        let remaining = content;

        while (remaining.length > 0) {
            // Try block LaTeX first: $$...$$
            const blockMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);
            // Try inline LaTeX: $...$
            const inlineMatch = remaining.match(/\$((?!\$)[\s\S]*?)\$/);

            let firstMatch: { index: number; length: number; latex: string; isBlock: boolean } | null = null;

            if (blockMatch && blockMatch.index !== undefined) {
                firstMatch = {
                    index: blockMatch.index,
                    length: blockMatch[0].length,
                    latex: blockMatch[1],
                    isBlock: true,
                };
            }

            if (inlineMatch && inlineMatch.index !== undefined) {
                if (!firstMatch || inlineMatch.index < firstMatch.index) {
                    firstMatch = {
                        index: inlineMatch.index,
                        length: inlineMatch[0].length,
                        latex: inlineMatch[1],
                        isBlock: false,
                    };
                }
            }

            if (!firstMatch) {
                parts.push(escapeHtml(remaining));
                break;
            }

            // Add text before the match
            if (firstMatch.index > 0) {
                parts.push(escapeHtml(remaining.substring(0, firstMatch.index)));
            }

            // Render LaTeX
            try {
                const html = katex.renderToString(firstMatch.latex, {
                    displayMode: firstMatch.isBlock,
                    throwOnError: false,
                    trust: true,
                });
                parts.push(html);
            } catch {
                parts.push(escapeHtml(remaining.substring(firstMatch.index, firstMatch.index + firstMatch.length)));
            }

            remaining = remaining.substring(firstMatch.index + firstMatch.length);
        }

        return parts.join('');
    }, [content]);

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    );
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
