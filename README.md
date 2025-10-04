🔐 Password Vault + Password Generator (MVP)

A secure, privacy-first password manager built with Next.js, TypeScript, and MongoDB.
Users can generate, store, search, edit, and delete passwords — all encrypted client-side to ensure no plaintext data ever leaves the browser.

🚀 Live Demo

👉 https://password-vault-mvp-avrj-git-main-soumadip-ghoshs-projects.vercel.app/

⚙️ Tech Stack

Frontend: Next.js (App Router) + TypeScript + Tailwind CSS

Backend: Next.js API Routes

Database: MongoDB Atlas

Authentication: Iron Session

Encryption: AES (CryptoJS)

🧠 Features

✅ Password generator (length, symbols, numbers, etc.)
✅ Client-side AES encryption (no plaintext stored)
✅ Simple authentication (email + password)
✅ Vault: add / edit / delete / search
✅ Copy to clipboard with auto-clear (15s)
✅ Responsive, minimalist UI
✅ Each user accesses only their own vault

🛠️ Local Setup
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/password-vault-mvp.git
cd password-vault-mvp

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create a .env.local file in the project root:

MONGODB_URI=your_mongodb_connection_string
SESSION_PASSWORD=your_iron_session_secret
NEXT_PUBLIC_CRYPTO_SECRET=your_crypto_secret


⚠️ Use strong 32-character random strings for SESSION_PASSWORD and NEXT_PUBLIC_CRYPTO_SECRET.

4️⃣ Run the App
npm run dev


Open http://localhost:3000



🎥 Demo Flow

Sign up or log in

Generate a strong password

Save it to your vault

Search, edit, or delete entries

Copy password → auto-clears after 15 seconds

👨‍💻 Author: Piku
🌐 Hosting: Vercel
🗄️ Database: MongoDB Atlas
🔐 Encryption: AES (CryptoJS)

