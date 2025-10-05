"use client";

import React, { useState } from "react";
import { encrypt } from "@/lib/crypto";
import PasswordGenerator from "@/components/PasswordGenerator";
import { VaultItem } from "@/types/VaultItems";

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

  // ✅ When password is generated
  const handlePasswordGenerated = (generated: string) => {
    setPassword(generated);
  };

  // ✅ Submit vault entry
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

      console.log("📤 Submitting vault item:", payload);

      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ ensures session cookies sent
        body: JSON.stringify(payload),
      });

      console.log("📥 Server response:", res.status);

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/";
        return;
      }

      const data = await res.json();
      console.log("📥 Response data:", data);

      if (res.ok && data.id) {
        const newItem: VaultItem = {
          _id: data.id,
          title,
          username,
          url,
          password, // decrypted for UI
          notes,
          createdAt: new Date().toISOString(),
          userEmail: "",
        };

        onItemAdded(newItem);

        // ✅ Clear form
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
      alert("❌ Error saving vault entry. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md border border-gray-700 rounded-xl p-6 mb-10 shadow-md"
    >
      <h2 className="text-2xl font-semibold text-white mb-4">
        ➕ Add New Vault Entry
      </h2>

      {/* ✅ Inputs — white text + placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Title (e.g. Amazon)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-500 bg-transparent text-white placeholder-white p-3 rounded w-full focus:border-blue-500 focus:outline-none"
          required
        />
        <input
          type="text"
          placeholder="Username / Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-500 bg-transparent text-white placeholder-white p-3 rounded w-full focus:border-blue-500 focus:outline-none"
          required
        />
        <input
          type="url"
          placeholder="URL (e.g. https://amazon.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border border-gray-500 bg-transparent text-white placeholder-white p-3 rounded w-full focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Password (or use generator)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-500 bg-transparent text-white placeholder-white p-3 rounded w-full focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

      {/* ✅ Password Generator */}
      <div className="mb-4">
        <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
      </div>

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border border-gray-500 bg-transparent text-white placeholder-white p-3 rounded w-full mb-4 focus:border-blue-500 focus:outline-none"
      />

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 w-full"
      >
        {saving ? "Saving..." : "💾 Save Entry"}
      </button>
    </form>
  );
}
