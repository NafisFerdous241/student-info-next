"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Student type
type Student = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export default function StudentsPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchStudents();
    setIsClient(true);
  }, []);

  // Fetch students from Supabase
  async function fetchStudents() {
    const { data, error } = await supabase.from("users").select("*").order("id");

    if (error) console.error(error);
    else if (data) setStudents(data as Student[]);
  }

  // Add a new student
  async function addStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email) return;

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email }])
      .select();

    if (error) console.error(error);
    else if (data) setStudents([...students, ...(data as Student[])]);

    setName("");
    setEmail("");
  }

  const generateCsvContent = (data: Student[]) => {
    const headers = ["ID", "Name", "Email", "CreatedAt"];
    const rows = data.map((s) => [
      s.id,
      s.name,
      s.email,
      new Date(s.created_at).toLocaleString(),
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const downloadCsv = (data: Student[], filename: string) => {
    const csvContent = generateCsvContent(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const downloadZip = async (data: Student[], filename: string) => {
    const zip = new JSZip();
    const csvContent = generateCsvContent(data);
    zip.file("students.csv", csvContent);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, filename);
  };

  async function handleDownload(format: "csv" | "zip", filtered: boolean) {
    let query = supabase.from("users").select("*");

    if (filtered) {
      if (!nameFilter && !emailFilter) {
        alert("Please enter a filter value.");
        return;
      }
      if (nameFilter) query = query.ilike("name", `%${nameFilter}%`);
      if (emailFilter) query = query.ilike("email", `%${emailFilter}%`);
    }

    const { data, error } = await query.order("id");

    if (error) {
      console.error(`Error fetching ${filtered ? "filtered" : "all"} students:`, error);
      return;
    }

    if (data.length === 0) {
      alert("No students found.");
      return;
    }

    const filename = `${filtered ? "filtered" : "all"}_students`;
    if (format === "csv") {
      downloadCsv(data as Student[], `${filename}.csv`);
    } else if (format === "zip") {
      downloadZip(data as Student[], `${filename}.zip`);
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl font-semibold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">🎓 Student Info Manager</h1>
          <p className="text-lg text-gray-400 mt-2">A colorful way to manage student data.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* Add Student Form */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-white">Add New Student</h2>
              <form onSubmit={addStudent} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-gray-400">Name</label>
                  <input
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-400">Email</label>
                  <input
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., john.doe@example.com"
                  />
                </div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-transform transform hover:scale-105">
                  Add Student
                </button>
              </form>
            </div>

            {/* Filter and Download Section */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-white">Filter & Download</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Filter by name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Filter by email"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-white"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleDownload("csv", true)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105"
                  >
                    Filtered CSV
                  </button>
                  <button
                    onClick={() => handleDownload("zip", true)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105"
                  >
                    Filtered ZIP
                  </button>
                </div>
              </div>
            </div>

            {/* More Features Section */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white">Full Data</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => handleDownload("csv", false)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        Download All (CSV)
                    </button>
                    <button
                        onClick={() => handleDownload("zip", false)}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-transform transform hover:scale-105"
                    >
                        Download All (ZIP)
                    </button>
                </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">Student List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {students.map((s, index) => (
                    <tr key={s.id} className={`hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{s.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{s.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{s.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
