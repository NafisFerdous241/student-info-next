"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { CSVLink } from "react-csv";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function StudentsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [students, setStudents] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("users").select("*").order("id");
    setStudents(data);
  }

  async function addStudent(e) {
    e.preventDefault();
    if (!name || !email) return;

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email }])
      .select();
    if (error) console.error(error);
    else setStudents([...students, ...data]);

    setName("");
    setEmail("");
  }

  // CSV data
  const csvData = students.map(({ id, name, email, created_at }) => ({
    ID: id,
    Name: name,
    Email: email,
    "Created At": new Date(created_at).toLocaleString(),
  }));

  // Create ZIP
  async function createZip() {
    const zip = new JSZip();
    const csvContent = csvData
      .map((row) => Object.values(row).join(","))
      .join("\n");
    zip.file("students.csv", csvContent);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "students.zip");
    setZipBlob(blob);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎓 Student Info Manager</h1>

      {/* Form */}
      <form
        onSubmit={addStudent}
        className="bg-white p-6 rounded-lg shadow mb-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
          Add Student
        </button>
      </form>

      {/* Download Buttons */}
      <div className="flex gap-4 mb-4">
        <CSVLink
          data={csvData}
          filename="students.csv"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Download CSV
        </CSVLink>
        <button
          onClick={createZip}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
        >
          Download ZIP
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition"
              >
                <td className="p-2 border">{s.id}</td>
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">
                  {new Date(s.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
