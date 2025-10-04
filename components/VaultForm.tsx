"use client";

import React, { useState } from "react";
import { encrypt } from "@/lib/crypto";
import PasswordGenerator from "./PasswordGenerator";

export default function VaultForm({ onItemAdded }: { onItemAdded: (item: any) => void }) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ This function will receive the generated password from the generator
  const handleGeneratedPassword = (newPassword: string) => {
    setPassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const encryptedPassword = encrypt(password);

      const payload = {
        title,
        username,
        password: encryptedPassword,
        notes,
      };

      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const newItem = {
          ...payload,
          _id: data.id,
          password, // keep decrypted password in UI
        };

        onItemAdded(newItem);
        setTitle("");
        setUsername("");
        setPassword("");
        setNotes("");
      } else {
        alert("❌ Failed to save vault entry.");
      }
    } catch (error) {
      console.error("❌ Error saving vault entry:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* ✅ Add Password Generator on top */}
      <PasswordGenerator onPasswordGenerated={handleGeneratedPassword} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full font-mono"
          required
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
