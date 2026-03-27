# AptosBlobs Mail ✉️

A decentralized, Web3-native email client prototype built on top of the **Aptos Blockchain** and **Shelby Protocol**. This application leverages Shelby Protocol's decentralized object storage to send, receive, and manage immutable email payloads (Blobs) securely on the Aptos Testnet.

![AptosBlobs UI](https://github.com/sndynto/AptosBlobs-Mail/assets/preview.png)

## ✨ Core Features
- **Web3 Wallet Integration:** Seamless login via the Petra Aptos Wallet (`@aptos-labs/wallet-adapter-react`).
- **On-Chain Inbox:** Send and read actual binary payloads entirely stored and fetched from the Shelby infrastructure (`useAccountBlobs`).
- **Dynamic Storage Quota:** Real-time quota and usage calculation utilizing live Aptos Blob metadata.
- **Binary Attachments:** Attach any files and decode/download them individually to your local OS using `shelbyClient.download()`.
- **Auto-Save Drafts:** Never lose an unsent message, backed seamlessly by local browser caching.
- **Erasure Coding Validation:** Displays raw metadata including commitment hashes (Merkle Roots) directly from the blockchain state.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Blockchain:** Aptos TS SDK
- **Storage Layer:** Shelby Protocol SDK (`@shelby-protocol/sdk`, `@shelby-protocol/react`)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- **Petra Wallet** browser extension installed in your browser.
- A Client-type API Key from [Geomi Dashboard](https://geomi.dev/) configured for Testnet.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sndynto/AptosBlobs-Mail.git
   cd AptosBlobs-Mail
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment Variable:**
   Create a `.env` file in the root directory (this file is `.gitignore`d for security) and inject your Geomi API Key:
   ```env
   VITE_SHELBY_API_KEY=aptoslabs_xxxxxxxxxxxxxxxxxxxxxx
   ```
   *Note: Ensure "Enforce Origin" is turned OFF on your Geomi dashboard if you are testing locally without specifying `http://localhost:5173` in the allowed URLs.*

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to test the Web3 app!

## 📝 Disclaimer
This app interfaces deeply with the **Aptos Testnet** and **Shelby Testnet Nodes**. Due to the experimental beta nature of the Shelby RPC routing, Geomi API Key synchronization may periodically face downtime or throw `401 Unauthorized` errors. Should this happen, please regenerate your Geomi token or contact the Shelby dev team.
