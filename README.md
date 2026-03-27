# 📬 AptosBlobs Mail

A decentralized mail system built on Aptos using blob-based storage.  
This project enables users to send, store, and retrieve messages in a trustless and censorship-resistant way.

---

## 🚀 Overview

**AptosBlobs Mail** is a Web3 experiment combining:
- ✉️ Messaging system (email-like)
- 📦 Blob storage (on-chain / off-chain hybrid)
- ⚡ Aptos blockchain for security and transparency  

This project aims to create a communication system that is:
- Decentralized (no central server)
- Immutable
- Private & verifiable  

---

## ✨ Features

- 📩 Send messages via Aptos
- 📦 Store messages as blobs
- 🔍 Retrieve messages from storage
- 🔐 Wallet-based authentication
- ⚡ Fast & low-cost transactions

---

## 🧱 Tech Stack

- **Blockchain:** Aptos  
- **Smart Contract:** Move  
- **Frontend:** React / Next.js (optional)  
- **SDK:** Aptos TypeScript SDK  
- **Storage:** Blob / IPFS / custom  

---

## 📂 Project Structure

```
AptosBlobs-Mail/
│
├── contracts/        # Move smart contracts
├── scripts/          # Deployment & interaction scripts
├── frontend/         # UI (if available)
├── utils/            # Helper functions
└── README.md
```

---

## ⚙️ Installation

### 1. Clone repository
```bash
git clone https://github.com/sndynto/AptosBlobs-Mail.git
cd AptosBlobs-Mail
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Setup Aptos CLI
```bash
aptos init
```

---

## 🛠️ Usage

### Deploy contract
```bash
aptos move publish
```

### Send message
```bash
node scripts/sendMessage.js
```

### Fetch messages
```bash
node scripts/getMessages.js
```

---

## 🔐 How It Works

1. User connects wallet  
2. Message is created & hashed  
3. Data stored as blob  
4. Reference saved on-chain  
5. Recipient fetches & decrypts  

---

## 📡 Use Cases

- Web3 email system  
- Decentralized communication  
- On-chain messaging  
- Private data sharing  

---

## 🧪 Future Improvements

- 🔑 End-to-end encryption  
- 📱 Mobile support  
- 🌐 Improved UI/UX  
- 🔄 Cross-chain messaging  
- 📬 Inbox system  

---

## 🤝 Contributing

Contributions are welcome!

```
fork → create branch → commit → PR
```

---

## 📄 License

MIT License  

---

## 🔗 Links

- https://aptos.dev  
- https://github.com/sndynto/AptosBlobs-Mail
