// /types/VaultItem.ts
export interface VaultItem {
  _id?: string;
  title: string;
  username: string;
  url?: string;
  password: string;
  notes?: string;
  userEmail?: ""; // ✅ made optional to prevent build errors
  createdAt?: string;
}
