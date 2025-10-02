// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Welcome to Student Info Manager</h1>
      <p className="mb-4">Manage students, download CSV/ZIP, and more.</p>
      <Link
        href="/students"
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
      >
        Go to Students Page
      </Link>
    </div>
  );
}
