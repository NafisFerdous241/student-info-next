"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; // adjust path if needed
import { CSVLink } from "react-csv";
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

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch students from Supabase
  async function fetchStudents() {
    const { data, error } = await supabase
      .from("users")         // ✅ Only table name here
      .select("*")
      .order("id");

    if (error) console.error(error);
    else if (data) setStudents(data as Student[]);  // ✅ Cast to Student[]
  }

  // Add a new student
  async function addStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email) return;

    const { data, error } = await supabase
      .from("users")         // ✅ Only table name here
      .insert([{ name, email }])
      .select();

    if (error) console.error(error);
    else if (data) setStudents([...students, ...(data as Student[])]);

    setName("");
    setEmail("");
  }

  // CSV data for download
  const csvData = students.map((s) => ({
    ID: s.id,
    Name: s.name,
    Email: s.email,
    CreatedAt: new Date(s.created_at).toLocaleString(),
  }));

  // Create ZIP of CSV
  async function downloadZip() {
    const zip = new JSZip();
    const csvContent = [
      ["ID", "Name", "Email", "CreatedAt"],
      ...students.map((s) => [s.id, s.name, s.email, new Date(s.created_at).toLocaleString()]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    zip.file("students.csv", csvContent);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "students.zip");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎓 Student Info Manager</h1>

      {/* Add Student Form */}
      <form onSubmit={addStudent} className="bg-white p-6 rounded shadow mb-8 space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            className="border rounded w-full p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Student
        </button>
      </form>

      {/* Download Buttons */}
      <div className="flex gap-4 mb-4">
        <CSVLink
          data={csvData}
          filename="students.csv"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Download CSV
        </CSVLink>
        <button
          onClick={downloadZip}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Download ZIP
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border">{s.id}</td>
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
