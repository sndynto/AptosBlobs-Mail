export type Mail = {
  id: number
  unread: boolean
  from: string
  addr: string
  subject: string
  preview: string
  time: string
  tags: string[]
  body: string
  blobs: any[]
  color: number
}

export const COLORS = [
  ['#1a3a6b', '#60a5fa'], ['#1a4a3b', '#34d399'], ['#4a2a1a', '#fb923c'],
  ['#3a1a4a', '#c084fc'], ['#4a3a1a', '#fbbf24'], ['#1a3a4a', '#38bdf8']
]

export const MOCK_MAILS: Mail[] = [
  {
    id: 1, unread: true,
    from: 'Protocol Team', addr: '0x8f3a...2d1e',
    subject: '🎉 Welcome to AptosBlobs Mail',
    preview: 'Your decentralized inbox is ready. Messages stored on Shelby, settled on Aptos.',
    time: '10:24 AM',
    tags: ['shelby','aptos'],
    body: `<p>Welcome to <strong>AptosBlobs Mail</strong> — the first decentralized email client built on Aptos and powered by Shelby Protocol for blob storage.</p>
<p>Every message you send is encoded with <strong>erasure coding</strong>, distributed across Shelby storage providers, and the commitment hash is registered on-chain via Aptos smart contracts.</p>
<p>Key features:<br>
• <strong>Decentralized Storage</strong> — Messages stored as blobs on Shelby's distributed network<br>
• <strong>On-Chain Commitments</strong> — Cryptographic proofs settled on Aptos<br>
• <strong>Wallet Authentication</strong> — Sign in with any Aptos wallet (Petra, Martian, Pontem)<br>
• <strong>End-to-End Integrity</strong> — Verify any message with <code>useUploadBlobs</code> SDK</p>
<p>To get started, connect your Aptos wallet and compose your first on-chain message.</p>`,
    blobs: [{name:'welcome.json',size:'2.4 KB',hash:'0xb2e4...8f1a',enc:'8+4'}],
    color: 0
  },
  {
    id: 2, unread: true,
    from: 'Shelby Protocol', addr: '0x4c7b...9a2f',
    subject: 'Testnet Early Access Approved',
    preview: 'Your application to build on Shelby testnet has been approved. Here are your credentials.',
    time: '9:15 AM',
    tags: ['shelby'],
    body: `<p>Your early access application to <strong>Shelby Testnet</strong> has been approved!</p>
<p>Shelby is a high-performance decentralized blob storage system built for demanding read-heavy workloads — video streaming, AI inference, large-scale data analytics.</p>
<p>Your testnet credentials:<br>
RPC Endpoint: <code>https://rpc.testnet.shelby.xyz</code><br>
Network ID: <code>testnet-1</code><br>
Storage Quota: <code>100 MB</code></p>
<p>Use the Shelby TypeScript SDK to upload blobs:<br>
<code>npm install @shelby-protocol/sdk @shelby-protocol/react</code></p>
<p>Join us in <strong>Discord</strong> for support and updates. Happy building!</p>`,
    blobs: [{name:'credentials.json',size:'1.1 KB',hash:'0xd7f2...3c8e',enc:'8+4'}],
    color: 1
  },
  {
    id: 3, unread: true,
    from: 'Aptos Foundation', addr: '0xa1b2...c3d4',
    subject: 'Aptos Wallet Adapter — New SDK Update',
    preview: 'The Aptos Wallet Adapter dApp integration now supports unified signing. Update your dependencies.',
    time: 'Yesterday',
    tags: ['aptos','enc'],
    body: `<p>The <strong>Aptos Wallet Adapter</strong> has been updated with new features for dApp developers.</p>
<p>Key changes in the latest release:<br>
• Unified <code>signAndSubmitTransaction</code> API across all wallet providers<br>
• Support for <strong>Petra</strong>, <strong>Martian</strong>, <strong>Pontem</strong>, and <strong>Rise Wallet</strong><br>
• Improved TypeScript types for <code>AccountInfo</code> and <code>NetworkInfo</code><br>
• New <code>useWallet</code> hook with better state management</p>
<p>To integrate with Shelby Protocol for blob storage, use the wallet adapter signer pattern:</p>
<p><code>const { account, signAndSubmitTransaction } = useWallet();</code></p>
<p>This allows Shelby's <code>useUploadBlobs</code> hook to use your connected wallet to register blob commitments on-chain via Aptos smart contracts.</p>`,
    blobs: [],
    color: 2
  },
  {
    id: 4, unread: false,
    from: 'Jump Crypto', addr: '0x6e9f...7b3c',
    subject: 'High-Performance Storage Architecture',
    preview: 'How Shelby achieves consistent high throughput using dedicated fiber networks and erasure coding.',
    time: 'Mon',
    tags: ['shelby'],
    body: `<p>Shelby's storage architecture is designed for <strong>demanding read-heavy workloads</strong> with consistent performance guarantees.</p>
<p>The system uses <strong>dedicated private bandwidth</strong> — a fiber network separate from the public internet — to ensure predictable I/O performance across storage providers.</p>
<p>Data integrity is maintained through:<br>
• <strong>Erasure Coding (8+4)</strong> — 8 data shards + 4 parity shards, tolerating 4 provider failures<br>
• <strong>Novel Auditing System</strong> — continuous verification of stored blobs<br>
• <strong>Aptos Settlement</strong> — audit outcomes written to Aptos for transparency</p>
<p>Storage providers earn rewards through a <strong>paid reads model</strong> — ensuring providers are incentivized to deliver quality service rather than just availability.</p>`,
    blobs: [{name:'architecture.pdf',size:'847 KB',hash:'0x1a3e...9d2b',enc:'8+4'},{name:'whitepaper.pdf',size:'2.1 MB',hash:'0xf8c1...4e7a',enc:'8+4'}],
    color: 3
  },
  {
    id: 5, unread: false,
    from: 'DAO Governance', addr: '0x3d8a...1f5e',
    subject: '[Vote] Proposal #47 — Storage Fee Adjustment',
    preview: 'New governance proposal to adjust storage provider fee distribution. Voting ends Friday.',
    time: 'Sun',
    tags: ['aptos'],
    body: `<p><strong>Proposal #47</strong> has been submitted to the DAO for vote.</p>
<p>This proposal adjusts the fee distribution model for storage providers on Shelby Protocol, increasing read rewards by 15% to incentivize higher-quality service delivery.</p>
<p>Current distribution:<br>
• Storage Providers: 70%<br>
• Protocol Treasury: 20%<br>
• Audit Reserve: 10%</p>
<p>Proposed distribution:<br>
• Storage Providers: 80%<br>
• Protocol Treasury: 12%<br>
• Audit Reserve: 8%</p>
<p>Vote on Aptos using your connected wallet. Transaction will be submitted via smart contract call.</p>`,
    blobs: [],
    color: 4
  }
];
