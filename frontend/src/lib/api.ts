import { Question } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadFile(file: File): Promise<{ questions: Question[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
}

export function getImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE}${imageUrl}`;
}
