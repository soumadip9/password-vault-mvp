// /types/VaultItem.ts
export interface VaultItem {
  _id?: string;
  title: string;
  username: string;
  url?: string;
  password: string;
  notes?: string;
  userEmail?: string; // ✅ made optional to prevent build errors
  createdAt?: string;
}
