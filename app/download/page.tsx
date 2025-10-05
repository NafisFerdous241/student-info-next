"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Student = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export default function DownloadPage() {
  const [filterType, setFilterType] = useState<"name" | "email">("name");
  const [filterValue, setFilterValue] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      if (!filterValue) {
        alert("Please enter a filter value.");
        return;
      }
      query = query.ilike(filterType, `%${filterValue}%`);
    }

    const { data, error } = await query;

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
    return null; // Render nothing on the server to avoid hydration mismatch
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Download Student Data
      </h1>

      <div className="bg-white p-6 rounded shadow mb-8 space-y-4">
        <h2 className="text-xl font-bold mb-4">Filtered Download</h2>
        <div className="flex items-center gap-4">
          <label>
            <input
              type="radio"
              name="filterType"
              value="name"
              checked={filterType === "name"}
              onChange={() => setFilterType("name")}
              className="mr-2"
            />
            Filter by Name
          </label>
          <label>
            <input
              type="radio"
              name="filterType"
              value="email"
              checked={filterType === "email"}
              onChange={() => setFilterType("email")}
              className="mr-2"
            />
            Filter by Email
          </label>
        </div>
        <input
          type="text"
          placeholder={`Enter ${filterType} to filter`}
          className="border rounded w-full p-2"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleDownload("csv", true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Download Filtered CSV
          </button>
          <button
            onClick={() => handleDownload("zip", true)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Download Filtered ZIP
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8 space-y-4">
        <h2 className="text-xl font-bold mb-4">Full Table Download</h2>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleDownload("csv", false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download Full Table CSV
          </button>
          <button
            onClick={() => handleDownload("zip", false)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Download Full Table ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
