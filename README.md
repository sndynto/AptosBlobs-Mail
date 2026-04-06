# 📬 AptosBlobs Mail

A secure, client-side encrypted decentralized mail app built with React + Vite. Messages are stored as blobs on **Shelby Protocol** and finalized on **Aptos**, so there is no centralized email server and sensitive data stays encrypted in the browser.

## Features

- **Send encrypted messages** — Stored as blobs and settled on Aptos.
- **Client-side AES-GCM encryption** — Messages are encrypted before they leave the browser.
- **Inbox & Sent views** — Standard mail-like interface for wallet-based messaging.
- **File attachments** — Upload and send files along with your message.
- **Tags and labels** — Auto-tagging for DeFi, DAO, NFT, and pending messages.
- **Mobile-friendly** — Responsive UI and Petra Wallet support.
- **Draft autosave** — Drafts are saved to local storage automatically.

---

## Tech

- **Frontend**: React 18 + Vite
- **State + Data**: React Query
- **Blockchain**: Aptos Testnet / Shelbynet
- **Storage**: Shelby Protocol
- **Wallet**: Aptos Wallet Adapter / Petra Wallet

---

## ⚙️ Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Petra Wallet](https://petra.app/) browser extension or mobile app
- Aptos Testnet APT from the [Aptos Faucet](https://aptos.dev/en/network/faucet)
- A Shelby Protocol API key from [geomi.dev](https://geomi.dev)

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then edit `.env` and set your keys:

```env
VITE_SHELBY_API_KEY_SHELBYNET=your_shelbynet_api_key_here
VITE_SHELBY_API_KEY_TESTNET=your_testnet_api_key_here
VITE_SHELBY_APP_SECRET=your_unique_secret_at_least_32_chars
```

> `VITE_SHELBY_APP_SECRET` is required for client-side encryption and must be unique.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Wallet Setup

1. Install Petra Wallet
2. Create or import an Aptos wallet
3. Switch Petra to **Testnet**
4. Fund the wallet with test APT
5. Connect the wallet from the app UI

---

## 📁 Project Structure

```
aptosblobs-mail/
├── src/
│   ├── App.tsx          # Main application logic and UI
│   ├── data.ts          # Mail type definitions and color palette
│   ├── index.css        # Application styles
│   └── main.tsx         # React entry point and providers
├── index.html           # HTML shell
├── vite.config.ts       # Vite config with polyfills
├── .env.example         # Environment variable template
└── package.json
```

---

## 🛠️ How It Works

1. User composes a message and optionally attaches files.
2. The app serializes the payload to JSON.
3. If privacy is enabled, the payload is encrypted in the browser.
4. The app uploads blobs to Shelby Protocol.
5. Shelby stores the blob and the transaction is finalized on Aptos.
6. Recipient inbox polls Shelby for blobs addressed to their wallet.

---

## 🏗️ Build for Production

```bash
npm run build
```

The production output is saved in `dist/`.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SHELBY_API_KEY_SHELBYNET` | Yes | Shelby API key for Shelbynet access |
| `VITE_SHELBY_API_KEY_TESTNET` | Yes | Shelby API key for Aptos Testnet access |
| `VITE_SHELBY_APP_SECRET` | Yes | Client-side encryption secret (use a unique 32+ char value) |

---

## ⚠️ Known Limitations

- Requires Aptos Testnet APT for sending messages
- Recent uploads may take a few seconds to appear due to Shelby indexing
- Designed for Testnet / Shelbynet use; mainnet support is not configured

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repo
2. Create a branch
3. Make your changes
4. Open a pull request

Please do not commit `.env` or any credentials.

---

## 📄 License

MIT License

---

## 🔗 Links

- [Aptos Developer Docs](https://aptos.dev)
- [Shelby Protocol Docs](https://shelby.xyz)
- [Petra Wallet](https://petra.app)
- [Geomi Dashboard](https://geomi.dev)
