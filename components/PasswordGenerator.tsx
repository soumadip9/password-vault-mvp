"use client";

import { useState } from "react";

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const generatePassword = () => {
    let chars = "";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()-_=+[]{};:,.<>?";

    if (excludeSimilar) {
      chars = chars.replace(/[Il1O0]/g, ""); // exclude confusing characters
    }

    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedPassword(password);
    onPasswordGenerated(password);
  };

  return (
    <div className="p-5 mb-5 border rounded-xl bg-white shadow-sm">
      <h3 className="font-bold mb-4 text-xl text-black text-center">
        🔐 Password Generator
      </h3>

      <div className="flex items-center justify-between mb-4 text-black">
        <label className="font-medium">Password Length: {length}</label>
        <input
          type="range"
          min="6"
          max="32"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-1/2 accent-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-black mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
          />
          Lowercase
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
          />
          Uppercase
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
          />
          Numbers
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
          />
          Symbols
        </label>
        <label className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            checked={excludeSimilar}
            onChange={(e) => setExcludeSimilar(e.target.checked)}
          />
          Exclude look-alike characters (O/0, I/l)
        </label>
      </div>

      <button
  type="button" // ✅ prevents form from refreshing
  onClick={generatePassword}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full font-medium"
>
  Generate Password
</button>


      {generatedPassword && (
        <div className="mt-4 text-sm text-black text-center bg-gray-50 p-3 rounded-md border border-gray-200">
          <span className="font-semibold">Generated:</span>{" "}
          <span className="font-mono break-all">{generatedPassword}</span>
        </div>
      )}
    </div>
  );
}
