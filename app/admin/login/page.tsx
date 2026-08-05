"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Admin login is stubbed. Implement authentication in backend.");
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Username" className="w-full border px-3 py-2 rounded" />
        <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" type="password" className="w-full border px-3 py-2 rounded" />
        <button className="w-full bg-green-600 text-white py-2 rounded">Sign in</button>
      </form>
    </div>
  );
}
