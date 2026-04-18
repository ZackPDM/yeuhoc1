export interface Question {
    id: number;
    content: string;
    options: string[];
    answer: string;
    image_url: string | null;
}

export interface ExamData {
    title: string;
    questions: Question[];
    duration: number; // minutes
}

export interface ExamResult {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    answers: Record<number, string>;
    correctMap: Record<number, string>;
}
