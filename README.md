# Password Vault MVP

A secure, privacy-focused password manager built with **Next.js**, **TypeScript**, and **MongoDB Atlas**. Users can register, log in, generate strong passwords, and store vault entries with **client-side AES encryption** so plaintext passwords are never stored in the database.

**Live demo:** [password-vault-mvp on Vercel](https://password-vault-mvp-avrj-git-main-soumadip-ghoshs-projects.vercel.app/)

**Repository:** [github.com/soumadip9/password-vault-mvp](https://github.com/soumadip9/password-vault-mvp)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Security Model](#security-model)
- [DevSecOps & CI/CD Pipeline](#devsecops--cicd-pipeline)
- [Deployment](#deployment)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)
- [Roadmap / Known Limitations](#roadmap--known-limitations)
- [Author](#author)

---

## Features

| Feature | Description |
|--------|-------------|
| **User authentication** | Email + password sign-up and login with bcrypt-hashed credentials |
| **Session management** | Encrypted HTTP-only cookies via [iron-session](https://github.com/vvo/iron-session) |
| **Password generator** | Configurable length (6–32), uppercase/lowercase, numbers, symbols, look-alike exclusion |
| **Vault CRUD** | Create, read, update, and delete password entries |
| **Search** | Filter entries by title, username, or URL |
| **Client-side encryption** | Vault passwords encrypted with AES (CryptoJS) before being sent to the server |
| **Clipboard copy** | One-click copy with auto-clear after 15 seconds |
| **Per-user isolation** | All vault queries are scoped to the logged-in user's email |
| **Responsive UI** | Tailwind CSS with a clean, mobile-friendly layout |
| **DevSecOps pipeline** | Automated Jenkins pipeline with SonarQube, OWASP Dependency-Check, and Docker builds |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Database | MongoDB Atlas |
| Auth sessions | iron-session |
| Password hashing | bcryptjs |
| Vault encryption | CryptoJS (AES) |
| Validation | Zod |
| Hosting | Vercel |
| CI/CD | Jenkins |
| Code quality | SonarQube |
| Dependency scanning | OWASP Dependency-Check |
| Containerization | Docker |

---

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────────┐     ┌─────────────────┐
│   Browser   │ ◄───────────► │  Next.js App Router  │ ◄──► │  MongoDB Atlas  │
│             │                │                      │     │                 │
│ • Login UI  │                │ • API Routes         │     │ • users         │
│ • Vault UI  │                │ • iron-session       │     │ • vault         │
│ • AES enc   │                │ • bcrypt auth        │     │                 │
└─────────────┘                └──────────────────────┘     └─────────────────┘
```

### Request flow

1. **Register / Login** — Credentials are sent to `/api/auth/*`. Passwords are hashed with bcrypt before storage. On success, an encrypted session cookie (`vault_session`) is set.
2. **Vault access** — The browser sends the session cookie with every `/api/vault` request. The API validates the session and scopes all queries to `userEmail`.
3. **Encryption** — Before a vault entry is saved, the password field is encrypted in the browser. The server stores only the ciphertext. On fetch, the client decrypts for display.

---

## Project Structure

```
password-vault-mvp/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST — authenticate user
│   │   │   ├── register/route.ts   # POST — create account
│   │   │   ├── logout/route.ts     # POST — destroy session
│   │   │   └── enc-salt/route.ts   # GET  — fetch user encryption salt
│   │   └── vault/route.ts          # GET/POST/PUT/DELETE — vault CRUD
│   ├── vault/page.tsx              # Main vault dashboard
│   ├── page.tsx                    # Login / register page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── PasswordGenerator.tsx       # Password generation UI
│   ├── VaultForm.tsx               # Add new vault entry
│   └── VaultList.tsx               # (placeholder for list component)
├── lib/
│   ├── crypto.ts                   # AES encrypt/decrypt + Web Crypto helpers
│   ├── db.ts                       # MongoDB connection singleton
│   └── session.ts                  # iron-session configuration
├── types/
│   └── VaultItems.ts               # VaultItem TypeScript interface
├── public/                         # Static assets
├── Dockerfile                      # Container build
├── test-db.js                      # MongoDB connection smoke test
├── next.config.ts
├── package.json
└── .env.local                      # Local secrets (not committed)
```

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 9+
- A **MongoDB Atlas** cluster (free tier works)
- **Git**

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/soumadip9/password-vault-mvp.git
cd password-vault-mvp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root (see [Environment Variables](#environment-variables) below).

### 4. Verify database connection (optional)

```bash
node test-db.js
```

> **Note:** `test-db.js` contains a hardcoded connection string for local testing. Do not commit real credentials to version control.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To use a different port:

```bash
npm run dev -- -p 3001
```

### 6. Production build (local)

```bash
npm run build
npm start
```

---

## Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Database name (default: vaultDB)
MONGODB_DB=vaultDB

# iron-session secret — must be at least 32 characters
IRON_SESSION_PASSWORD=your_random_32_character_secret_here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB` | No | Database name. Defaults to `vaultDB` |
| `IRON_SESSION_PASSWORD` | Yes | Secret used to encrypt session cookies (min. 32 chars) |

### Generating a session secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Vercel deployment

Add the same variables in **Vercel → Project → Settings → Environment Variables**. `.env.local` is gitignored and is **not** deployed automatically.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create optimized production build |
| `npm start` | Run production server (after build) |
| `npm run lint` | Run ESLint |

---

## API Reference

All vault endpoints require an active session cookie (`credentials: "include"` on the client).

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/auth/register` | `{ email, password }` | `200` on success, `400` if user exists |
| `POST` | `/api/auth/login` | `{ email, password }` | `200` + session cookie, `401` on bad credentials |
| `POST` | `/api/auth/logout` | — | `200`, destroys session |
| `GET` | `/api/auth/enc-salt` | — | `{ encSalt }` for logged-in user |

### Vault

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vault` | List all entries for the logged-in user |
| `POST` | `/api/vault` | Create a new entry |
| `PUT` | `/api/vault` | Update an existing entry (requires `_id`) |
| `DELETE` | `/api/vault?id=<id>` | Delete an entry by ID |

#### Example: create vault entry

```json
POST /api/vault
{
  "title": "GitHub",
  "username": "user@example.com",
  "url": "https://github.com",
  "password": "<AES-encrypted-ciphertext>",
  "notes": "Personal account"
}
```

---

## Database Schema

### `users` collection

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "passwordHash": "$2a$10$...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "encSalt": "optional-base64-salt"
}
```

### `vault` collection

```json
{
  "_id": "ObjectId",
  "userEmail": "user@example.com",
  "title": "Amazon",
  "username": "user@example.com",
  "url": "https://amazon.com",
  "password": "<AES-encrypted-ciphertext>",
  "notes": "Shopping account",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-06-01T00:00:00.000Z"
}
```

---

## Security Model

### What is protected

- **Login passwords** are hashed with bcrypt (cost factor 10) before storage.
- **Vault passwords** are AES-encrypted in the browser before being sent to the API.
- **Sessions** are stored in encrypted, HTTP-only cookies (secure flag enabled in production).
- **Vault access** is scoped per user — queries always filter by `userEmail` from the session.

### Important limitations (MVP)

- The AES encryption key is currently **hardcoded** in `lib/crypto.ts`. Anyone with source access can decrypt stored vault data. For production hardening, move this to a per-user key derived from the master password (PBKDF2 helpers already exist in `lib/crypto.ts`).
- Do **not** commit `.env.local`, MongoDB credentials, or session secrets to Git.
- Remove or rotate credentials in `test-db.js` before open-sourcing.
- This is an **MVP** — not audited for production security compliance.

---

## DevSecOps & CI/CD Pipeline

This project integrates **DevSecOps** practices — security and quality checks are automated into the delivery pipeline rather than handled manually at the end.

A **Jenkins pipeline** (`passwordvault-cicd`) orchestrates the full build lifecycle: source checkout, static analysis, dependency scanning, containerization, and deployment readiness checks.

### Pipeline overview

```
┌──────────┐    ┌─────────────┐    ┌──────────────────────┐    ┌─────────────┐    ┌──────────────┐
│  GitHub  │───►│   Jenkins   │───►│     SonarQube        │───►│ OWASP Dep.  │───►│    Docker    │
│  (push)  │    │  Pipeline   │    │  (code quality)      │    │   Check     │    │    Build     │
└──────────┘    └─────────────┘    └──────────────────────┘    └─────────────┘    └──────────────┘
```

### Pipeline stages

| Stage | Tool | Purpose |
|-------|------|---------|
| **Source checkout** | Jenkins + Git | Pull latest code from GitHub on every build |
| **Install & build** | npm | Install dependencies and run `npm run build` |
| **Code quality analysis** | SonarQube | Static analysis for bugs, vulnerabilities, code smells, and maintainability |
| **Dependency scanning** | OWASP Dependency-Check | Scans `package-lock.json` for known CVEs in npm dependencies |
| **Containerization** | Docker | Builds a production image using the included `Dockerfile` |
| **Deploy** | Vercel / Docker host | Application deployed after quality gates pass |

### SonarQube — code quality

[SonarQube](https://www.sonarqube.org/) performs **static application security testing (SAST)** and code quality analysis on every pipeline run.

**What it checks:**

- Bugs and logical errors
- Security hotspots and vulnerabilities in application code
- Code smells and technical debt
- Duplicated code
- Test coverage (when tests are configured)
- Maintainability ratings

**Jenkins integration:** The pipeline publishes scan results to the SonarQube dashboard. Builds can be configured to fail if quality gates are not met (e.g. too many critical issues or insufficient coverage).

**Dashboard:** Review findings at your local SonarQube instance (e.g. `http://localhost:9000`) under the `passwordvault-cicd` project.

### OWASP Dependency-Check — supply chain security

[OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) performs **software composition analysis (SCA)** — it inspects third-party npm packages for publicly known vulnerabilities (CVEs / GHSA advisories).

**What it scans:**

- Direct dependencies (`next`, `react`, `mongodb`, etc.)
- Transitive dependencies pulled in via `package-lock.json`
- Severity breakdown: Critical, High, Medium, Low

**Jenkins integration:** Results appear under **Dependency-Check** in the Jenkins build sidebar (`/job/passwordvault-cicd/lastCompletedBuild/dependency-check-findings/`).

**Example findings addressed in this project:**

| Package | Issue | Resolution |
|---------|-------|------------|
| `next@13.5.4` / `15.5.4` | Multiple critical/high CVEs (incl. React2Shell) | Upgraded to `next@16.2.7` |
| `minimatch`, `picomatch`, `flatted` | ReDoS / prototype pollution | Patched via `npm audit fix` |
| `postcss` | XSS advisory in bundled dependency | Resolved via `overrides` in `package.json` |

> **Tip:** Run `npm audit` locally before pushing to catch dependency issues before the Jenkins pipeline runs.

### Docker containerization

The app is packaged as a **Docker image** for consistent, portable deployments across environments.

**What the `Dockerfile` does:**

1. Uses `node:20-alpine` as the base image (minimal attack surface)
2. Copies `package.json` / `package-lock.json` and runs `npm install`
3. Copies application source and runs `npm run build`
4. Exposes port `3000` and starts with `npm start`

**Why Docker in a DevSecOps pipeline:**

- **Reproducible builds** — same image in dev, CI, and production
- **Isolation** — app runs in a contained environment with defined dependencies
- **Immutable artifacts** — each successful pipeline run produces a versioned image
- **Deployment flexibility** — run on any Docker host, Kubernetes, or cloud container service

See the [Docker](#docker) section below for local build and run commands.

### DevSecOps workflow (end-to-end)

```
Developer pushes to GitHub
        │
        ▼
Jenkins webhook / poll triggers build
        │
        ├──► npm install & npm run build
        │
        ├──► SonarQube scan  ──► Quality gate pass/fail
        │
        ├──► OWASP Dependency-Check  ──► CVE report (pass/fail)
        │
        ├──► docker build  ──► Container image artifact
        │
        ▼
Deploy to Vercel (production) or run Docker container
```

### Running quality checks locally

Before opening a PR or pushing to `main`, you can run equivalent checks locally:

```bash
# Dependency vulnerability scan
npm audit

# Fix auto-patchable issues
npm audit fix

# Production build verification
npm run build

# Docker image build
docker build -t password-vault-mvp .
```

### Jenkins project

| Setting | Value |
|---------|-------|
| Jenkins job name | `passwordvault-cicd` |
| Jenkins URL (local) | `http://localhost:8081` |
| Source repository | `github.com/soumadip9/password-vault-mvp` |
| Reports | SonarQube dashboard, Dependency-Check HTML report in Jenkins |

---

## Deployment

### Vercel (recommended)

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add environment variables (`MONGODB_URI`, `MONGODB_DB`, `IRON_SESSION_PASSWORD`).
4. Deploy.

> **Vercel security gate:** Deployments are blocked if a vulnerable Next.js version is detected. Keep `next` updated to the latest patched release (currently `16.2.7`).

### Manual Git push

```bash
git add .
git commit -m "your commit message"
git push origin main
```

---

## Docker

The `Dockerfile` is used both for **local containerized runs** and as the **final artifact** in the Jenkins DevSecOps pipeline.

Build and run the app in a container:

```bash
docker build -t password-vault-mvp .
docker run -p 3000:3000 \
  -e MONGODB_URI="your_connection_string" \
  -e MONGODB_DB="vaultDB" \
  -e IRON_SESSION_PASSWORD="your_32_char_secret" \
  password-vault-mvp
```

The Dockerfile uses `node:20-alpine`, runs `npm install`, `npm run build`, and starts on port **3000**.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| `{"error":"Internal server error"}` on login | Missing `.env.local` | Create `.env.local` with `MONGODB_URI` and `IRON_SESSION_PASSWORD`, then restart the dev server |
| `Invalid credentials` | Wrong email/password | Use the correct login credentials or register a new account |
| Vercel build blocked | Outdated Next.js version | Upgrade `next` to the latest patched release and push |
| Jenkins build fails — OWASP | Vulnerable npm dependencies | Run `npm audit fix`, upgrade `next`/`react`, push updated `package-lock.json` |
| Jenkins build fails — SonarQube | Quality gate not met | Fix reported bugs, vulnerabilities, or code smells in SonarQube dashboard |
| Docker build fails in pipeline | Missing env vars at runtime | Pass `MONGODB_URI` and `IRON_SESSION_PASSWORD` when running the container |
| MongoDB connection fails | Atlas IP whitelist / paused cluster | Allow your IP in Atlas Network Access; wake the cluster if paused |
| Session expires immediately | `IRON_SESSION_PASSWORD` too short | Use at least 32 characters |
| Empty vault after login | Wrong `MONGODB_DB` | Ensure `MONGODB_DB=vaultDB` matches where your data lives |

### Test MongoDB connectivity

```bash
node test-db.js
```

Expected output:

```
⏳ Connecting...
✅ Connected successfully to MongoDB!
```

---

## Roadmap / Known Limitations

- [ ] Move encryption key to per-user derivation (PBKDF2 + master password)
- [ ] Use `NEXT_PUBLIC_CRYPTO_SECRET` or server-side salt via `/api/auth/enc-salt`
- [ ] Add password strength meter
- [ ] Add rate limiting on auth endpoints
- [ ] Add unit / integration tests
- [ ] Improve metadata in `app/layout.tsx` (title, description)
- [ ] Remove hardcoded credentials from `test-db.js`
- [ ] Add Jenkinsfile to the repository for pipeline-as-code
- [ ] Configure SonarQube quality gate thresholds in Jenkins
- [ ] Add automated tests to improve SonarQube coverage score

---

## Demo Flow

1. Open the app and **register** a new account (or log in).
2. Navigate to **Your Vault**.
3. Use the **password generator** to create a strong password.
4. Fill in title, username, URL, and notes — then **Save Entry**.
5. **Search**, **edit**, **copy**, or **delete** entries as needed.
6. Copied passwords auto-clear from the clipboard after **15 seconds**.
7. Click **Logout** when done.

---

## Author

**Piku (Soumadip Ghosh)**

- Hosting: Vercel
- Database: MongoDB Atlas
- Encryption: AES (CryptoJS)
- DevSecOps: Jenkins · SonarQube · OWASP Dependency-Check · Docker

---

## License

This project is private / MVP. Add a license file if you plan to open-source it.
