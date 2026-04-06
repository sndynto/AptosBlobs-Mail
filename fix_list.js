const fs = require('fs');
let t = fs.readFileSync('src/LandingPage.tsx', 'utf8');

const regex = /{ label: 'AES-GCM 256-bit message encryption', icon: '[^']+' }/g;
t = t.replace(regex, "{ label: 'AES-GCM 256-bit message encryption', icon: '🔒' }");

const regex2 = /{ label: 'PBKDF2 key derivation from wallet address', icon: '[^']+' }/g;
t = t.replace(regex2, "{ label: 'PBKDF2 key derivation from wallet address', icon: '🔑' }");

const regex3 = /{ label: 'SHA-256 recipient address privacy hashing', icon: '[^']+' }/g;
t = t.replace(regex3, "{ label: 'SHA-256 recipient address privacy hashing', icon: '🛡️' }");

const regex4 = /{ label: '8+4 erasure coding across 7 storage nodes', icon: '[^']+' }/g;
t = t.replace(regex4, "{ label: '8+4 erasure coding across 7 storage nodes', icon: '⬡' }");

const regex5 = /{ label: 'Aptos merkle root on-chain verification', icon: '[^']+' }/g;
t = t.replace(regex5, "{ label: 'Aptos merkle root on-chain verification', icon: '✅' }");

fs.writeFileSync('src/LandingPage.tsx', t, 'utf8');
console.log('done fixing list items');
