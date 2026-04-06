# 📬 AptosBlobs Mail

<<<<<<< HEAD
A secure, **client-side encrypted**, decentralized email client. It uses **Shelby Protocol** for storage and settles everything on the **Aptos** blockchain. No servers, just on-chain data.
=======
A simple Web3 email-like client using Aptos for identity and transaction settlement, with Shelby Protocol for scalable storage
>>>>>>> 6f0b0cc0f18eb69d141c89be16e2a362eccdb323

## Features

- **Send messages** — Stored as blobs, settled on Aptos.
- **Client-Side Encryption** — All messages are encrypted with AES-GCM before upload.
- **Inbox & Sent** — Standard mail views for your wallet address.
- **Attachments** — You can attach files directly to your on-chain messages.
- **Tags** — Automatic tagging for DeFi, DAO, and NFT related subjects.
- **Mobile Friendly** — Works great on Android/iOS and inside Petra Wallet.
- **Drafts** — Automatically saves what you're typing to local storage.

---

## Tech

- **Frontend**: React 18 + Vite
- **Chain**: Aptos (Testnet / Shelbynet)
- **Storage**: [Shelby Protocol](https://shelby.xyz)
- **State**: React Query 
- **Style**: Pure CSS

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
VITE_SHELBY_API_KEY_SHELBYNET=your_shelbynet_api_key_here
VITE_SHELBY_API_KEY_TESTNET=your_testnet_api_key_here
```

> **Get your API key** → [https://geomi.dev](https://geomi.dev)  
> Obtain separate keys for Shelbynet and Aptos Testnet if needed. Without a valid API key, uploading blobs will fail. The inbox can still show received messages.

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

> ⚠️ Remember to set `VITE_SHELBY_API_KEY_SHELBYNET` and `VITE_SHELBY_API_KEY_TESTNET` as environment variables in your hosting dashboard.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SHELBY_API_KEY_SHELBYNET` | Yes | API key for Shelbynet access ([geomi.dev](https://geomi.dev)) |
| `VITE_SHELBY_API_KEY_TESTNET` | Yes | API key for Aptos Testnet access ([geomi.dev](https://geomi.dev)) |

---

## ⚠️ Known Limitations

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
