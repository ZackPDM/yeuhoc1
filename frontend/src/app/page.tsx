'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import { uploadFile } from '@/lib/api';
import { Question } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadFile(file);
      // Store questions in sessionStorage for the preview page
      sessionStorage.setItem('examQuestions', JSON.stringify(data.questions));
      sessionStorage.setItem('examTitle', file.name.replace(/\.(docx|pdf)$/, ''));
      router.push('/preview/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    const demoQuestions: Question[] = [
      {
        id: 1,
        content: 'Tính tích phân $\\int_0^{\\pi} \\sin(x)\\,dx$. Chọn đáp án đúng:',
        options: ['A. $0$', 'B. $1$', 'C. $2$', 'D. $\\pi$'],
        answer: 'C',
        image_url: null,
      },
      {
        id: 2,
        content: 'Tính định thức ma trận $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$:',
        options: ['A. $-2$', 'B. $-1$', 'C. $2$', 'D. $10$'],
        answer: 'A',
        image_url: null,
      },
      {
        id: 3,
        content: 'Một lượng khí lý tưởng thực hiện chu trình biến đổi biểu diễn trên đồ thị $p-V$ như hình vẽ. Công mà khí thực hiện trong cả chu trình bằng:',
        options: ['A. $200\\,J$', 'B. $400\\,J$', 'C. $600\\,J$', 'D. $800\\,J$'],
        answer: 'B',
        image_url: null,
      },
      {
        id: 4,
        content: 'Đồ thị biểu diễn quá trình đẳng áp của khí lý tưởng trong hệ tọa độ $(V, T)$ là:',
        options: ['A. Đường thẳng qua gốc tọa độ', 'B. Đường cong hyperbol', 'C. Đường thẳng song song trục $V$', 'D. Đường thẳng song song trục $T$'],
        answer: 'A',
        image_url: null,
      },
      {
        id: 5,
        content: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = a\\sqrt{2}$. Tính khoảng cách từ $A$ đến mặt phẳng $(SBC)$:',
        options: ['A. $\\dfrac{a\\sqrt{6}}{3}$', 'B. $\\dfrac{a\\sqrt{3}}{3}$', 'C. $\\dfrac{a\\sqrt{2}}{2}$', 'D. $\\dfrac{a\\sqrt{6}}{6}$'],
        answer: 'A',
        image_url: null,
      },
    ];

    sessionStorage.setItem('examQuestions', JSON.stringify(demoQuestions));
    sessionStorage.setItem('examTitle', 'Đề thi mẫu - Toán Lý Tổng hợp');
    router.push('/preview/');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="text-center animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Hỗ trợ LaTeX & Trích xuất hình ảnh
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              <span className="text-gray-100">Tạo đề thi </span>
              <span className="gradient-text">trắc nghiệm</span>
              <br />
              <span className="text-gray-100">thông minh</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Upload file Word hoặc PDF — hệ thống tự động nhận diện câu hỏi,
              chuyển đổi công thức toán học sang LaTeX và trích xuất hình ảnh minh họa.
            </p>

            {/* Upload Area */}
            <FileUpload onUpload={handleUpload} isLoading={isLoading} />

            {/* Error Message */}
            {error && (
              <div className="mt-4 max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Demo Button */}
            <div className="mt-8">
              <button
                onClick={handleLoadDemo}
                className="text-sm text-gray-500 hover:text-indigo-400 transition-colors duration-200 underline underline-offset-4 decoration-gray-700 hover:decoration-indigo-500"
              >
                Hoặc dùng thử với đề thi mẫu →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📐',
              title: 'LaTeX Rendering',
              desc: 'Hiển thị công thức toán học chuyên nghiệp với KaTeX — từ tích phân đến ma trận.',
              gradient: 'from-blue-600 to-indigo-600',
            },
            {
              icon: '🖼️',
              title: 'Trích xuất hình ảnh',
              desc: 'Tự động trích xuất đồ thị, hình vẽ từ file Word và gắn vào đúng câu hỏi.',
              gradient: 'from-purple-600 to-pink-600',
            },
            {
              icon: '⚡',
              title: 'Thi trực tuyến',
              desc: 'Chế độ làm bài với đếm ngược thời gian, chấm điểm tự động và phóng to ảnh.',
              gradient: 'from-amber-600 to-orange-600',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
