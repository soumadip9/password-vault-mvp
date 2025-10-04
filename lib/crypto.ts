import CryptoJS from "crypto-js";

const SECRET_KEY = "piku_vault_secret_key_123456"; // you can move this to .env later

// Encrypt text
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

// Decrypt text
export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export type EncBlob = { iv: string; ct: string };

function str2buf(str: string) {
  return new TextEncoder().encode(str);
}
function buf2b64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b642buf(b64: string) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

export async function deriveKey(password: string, saltB64: string) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    str2buf(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: b642buf(saltB64),
      iterations: 250_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(data: any, key: CryptoKey): Promise<EncBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, str2buf(JSON.stringify(data)));
  return { iv: buf2b64(iv.buffer), ct: buf2b64(ct) }; // ✅ FIXED
}


export async function decryptJson<T>(blob: EncBlob, key: CryptoKey): Promise<T> {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b642buf(blob.iv) }, key, b642buf(blob.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}

export function excludeLookAlikes(chars: string) {
  const bad = new Set("0O1lI|`'\"");
  return [...chars].filter(c => !bad.has(c)).join("");
}
