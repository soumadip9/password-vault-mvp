"use client";

import { useEffect, useState } from "react";
import VaultForm from "@/components/VaultForm";
import { decrypt, encrypt } from "@/lib/crypto";
import { VaultItem } from "@/types/VaultItem"; // ✅ shared type

export default function VaultPage() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch vault items for current user
  const fetchVaultItems = async () => {
    try {
      const res = await fetch("/api/vault");
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const decrypted = data.items.map((item: VaultItem) => ({
          ...item,
          password: decrypt(item.password),
        }));
        setVaultItems(decrypted);
      } else {
        setVaultItems([]);
      }
    } catch (error) {
      console.error("❌ Error fetching vault items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultItems();
  }, []);

  // ✅ When new item is added
  const handleItemAdded = (newItem: VaultItem) => {
    setVaultItems((prev) => [newItem, ...prev]);
  };

  // ✅ Copy password to clipboard (auto clear after 15s)
  const handleCopy = async (password: string, id: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedId(id);

      setTimeout(async () => {
        try {
          if (document.hasFocus()) await navigator.clipboard.writeText("");
        } catch (err) {
          console.warn("⚠️ Could not clear clipboard:", err);
        }
        setCopiedId(null);
      }, 15000);
    } catch (err) {
      console.error("❌ Clipboard error:", err);
    }
  };

  // ✅ Delete vault item
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this entry?")) return;
    await fetch(`/api/vault?id=${id}`, { method: "DELETE" });
    setVaultItems((prev) => prev.filter((item) => item._id !== id));
  };

  // ✅ Edit vault item
  const handleEdit = (item: VaultItem) => setEditingItem(item);

  // ✅ Save updated item
  const handleUpdate = async () => {
    if (!editingItem) return;

    const payload = {
      ...editingItem,
      password: encrypt(editingItem.password),
    };

    await fetch("/api/vault", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setVaultItems((prev) =>
      prev.map((item) => (item._id === editingItem._id ? editingItem : item))
    );
    setEditingItem(null);
  };

  const filteredItems = vaultItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q) ||
      (item.url ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-700">
        🔒 Your Vault
      </h1>

      {/* ✅ Vault Form */}
      <VaultForm onItemAdded={handleItemAdded} />

      {/* ✅ Saved Vault Entries */}
      <div className="flex justify-between items-center mt-12 mb-4">
        <h2 className="text-2xl font-semibold text-white">Saved Vault Entries</h2>
        <input
          type="text"
          placeholder="Search title / username / URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-400 p-2 rounded-lg w-1/2 text-sm placeholder-white"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-gray-600">No entries found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id ?? `${item.title}-${item.createdAt}`}
              className="p-5 border border-gray-300 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {editingItem && editingItem._id === item._id ? (
                <>
                  <input
                    className="border border-gray-400 p-2 rounded w-full mb-3 text-black"
                    value={editingItem.title || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, title: e.target.value })
                    }
                  />
                  <input
                    className="border border-gray-400 p-2 rounded w-full mb-3 text-black"
                    value={editingItem.username || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, username: e.target.value })
                    }
                  />
                  <input
                    className="border border-gray-400 p-2 rounded w-full mb-3 text-black"
                    placeholder="https://example.com"
                    value={editingItem.url || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, url: e.target.value })
                    }
                  />
                  <input
                    className="border border-gray-400 p-2 rounded w-full mb-3 text-black"
                    value={editingItem.password || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, password: e.target.value })
                    }
                  />
                  <textarea
                    className="border border-gray-400 p-2 rounded w-full mb-3 text-black"
                    value={editingItem.notes || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, notes: e.target.value })
                    }
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xl text-black">{item.title}</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleCopy(item.password, item._id ?? item.title)}
                        className={`text-sm px-3 py-1 rounded-lg ${
                          copiedId === (item._id ?? item.title)
                            ? "bg-green-600 text-white"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                        }`}
                      >
                        {copiedId === (item._id ?? item.title)
                          ? "Copied ✅"
                          : "Copy"}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-black mt-2">
                    <strong>Username:</strong> {item.username}
                  </p>
                  {item.url && (
                    <p className="text-sm text-black mt-2">
                      <strong>URL:</strong>{" "}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline break-all"
                      >
                        {item.url}
                      </a>
                    </p>
                  )}
                  <p className="text-sm font-mono text-black mt-2">
                    <strong>Password:</strong> ••••••••
                  </p>
                  {item.notes && (
                    <p className="text-sm italic text-black mt-2">
                      <strong>Notes:</strong> {item.notes}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
