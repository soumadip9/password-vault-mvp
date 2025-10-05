"use client";

import React, { useState } from "react";
import { encrypt } from "@/lib/crypto";
import PasswordGenerator from "@/components/PasswordGenerator";
import { VaultItem } from "@/types/VaultItems";
 // ✅ shared type

export default function VaultForm({
  onItemAdded,
}: {
  onItemAdded: (item: VaultItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordGenerated = (generated: string) => {
    setPassword(generated);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);

  try {
    const encryptedPassword = encrypt(password);

    const payload = {
      title,
      username,
      url: url || undefined,
      password: encryptedPassword,
      notes,
    };

    console.log("📤 Submitting new vault item:", payload); // ✅ add this

    const res = await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📥 Server response:", res.status); // ✅ add this
    const data = await res.json();
    console.log("📥 Response body:", data); // ✅ add this

    if (res.ok) {
      const newItem: VaultItem = {
        _id: data.id,
        title,
        username,
        url,
        password, // decrypted for UI
        notes,
        createdAt: new Date().toISOString(),
      };

      onItemAdded(newItem);

      // Reset form
      setTitle("");
      setUsername("");
      setUrl("");
      setPassword("");
      setNotes("");
    } else {
      alert(data?.error || "❌ Failed to save vault entry.");
    }
  } catch (error) {
    console.error("❌ Error saving vault entry:", error);
    alert("❌ Error saving vault entry. Check console.");
  } finally {
    setSaving(false);
  }
};

  
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md border border-gray-300 rounded-xl p-6 mb-10 shadow-md"
    >
      <h2 className="text-2xl font-semibold text-white mb-4">➕ Add New Vault Entry</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border border-gray-400 p-3 rounded w-full text-black placeholder-white" required />
        <input type="text" placeholder="Username / Email" value={username} onChange={(e) => setUsername(e.target.value)} className="border border-gray-400 p-3 rounded w-full text-black placeholder-white" required />
        <input type="url" placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} className="border border-gray-400 p-3 rounded w-full text-black placeholder-white" />
        <input type="text" placeholder="Password (or use generator)" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-400 p-3 rounded w-full text-black placeholder-white" required />
      </div>

      <div className="mb-4">
        <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
      </div>

      <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="border border-gray-400 p-3 rounded w-full text-black placeholder-white mb-4" />

      <button type="submit" disabled={saving} className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
        {saving ? "Saving..." : "💾 Save Entry"}
      </button>
    </form>
  );
}
