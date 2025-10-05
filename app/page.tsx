"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Welcome to Student Info Manager</h1>
        <p className="text-lg text-gray-400 mb-8">Manage students, download CSV/ZIP, and more.</p>
        <Link href="/students" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-transform transform hover:scale-105">
          Go to Students Page
        </Link>
      </div>
    </div>
  );
}