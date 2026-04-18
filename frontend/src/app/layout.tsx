import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Azota - Tạo đề thi trắc nghiệm thông minh",
  description: "Ứng dụng tạo đề thi trắc nghiệm tự động, hỗ trợ LaTeX và trích xuất hình ảnh từ Word/PDF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
