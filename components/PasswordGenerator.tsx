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
    <div className="p-4 mb-4 border rounded-lg bg-gray-100">
      <h3 className="font-semibold mb-3 text-lg">🔐 Password Generator</h3>

      <div className="flex items-center justify-between mb-2">
        <label>Password Length: {length}</label>
        <input
          type="range"
          min="6"
          max="32"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-1/2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <label>
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
          />{" "}
          Lowercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
          />{" "}
          Uppercase
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
          />{" "}
          Numbers
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
          />{" "}
          Symbols
        </label>
        <label className="col-span-2">
          <input
            type="checkbox"
            checked={excludeSimilar}
            onChange={(e) => setExcludeSimilar(e.target.checked)}
          />{" "}
          Exclude look-alike characters (O/0, I/l)
        </label>
      </div>

      <button
        onClick={generatePassword}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full mb-2"
      >
        Generate Password
      </button>

      {generatedPassword && (
        <div className="text-sm text-gray-800 text-center">
          Generated: <span className="font-mono">{generatedPassword}</span>
        </div>
      )}
    </div>
  );
}
