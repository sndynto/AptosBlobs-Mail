# 📬 AptosBlobs Mail

A decentralized Web3 email client powered by **Shelby Protocol** blob storage, settled on the **Aptos** blockchain. Send, receive, and store messages entirely on-chain — no central servers.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Aptos](https://img.shields.io/badge/Blockchain-Aptos-00e5b8)](https://aptos.dev)
[![Shelby Protocol](https://img.shields.io/badge/Storage-Shelby_Protocol-f59e0b)](https://shelby.xyz)

---

## ✨ Features

- 📩 **Send messages** — stored as blobs on Shelby Protocol, settled on Aptos
- 📥 **Inbox** — receive messages from any Aptos wallet address
- 📤 **Sent** — view all your on-chain sent messages
- 📎 **File attachments** — attach any file as a blob alongside your message
- ⭐ **Starred / Labels** — DeFi, DAO, NFT auto-tagging
- 🔍 **Search** — filter by address, subject, preview
- 📱 **Mobile-first** — works on Android & iOS, including Petra Wallet dApp browser
- 🌐 **Network switcher** — Aptos Testnet ↔ Shelbynet
- ⚡ **Real-time sync** — auto-refresh every 10s, pending blob polling every 5s
- 💾 **Auto-save drafts** — saved to localStorage while you type

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Blockchain | Aptos (Testnet / Shelbynet) |
| Blob Storage | [Shelby Protocol](https://shelby.xyz) |
| Wallet | Petra Wallet (browser extension + mobile dApp) |
| State / Query | TanStack React Query v5 |
| Styling | Vanilla CSS (dark, glassmorphism) |

---

## ⚙️ Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Petra Wallet](https://petra.app/) browser extension (or mobile app)
- An Aptos Testnet wallet with some test APT ([faucet](https://aptos.dev/en/network/faucet))
- A **Shelby Protocol API Key** (get one at [geomi.dev](https://geomi.dev))

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/sndynto/AptosBlobs-Mail.git
cd AptosBlobs-Mail
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your API key:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
VITE_SHELBY_API_KEY=your_shelby_api_key_here
```

> **Get your API key** → [https://geomi.dev](https://geomi.dev)  
> Without a valid API key, uploading blobs will fail. The inbox can still show received messages.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Wallet Setup

1. Install [Petra Wallet](https://petra.app/) browser extension
2. Create or import an Aptos wallet
3. Switch to **Testnet** in Petra settings
4. Get test APT from the [Aptos Faucet](https://aptos.dev/en/network/faucet)
5. Click **"Connect Wallet"** in the app

---

## 📱 Mobile (Android / iOS)

The app is fully responsive. To use with Petra mobile wallet:

1. Install **Petra Wallet** app on your phone
2. Open the Petra app → tap **"Browser"** (dApp browser tab)
3. Enter your deployed app URL
4. The app auto-detects Petra and connects instantly

---

## 📁 Project Structure

```
aptosblobs-mail/
├── src/
│   ├── App.tsx          # Main application (all components)
│   ├── data.ts          # Mail type definition & color palette
│   ├── index.css        # Styles + mobile responsive
│   └── main.tsx         # Entry point (providers setup)
├── index.html           # HTML shell with mobile meta tags
├── vite.config.ts       # Vite + WASM + node polyfills
├── .env.example         # Environment variable template
└── package.json
```

---

## 🛠️ How It Works

```
User writes email
      ↓
JSON payload encoded → Uint8Array blob
      ↓
Blob named: "to_<recipientAddr>_<timestamp>-mail.json"
      ↓
Uploaded to Shelby Protocol (blob storage layer)
      ↓
100 Octa APT sent to recipient as on-chain notification
      ↓
Recipient's inbox polls Shelby indexer for blobs
matching pattern: "to_<myAddr>_%"
```

---

## 🏗️ Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. You can deploy to:
- [Vercel](https://vercel.com) — recommended
- [Netlify](https://netlify.com)
- Any static file host

> ⚠️ Remember to set `VITE_SHELBY_API_KEY` as an environment variable in your hosting dashboard.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SHELBY_API_KEY` | Yes | API key from [geomi.dev](https://geomi.dev) for Shelby Protocol access |

---

## ⚠️ Known Limitations

- Messages are **not encrypted** — blobs are readable by anyone with the blob name
- Requires real APT on testnet for sending (for the 100 Octa notification ping)
- Shelby Protocol is in beta — occasional sync delays possible (2–30 seconds)

---

## 🤝 Contributing

Contributions are welcome!

```
fork → create branch → commit → open PR
```

Please do **not** commit your `.env` file or any file containing API keys.

---

## 📄 License

MIT License

---

## 🔗 Links

- [Aptos Developer Docs](https://aptos.dev)
- [Shelby Protocol Docs](https://shelby.xyz)
- [Petra Wallet](https://petra.app)
- [Geomi Dashboard (API Keys)](https://geomi.dev)
- [GitHub Repository](https://github.com/sndynto/AptosBlobs-Mail)
