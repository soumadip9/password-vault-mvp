"use client";

import { useEffect, useState } from "react";
import VaultForm from "@/components/VaultForm";
import { decrypt, encrypt } from "@/lib/crypto";

interface VaultItem {
  _id: string;
  title: string;
  username: string;
  password: string;
  notes: string;
  userEmail: string;
  createdAt: string;
}

export default function VaultPage() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleItemAdded = (newItem: VaultItem) => {
    setVaultItems((prev) => [newItem, ...prev]);
  };

  const handleCopy = (password: string, id: string) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => {
      navigator.clipboard.writeText("");
      setCopiedId(null);
    }, 15000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    await fetch(`/api/vault?id=${id}`, { method: "DELETE" });
    setVaultItems((prev) => prev.filter((item) => item._id !== id));
  };

  const handleEdit = (item: VaultItem) => {
    setEditingItem(item);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    const updatedData = {
      ...editingItem,
      password: encrypt(editingItem.password),
    };

    await fetch("/api/vault", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    setVaultItems((prev) =>
      prev.map((item) => (item._id === editingItem._id ? editingItem : item))
    );
    setEditingItem(null);
  };

  const filteredItems = vaultItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">🔒 Your Vault</h1>

      <VaultForm onItemAdded={handleItemAdded} />

      <div className="flex justify-between items-center mt-10 mb-3">
        <h2 className="text-xl font-semibold">Saved Vault Entries</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-1/2 text-sm"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="p-4 border rounded-lg bg-gray-50 shadow-sm"
            >
              {editingItem?._id === item._id ? (
                <>
                  <input
                    className="border p-2 rounded w-full mb-2"
                    value={editingItem.title}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        title: e.target.value,
                      })
                    }
                  />
                  <input
                    className="border p-2 rounded w-full mb-2"
                    value={editingItem.username}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        username: e.target.value,
                      })
                    }
                  />
                  <input
                    className="border p-2 rounded w-full mb-2"
                    value={editingItem.password}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        password: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="border p-2 rounded w-full mb-2"
                    value={editingItem.notes}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        notes: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleCopy(item.password, item._id)}
                        className={`text-sm px-3 py-1 rounded ${
                          copiedId === item._id
                            ? "bg-green-600 text-white"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                        }`}
                      >
                        {copiedId === item._id ? "Copied ✅" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    Username: {item.username}
                  </p>
                  <p className="text-sm font-mono mt-1">Password: ••••••••</p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 italic mt-1">
                      Notes: {item.notes}
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
