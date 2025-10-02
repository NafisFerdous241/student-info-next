"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", studentId: "", age: "" });
  const [result, setResult] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(`Name: ${form.name}, ID: ${form.studentId}, Age: ${form.age}`);
    setForm({ name: "", studentId: "", age: "" });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Student Info Form (Next.js)</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <br />
        <input
          placeholder="ID"
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
        />
        <br />
        <input
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <br />
        <button type="submit">Add</button>
      </form>

      <h2>Result:</h2>
      <div>{result}</div>
    </div>
  );
}
