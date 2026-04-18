'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Trang chủ', icon: '🏠' },
        { href: '/preview/', label: 'Xem trước', icon: '👁️' },
        { href: '/exam/', label: 'Làm bài', icon: '✍️' },
    ];

    return (
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                            <span className="text-white font-black text-sm">AZ</span>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Azota
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname === item.href.slice(0, -1);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                                        }
                  `}
                                >
                                    <span className="mr-1.5">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
