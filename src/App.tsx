import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react'
import gsap from 'gsap'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs, useAccountBlobs, useDeleteObjects } from '@shelby-protocol/react'
import { useQuery } from '@tanstack/react-query'
import { ShelbyClient } from '@shelby-protocol/sdk/browser'
import { AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk'
import { COLORS, Mail } from './data'

const AptosLogo = ({ size = 20, color = 'currentColor' }: { size?: number | string, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M11 25.5H49V22.5H11V25.5ZM11 31.5H49V28.5H11V31.5ZM11 37.5H49V34.5H11V37.5Z" fill={color}/>
  </svg>
)

const PetraLogo = ({ size = 20 }: { size?: number | string }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M49 14L30 3L11 14V36L30 47L49 36V14Z" fill="var(--brand-purple)" />
    <path d="M30 47L11 36L30 3L49 36L30 47Z" fill="var(--brand-color)" />
    <path d="M30 47V3L49 36L30 47Z" fill="var(--brand-color-light)" />
    <path d="M30 25L23 30L30 35L37 30L30 25Z" fill="white" />
  </svg>
)

type AppIconName =
  | 'compose' | 'refresh' | 'filter' | 'sort' | 'mail' | 'search' | 'emptyMail' | 'alert' | 'menu'
  | 'inbox' | 'sent' | 'drafts' | 'outbox' | 'failed' | 'starred' | 'contacts' | 'blocked'
  | 'blob' | 'transactions' | 'lock' | 'defi' | 'dao' | 'nft'
  | 'reply' | 'forward' | 'delete' | 'explorer' | 'download' | 'eye' | 'clock' | 'attachment' | 'check' | 'unread' | 'public' | 'close'
  | 'help' | 'settings' | 'logout'

const AppIcon = ({ name, size = 16 }: { name: AppIconName, size?: number }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  }
  const stroke = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'compose':
      return <svg {...common}><path {...stroke} d="M12 5v14M5 12h14" /></svg>
    case 'mail':
      return <svg {...common}><rect {...stroke} x="3" y="5" width="18" height="14" rx="3" /><path {...stroke} d="m4 7 8 6 8-6" /></svg>
    case 'search':
      return <svg {...common}><circle {...stroke} cx="11" cy="11" r="7" /><path {...stroke} d="m20 20-3.5-3.5" /></svg>
    case 'emptyMail':
      return <svg {...common}><path {...stroke} d="M5 9h14v9H5V9Z" /><path {...stroke} d="m5 10 7 5 7-5" /><path {...stroke} d="M8 9V6h8v3" /><path {...stroke} d="M16 6h3v4" /></svg>
    case 'alert':
      return <svg {...common}><path {...stroke} d="M12 8v5" /><path {...stroke} d="M12 17h.01" /><path {...stroke} d="M10.3 3.9 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
    case 'menu':
      return <svg {...common}><path {...stroke} d="M4 7h16M4 12h16M4 17h16" /></svg>
    case 'refresh':
      return <svg {...common}><path {...stroke} d="M20 6v5h-5" /><path {...stroke} d="M4 18v-5h5" /><path {...stroke} d="M18 9a7 7 0 0 0-11.7-2.7L4 8.5" /><path {...stroke} d="M6 15a7 7 0 0 0 11.7 2.7L20 15.5" /></svg>
    case 'filter':
      return <svg {...common}><path {...stroke} d="M5 4h14l-5.5 6.5v5L10.5 18v-7.5L5 4Z" /></svg>
    case 'sort':
      return <svg {...common}><path {...stroke} d="M8 5v14" /><path {...stroke} d="m5 8 3-3 3 3" /><path {...stroke} d="M16 19V5" /><path {...stroke} d="m13 16 3 3 3-3" /></svg>
    case 'reply':
      return <svg {...common}><path {...stroke} d="m10 7-5 5 5 5" /><path {...stroke} d="M5 12h10a5 5 0 0 1 5 5v1" /></svg>
    case 'forward':
      return <svg {...common}><path {...stroke} d="m14 7 5 5-5 5" /><path {...stroke} d="M19 12H9a5 5 0 0 0-5 5v1" /></svg>
    case 'delete':
      return <svg {...common}><path {...stroke} d="M4 7h16" /><path {...stroke} d="M10 11v6" /><path {...stroke} d="M14 11v6" /><path {...stroke} d="M6 7l1 14h10l1-14" /><path {...stroke} d="M9 7V4h6v3" /></svg>
    case 'explorer':
      return <svg {...common}><path {...stroke} d="M7 8h10M7 12h6M7 16h10" /><path {...stroke} d="M19 3v6h-6" /><path {...stroke} d="m12 10 7-7" /></svg>
    case 'download':
      return <svg {...common}><path {...stroke} d="M12 4v10" /><path {...stroke} d="m8 10 4 4 4-4" /><path {...stroke} d="M5 20h14" /></svg>
    case 'eye':
      return <svg {...common}><path {...stroke} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle {...stroke} cx="12" cy="12" r="3" /></svg>
    case 'clock':
      return <svg {...common}><circle {...stroke} cx="12" cy="12" r="8" /><path {...stroke} d="M12 8v5l3 2" /></svg>
    case 'attachment':
      return <svg {...common}><path {...stroke} d="m21 11-8.5 8.5a5 5 0 0 1-7.1-7.1L14 3.8a3.5 3.5 0 0 1 5 5L10.4 17.4a2 2 0 0 1-2.8-2.8L16 6.2" /></svg>
    case 'check':
      return <svg {...common}><path {...stroke} d="m5 12 4 4L19 6" /></svg>
    case 'unread':
      return <svg {...common}><circle {...stroke} cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></svg>
    case 'public':
      return <svg {...common}><circle {...stroke} cx="12" cy="12" r="8" /><path {...stroke} d="M4 12h16" /><path {...stroke} d="M12 4a12 12 0 0 1 0 16" /><path {...stroke} d="M12 4a12 12 0 0 0 0 16" /></svg>
    case 'close':
      return <svg {...common}><path {...stroke} d="m6 6 12 12M18 6 6 18" /></svg>
    case 'help':
      return <svg {...common}><circle {...stroke} cx="12" cy="12" r="9" /><path {...stroke} d="M9.5 9a3 3 0 0 1 5.2 2c0 2-2.7 2.2-2.7 4" /><path {...stroke} d="M12 18h.01" /></svg>
    case 'settings':
      return <svg {...common}><circle {...stroke} cx="12" cy="12" r="3" /><path {...stroke} d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
    case 'logout':
      return <svg {...common}><path {...stroke} d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /><path {...stroke} d="M15 8l4 4-4 4" /><path {...stroke} d="M19 12H9" /></svg>
    case 'inbox':
      return <svg {...common}><path {...stroke} d="M4 13h4l2 3h4l2-3h4" /><path {...stroke} d="M5 13 7 5h10l2 8v5H5v-5Z" /><path {...stroke} d="M12 5v7" /><path {...stroke} d="m9 9 3 3 3-3" /></svg>
    case 'sent':
      return <svg {...common}><path {...stroke} d="M21 3 10 14" /><path {...stroke} d="m21 3-7 18-4-7-7-4 18-7Z" /></svg>
    case 'drafts':
      return <svg {...common}><path {...stroke} d="M7 3h7l3 3v15H7V3Z" /><path {...stroke} d="M14 3v4h4" /><path {...stroke} d="M9 12h6M9 16h5" /></svg>
    case 'outbox':
      return <svg {...common}><path {...stroke} d="M7 17 17 7" /><path {...stroke} d="M9 7h8v8" /><path {...stroke} d="M5 21h14" /></svg>
    case 'failed':
      return <svg {...common}><path {...stroke} d="M12 8v5" /><path {...stroke} d="M12 17h.01" /><path {...stroke} d="M10.3 3.9 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
    case 'starred':
      return <svg {...common} fill="currentColor"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z" /></svg>
    case 'contacts':
      return <svg {...common}><path {...stroke} d="M16 21v-2a4 4 0 0 0-8 0v2" /><path {...stroke} d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path {...stroke} d="M20 8v6" /><path {...stroke} d="M23 11h-6" /></svg>
    case 'blocked':
      return <svg {...common}><circle {...stroke} cx="12" cy="12" r="8" /><path {...stroke} d="m7 17 10-10" /></svg>
    case 'blob':
      return <svg {...common}><path {...stroke} d="m12 3 7 4v10l-7 4-7-4V7l7-4Z" /><path {...stroke} d="m8 9 4-2 4 2v6l-4 2-4-2V9Z" /></svg>
    case 'transactions':
      return <svg {...common}><path {...stroke} d="M8 7h8M8 17h8" /><path {...stroke} d="M7 12h10" /><path {...stroke} d="M5 5v4h4M19 19v-4h-4" /></svg>
    case 'lock':
      return <svg {...common}><rect {...stroke} x="5" y="11" width="14" height="9" rx="2" /><path {...stroke} d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
    case 'defi':
      return <svg {...common} fill="currentColor"><circle cx="12" cy="12" r="5" /></svg>
    case 'dao':
      return <svg {...common} fill="currentColor"><path d="M12 3 21 8v2H3V8l9-5ZM5 12h3v7H5v-7Zm5.5 0h3v7h-3v-7ZM16 12h3v7h-3v-7Z" /></svg>
    case 'nft':
      return <svg {...common}><path {...stroke} d="M7 4h10l4 7-9 9-9-9 4-7Z" /><path {...stroke} d="M7 4l5 16 5-16" /><path {...stroke} d="M3 11h18" /></svg>
    default:
      return null
  }
}

const LandingPage = lazy(() => import('./LandingPage'))

const API_KEY_SHELBYNET = import.meta.env.VITE_SHELBY_API_KEY_SHELBYNET || ''
const API_KEY_TESTNET = import.meta.env.VITE_SHELBY_API_KEY_TESTNET || ''

export default function App() {
  const [currentNetwork, setCurrentNetwork] = useState<any>('shelbynet') // shelbynet, testnet
  const [showLanding, setShowLanding] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  
  const key = currentNetwork === 'shelbynet' ? API_KEY_SHELBYNET : API_KEY_TESTNET
  const noKey = !key || key.startsWith('insert_api_key')
  const envSecret = import.meta.env.VITE_SHELBY_APP_SECRET
  const noSecret = !envSecret || envSecret === 'REPLACE_WITH_YOUR_OWN_RANDOM_SECRET_MINIMUM_32_CHARS' || envSecret === 'insert_secret_here'
  const envVar = currentNetwork === 'shelbynet' ? 'VITE_SHELBY_API_KEY_SHELBYNET' : 'VITE_SHELBY_API_KEY_TESTNET'

  const handleEnterApp = () => {
    setFadeOut(true)
    setTimeout(() => setShowLanding(false), 420)
  }

  if (showLanding) {
    return (
      <div className="app-scale-frame" style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.42s ease', minHeight: '100dvh' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--brand-color-dark)', color: 'var(--brand-color)', fontSize: 20, fontFamily: 'Inter,sans-serif', gap: 12 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'flex' }}>
              <AptosLogo size={24} color="var(--brand-color)" />
            </span> Loading...
          </div>
        }>
          <LandingPage onEnterApp={handleEnterApp} />
        </Suspense>
      </div>
    )
  }

  const handleReturnHome = () => {
    setFadeOut(false)
    setShowLanding(true)
  }

  return (
    <>
      {(noKey || noSecret) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#fff0fa', borderBottom: '1px solid rgba(240,64,176,0.22)',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: '"Inter", sans-serif', fontSize: 12, color: 'var(--brand-color-dark)',
          flexWrap: 'wrap', maxWidth: '100vw', overflow: 'hidden',
        }}>
          <span>⚠️</span>
          <span>
            {noKey && (
              <>
                <b>{envVar}</b> not found for {currentNetwork}.
              </>
            )}
            {noKey && noSecret && <span style={{margin: '0 8px'}}>|</span>}
            {noSecret && (
              <>
                <b>VITE_SHELBY_APP_SECRET</b> not yet configured.
              </>
            )}
            <span style={{marginLeft: 8}}>Check your <code style={{background:'#ffffff',padding:'1px 6px',borderRadius:4,border:'1px solid rgba(240,64,176,0.22)'}}>.env</code> file.</span>
            <a href="https://geomi.dev" target="_blank" rel="noreferrer" style={{color:'var(--brand-purple)', fontWeight:600, marginLeft: 8}}>Get Key →</a>
          </span>
        </div>
      )}
      <MailApp key={currentNetwork} currentNetwork={currentNetwork} setCurrentNetwork={setCurrentNetwork} apiKey={key} onReturnHome={handleReturnHome} />
    </>
  )
}

// -------------------------------------------------------------------------
//  Utilities & Formatting
// -------------------------------------------------------------------------
const formatAddr = (addr: string) => {
  if (!addr || addr === '0x') return 'Anonymous'
  const clean = addr.replace(/^to_/, '').split('_')[0]
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`
}

const MAIL_ID_DOMAIN = 'aptosblobs.mail'

const cleanMailHandle = (value?: string | null) => {
  const raw = String(value || '').trim()
  if (!raw || raw.startsWith('0x')) return ''
  return raw.replace(/^@/, '').split('@')[0].trim()
}

const formatMailIdentity = (value?: string | null, fallbackAddress?: string) => {
  const handle = cleanMailHandle(value)
  return handle ? `${handle}@${MAIL_ID_DOMAIN}` : formatAddr(fallbackAddress || String(value || ''))
}

const parseMailIdentityInput = (input: string) => {
  const trimmed = String(input || '').trim()
  if (trimmed.startsWith('0x')) return trimmed
  return cleanMailHandle(trimmed)
}

const readJsonResponse = async (res: Response, label: string) => {
  const text = await res.text()
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok) {
    const body = text.trim().slice(0, 180)
    throw new Error(`${label} failed (${res.status})${body ? `: ${body}` : ''}`)
  }
  if (contentType && !contentType.toLowerCase().includes('json')) {
    throw new Error(`${label} returned ${contentType || 'a non-JSON response'}`)
  }
  try {
    return text ? JSON.parse(text) : null
  } catch {
    const looksHtml = text.trim().startsWith('<')
    throw new Error(looksHtml
      ? `${label} returned an HTML page instead of JSON`
      : `${label} returned invalid JSON`)
  }
}

const getFriendlySendError = (value: unknown) => {
  const message = value instanceof Error ? value.message : String(value || '')
  const lower = message.toLowerCase()
  if (
    message.includes("Unexpected token '<'") ||
    lower.includes('<html') ||
    lower.includes('html page instead of json') ||
    lower.includes('non-json response')
  ) {
    return 'Shelby/API returned HTML instead of JSON. Check the Shelby API key for this network, make sure the app is on the same network as the wallet, then refresh and try again.'
  }
  return message || 'Unknown error'
}

const formatEntryFunction = (fn?: string) => {
  const parts = String(fn || '').split('::').filter(Boolean)
  if (parts.length >= 2) return parts.slice(-2).join('::')
  return fn || 'Unknown function'
}

const getTxnTimeMs = (tx: any) => {
  const timestampValue = Number(tx?.timestamp || tx?.timestamp_us || 0)
  return timestampValue > 10_000_000_000_000
    ? Math.floor(timestampValue / 1000)
    : timestampValue || Date.now()
}

const getTxArgs = (tx: any) =>
  tx?.payload?.arguments || tx?.payload?.functionArguments || tx?.payload?.args || []

const summarizeTxArg = (value: any) => {
  if (value === undefined || value === null) return '-'
  if (typeof value === 'string') {
    if (value.startsWith('@')) return value.split('/').pop() || value
    if (value.startsWith('0x') && value.length > 18) return formatAddr(value)
    return value.length > 44 ? `${value.slice(0, 22)}...${value.slice(-10)}` : value
  }
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  if (typeof value === 'object') return 'structured data'
  return String(value)
}

const describeTransactionActivity = (tx: any) => {
  const functionLabel = formatEntryFunction(tx?.payload?.function)
  const rawFunction = String(tx?.payload?.function || '')
  const args = getTxArgs(tx)
  const firstArg = summarizeTxArg(args[0])

  if (functionLabel === 'access_control::purchase') {
    return {
      title: 'Paid unlock',
      description: `Unlocked paid mail access${firstArg !== '-' ? ` for ${firstArg}` : ''}`,
      tone: 'paid',
      tag: 'paid',
    }
  }
  if (functionLabel === 'access_control::register_blobs_v2') {
    return {
      title: 'Registered paywall',
      description: 'Enabled ShelbyUSD pay-to-read for a mail blob',
      tone: 'paywall',
      tag: 'paywall',
    }
  }
  if (functionLabel === 'blob_metadata::register_multiple_blobs' || functionLabel === 'blob_metadata::register_blob' || rawFunction.includes('::shelby::')) {
    return {
      title: 'Stored Shelby blob',
      description: 'Uploaded mail content or attachment to Shelby',
      tone: 'blob',
      tag: 'blob',
    }
  }
  if (functionLabel === 'read_receipt::mark_read') {
    return {
      title: 'Sent read receipt',
      description: `Confirmed this mail was read${firstArg !== '-' ? ` from ${firstArg}` : ''}`,
      tone: 'receipt',
      tag: 'receipt',
    }
  }
  if (functionLabel === 'registry::register_report') {
    return {
      title: 'Reported mail',
      description: 'Submitted an on-chain abuse or spam report',
      tone: 'report',
      tag: 'report',
    }
  }
  if (functionLabel === 'mail_registry_v2::register_handle') {
    return {
      title: 'Updated username',
      description: `Registered wallet handle${firstArg !== '-' ? `: ${firstArg}` : ''}`,
      tone: 'identity',
      tag: 'identity',
    }
  }
  if (functionLabel.includes('fungible_asset::') || functionLabel.includes('coin::')) {
    return {
      title: 'Token movement',
      description: 'Fungible asset balance changed',
      tone: 'token',
      tag: 'token',
    }
  }
  return {
    title: 'On-chain transaction',
    description: functionLabel,
    tone: 'default',
    tag: 'aptos',
  }
}

const getAvatarInitial = (mail: any) => {
  const source = String(mail?.from || '').startsWith('To:')
    ? String(mail?.addr || mail?.from || '')
    : String(mail?.from || mail?.addr || '')
  const clean = source
    .replace(/^to:\s*/i, '')
    .replace(/^0x/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
  return (clean[0] || '?').toUpperCase()
}

// Helper to normalize address to 64-hex canonical form (0x + 64 chars)
const normalizeAddr = (addr?: string): string => {
  try {
    if (!addr || addr === '0x') return addr || '';
    let clean = addr.trim().toLowerCase();
    // Strip common prefixes like 'to_0x...' or internal routing labels
    clean = clean.replace(/^to_/, '').split('_')[0];
    if (!clean.startsWith('0x')) clean = '0x' + clean;
    // Ensure 64-character canonical form for Shelby Indexer
    return AccountAddress.from(clean).toString();
  } catch (e) {
    // If it fails, strip known prefix anyway but return as is
    return (addr || '').replace(/^to_/, '').split('_')[0].toLowerCase().trim();
  }
}

const normalizeNetworkName = (value?: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')

// -------------------------------------------------------------------------
//  SECURE PRIVACY LAYER (Client-Side Encryption)
// -------------------------------------------------------------------------

/**
 * Derived a fixed key from the app secret and a user-specific salt.
 */
const deriveKey = async (salt: string) => {
  const enc = new TextEncoder();
  const envSecret = import.meta.env.VITE_SHELBY_APP_SECRET
  
  if (!envSecret || 
      envSecret === 'SHELBY_APP_MASTER_SECRET_2026_XRAY' || 
      envSecret === 'insert_secret_here' || 
      envSecret === 'REPLACE_WITH_YOUR_OWN_RANDOM_SECRET_MINIMUM_32_CHARS') {
    throw new Error("CRITICAL SECURITY: VITE_SHELBY_APP_SECRET not found or using default values. Please set a unique secret of at least 32 characters in your .env file.");
  }

  const secret = envSecret;

  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "PBKDF2" }, false, ["deriveKey", "deriveBits"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 1000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
  );
}

/**
 * Generates a short hash of an address to use as a prefix for blobs.
 * Preserves privacy by hiding the recipient's raw address on public explorers.
 */
const getPrivacyHash = async (addr: string) => {
  const normalized = normalizeAddr(addr);
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
}

/**
 * Encrypts sensitive content to make it unreadable at rest on Shelby nodes using AES-GCM.
 */
const encryptBody = async (text: string, address: string) => {
  const prefix = "🔐SHELBY_V2_ENCRYPTED:";
  const enc = new TextEncoder();
  const key = await deriveKey(normalizeAddr(address));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as any }, key, enc.encode(text) as any);
  
  // Combine IV + Ciphertext for storage
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), 12);
  
  return prefix + btoa(String.fromCharCode.apply(null, combined as any));
}

/**
 * Decrypts content if it contains our privacy prefix.
 */
const decryptBody = async (text: string, address: string) => {
  const prefix = "🔐SHELBY_V2_ENCRYPTED:";
  const oldPrefix = "🔐SHELBY_ENCRYPTED:";
  
  if (!text) return text;
  const cleanText = text.trim();

  // Handle Legacy Base64 for backward compatibility with old messages
  if (cleanText.startsWith(oldPrefix)) {
    try {
      return decodeURIComponent(escape(atob(cleanText.replace(oldPrefix, ""))));
    } catch(e) { return text; }
  }

  // Handle V2 AES-GCM
  if (cleanText.startsWith(prefix)) {
    try {
      const data = cleanText.replace(prefix, "");
      const combined = new Uint8Array(atob(data).split("").map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);
      const key = await deriveKey(normalizeAddr(address));
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as any }, key, ciphertext as any);
      return new TextDecoder().decode(decrypted);
    } catch(e) { 
      return `[Decryption Failed: Check your permissions/secret]`; 
    }
  }
  return text;
}

const encryptBinary = async (data: Uint8Array, address: string) => {
  const enc = new TextEncoder();
  const key = await deriveKey(normalizeAddr(address));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as any }, key, data as any);
  return { encrypted: new Uint8Array(encrypted), iv: btoa(String.fromCharCode.apply(null, iv as any)) };
}

const decryptBinary = async (data: Uint8Array, address: string, ivBase64: string) => {
  try {
    const key = await deriveKey(normalizeAddr(address));
    const iv = new Uint8Array(atob(ivBase64).split("").map(c => c.charCodeAt(0)));
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as any }, key, data as any);
    return new Uint8Array(decrypted);
  } catch(e) {
    throw new Error("Failed to decrypt attachment. Check your permissions/secret.");
  }
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] || char))

const safeJsArg = (value: unknown) =>
  JSON.stringify(String(value ?? ''))
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

const ONE_DAY_MICROS = 24 * 60 * 60 * 1000 * 1000
const MB = 1024 * 1024

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

const parseAptToOctas = (value: string) => {
  const clean = String(value || '').trim()
  if (!/^\d+(\.\d{0,8})?$/.test(clean)) throw new Error('Invalid APT price')
  const [whole, fraction = ''] = clean.split('.')
  const octas = BigInt(whole || '0') * 100_000_000n + BigInt((fraction + '00000000').slice(0, 8))
  if (octas <= 0n) throw new Error('Price must be greater than 0 APT')
  return octas.toString()
}

const parseShelbyUsdToBaseUnits = (value: string) => {
  const clean = String(value || '').trim()
  if (!/^\d+(\.\d{0,8})?$/.test(clean)) throw new Error('Invalid ShelbyUSD price')
  const [whole, fraction = ''] = clean.split('.')
  const units = BigInt(whole || '0') * 100_000_000n + BigInt((fraction + '00000000').slice(0, 8))
  if (units <= 0n) throw new Error('Price must be greater than 0 ShelbyUSD')
  return units
}

const makePurchaseKey = (network: string, owner: string, blobName: string) =>
  `${network}:${normalizeAddr(owner)}:${blobName}`

const makeShelbyFullBlobName = (owner: string, blobName: string) => {
  const accountHex = normalizeAddr(owner).replace(/^0x/, '')
  const suffix = String(blobName || '').replace(/^@[^/]+\//, '')
  return `@${accountHex}/${suffix}`
}

const parseAptosOptionBool = (value: any): boolean | null => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  if (Array.isArray(value)) return value.length ? parseAptosOptionBool(value[0]) : null
  if (value?.vec) return value.vec.length ? parseAptosOptionBool(value.vec[0]) : null
  return null
}

const makeReadReceiptKey = (network: string, reader: string, blobName: string) =>
  `${network}:${normalizeAddr(reader)}:${blobName}`

const makeReportKey = (network: string, reporter: string, blobName: string) =>
  `${network}:${normalizeAddr(reporter)}:${blobName}`

const SHELBY_USD_METADATA = '0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1'

const formatMailDateTime = (timestamp?: number | string) => {
  const date = new Date(Number(timestamp) || Date.now())
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const hours24 = date.getHours()
  const hours = hours24 % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours24 >= 12 ? 'PM' : 'AM'
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes} ${ampm}`
}

const toLocalDatetimeInputValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const getDefaultTimeLockValue = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
  date.setSeconds(0, 0)
  return toLocalDatetimeInputValue(date)
}

const parseTimeLockMs = (value?: string | null) => {
  const ms = new Date(String(value || '')).getTime()
  return Number.isFinite(ms) ? ms : 0
}

const isShelbyBlobPending = (blob: any) => {
  const st = String(blob?.status || '').toLowerCase()
  const root = blob?.blobMerkleRoot
  const rootPending = !root || (Array.isArray(root) || root instanceof Uint8Array ? Array.from(root).every((byte: any) => Number(byte) === 0) : false)
  return blob?.isWritten === false || rootPending || st === 'pending' || st === 'processing' || st === 'unconfirmed'
}

const isShelbyBlobDeleted = (blob: any) => {
  const st = String(blob?.status || '').toLowerCase()
  return blob?.isDeleted === true || st === 'deleted'
}

const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s. Please check RPC/API key/network status.`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const encodeUleb128 = (value: number) => {
  const bytes: number[] = []
  let remaining = value >>> 0
  do {
    let byte = remaining & 0x7f
    remaining >>>= 7
    if (remaining !== 0) byte |= 0x80
    bytes.push(byte)
  } while (remaining !== 0)
  return bytes
}

const encodeStringBytes = (value: string) => {
  const bytes = Array.from(new TextEncoder().encode(value))
  return [...encodeUleb128(bytes.length), ...bytes]
}

const encodeVectorBytes = (value: Uint8Array | number[]) => {
  const bytes = Array.from(value)
  return [...encodeUleb128(bytes.length), ...bytes]
}

const encodeU64Le = (value: bigint) => {
  const bytes: number[] = []
  let n = value
  for (let i = 0; i < 8; i++) {
    bytes.push(Number(n & 0xffn))
    n >>= 8n
  }
  return bytes
}

const buildAccessControlRegistrationV2 = (items: Array<{ blobNameSuffix: string, policyBytes: number[] }>) => {
  const bytes: number[] = [...encodeUleb128(items.length)]
  for (const item of items) {
    bytes.push(...encodeStringBytes(item.blobNameSuffix))
    bytes.push(0) // green_box_scheme: app-level encryption, no ACE green box
    bytes.push(...encodeVectorBytes([]))
    bytes.push(...item.policyBytes)
  }
  return bytes
}

const buildPayToDownloadPolicyBytes = (priceBaseUnits: bigint) => [
  ...encodeUleb128(2), // AccessPolicy::PayToDownload
  ...encodeU64Le(priceBaseUnits),
]

const buildTimeLockPolicyBytes = (lockedUntilMicros: bigint) => [
  ...encodeUleb128(1), // AccessPolicy::TimeLock
  ...encodeU64Le(lockedUntilMicros),
]

const getTags = (subject: string, isPending: boolean, hasAttachments: boolean) => {
  let tags = ['shelby', 'blobs']
  const lower = subject.toLowerCase()
  if (lower.includes('swap') || lower.includes('yield') || lower.includes('defi')) tags.push('defi')
  if (lower.includes('vote') || lower.includes('proposal') || lower.includes('dao')) tags.push('dao')
  if (lower.includes('mint') || lower.includes('collection') || lower.includes('nft')) tags.push('nft')
  if (isPending) tags.push('pending')
  return tags
}

const TAG_ICONS: Record<string, any> = {
  shelby: <AptosLogo size={14} />, 
  aptos: <AptosLogo size={14} />, 
  blobs: <AptosLogo size={14} />, 
  blob: <AptosLogo size={14} />,
  nft: <AppIcon name="nft" size={12} />,
  defi: <AppIcon name="defi" size={12} />,
  dao: <AppIcon name="dao" size={12} />,
  attachment: <AppIcon name="attachment" size={12} />,
  pending: <AppIcon name="clock" size={12} />,
  starred: <AppIcon name="starred" size={12} />,
  paid: <AppIcon name="lock" size={12} />,
  paywall: <AppIcon name="lock" size={12} />,
  receipt: <AppIcon name="check" size={12} />,
  report: <AppIcon name="alert" size={12} />,
  identity: <AppIcon name="contacts" size={12} />,
  token: <AppIcon name="transactions" size={12} />
}

const TAG_LABELS: Record<string, string> = {
  shelby: 'Shelby', aptos: 'Aptos', blobs: 'Blob',
  nft: 'NFT', defi: 'DeFi', dao: 'DAO', attachment: 'Attachment',
  pending: 'Pending', starred: 'Starred',
  paid: 'Paid', paywall: 'Paywall', receipt: 'Receipt',
  report: 'Report', identity: 'Identity', token: 'Token'
}

const Tag = ({ type }: { type: string }) => (
  <span className={`tag tag-${type}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    {TAG_ICONS[type] || ''} {TAG_LABELS[type] || type}
  </span>
)

function MailApp({ currentNetwork, setCurrentNetwork, apiKey, onReturnHome }: any) {
  const apiKeyMissing = !apiKey || String(apiKey).startsWith('insert_api_key')

  const { aptosConfig, shelbyClient } = useMemo(() => {
    const isShelbynet = currentNetwork === 'shelbynet'
    // Shelbynet: isolated Aptos validator network (Network.SHELBYNET), separate from testnet/mainnet
    // Testnet: standard Aptos testnet (Network.TESTNET)
    // FIX: Sebelumnya keduanya pakai Network.TESTNET — sekarang shelbynet pakai Network.SHELBYNET
    const mappedNet = isShelbynet ? Network.SHELBYNET : Network.TESTNET;
    const shelbyNet = isShelbynet ? 'shelbynet' : 'testnet';
    
    // Official endpoints from docs.shelby.xyz/protocol/architecture/networks
    const fullnodeUrl = isShelbynet
      ? 'https://api.shelbynet.shelby.xyz/v1'
      : 'https://api.testnet.aptoslabs.com/v1'
    
    // FIX: Shelbynet GraphQL indexer menggunakan endpoint khusus Shelby, bukan Hasura standar Aptos
    const indexerUrl = isShelbynet
      ? 'https://api.shelbynet.aptoslabs.com/v1/graphql'
      : 'https://api.testnet.aptoslabs.com/v1/graphql'
    
    const rpcUrl = isShelbynet
      ? 'https://shelby.shelbynet.shelby.xyz/shelby'
      : 'https://api.testnet.shelby.xyz/shelby'
    
    const aptos = new AptosConfig({
      network: mappedNet,
      fullnode: fullnodeUrl,
      clientConfig: apiKey ? { API_KEY: apiKey } : undefined,
    })

    const defaultLocationHint = isShelbynet ? 'shelbynet-1' : 'us-east-1';

    const client = new ShelbyClient({
      network: shelbyNet as any,
      apiKey,
      aptos: aptos,
      indexer: { apiKey: apiKey, baseUrl: indexerUrl },
      rpc: { apiKey: apiKey, baseUrl: rpcUrl },
      locationHint: defaultLocationHint,
    })
    
    return { aptosConfig: aptos, shelbyClient: client }
  }, [currentNetwork, apiKey])

  // Identifying the Shelby Protocol contract address to filter transactions
  // This is the core protocol address for AptosBlobs-Mail
  const SHELBY_MODULE = currentNetwork === 'shelbynet'
    ? "0x85fdb9a176ab8ef1d9d9c1b60d60b3924f0800ac1de1cc2085fb0b8bb4988e6a::shelby"
    : "0x1cb6d22b64dd8b98f24419cb7aa7d620583b482a201b1aae357a62725ad50ea1::shelby";
  const SHELBY_PROTOCOL_ADDR = SHELBY_MODULE.split('::')[0];

  // Mail registry smart contract address (per-network)
  const MAIL_REGISTRY_ADDR = currentNetwork === 'shelbynet'
    ? "0xf0a3b890c4ff6c78e9b89ec3630cb40efe276890fb8e34a9362e3f2be35f374e"
    : "0xf0a3b890c4ff6c78e9b89ec3630cb40efe276890fb8e34a9362e3f2be35f374e";
  const ACCESS_CONTROL_MODULE = currentNetwork === 'shelbynet'
    ? "0xf0a3b890c4ff6c78e9b89ec3630cb40efe276890fb8e34a9362e3f2be35f374e::access_control"
    : "0x5211945b33c28c975544f65d361c3739a0244eb6779920128d72e7f70c088069::access_control";

  const { connected, account, connect, disconnect, signAndSubmitTransaction, wallets, changeNetwork, network: walletNetwork } = useWallet()
  
  // Auto-return to Landing Page on disconnect
  useEffect(() => {
    if (!connected) {
      onReturnHome()
    }
  }, [connected, onReturnHome])
  const { mutateAsync: uploadBlobs } = useUploadBlobs({ client: shelbyClient })
  const { mutateAsync: deleteBlobs, isPending: isDeleting } = useDeleteObjects({ client: shelbyClient })
  const { data: onchainBlobs, isLoading: isBlobsLoading, isError: isBlobsError, error: blobsError, refetch: refetchBlobs } = useAccountBlobs({ 
    client: shelbyClient, 
    account: normalizeAddr(account?.address?.toString() || '0x0000000000000000000000000000000000000000000000000000000000000001'), 
    pagination: { limit: 100 }
  })
  
  // Custom fetch for incoming blobs destined to our address
  const myAddress = account?.address?.toString()?.toLowerCase();
  const { data: incomingBlobs, isLoading: isIncomingLoading, isError: isIncomingError, error: incomingError, refetch: refetchIncoming } = useQuery({
    queryKey: ['incomingBlobs', currentNetwork, myAddress],
    queryFn: async () => {
      if (!myAddress) return [];
      
      // Normalisasi address penerima ke berbagai format yang mungkin dipakai pengirim
      const normalizedMyAddr = normalizeAddr(myAddress);
      const shortAddr = myAddress.startsWith('0x') ? '0x' + myAddress.substring(2).replace(/^0+/, '') : myAddress;

      try {
        // PRIVACY: Cari juga prefix address yang sudah di-hash (untuk mode private)
        const hashedAddr = await getPrivacyHash(normalizedMyAddr);

        // FIX: Gunakan filter `object_name` yang benar di Hasura Blobs_Bool_Exp.
        // Field di GraphQL schema adalah `object_name` (format "@owner/suffix"),
        // bukan `blob_name_suffix` yang tidak ada di schema.
        // Kita filter dengan _like untuk mencari blob yang namanya mengandung prefix address penerima.
        const fetchByPrefix = async (prefix: string) => {
          try {
            const res = await shelbyClient.coordination.getBlobs({
              where: {
                object_name: { _like: `%${prefix}%` }
              } as any,
              pagination: { limit: 500 },
            });
            console.log(`[AptosMail Debug] Found ${res?.length || 0} blobs for prefix ${prefix}`, res);
            return res;
          } catch (err) {
            console.error(`[AptosMail Debug] Error querying prefix ${prefix}:`, err);
            return [];
          }
        };

        // Ambil hasil untuk ketiga format address secara paralel
        const [rawResults, shortResults, hashedResults] = await Promise.all([
          fetchByPrefix(`to_${normalizedMyAddr}`),
          normalizedMyAddr !== shortAddr ? fetchByPrefix(`to_${shortAddr}`) : Promise.resolve([]),
          fetchByPrefix(`to_${hashedAddr}`),
        ]);

        // Gabungkan dan hapus duplikat berdasarkan blob name
        const seen = new Set<string>();
        const combined: any[] = [];
        for (const blob of [...(rawResults as any[]), ...(shortResults as any[]), ...(hashedResults as any[])]) {
          const name = String(blob?.blobNameSuffix || blob?.blob_name || blob?.name || '');
          if (name && !seen.has(name)) {
            seen.add(name);
            combined.push(blob);
          }
        }

        console.log(`[AptosMail Debug] Combined incoming count: ${combined.length}`);

        // Jika filter indexer tidak bekerja (semua empty), fallback ke metode lama tapi dengan limit lebih besar
        if (combined.length === 0) {
          console.warn("[AptosMail Debug] No blobs combined, trying fallback getBlobs(limit: 500)");
          try {
            const fallback = await shelbyClient.coordination.getBlobs({
              pagination: { limit: 500 }
            });
            const allBlobs = Array.isArray(fallback) ? fallback : (fallback as any)?.blobs || [];
            console.log(`[AptosMail Debug] Fallback total blobs loaded: ${allBlobs.length}`);
            const filtered = allBlobs.filter((b: any) => {
              const name = String(b?.blobNameSuffix || b?.blob_name || b?.name || '');
              return name.includes(`to_${normalizedMyAddr}`) ||
                     name.includes(`to_${shortAddr}`) ||
                     name.includes(`to_${hashedAddr}`);
            });
            console.log(`[AptosMail Debug] Fallback filtered incoming count: ${filtered.length}`, filtered);
            return filtered;
          } catch (err) {
            console.error("[AptosMail Debug] Fallback failed:", err);
            return [];
          }
        }

        return combined;
      } catch (_err) {
        console.error("[AptosMail Debug] Query function crashed:", _err);
        return [];
      }
    },
    enabled: !!myAddress && !!shelbyClient,
    refetchInterval: 10000
  })

  // DRAFTS STATE
  const [drafts, setDrafts] = useState<any[]>(() => {
    const saved = localStorage.getItem('aptos_blobs_multi_drafts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aptos_blobs_multi_drafts', JSON.stringify(drafts));
  }, [drafts]);

  // Fetch real account transactions to filter for AptosBlobs-Mail (Shelby) interactions
  const { data: accountTransactions, refetch: refetchTransactions, isLoading: isTxnsLoading } = useQuery({
    queryKey: ['accountTransactions', currentNetwork, myAddress],
    queryFn: async () => {
      if (!myAddress) return [];
      try {
        // Fetch last 50 transactions for the account
        // We use the raw fetch or SDK to get transactions from the node
        const nodeUrl = currentNetwork === 'shelbynet'
          ? 'https://api.shelbynet.shelby.xyz/v1'
          : `https://api.testnet.aptoslabs.com/v1`;
        
        const res = await fetch(`${nodeUrl}/accounts/${myAddress}/transactions?limit=50`);
        const txns = await readJsonResponse(res, 'Transaction history');
        
        // Filter: show Shelby calls, app calls, and package publish txs for this app account.
        return txns.filter((t: any) => {
          const payload = t.payload;
          if (!payload || payload.type !== 'entry_function_payload') return false;
          const func = payload.function || '';
          const isAppPublish = normalizeAddr(t.sender || '') === normalizeAddr(MAIL_REGISTRY_ADDR)
            && func === '0x1::code::publish_package_txn';
          return func.startsWith(`${SHELBY_PROTOCOL_ADDR}::`)
            || func.startsWith(`${MAIL_REGISTRY_ADDR}::`)
            || func.startsWith(`${ACCESS_CONTROL_MODULE}`)
            || isAppPublish;
        });
      } catch (e) {
        return [];
      }
    },
    enabled: !!myAddress,
    refetchInterval: 15000
  })



  // Network validation logic
  const isWrongNetwork = useMemo(() => {
    if (!connected || !walletNetwork) return false;
    const currentWalletNet = normalizeNetworkName((walletNetwork as any)?.name || String(walletNetwork || ''));
    if (!currentWalletNet) return false;
    if (currentNetwork === 'shelbynet') {
      // Shelbynet runs its own Aptos validators but wallets may show it as testnet or shelbynet
      // Reject only if wallet is on mainnet
      return currentWalletNet.includes('mainnet');
    }
    // For testnet: reject if wallet is on mainnet or shelbynet
    return currentWalletNet.includes('mainnet');
  }, [connected, walletNetwork, currentNetwork]);

  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null)
  const [localMails, setLocalMails] = useState<any[]>([])
  const [mailMeta, setMailMeta] = useState<Record<string, { read?: boolean, starred?: boolean, snapshot?: any }>>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_mail_meta')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [contacts, setContacts] = useState<Record<string, { address: string, label?: string, lastUsed: number, count: number }>>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_contacts')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [blockedAddrs, setBlockedAddrs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_blocked_addrs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [outbox, setOutbox] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_outbox')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [sentHistory, setSentHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_sent_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [hiddenMailKeys, setHiddenMailKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_hidden_mail_keys')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [failedMailMeta, setFailedMailMeta] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_failed_mail_meta')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [currentView, setCurrentView] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [listFilter, setListFilter] = useState<'all' | 'unread' | 'attachments'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null)
  
  // Mobile-specific state
  const [mobilePanel, setMobilePanel] = useState<'list' | 'detail'>('list')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const previousInboxCount = useRef<number | null>(null)

  const [composeOpen, setComposeOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false)
  const [sendBusy, setSendBusy] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [previewBlob, setPreviewBlob] = useState<{ url: string, name: string, type: 'image' | 'unknown' } | null>(null)

  // Auto-fetch blob content state
  const [blobLoading, setBlobLoading] = useState(false)
  const [blobBodyCache, setBlobBodyCache] = useState<Record<number, string>>({})
  const [realSubjects, setRealSubjects] = useState<Record<number, string>>({})
  const payUnlockInFlightRef = useRef(false)
  const [purchasedAccess, setPurchasedAccess] = useState<Record<string, { txHash?: string, paidAt: number }>>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_purchased_access')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [readReceipts, setReadReceipts] = useState<Record<string, { txHash?: string, readAt: number }>>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_read_receipts')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [reportedMails, setReportedMails] = useState<Record<string, { txHash?: string, reportedAt: number }>>(() => {
    try {
      const saved = localStorage.getItem('aptosblobs_reported_mails')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Access Control State
  const [accessControlOpen, setAccessControlOpen] = useState(false)
  const [accessMode, setAccessMode] = useState<'public' | 'allowlist' | 'timelock' | 'purchasable'>(() => {
    return (localStorage.getItem('aptosblobs_access_mode') as any) || 'allowlist'
  })
  const [accessPrice, setAccessPrice] = useState(() => localStorage.getItem('aptosblobs_access_price') || '0.1')
  const [timeLockUntil, setTimeLockUntil] = useState(() => localStorage.getItem('aptosblobs_time_lock_until') || getDefaultTimeLockValue())
  const [allowlistAddrs, setAllowlistAddrs] = useState<string[]>([''])
  const [autoSyncSentHistory, setAutoSyncSentHistory] = useState(() => {
    const saved = localStorage.getItem('aptosblobs_autosync')
    return saved === null ? true : saved === 'true'
  })

  // STATE UNTUK USERNAME/HANDLE
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [isRegisteringHandle, setIsRegisteringHandle] = useState(false);
  const [newHandleInput, setNewHandleInput] = useState('');
  const [isEditingHandle, setIsEditingHandle] = useState(false);

  const [handleCache, setHandleCache] = useState<Record<string, string>>({})
  
  // CEK HANDLE MILIK USER (On-chain View Call)
  const { data: registeredHandle, refetch: refetchHandle } = useQuery({
    queryKey: ['userHandle', myAddress, currentNetwork],
    queryFn: async () => {
      if (!myAddress) return null;
      try {
        // Karena kita tidak punya fungsi view `get_handle_by_address` di contract (hanya resolve_handle), 
        // untuk demo ini kita asumsikan jika user baru daftar, mereka tahu namanya.
        // Di masa depan, kita bisa tambahkan fungsi reverse lookup di contract.
        return localStorage.getItem(`handle_${myAddress}`);
      } catch (e) { return null; }
    },
    enabled: !!myAddress,
  })

  // FUNGSI UNTUK DAFTAR USERNAME
  const handleRegisterHandle = async () => {
    if (!account) return showToast('Please connect your wallet first', 'error');
    if (isWrongNetwork) return showToast(`Please switch your wallet to ${currentNetwork} first`, 'error');
    const nextHandle = newHandleInput.trim();
    if (!nextHandle) return showToast('Enter a name', 'error');
    if (registeredHandle && nextHandle === registeredHandle) {
      setIsEditingHandle(false);
      setNewHandleInput('');
      return showToast('Username unchanged', 'info');
    }
    try {
      showToast(`${registeredHandle ? 'Changing username to' : 'Registering'} ${nextHandle}...`, 'info');
      await signAndSubmitTransaction({
        data: {
          function: `${MAIL_REGISTRY_ADDR}::mail_registry_v2::register_handle`,
          functionArguments: [nextHandle],
        }
      } as any);
      showToast(registeredHandle ? 'Username changed!' : 'Username registered!', 'success');
      localStorage.setItem(`handle_${myAddress}`, nextHandle);
      setUserHandle(nextHandle);
      setNewHandleInput('');
      setIsEditingHandle(false);
      setIsRegisteringHandle(false);
      refetchHandle();
    } catch (e: any) {
      showToast('Registration failed: ' + (e.message || String(e)), 'error');
    }
  }

  // FUNGSI UNTUK RESOLVE USERNAME SAAT KIRIM PESAN (Handle -> Address)
  const resolveTargetAddress = async (input: string) => {
    const target = parseMailIdentityInput(input);
    if (target.startsWith('0x')) return target;
    if (!target) return input;
    try {
      const payload: any = {
        function: `${MAIL_REGISTRY_ADDR}::mail_registry_v2::resolve_handle`,
        type_arguments: [],
        arguments: [target],
      };
      const res = await fetch(`${aptosConfig.fullnode}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readJsonResponse(res, 'Handle lookup');
      return data[0]; 
    } catch (e) {
      return target || input; 
    }
  }

  // FUNGSI UNTUK RESOLVE ADDRESS KE USERNAME (REVERSE LOOKUP: Address -> Handle)
  const resolveAddressToHandle = async (addr: string) => {
    if (!addr || addr === '0x') return null;
    if (handleCache[addr]) return handleCache[addr];
    try {
      const payload: any = {
        function: `${MAIL_REGISTRY_ADDR}::mail_registry_v2::get_handle`,
        type_arguments: [],
        arguments: [addr],
      };
      const res = await fetch(`${aptosConfig.fullnode}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readJsonResponse(res, 'Reverse handle lookup');
      const h = data[0];
      if (h) {
        setHandleCache(prev => ({ ...prev, [addr]: h }));
        return h;
      }
      return null;
    } catch (e) { return null; }
  }

  const hasOnchainMailUnlock = async (payer: string, blobName: string) => {
    if (!payer || !blobName) return false;
    try {
      const owner = selectedMailId !== null
        ? filteredMails.find((m: any) => m.id === selectedMailId)?.addr || ''
        : ''
      const fullBlobName = owner ? makeShelbyFullBlobName(owner, blobName) : blobName
      return (await getShelbyPurchasePermission(payer, fullBlobName)) === true
    } catch (e) {
      return false;
    }
  }

  const getShelbyPurchasePermission = async (payer: string, fullBlobName: string, ownerAddr?: string): Promise<boolean | null> => {
    if (!payer || !fullBlobName) return null
    try {
      // Our custom access_control module requires blob_owner as argument
      // Extract owner from fullBlobName if not provided (format: "0xowner/blobname")
      const extractedOwner = ownerAddr || fullBlobName.split('/')[0] || payer
      const payload: any = {
        function: `${ACCESS_CONTROL_MODULE}::check_permission`,
        type_arguments: [],
        arguments: [normalizeAddr(payer), normalizeAddr(extractedOwner), fullBlobName],
      }
      const res = await withTimeout(fetch(`${aptosConfig.fullnode}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }), 8000, 'Shelby permission check')
      const data = await readJsonResponse(res, 'Shelby permission check')
      return parseAptosOptionBool(data?.[0] ?? data?.value?.[0])
    } catch {
      return null
    }
  }

  const getShelbyUsdBalance = async (addr: string): Promise<bigint | null> => {
    if (!addr) return null
    try {
      const payload: any = {
        function: '0x1::primary_fungible_store::balance',
        type_arguments: ['0x1::fungible_asset::Metadata'],
        arguments: [normalizeAddr(addr), SHELBY_USD_METADATA],
      }
      const res = await withTimeout(fetch(`${aptosConfig.fullnode}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }), 8000, 'ShelbyUSD balance check')
      const data = await readJsonResponse(res, 'ShelbyUSD balance check')
      const raw = data?.[0] ?? data?.value?.[0]
      return raw === undefined ? null : BigInt(String(raw))
    } catch {
      return null
    }
  }

  const waitForShelbyPaywallRegistration = async (owner: string, blobName: string, attempts = 8) => {
    const fullBlobName = makeShelbyFullBlobName(owner, blobName)
    for (let attempt = 0; attempt < attempts; attempt++) {
      const permission = await getShelbyPurchasePermission(owner, fullBlobName)
      if (permission !== null) return true
      await sleep(1500 + attempt * 500)
    }
    return false
  }

  const hasOnchainReadReceipt = async (reader: string, blobName: string) => {
    if (!reader || !blobName) return false;
    try {
      const payload: any = {
        function: `${MAIL_REGISTRY_ADDR}::read_receipt::has_read`,
        type_arguments: [],
        arguments: [normalizeAddr(reader), blobName],
      };
      const res = await fetch(`${aptosConfig.fullnode}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readJsonResponse(res, 'Read receipt check');
      return data[0] === true || data[0] === 'true';
    } catch (e) {
      return false;
    }
  }

  const hasOnchainReport = async (reporter: string, blobName: string) => {
    if (!reporter || !blobName) return false;
    try {
      const payload: any = {
        function: `${MAIL_REGISTRY_ADDR}::registry::has_reported`,
        type_arguments: [],
        arguments: [normalizeAddr(reporter), blobName],
      };
      const res = await fetch(`${aptosConfig.fullnode}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readJsonResponse(res, 'Report check');
      return data[0] === true || data[0] === 'true';
    } catch (e) {
      return false;
    }
  }

  // Trigger auto-resolve for unknown senders in inbox
  useEffect(() => {
    if (!incomingBlobs) return;
    incomingBlobs.forEach((b: any) => {
      const sender = (b.owner || b.account || b.creator || '').toString();
      if (sender && sender !== '0x' && !handleCache[sender]) {
        resolveAddressToHandle(sender);
      }
    });
  }, [incomingBlobs]);

  useEffect(() => {
    localStorage.setItem('aptosblobs_access_mode', accessMode)
    localStorage.setItem('aptosblobs_access_price', accessPrice)
    localStorage.setItem('aptosblobs_time_lock_until', timeLockUntil)
    localStorage.setItem('aptosblobs_autosync', String(autoSyncSentHistory))
  }, [accessMode, accessPrice, timeLockUntil, autoSyncSentHistory])

  useEffect(() => {
    localStorage.setItem('aptosblobs_mail_meta', JSON.stringify(mailMeta))
  }, [mailMeta])

  useEffect(() => {
    localStorage.setItem('aptosblobs_contacts', JSON.stringify(contacts))
  }, [contacts])

  useEffect(() => {
    localStorage.setItem('aptosblobs_blocked_addrs', JSON.stringify(blockedAddrs))
  }, [blockedAddrs])

  useEffect(() => {
    localStorage.setItem('aptosblobs_outbox', JSON.stringify(outbox.slice(0, 50)))
  }, [outbox])

  useEffect(() => {
    localStorage.setItem('aptosblobs_sent_history', JSON.stringify(sentHistory.slice(0, 100)))
  }, [sentHistory])

  useEffect(() => {
    localStorage.setItem('aptosblobs_hidden_mail_keys', JSON.stringify(hiddenMailKeys.slice(0, 250)))
  }, [hiddenMailKeys])

  useEffect(() => {
    localStorage.setItem('aptosblobs_failed_mail_meta', JSON.stringify(failedMailMeta))
  }, [failedMailMeta])

  useEffect(() => {
    localStorage.setItem('aptosblobs_purchased_access', JSON.stringify(purchasedAccess))
  }, [purchasedAccess])

  useEffect(() => {
    localStorage.setItem('aptosblobs_read_receipts', JSON.stringify(readReceipts))
  }, [readReceipts])

  useEffect(() => {
    localStorage.setItem('aptosblobs_reported_mails', JSON.stringify(reportedMails))
  }, [reportedMails])

  // Smart Discovery: Gather all potential salt addresses from interaction history
  const [knownSalts, setKnownSalts] = useState<Set<string>>(new Set())
  useEffect(() => {
    const salts = new Set<string>()
    if (myAddress) salts.add(normalizeAddr(myAddress))
    
    // 1. All senders from Inbox
    if (incomingBlobs) {
      incomingBlobs.forEach((b: any) => {
        const s = (b.owner || b.account || b.creator || '').toString()
        if (s && s !== '0x') { try { salts.add(normalizeAddr(s)) } catch (e) {} }
      })
    }
    
    // 2. All recipients from unhashed sent blobs
    if (onchainBlobs) {
      onchainBlobs.forEach((b: any) => {
        const name = b.blobNameSuffix || b.name || ''
        const match = name.match(/to_(0x[a-fA-F0-9]+)/i)
        if (match && match[1].length >= 30) { try { salts.add(normalizeAddr(match[1])) } catch (e) {} }
      })
    }
    setKnownSalts(salts)
  }, [incomingBlobs, onchainBlobs, myAddress])

  // GLOBAL SECURE DOWNLOAD HANDLER
  useEffect(() => {
    (window as any).handleSecureDownload = async (owner: string, blobName: string, fileName: string, iv?: string, saltAddr?: string) => {
      try {
        showToast(`Decrypting ${fileName}...`, 'info');
        const blobObj = await shelbyClient.download({ account: owner as any, blobName });
        const response = new Response((blobObj as any).readable);
        const data = await response.blob();
        const arrayBuffer = await data.arrayBuffer();
        let uint8 = new Uint8Array(arrayBuffer);
        
        // Only decrypt if it's a private mail (ends with .bin in this implementation)
        if (blobName.endsWith('.bin') && iv) {
          // AUTO-DECRYPT: Always use the sender (owner) as the salt
          uint8 = await decryptBinary(uint8, owner, iv);
        } else if (blobName.endsWith('.bin') && !iv) {
          // Legacy XOR fallback for old messages
          const key = 0x53;
          for (let i = 0; i < uint8.length; i++) uint8[i] ^= key;
        }
        
        const decryptedBlob = new Blob([uint8], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Download complete', 'success');
      } catch (e: any) {
        showToast(`Download failed: ${e.message}`, 'error');
      }
    };

    (window as any).handleResyncMail = (id: number) => {
      setBlobBodyCache(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      const failedEntry = Object.values(failedMailMeta).find((entry: any) => entry?.snapshot?.id === id) as any;
      setFailedMailMeta(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key]?.snapshot?.id === id) delete next[key];
        });
        return next;
      });
      if (failedEntry?.snapshot?.folder) setCurrentView(failedEntry.snapshot.folder);
      setSelectedMailId(null);
      setTimeout(() => setSelectedMailId(id), 0);
    };

    (window as any).handleCopyAddress = async (addr: string) => {
      try {
        await navigator.clipboard.writeText(addr);
        showToast('Address copied', 'success');
      } catch {
        showToast('Unable to copy address', 'error');
      }
    };

    (window as any).handlePayToUnlock = async (owner: string, price: string, mailIdValue?: string, blobName?: string) => {
      if (!connected || !account) return showToast('Connect your wallet first', 'error');
      if (isWrongNetwork) return showToast(`Please switch your wallet to ${currentNetwork} first`, 'error');
      if (payUnlockInFlightRef.current) return showToast('Purchase is already opening in your wallet...', 'info');

      const mailId = Number(mailIdValue);
      if (!Number.isFinite(mailId) || !blobName) return showToast('Purchase target not found. Please refresh and try again.', 'error');

      try {
        payUnlockInFlightRef.current = true;
        const normalizedOwner = normalizeAddr(owner);
        if (!normalizedOwner || normalizedOwner === '0x') throw new Error('Owner address not found');
        if (normalizeAddr(account.address.toString()) === normalizedOwner) {
          return showToast('This blob is already yours', 'info');
        }

        const purchaseKey = makePurchaseKey(currentNetwork, normalizedOwner, blobName);
        if (purchasedAccess[purchaseKey]) {
          setBlobBodyCache(prev => {
            const next = { ...prev };
            delete next[mailId];
            return next;
          });
          setSelectedMailId(null);
          setTimeout(() => setSelectedMailId(mailId), 0);
          return showToast('Access already unlocked on this device', 'success');
        }

        const fullBlobName = makeShelbyFullBlobName(normalizedOwner, blobName);
        showToast('Checking Shelby paywall registration...', 'info');
        const metadataPermission = await getShelbyPurchasePermission(normalizedOwner, fullBlobName, normalizedOwner);
        if (metadataPermission === null && !(await waitForShelbyPaywallRegistration(normalizedOwner, blobName, 2))) {
          return showToast('Shelby paywall is not registered on-chain yet. The sender must approve the second register_blobs_v2 transaction or re-send this mail.', 'error');
        }

        const permission = await getShelbyPurchasePermission(account.address.toString(), fullBlobName, normalizedOwner);
        if (permission === true) {
          setPurchasedAccess(prev => ({
            ...prev,
            [purchaseKey]: { paidAt: Date.now() },
          }));
          setBlobBodyCache(prev => {
            const next = { ...prev };
            delete next[mailId];
            return next;
          });
          setSelectedMailId(null);
          setTimeout(() => setSelectedMailId(mailId), 0);
          return showToast('Shelby access already granted', 'success');
        }

        const requiredShelbyUsd = parseShelbyUsdToBaseUnits(price || '0')
        const shelbyUsdBalance = await getShelbyUsdBalance(account.address.toString());
        if (shelbyUsdBalance !== null && shelbyUsdBalance < requiredShelbyUsd) {
          return showToast(`Not enough ShelbyUSD. Need ${price} ShelbyUSD for this purchase.`, 'error');
        }

        showToast(`Confirm Shelby purchase in your wallet...`, 'info');
        const tx: any = await withTimeout(Promise.resolve(signAndSubmitTransaction({
          data: {
            function: `${ACCESS_CONTROL_MODULE}::purchase`,
            typeArguments: [],
            functionArguments: [normalizedOwner, fullBlobName],
          },
          options: { maxGasAmount: 20000, gasUnitPrice: 100 },
        } as any)), 90000, 'Wallet signature request');
        const txHash = tx?.hash || tx?.transactionHash;
        if (txHash && shelbyClient?.aptos?.waitForTransaction) {
          await withTimeout(shelbyClient.aptos.waitForTransaction({ transactionHash: txHash }), 60000, 'Shelby purchase confirmation');
        }

        setPurchasedAccess(prev => ({
          ...prev,
          [purchaseKey]: { txHash, paidAt: Date.now() },
        }));
        setBlobBodyCache(prev => {
          const next = { ...prev };
          delete next[mailId];
          return next;
        });
        setSelectedMailId(null);
        setTimeout(() => setSelectedMailId(mailId), 0);
        refetchTransactions();
        showToast('Payment confirmed. Content unlocked!', 'success');
      } catch (e: any) {
        showToast('Payment failed: ' + (e?.message || String(e)), 'error');
      } finally {
        payUnlockInFlightRef.current = false;
      }
    };
  }, [shelbyClient, knownSalts, failedMailMeta, connected, account, isWrongNetwork, currentNetwork, purchasedAccess, signAndSubmitTransaction, refetchTransactions]);

  // Detect if user is opening via Petra mobile dApp browser
  const isPetraApp = typeof window !== 'undefined' && !!(window as any).aptos

  // Premium Entry Animation with GSAP (All-Device optimized)
  const mainRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!mainRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(".layout", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2
      })
    }, mainRef)
    return () => ctx.revert()
  }, [])

  // Auto-refresh pending blobs every 5s until all are confirmed
  useEffect(() => {
    if (!onchainBlobs) return
    const hasPending = onchainBlobs.some((b: any) => isShelbyBlobPending(b))
    if (!hasPending) return
    const timer = setInterval(() => refetchBlobs(), 5000)
    return () => clearInterval(timer)
  }, [onchainBlobs])

  const resetCompose = () => {
    setComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setAttachedFiles([]);
  };

  const saveCurrentDraft = () => {
    const newDraft = {
      id: 'draft_' + Date.now(),
      from: 'Draft',
      addr: composeTo,
      subject: composeSubject || '(No Subject)',
      body: composeBody,
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      unread: false,
      color: 0,
      tags: ['draft'],
      blobs: [],
      preview: (composeBody || '').substring(0, 50) + '...'
    };
    setDrafts(prev => [newDraft, ...prev]);
    showToast('Draft saved to list', 'info');
  }

  const handleCloseCompose = () => {
    if (composeTo || composeSubject || composeBody) {
      setDraftConfirmOpen(true)
      return
    }
    resetCompose()
  };

  const handleDraftDecision = (save: boolean) => {
    if (save) saveCurrentDraft()
    setDraftConfirmOpen(false)
    resetCompose()
  }

  const handleOpenDraft = (draft: any) => {
    setComposeTo(draft.addr);
    setComposeSubject(draft.subject);
    setComposeBody(draft.body);
    setDrafts(drafts.filter(d => d.id !== draft.id));
    setComposeOpen(true);
  };

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleConnect = () => {
    if (connected) {
      disconnect()
      showToast('Wallet disconnected', 'info')
      if (onReturnHome) {
        setTimeout(() => onReturnHome(), 250)
      }
    } else {
      // In Petra mobile dApp browser, wallet is automatically injected as window.aptos
      if (isPetraApp) {
        const petraWallet = wallets?.find(w => w.name === 'Petra')
        if (petraWallet) {
          connect(petraWallet.name)
          return
        }
      }
      // In regular browsers: look for Petra first, fallback to the first wallet
      const targetWallet = wallets?.find(w => w.name === 'Petra') || wallets?.[0]
      if (targetWallet) {
        connect(targetWallet.name)
      } else {
        // Mobile: redirect to Petra deep link or download page
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isMobile) {
          showToast('Please open this dApp in the Petra Wallet browser', 'info')
          // Deep link to Petra mobile
          window.open('https://petra.app', '_blank', 'noopener,noreferrer')
        } else {
          showToast('Aptos wallet not found. Please install Petra or Martian.', 'error')
        }
      }
    }
  }

  const filteredMails = useMemo(() => {
    let list: any[] = []
    
    if (currentView === 'inbox') {
      if (incomingBlobs && incomingBlobs.length > 0) {
        const getGroupKey = (rawName: string) => {
          let name = rawName
          if (name.startsWith('@')) name = name.split('/').slice(1).join('/')
          const match = name.match(/^(to_[^_]+_\d+)/i)
          return match ? match[1] : name
        }

        const groups = new Map<string, any[]>()
        for (const b of incomingBlobs) {
          if (isShelbyBlobDeleted(b)) continue
          let rawName = (b as any).blobNameSuffix || b.name || ''
          const key = getGroupKey(rawName)
          if (!groups.has(key)) groups.set(key, [])
          groups.get(key)!.push(b)
        }

        list = Array.from(groups.entries())
          .filter(([_, blobs]) => blobs.some((b: any) => (b.blobNameSuffix || b.name || '').endsWith('-mail.json')))
          .map(([groupKey, blobs], i) => {
            blobs.sort((a: any, b: any) => {
              const aJson = (a.blobNameSuffix || a.name || '').endsWith('.json')
              const bJson = (b.blobNameSuffix || b.name || '').endsWith('.json')
              return aJson === bJson ? 0 : aJson ? -1 : 1
            })
            const primary = blobs[0] as any
            const isPending = isShelbyBlobPending(primary)
            const senderAddr = (primary.owner || primary.account || primary.creator || '').toString() || 'Unknown Sender'
            const tsMs = (primary.creationMicros ? Math.floor(primary.creationMicros / 1000) : 0) || Date.now()

            // ATTEMPT REVERSE LOOKUP (Check local cache and then on-chain cache)
            const cachedHandle = localStorage.getItem(`handle_${senderAddr}`) || handleCache[senderAddr];
            const displayName = cachedHandle ? formatMailIdentity(cachedHandle) : formatAddr(senderAddr);

            let subject = groupKey
            const jsonBlob = blobs.find((b: any) => (b.blobNameSuffix || b.name || '').endsWith('.json')) as any
            if (jsonBlob) {
              const rawN = jsonBlob.blobNameSuffix || jsonBlob.name || ''
              const after = rawN.replace(/^to_[^_]+_\d+-/, '').replace(/\.json$/, '')
              if (after) subject = after
            }

            const sTags = getTags(subject, isPending, blobs.length > 1)
            const blobItems = blobs.map((b: any) => {
              let bn = b.blobNameSuffix || b.name || ''
              if (bn.startsWith('@')) bn = bn.split('/').slice(1).join('/')
              const hexHash = b.blobMerkleRoot ? Array.from(b.blobMerkleRoot as number[]).map((byte: number) => byte.toString(16).padStart(2, '0')).join('') : ''
              const bPending = isShelbyBlobPending(b)
              return {
                name: bn,
                size: ((b.size || 0) / 1024).toFixed(1) + ' KB',
                hash: bPending ? 'Pending...' : '0x' + hexHash,
                enc: '8+4',
                pending: bPending
              }
            })

            return {
              id: -2000 - i,
              mailKey: `inbox:${groupKey}`,
              folder: 'inbox',
              unread: isPending,
              pending: isPending,
              from: `From: ${displayName}`,
              addr: senderAddr,
              subject,
              preview: isPending ? '🕐 Waiting for on-chain confirmation...' : (blobs.length > 1 ? `📎 ${blobs.length - 1} attachments · ${formatAddr(senderAddr)}` : `From ${formatAddr(senderAddr)}`),
              time: new Date(tsMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              timestamp: tsMs,
              tags: sTags,
              body: isPending ? `<p>Waiting for confirmation...</p>` : `<p>Loading content...</p>`,
              blobs: blobItems,
              color: (i + 1) % COLORS.length,
              private: groupKey.length > 30
            }
          })
      }
    } else if (currentView === 'sent') {
      if (onchainBlobs && onchainBlobs.length > 0) {
        // Logika mapping sent yang sudah ada (disingkat untuk keamanan edit)
        const getSentGroupKey = (b: any) => {
          const rawName = b.blobNameSuffix || b.name || ''
          const ts = b.creationMicros || 0
          const owner = (b.owner || b.account || '').toString()
          let name = rawName
          if (name.startsWith('@')) name = name.split('/').slice(1).join('/')
          const match = name.match(/^(to_[^_]+_\d+)/i)
          return match ? `prefix_${match[1]}` : (ts ? `ts_${Math.floor(Number(ts)/1000000)}_${owner}` : name)
        }
        const sentGroups = new Map<string, any[]>()
        for (const b of onchainBlobs) {
          if (isShelbyBlobDeleted(b)) continue
          const key = getSentGroupKey(b)
          if (!sentGroups.has(key)) sentGroups.set(key, [])
          sentGroups.get(key)!.push(b)
        }
        list = Array.from(sentGroups.entries())
          .filter(([_, blobs]) => blobs.some((b: any) => (b.blobNameSuffix || b.name || '').endsWith('-mail.json')))
          .map(([groupKey, blobs], i) => {
            const primary = blobs[0] as any
            const isPending = isShelbyBlobPending(primary)
            const tsMs = (primary.creationMicros ? Math.floor(primary.creationMicros / 1000) : 0) || Date.now()
            let subject = groupKey.replace(/^prefix_to_[^_]+_\d+-?/, '').replace(/^prefix_/, '').replace(/^ts_\d+_/, '')
            const blobItems = blobs.map((b: any) => {
              let bn = b.blobNameSuffix || b.name || ''
              if (bn.startsWith('@')) bn = bn.split('/').slice(1).join('/')
              const hexHash = b.blobMerkleRoot ? Array.from(b.blobMerkleRoot as number[]).map((byte: number) => byte.toString(16).padStart(2, '0')).join('') : ''
              const bPending = isShelbyBlobPending(b)
              return {
                name: bn,
                size: ((b.size || 0) / 1024).toFixed(1) + ' KB',
                hash: bPending ? 'Pending...' : '0x' + hexHash,
                enc: '8+4',
                pending: bPending
              }
            })
            const rawTo = groupKey.replace('prefix_to_', '').split('_')[0]
            const realTo = localStorage.getItem(`sent_hash_${rawTo}`) || rawTo
            const sentContact = contacts[normalizeAddr(realTo)]
            const sentDisplayName = sentContact?.label && !sentContact.label.startsWith('0x')
              ? formatMailIdentity(sentContact.label, realTo)
              : formatAddr(realTo)
            return {
              id: -1000 - i, mailKey: `sent:${groupKey}`, folder: 'sent', unread: isPending, pending: isPending, from: `To: ${sentDisplayName}`,
              addr: account?.address?.toString() || '0x', subject,
              preview: isPending ? '🕐 Waiting for confirmation...' : (blobs.length > 1 ? `📎 ${blobs.length - 1} attachments` : `On-chain message`),
              time: new Date(tsMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              timestamp: tsMs, tags: getTags(subject, isPending, blobs.length > 1), body: `<p>Loading...</p>`, blobs: blobItems, color: i % COLORS.length
            }
          })
      }
      const indexedBlobNames = new Set(
        list.flatMap((mail: any) => (mail.blobs || []).map((blob: any) => blob.name))
      )
      const localSent = sentHistory
        .filter(item => !item.mailBlobName || !indexedBlobNames.has(item.mailBlobName))
        .map((item, i) => {
          const sentContact = contacts[normalizeAddr(item.to)]
          const sentDisplayName = sentContact?.label && !sentContact.label.startsWith('0x')
            ? formatMailIdentity(sentContact.label, item.to)
            : formatAddr(item.to)
          return {
            id: item.id,
            mailKey: `sent-history:${item.id}`,
            folder: 'sent',
            unread: false,
            pending: false,
            from: `To: ${sentDisplayName}`,
            addr: account?.address?.toString() || item.sender || '0x',
            subject: item.subject || '(No Subject)',
            preview: item.preview || 'Sent from this browser. Syncing Shelby indexer...',
            time: item.time,
            timestamp: item.timestamp,
            tags: ['sent', 'local'],
            body: `<div class="decoded-mail"><div class="mail-header-info"><p><b>To:</b> <code>${escapeHtml(item.to)}</code></p><p><b>Status:</b> Sent locally, syncing Shelby indexer</p></div><hr/>${String(item.body || '').trim() ? `<div class="mail-text-body">${escapeHtml(item.body || '').replace(/\n/g, '<br/>')}</div>` : ((item.blobs || []).length > 0 ? '' : '<div class="mail-empty-body"><span>No message body</span></div>')}</div>`,
            blobs: item.blobs || [],
            color: (i + list.length) % COLORS.length,
          }
        })
      list = [...localSent, ...list]
    } else if (currentView === 'drafts') {
      list = [...drafts]
    } else if (currentView === 'outbox') {
      list = outbox.map((item, i) => {
        const outboxContact = contacts[normalizeAddr(item.to)]
        const outboxDisplayName = outboxContact?.label && !outboxContact.label.startsWith('0x')
          ? formatMailIdentity(outboxContact.label, item.to)
          : formatAddr(item.to)
        return {
          id: item.id,
          mailKey: `outbox:${item.id}`,
          folder: 'outbox',
          unread: item.status === 'failed',
          pending: item.status === 'uploading' || item.status === 'submitted',
          from: `To: ${outboxDisplayName}`,
          addr: item.to,
          subject: item.subject || '(No Subject)',
          preview: `${item.statusLabel || item.status}${item.error ? ` - ${item.error}` : ''}`,
          time: item.time,
          timestamp: item.timestamp,
          tags: ['outbox', item.status],
          body: `<p><b>Status:</b> ${escapeHtml(item.statusLabel || item.status)}</p>${item.error ? `<p>${escapeHtml(item.error)}</p>` : ''}`,
          blobs: [],
          color: i % COLORS.length,
        }
      })
    } else if (currentView === 'contacts') {
      list = Object.values(contacts).map((contact, i) => ({
        id: 7000 + i,
        mailKey: `contact:${contact.address}`,
        folder: 'contacts',
        unread: false,
        pending: false,
        from: contact.label && !contact.label.startsWith('0x') ? formatMailIdentity(contact.label, contact.address) : formatAddr(contact.address),
        addr: contact.address,
        subject: contact.label ? contact.address : 'Recent recipient',
        preview: `${contact.count} sent mail${contact.count > 1 ? 's' : ''}`,
        time: new Date(contact.lastUsed).toLocaleDateString(),
        timestamp: contact.lastUsed,
        tags: ['contact'],
        body: `<p><b>Wallet:</b> ${escapeHtml(contact.address)}</p><p>Saved from recent recipients.</p>`,
        blobs: [],
        color: i % COLORS.length,
      }))
    } else if (currentView === 'blocked') {
      list = blockedAddrs.map((address, i) => ({
        id: 8000 + i,
        mailKey: `blocked:${address}`,
        folder: 'blocked',
        unread: false,
        pending: false,
        from: formatAddr(address),
        addr: address,
        subject: 'Blocked sender',
        preview: 'Mail from this address is hidden from Inbox',
        time: '',
        timestamp: 0,
        tags: ['blocked'],
        body: `<p>${escapeHtml(address)} is currently blocked.</p>`,
        blobs: [],
        color: i % COLORS.length,
      }))
    } else if (currentView === 'failed') {
      list = Object.values(failedMailMeta).map((item: any, i) => ({
        ...item.snapshot,
        id: item.snapshot?.id ?? 9000 + i,
        mailKey: item.mailKey,
        sourceFolder: item.snapshot?.folder,
        folder: 'failed',
        unread: true,
        pending: false,
        subject: item.snapshot?.subject || 'Broken mail',
        preview: item.error ? `Moved here because content failed to load: ${item.error}` : 'Moved here because content failed to load',
        tags: Array.from(new Set([...(item.snapshot?.tags || []), 'failed'])),
        body: `<div class="fetch-error"><b>Message content failed to load.</b><br/>${escapeHtml(item.error || 'Unknown error')}<br/><button onclick="window.handleResyncMail(${item.snapshot?.id ?? 9000 + i})" style="margin-top:10px; cursor:pointer; padding:6px 16px; background:var(--brand-color); color:white; border:none; border-radius:var(--radius-full); font-size:11px; font-weight:600; box-shadow:0 2px 8px rgba(240,64,176,0.3);">Resync</button></div>`,
        color: item.snapshot?.color ?? i % COLORS.length,
      }))
    } else if (currentView === 'transactions') {
      const accessControlTxs = (accountTransactions || []).filter((tx: any) =>
        formatEntryFunction(tx?.payload?.function).startsWith('access_control::')
      )
      const visibleTransactions = (accountTransactions || []).filter((tx: any) => {
        const label = formatEntryFunction(tx?.payload?.function)
        const isShelbyRegister = label.startsWith('shelby::register')
        if (!isShelbyRegister) return true
        const txTime = getTxnTimeMs(tx)
        return !accessControlTxs.some((accessTx: any) =>
          Math.abs(getTxnTimeMs(accessTx) - txTime) <= 120000
        )
      })

      list = visibleTransactions.map((tx: any, i: number) => {
        const rawFunction = tx?.payload?.function || ''
        const functionLabel = formatEntryFunction(rawFunction)
        const activity = describeTransactionActivity(tx)
        const tsMs = getTxnTimeMs(tx)
        const success = tx?.success !== false
        const hash = tx?.hash || ''
        const version = tx?.version || ''
        const isAccessControlTx = functionLabel.startsWith('access_control::')
        const activityTitle = success ? activity.title : `${activity.title} failed`

        return {
          id: 700000 + i,
          mailKey: `tx:${hash || version || i}`,
          folder: 'transactions',
          type: 'transaction',
          unread: false,
          pending: false,
          from: success ? 'Aptos activity' : 'Failed activity',
          addr: tx?.sender || myAddress || '',
          subject: activityTitle,
          functionLabel,
          activityLabel: activity.title,
          activityDescription: activity.description,
          txTone: success ? activity.tone : 'failed',
          txHash: hash,
          version,
          preview: isAccessControlTx
            ? `Access rule + Shelby blob registration · Version ${version || '-'}`
            : (hash ? `Version ${version || '-'} · ${formatAddr(hash)}` : `Version ${version || '-'}`),
          time: new Date(tsMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: tsMs,
          tags: ['aptos', activity.tag],
          body: `
            <div class="tx-detail-card">
              <div class="tx-activity-heading">
                <div class="tx-activity-icon tx-tone-${escapeHtml(success ? activity.tone : 'failed')}">${success ? '✓' : '!'}</div>
                <div>
                  <div class="tx-detail-label">Activity</div>
                  <h3>${escapeHtml(activityTitle)}</h3>
                  <p>${escapeHtml(activity.description)}</p>
                </div>
              </div>
              <div class="tx-detail-label">On-chain function</div>
              <div class="function-pill">${escapeHtml(functionLabel)}</div>
              ${isAccessControlTx ? '<div class="tx-linked-note">Grouped with the Shelby blob registration transaction from the same send flow.</div>' : ''}
              <div class="tx-detail-grid">
                <div><span>Status</span><b>${success ? 'Success' : 'Failed'}</b></div>
                <div><span>Version</span><b>${escapeHtml(version || '-')}</b></div>
                <div><span>Sender</span><b>${escapeHtml(formatAddr(tx?.sender || myAddress || ''))}</b></div>
                <div><span>Hash</span><b>${escapeHtml(hash ? formatAddr(hash) : '-')}</b></div>
              </div>
              ${hash ? `<div class="tx-detail-actions"><button onclick="window.open('https://explorer.aptoslabs.com/txn/${escapeHtml(hash)}?network=${escapeHtml(currentNetwork)}', '_blank', 'noopener,noreferrer')">Open in Explorer</button></div>` : ''}
            </div>
          `,
          blobs: [],
          color: i % COLORS.length,
        }
      })
    } else if (currentView === 'blobs') {
      // Logika mapping raw blobs tetap sama
    } else if (currentView === 'starred') {
      list = Object.entries(mailMeta)
        .filter(([_, meta]) => meta.starred && meta.snapshot)
        .map(([mailKey, meta]) => ({ ...meta.snapshot, mailKey, starred: true, tags: Array.from(new Set([...(meta.snapshot.tags || []), 'starred'])) }))
    } else {
      list = (onchainBlobs || []).filter((m: any) => (m.tags || []).includes(currentView))
    }

    list = list.map((mail: any) => {
      const mailKey = mail.mailKey || `${currentView}:${mail.id || mail.subject || mail.timestamp}`
      const meta = mailMeta[mailKey] || {}
      const failedMeta = failedMailMeta[mailKey]
      if (hiddenMailKeys.includes(mailKey)) return null
      const baseTags = failedMeta && !(mail.tags || []).includes('failed')
        ? [...(mail.tags || []), 'failed']
        : (mail.tags || [])
      const tags = meta.starred && !baseTags.includes('starred')
        ? [...baseTags, 'starred']
        : baseTags
      return {
        ...mail,
        mailKey,
        starred: !!meta.starred,
        unread: mail.folder === 'inbox' ? (mail.pending || !meta.read) : mail.unread,
        preview: failedMeta?.error ? `Content failed to load: ${failedMeta.error}` : mail.preview,
        tags,
      }
    }).filter(Boolean)

    if (currentView === 'inbox' && blockedAddrs.length > 0) {
      const blocked = new Set(blockedAddrs.map(addr => normalizeAddr(addr)))
      list = list.filter((mail: any) => !blocked.has(normalizeAddr(mail.addr)))
    }

    if (currentView === 'starred') {
      list = list.filter((mail: any) => mail.starred)
    }

    if (listFilter === 'unread') {
      list = list.filter((mail: any) => mail.unread)
    } else if (listFilter === 'attachments') {
      list = list.filter((mail: any) => (mail.blobs || []).length > 1)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((m: any) => (m.from || '').toLowerCase().includes(q) || (m.subject || '').toLowerCase().includes(q) || (m.addr || '').toLowerCase().includes(q))
    }

    return [...list].sort((a: any, b: any) => {
      const diff = (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0)
      return sortOrder === 'newest' ? diff : -diff
    })
  }, [currentView, searchQuery, listFilter, sortOrder, onchainBlobs, incomingBlobs, drafts, account, accountTransactions, mailMeta, contacts, blockedAddrs, outbox, sentHistory, hiddenMailKeys, failedMailMeta])

  // Automatically sync allowlist with sent history if enabled
  useEffect(() => {
    if (autoSyncSentHistory && onchainBlobs) {
      const recipients = new Set<string>()
      onchainBlobs.forEach((b: any) => {
        const name = b.blobNameSuffix || b.name || ''
        const match = name.match(/to_(0x[a-fA-F0-9]+)/i)
        if (match) {
          try {
            recipients.add(normalizeAddr(match[1]))
          } catch (e) {}
        }
      })
      if (recipients.size > 0) {
        const newAddrs = Array.from(recipients)
        // Only update if the list is actually different to avoid infinite loops
        const currentSet = new Set(allowlistAddrs.filter(a => a.trim() !== ''))
        const isChanged = newAddrs.length !== currentSet.size || newAddrs.some(a => !currentSet.has(a))
        if (isChanged) {
          setAllowlistAddrs(newAddrs.length > 0 ? newAddrs : [''])
        }
      }
    }
  }, [autoSyncSentHistory, onchainBlobs])

  // Auto-fetch blob content when an on-chain mail is selected
  useEffect(() => {
    if (selectedMailId === null) return
    if (selectedMailId >= 0) return // only on-chain blobs have negative IDs
    if (blobBodyCache[selectedMailId]) return // already fetched

    const mail = filteredMails.find((m: any) => m.id === selectedMailId)
    if (!mail) return
    if (mail.folder === 'failed') return

    const jsonBlob = mail.blobs?.find((b: any) => b.name?.endsWith('.json'))
    if (!jsonBlob) return

    const fetchBlobBody = async () => {
      setBlobLoading(true)
      try {
        const ownerAddr = mail.from.startsWith('You') 
          ? normalizeAddr(account?.address?.toString() || '') 
          : normalizeAddr(mail.addr || '')
        if (!ownerAddr || ownerAddr === '0x') throw new Error('Owner address not found')

        const blob = await shelbyClient.download({ account: ownerAddr as any, blobName: jsonBlob.name })
        const response = new Response((blob as any).readable)
        const data = await response.blob()
        const rawText = await data.text()
        const text = rawText.trim()
        
        let decodedBody = ''
        try {
          // AUTO-DECRYPT: First try the SENDER (new protocol)
          let maybeDecrypted = await decryptBody(text, ownerAddr)
          
          // RECOVERY: If decryption failed (likely an old message), try known salts (Inbox senders, etc.)
          if (maybeDecrypted.includes('Decryption Error')) {
            for (const salt of Array.from(knownSalts)) {
              if (normalizeAddr(salt) === normalizeAddr(ownerAddr)) continue;
              const d = await decryptBody(text, salt);
              if (!d.includes('Decryption Error')) {
                maybeDecrypted = d;
                break;
              }
            }
          }
          
          const parsed = JSON.parse(maybeDecrypted)
          const finalSubject = parsed.subject || 'No Subject';
          if (finalSubject) {
            setRealSubjects(prev => ({ ...prev, [selectedMailId]: finalSubject }))
          }
          
          // ACCESS CONTROL: Check if this message was for us or we are in the allowlist
          const effectiveAllowlist = parsed.allowlist || [];
          const isOwner = mail.from.startsWith('You') || normalizeAddr(mail.addr || '') === normalizeAddr(myAddress || '');
          const isRecipient = normalizeAddr(parsed.to || '') === normalizeAddr(myAddress || '');
          const isAllowlisted = Array.isArray(effectiveAllowlist) && effectiveAllowlist.some((a: string) => normalizeAddr(a) === normalizeAddr(myAddress || ''));
          const isPurchasable = parsed.accessMode === 'purchasable';
          const isTimeLocked = parsed.accessMode === 'timelock';
          const timeLockMs = parseTimeLockMs(parsed.timeLockUntil || parsed.timeLockUntilIso);
          const purchasePrice = String(parsed.accessPrice || '0.1');
          const purchaseCurrency = String(parsed.accessCurrency || 'ShelbyUSD');
          const attachmentCount = Array.isArray(parsed.attachments) ? parsed.attachments.length : 0;
          const purchaseScopeText = attachmentCount > 0
            ? `This purchase unlocks the mail and ${attachmentCount} attachment${attachmentCount === 1 ? '' : 's'}.`
            : 'This purchase unlocks the mail content.';
          const purchaseKey = makePurchaseKey(currentNetwork, ownerAddr, jsonBlob.name);
          let hasPurchasedAccess = !!purchasedAccess[purchaseKey];

          if (isPurchasable && !isOwner && !hasPurchasedAccess && myAddress) {
            hasPurchasedAccess = await hasOnchainMailUnlock(myAddress, jsonBlob.name);
            if (hasPurchasedAccess) {
              setPurchasedAccess(prev => ({
                ...prev,
                [purchaseKey]: { paidAt: Date.now() },
              }));
            }
          }
          
          if (parsed.accessMode === 'allowlist' && !isOwner && !isRecipient && !isAllowlisted) {
            decodedBody = `
              <div class="access-denied">
                <h3>🔴 Access Denied</h3>
                <p>This message is protected by a <b>Wallet Allowlist</b>.</p>
                <p>Your address (<code>${escapeHtml(myAddress)}</code>) is not permitted to view this content.</p>
                <div class="access-badge-small">Shelby Privacy Active</div>
              </div>
            `;
            setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: decodedBody }))
            setBlobLoading(false)
            return;
          }

          if (isTimeLocked && !isOwner && timeLockMs > Date.now()) {
            decodedBody = `
              <div class="access-denied access-timelock">
                <h3>Time locked</h3>
                <p>This Shelby mail is encrypted and scheduled for a later release.</p>
                <p><b>Unlocks:</b> ${escapeHtml(formatMailDateTime(timeLockMs))}</p>
                <div class="access-badge-small">Scheduled Shelby Access</div>
              </div>
            `;
            setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: decodedBody }))
            setBlobLoading(false)
            return;
          }

          if (isPurchasable && !isOwner && !hasPurchasedAccess) {
            decodedBody = `
              <div class="purchase-paywall">
                <div class="purchase-paywall-icon">${escapeHtml(purchaseCurrency === 'ShelbyUSD' ? '$' : purchaseCurrency)}</div>
                <h3>Pay to unlock</h3>
                <p>This Shelby blob is protected with purchasable access.</p>
                <p>${escapeHtml(purchaseScopeText)}</p>
                <div class="purchase-price"><span>Price</span><b>${escapeHtml(purchasePrice)} ${escapeHtml(purchaseCurrency)}</b></div>
                <button
                  class="btn-pay-unlock"
                  data-owner="${escapeHtml(ownerAddr)}"
                  data-price="${escapeHtml(purchasePrice)}"
                  data-mail-id="${selectedMailId}"
                  data-blob-name="${escapeHtml(jsonBlob.name)}"
                >Pay to unlock</button>
              </div>
            `;
            setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: decodedBody }))
            setBlobLoading(false)
            return;
          }

          // Extract data from the parsed JSON object
          const finalTo = parsed.to || 'Unknown';
          const finalBody = await decryptBody(parsed.body || '', finalTo);
          const attachments = parsed.attachments || [];
          const safeOwnerAddr = escapeHtml(ownerAddr.replace('to_', '').split('_')[0])
          const safeFinalTo = escapeHtml(finalTo)
          const safeFinalSubject = escapeHtml(finalSubject)
          const safeFinalBody = escapeHtml(finalBody || '').replace(/\n/g, '<br/>')
          const safeMailDate = escapeHtml(formatMailDateTime(mail.timestamp))
          const ownerAddressCopy = safeJsArg(ownerAddr.replace('to_', '').split('_')[0])
          const finalToCopy = safeJsArg(finalTo)
          const secureDownloadCall = (at: any) => escapeHtml(
            `window.handleSecureDownload(${safeJsArg(ownerAddr)}, ${safeJsArg(at.blobName)}, ${safeJsArg(at.originalName)}, ${safeJsArg(at.iv || '')}, ${safeJsArg(ownerAddr)})`
          )
          
          if (mail.mailKey) {
            setFailedMailMeta(prev => {
              if (!prev[mail.mailKey]) return prev;
              const next = { ...prev };
              delete next[mail.mailKey];
              return next;
            });
          }

          const isReallyPrivate = text.startsWith('🔐') || (parsed.body && parsed.body.startsWith('🔐'));
          
          decodedBody = `
            <div class="decoded-mail ${isReallyPrivate ? 'is-private' : ''}">
              <details class="mail-header-info">
                <summary>
                  <div class="mail-header-summary">
                    <span class="mail-header-summary-label">From</span>
                    <button class="mail-address-copy compact" title="Copy address" onclick="event.preventDefault(); window.handleCopyAddress(${ownerAddressCopy})">${safeOwnerAddr}<span>Copy</span></button>
                    <span class="mail-header-summary-date">${safeMailDate}</span>
                  </div>
                  <span class="mail-details-toggle">Show details</span>
                </summary>
                <div class="mail-header-details">
                  <div class="mail-header-row">
                    <span>From</span>
                    <button class="mail-address-copy" title="Copy address" onclick="window.handleCopyAddress(${ownerAddressCopy})">${safeOwnerAddr}<span>Copy</span></button>
                  </div>
                  <div class="mail-header-row">
                    <span>To</span>
                    <button class="mail-address-copy" title="Copy address" onclick="window.handleCopyAddress(${finalToCopy})">${safeFinalTo}<span>Copy</span></button>
                  </div>
                  <div class="mail-header-row">
                    <span>Subject</span>
                    <strong>${safeFinalSubject}</strong>
                  </div>
                  <div class="mail-header-row">
                    <span>Date</span>
                    <strong>${safeMailDate}</strong>
                  </div>
                  ${isReallyPrivate ? '<div class="privacy-badge">AES-GCM Encrypted</div>' : ''}
                </div>
              </details>
              ${safeFinalBody.trim() ? `<div class="mail-text-body">${safeFinalBody}</div>` : (attachments.length > 0 ? '' : '<div class="mail-empty-body"><span>No message body</span></div>')}
              
              ${attachments.length > 0 ? `
                <div class="secure-attachments">
                  <div class="secure-attachments-title">Attachments</div>
                  <div class="secure-attachment-list">
                    ${attachments.map((at: any) => `
                      <div class="secure-attachment-item">
                        <div class="secure-attachment-name">${escapeHtml(at.originalName)}</div>
                        <button class="btn-secure-download" onclick="${secureDownloadCall(at)}">
                          Download
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `
        } catch (jsonErr) {
          // Final fallback
          decodedBody = `<div class="raw-blob-view"><h3>Raw Blob Data</h3><pre>${escapeHtml(text.slice(0, 1000))}${text.length > 1000 ? '...' : ''}</pre></div>`
        }
        
        setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: decodedBody }))
      } catch (e: any) {
        const errMsg = e?.message || String(e)
        if (mail.mailKey && (mail.folder === 'inbox' || mail.folder === 'sent')) {
          setFailedMailMeta(prev => ({
            ...prev,
            [mail.mailKey]: {
              mailKey: mail.mailKey,
              error: errMsg,
              failedAt: Date.now(),
              snapshot: {
                ...mail,
                unread: true,
                pending: false,
                tags: Array.from(new Set([...(mail.tags || []), 'failed'])),
              },
            },
          }))
          showToast('Broken mail moved to Failed', 'info')
        }
        setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: `<div class="fetch-error">⚠️ <b>Failed to fetch message body:</b> ${escapeHtml(errMsg)}<br/><button onclick="window.handleResyncMail(${selectedMailId})" style="margin-top:10px; cursor:pointer; padding:6px 16px; background:var(--brand-color); color:white; border:none; border-radius:var(--radius-full); font-size:11px; font-weight:600; box-shadow:0 2px 8px rgba(240,64,176,0.3);">Resync</button></div>` }))
      } finally {
        setBlobLoading(false)
      }
    }

    fetchBlobBody()
  }, [selectedMailId, filteredMails, currentNetwork, purchasedAccess])

  const selectNav = (view: string) => {
    setCurrentView(view)
    setSelectedMailId(null)
    setMobilePanel('list')
    setMobileSidebarOpen(false)
  }

  const cycleListFilter = () => {
    setListFilter(current => current === 'all' ? 'unread' : current === 'unread' ? 'attachments' : 'all')
  }

  const handleResetMailboxView = () => {
    setSearchQuery('')
    setListFilter('all')
    if (currentView === 'inbox' || currentView === 'sent') {
      setHiddenMailKeys(prev => prev.filter(key => !key.startsWith(`${currentView}:`)))
      setFailedMailMeta(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(key => {
          if (key.startsWith(`${currentView}:`)) delete next[key]
        })
        return next
      })
    }
    showToast('Mailbox view reset', 'success')
  }

  const handleClearLocalMailboxState = () => {
    setSearchQuery('')
    setListFilter('all')
    setSortOrder('newest')
    setHiddenMailKeys([])
    setFailedMailMeta({})
    setBlobBodyCache({})
    setSelectedMailId(null)
    setMobilePanel('list')
    showToast('Local mailbox view cleared', 'success')
  }

  const handleLogout = () => {
    setMobileSidebarOpen(false)
    setHelpOpen(false)
    setSettingsOpen(false)
    disconnect()
    showToast('Wallet disconnected', 'info')
    setTimeout(() => onReturnHome?.(), 250)
  }
  
  const handleOpenMail = (id: any) => {
    const mail = filteredMails.find((m: any) => m.id === id);
    if (mail && mail.tags?.includes('draft')) {
      handleOpenDraft(mail);
      return;
    }
    if (mail?.folder === 'inbox' && mail.unread && !mail.pending) {
      markMailReadState(mail, true)
    }
    setSelectedMailId(id);
    setMobilePanel('detail');
  };

  const handleMobileBack = () => {
    setMobilePanel('list')
    setSelectedMailId(null)
  }

  const handleMailContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const payButton = target.closest('.btn-pay-unlock') as HTMLButtonElement | null
    if (!payButton) return

    event.preventDefault()
    event.stopPropagation()

    const owner = payButton.dataset.owner || ''
    const price = payButton.dataset.price || '0'
    const originalText = payButton.textContent || 'Pay to unlock'
    payButton.disabled = true
    payButton.textContent = 'Checking paywall...'
    const purchase = (window as any).handlePayToUnlock?.(owner, price, payButton.dataset.mailId, payButton.dataset.blobName)
    Promise.resolve(purchase).finally(() => {
      if (document.contains(payButton)) {
        payButton.disabled = false
        payButton.textContent = originalText
      }
    })
  }

  const markMailReadState = (mail: any, read: boolean) => {
    if (!mail?.mailKey) return
    setMailMeta(prev => ({
      ...prev,
      [mail.mailKey]: {
        ...(prev[mail.mailKey] || {}),
        read,
        snapshot: { ...mail, unread: !read },
      },
    }))
  }

  const getMailJsonBlob = (mail: any) =>
    mail?.blobs?.find((blob: any) => blob?.name?.endsWith('.json'))

  const getMailOwnerAddress = (mail: any) =>
    normalizeAddr(mail?.from?.startsWith('You') ? account?.address?.toString() || '' : mail?.addr || '')

  const hasLocalReadReceipt = (mail: any) => {
    const blob = getMailJsonBlob(mail)
    if (!myAddress || !blob?.name) return false
    return !!readReceipts[makeReadReceiptKey(currentNetwork, myAddress, blob.name)]
  }

  const hasLocalReport = (mail: any) => {
    const blob = getMailJsonBlob(mail)
    if (!myAddress || !blob?.name) return false
    return !!reportedMails[makeReportKey(currentNetwork, myAddress, blob.name)]
  }

  const handleMarkReadOnchain = async (mail: any, event?: React.MouseEvent) => {
    event?.stopPropagation()
    if (!connected || !account) return showToast('Connect your wallet first', 'error')
    if (isWrongNetwork) return showToast(`Please switch your wallet to ${currentNetwork} first`, 'error')
    if (!mail || mail.pending || mail.type === 'transaction') return showToast('Read receipt target is not ready yet', 'info')

    const jsonBlob = getMailJsonBlob(mail)
    if (!jsonBlob?.name) return showToast('Mail blob not found', 'error')

    const ownerAddr = getMailOwnerAddress(mail)
    if (!ownerAddr || ownerAddr === '0x') return showToast('Owner address not found', 'error')

    const readerAddr = normalizeAddr(account.address.toString())
    const receiptKey = makeReadReceiptKey(currentNetwork, readerAddr, jsonBlob.name)
    if (readReceipts[receiptKey] || await hasOnchainReadReceipt(readerAddr, jsonBlob.name)) {
      setReadReceipts(prev => ({
        ...prev,
        [receiptKey]: { ...(prev[receiptKey] || {}), readAt: prev[receiptKey]?.readAt || Date.now() },
      }))
      return showToast('Read receipt already recorded on-chain', 'success')
    }

    try {
      showToast('Confirm on-chain read receipt in your wallet...', 'info')
      const tx: any = await signAndSubmitTransaction({
        data: {
          function: `${MAIL_REGISTRY_ADDR}::read_receipt::mark_read`,
          typeArguments: [],
          functionArguments: [ownerAddr, jsonBlob.name],
        },
        options: { maxGasAmount: 20000, gasUnitPrice: 100 },
      } as any)
      const txHash = tx?.hash || tx?.transactionHash
      if (txHash && shelbyClient?.aptos?.waitForTransaction) {
        await shelbyClient.aptos.waitForTransaction({ transactionHash: txHash })
      }

      markMailReadState(mail, true)
      setReadReceipts(prev => ({
        ...prev,
        [receiptKey]: { txHash, readAt: Date.now() },
      }))
      refetchTransactions()
      showToast('Read receipt recorded on-chain', 'success')
    } catch (e: any) {
      showToast('Read receipt failed: ' + (e?.message || String(e)), 'error')
    }
  }

  const handleReportMail = async (mail: any, event?: React.MouseEvent) => {
    event?.stopPropagation()
    if (!connected || !account) return showToast('Connect your wallet first', 'error')
    if (isWrongNetwork) return showToast(`Please switch your wallet to ${currentNetwork} first`, 'error')
    if (!mail || mail.pending || mail.type === 'transaction') return showToast('Report target is not ready yet', 'info')

    const jsonBlob = getMailJsonBlob(mail)
    if (!jsonBlob?.name) return showToast('Mail blob not found', 'error')

    const ownerAddr = getMailOwnerAddress(mail)
    if (!ownerAddr || ownerAddr === '0x') return showToast('Owner address not found', 'error')

    const reporterAddr = normalizeAddr(account.address.toString())
    const reportKey = makeReportKey(currentNetwork, reporterAddr, jsonBlob.name)
    if (reportedMails[reportKey] || await hasOnchainReport(reporterAddr, jsonBlob.name)) {
      setReportedMails(prev => ({
        ...prev,
        [reportKey]: { ...(prev[reportKey] || {}), reportedAt: prev[reportKey]?.reportedAt || Date.now() },
      }))
      return showToast('Report already recorded on-chain', 'success')
    }

    try {
      showToast('Confirm on-chain report in your wallet...', 'info')
      const tx: any = await signAndSubmitTransaction({
        data: {
          function: `${MAIL_REGISTRY_ADDR}::registry::register_report`,
          typeArguments: [],
          functionArguments: [ownerAddr, jsonBlob.name, 'abuse_or_spam'],
        },
        options: { maxGasAmount: 20000, gasUnitPrice: 100 },
      } as any)
      const txHash = tx?.hash || tx?.transactionHash
      if (txHash && shelbyClient?.aptos?.waitForTransaction) {
        await shelbyClient.aptos.waitForTransaction({ transactionHash: txHash })
      }

      setReportedMails(prev => ({
        ...prev,
        [reportKey]: { txHash, reportedAt: Date.now() },
      }))
      refetchTransactions()
      showToast('Report recorded on-chain', 'success')
    } catch (e: any) {
      showToast('Report failed: ' + (e?.message || String(e)), 'error')
    }
  }

  const toggleStarredMail = (mail: any, event?: React.MouseEvent) => {
    event?.stopPropagation()
    if (!mail?.mailKey) return
    setMailMeta(prev => {
      const current = prev[mail.mailKey] || {}
      const nextStarred = !current.starred
      return {
        ...prev,
        [mail.mailKey]: {
          ...current,
          starred: nextStarred,
          snapshot: { ...mail, starred: nextStarred },
        },
      }
    })
    showToast(mail.starred ? 'Removed from Starred' : 'Added to Starred', 'info')
  }

  const toggleReadMail = (mail: any, event?: React.MouseEvent) => {
    event?.stopPropagation()
    if (!mail?.mailKey) return
    markMailReadState(mail, !!mail.unread)
    showToast(mail.unread ? 'Marked as read' : 'Marked as unread', 'info')
  }

  const rememberContact = (address: string, label?: string) => {
    const normalized = normalizeAddr(address)
    if (!normalized || !normalized.startsWith('0x')) return
    setContacts(prev => {
      const existing = prev[normalized]
      return {
        ...prev,
        [normalized]: {
          address: normalized,
          label: label && !label.startsWith('0x') ? label : existing?.label,
          lastUsed: Date.now(),
          count: (existing?.count || 0) + 1,
        },
      }
    })
  }

  const updateOutboxStatus = (id: string, status: string, statusLabel: string, error?: string) => {
    setOutbox(prev => prev.map(item => item.id === id ? { ...item, status, statusLabel, error } : item))
  }

  const syncMailboxesSoon = () => {
    [0, 2500, 5000, 8000, 12000, 20000, 30000].forEach(delay => {
      setTimeout(() => {
        refetchBlobs()
        refetchIncoming()
        refetchTransactions()
      }, delay)
    })
  }

  const handleNetworkSwitch = async (next: 'shelbynet' | 'testnet') => {
    if (next === currentNetwork) return
    setSelectedMailId(null)
    setMobilePanel('list')
    setSearchQuery('')
    setCurrentNetwork(next)
    if (changeNetwork) {
      try {
        // Shelbynet uses its own Aptos validators — some wallets only know testnet
        // Try shelbynet first, fallback to testnet if unsupported
        if (next === 'shelbynet') {
          try {
            await changeNetwork(Network.SHELBYNET as any)
          } catch {
            // Wallet doesn't support shelbynet natively — testnet is OK (shelbynet shares Aptos infra)
            try { await changeNetwork(Network.TESTNET as any) } catch {}
          }
        } else {
          await changeNetwork(Network.TESTNET as any)
        }
      } catch (e) {
        showToast(`Please switch wallet to Aptos ${next} manually`, 'error')
      }
    }
    showToast(`Switched to ${next}`, 'info')
  }

  const blockSender = (mail: any, event?: React.MouseEvent) => {
    event?.stopPropagation()
    const normalized = normalizeAddr(mail?.addr)
    if (!normalized || !normalized.startsWith('0x')) return
    setBlockedAddrs(prev => prev.includes(normalized) ? prev : [normalized, ...prev])
    setSelectedMailId(null)
    setMobilePanel('list')
    showToast('Sender blocked locally', 'info')
  }

  const unblockAddress = (address: string, event?: React.MouseEvent) => {
    event?.stopPropagation()
    const normalized = normalizeAddr(address)
    setBlockedAddrs(prev => prev.filter(addr => normalizeAddr(addr) !== normalized))
    setSelectedMailId(null)
    showToast('Sender unblocked', 'success')
  }

  const handleSend = async () => {
    if (sendBusy) return
    if (!composeTo) return showToast('Enter recipient', 'error')
    if (!composeSubject) return showToast('Enter subject', 'error')
    if (!connected || !account) return showToast('Connect your wallet first', 'error')
    if (apiKeyMissing) return showToast(`Shelby API key for ${currentNetwork} is missing. Set the key, restart the dev server, then try again.`, 'error')

    let outboxId = ''
    try {
      setSendBusy(true)
      setUploadStatus('Resolving recipient...')
      showToast('Resolving recipient...', 'info')
      const safeComposeTo = await resolveTargetAddress(composeTo)
      if (!safeComposeTo || !safeComposeTo.startsWith('0x')) {
        return showToast('Could not resolve username to a valid address', 'error')
      }
      if (normalizeAddr(safeComposeTo) === normalizeAddr(MAIL_REGISTRY_ADDR)) {
        return showToast('Recipient is the registry contract address, not a wallet. Enter the receiver wallet address or handle.', 'error')
      }
      const timeLockMs = accessMode === 'timelock' ? parseTimeLockMs(timeLockUntil) : 0
      if (accessMode === 'timelock' && (!timeLockMs || timeLockMs <= Date.now())) {
        return showToast('Choose a future date and time for Time Lock.', 'error')
      }

      const totalAttachmentBytes = attachedFiles.reduce((sum, file) => sum + file.size, 0)
      const largeUpload = totalAttachmentBytes >= 5 * MB
      const uploadTimeoutMs = Math.max(
        120000,
        Math.min(20 * 60 * 1000, 120000 + Math.ceil(totalAttachmentBytes / MB) * 60000)
      )
      const maxConcurrentUploads = largeUpload ? 1 : 3
      const uploadSizeLabel = formatBytes(totalAttachmentBytes)

      setUploadStatus(totalAttachmentBytes > 0 ? `Preparing ${uploadSizeLabel} for Shelby...` : 'Preparing upload via Shelby...')
      showToast(totalAttachmentBytes > 0 ? `Preparing ${uploadSizeLabel} upload via Shelby...` : 'Preparing upload via Shelby...', 'info')
      
      const timestamp = Date.now()
      outboxId = `outbox_${timestamp}`
      setOutbox(prev => [{
        id: outboxId,
        to: normalizeAddr(safeComposeTo),
        subject: composeSubject,
        timestamp,
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'uploading',
        statusLabel: 'Uploading blobs to Shelby',
      }, ...prev].slice(0, 50))
      const isPrivate = accessMode !== 'public'
      
      // PRIVACY: Hash the recipient for the blob name if Mode != Public
      let blobPrefix = `to_${safeComposeTo}`
      let attachmentsMeta = []
      
      if (isPrivate) {
        const hashedTo = await getPrivacyHash(safeComposeTo)
        blobPrefix = `to_${hashedTo}`
        try { localStorage.setItem(`sent_hash_${hashedTo}`, safeComposeTo) } catch(e) {}
      }

      // 1. Prepare Attachments
      const formattedBlobs: Array<{ blobName: string, blobData: Uint8Array }> = []
      for (let i = 0; i < attachedFiles.length; i++) {
        const file = attachedFiles[i]
        setUploadStatus(`Reading ${file.name} (${formatBytes(file.size)})...`)
        const arrayBuf = await file.arrayBuffer()
        let blobData = new Uint8Array(arrayBuf)
        let finalSuffix = ""
        
        if (isPrivate) {
          setUploadStatus(`Encrypting ${file.name} (${formatBytes(file.size)})...`)
          // AUTO-DECRYPT: Encrypt file binary using our own address (sender) as the salt
          const { encrypted, iv } = await encryptBinary(blobData, normalizeAddr(account.address.toString()))
          blobData = encrypted
          // Hide filename COMPLETELY
          finalSuffix = `part${i}.bin`
          attachmentsMeta.push({ 
            originalName: file.name, 
            blobName: `${blobPrefix}_${timestamp}-${finalSuffix}`,
            iv: iv 
          })
        } else {
          finalSuffix = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          attachmentsMeta.push({ originalName: file.name, blobName: `${blobPrefix}_${timestamp}-${finalSuffix}` })
        }
        
        formattedBlobs.push({ blobName: `${blobPrefix}_${timestamp}-${finalSuffix}`, blobData })
      }

      // 2. Prepare Main Mail Payload
      const mailBlobName = `${blobPrefix}_${timestamp}-mail.json`
      let payloadObj = { 
        to: composeTo, 
        subject: composeSubject, 
        body: composeBody, 
        attachments: attachmentsMeta,
        paywallBlobName: accessMode === 'purchasable' ? mailBlobName : null,
        paywallScope: accessMode === 'purchasable' ? 'mail_and_attachments' : null,
        allowlist: accessMode === 'allowlist' 
          ? Array.from(new Set([safeComposeTo, ...allowlistAddrs.filter(a => !!a.trim()).map(a => normalizeAddr(a))]))
          : null,
        timeLockUntil: accessMode === 'timelock' ? timeLockMs : null,
        timeLockUntilIso: accessMode === 'timelock' ? new Date(timeLockMs).toISOString() : null,
        accessPrice: accessMode === 'purchasable' ? accessPrice.trim() || '0.1' : null,
        accessCurrency: accessMode === 'purchasable' ? 'ShelbyUSD' : null,
        accessMode
      }
      let payloadString = JSON.stringify(payloadObj)
      
      if (isPrivate) {
        // AUTO-DECRYPT: Use our own address (sender) as the salt for the key
        payloadString = await encryptBody(payloadString, normalizeAddr(account.address.toString()))
      }

      const textEncoder = new TextEncoder()
      const payloadData = textEncoder.encode(payloadString)
      
      // Add the mail.json as the first blob
      formattedBlobs.unshift({ blobName: mailBlobName, blobData: payloadData })
      
      // Per docs: signer must use account.accountAddress (AccountAddress), not account object
      // Per wallet adapter docs: AccountInfo.address is the AccountAddress
      const signer = {
        account: account,
        signAndSubmitTransaction
      }

      setUploadStatus(largeUpload
        ? `Uploading ${uploadSizeLabel} to Shelby. Keep this tab open...`
        : `Uploading ${formattedBlobs.length} blob${formattedBlobs.length === 1 ? '' : 's'} to Shelby...`)
      try {
        const targetLocationHint = currentNetwork === 'shelbynet' ? 'shelbynet-1' : 'us-east-1';
        await withTimeout(uploadBlobs({
          signer: signer as any,
          blobs: formattedBlobs,
          expirationMicros: Date.now() * 1000 + ONE_DAY_MICROS,
          maxConcurrentUploads,
          options: {
            locationHint: targetLocationHint,
          },
        } as any), uploadTimeoutMs, 'Shelby upload')
      } catch (uploadErr: any) {
        const uploadMsg = uploadErr?.message || String(uploadErr)
        if (!uploadMsg.includes('Transaction not found')) throw uploadErr
        updateOutboxStatus(outboxId, 'submitted', 'Upload submitted, waiting for Shelby confirmation')
        showToast('Upload submitted. Waiting for Shelby confirmation...', 'info')
      }

      if (accessMode === 'purchasable' || accessMode === 'timelock') {
        const registrationBytes = accessMode === 'purchasable'
          ? buildAccessControlRegistrationV2([
              {
                blobNameSuffix: mailBlobName,
                policyBytes: buildPayToDownloadPolicyBytes(parseShelbyUsdToBaseUnits(accessPrice.trim() || '0.1')),
              },
            ])
          : buildAccessControlRegistrationV2(formattedBlobs.map(blob => ({
              blobNameSuffix: blob.blobName,
              policyBytes: buildTimeLockPolicyBytes(BigInt(timeLockMs) * 1000n),
            })))

        const accessLabel = accessMode === 'purchasable' ? 'Shelby paywall' : 'Shelby Time Lock permission'
        setUploadStatus(`Registering ${accessLabel} for this mail...`)
        updateOutboxStatus(outboxId, 'submitted', `Registering ${accessLabel}`)
        showToast(`Approve the second transaction to register ${accessLabel}...`, 'info')

        const accessTx: any = await signAndSubmitTransaction({
          data: {
            function: `${ACCESS_CONTROL_MODULE}::register_blobs_v2`,
            typeArguments: [],
            functionArguments: [registrationBytes],
          },
          options: { maxGasAmount: 60000, gasUnitPrice: 100 },
        } as any)
        const accessTxHash = accessTx?.hash || accessTx?.transactionHash
        if (!accessTxHash) {
          throw new Error(`${accessLabel} transaction did not return a hash. Please approve the register_blobs_v2 transaction and try sending again.`)
        }
        if (accessTxHash && shelbyClient?.aptos?.waitForTransaction) {
          const accessResult: any = await shelbyClient.aptos.waitForTransaction({ transactionHash: accessTxHash })
          if (accessResult?.success === false) {
            throw new Error(`${accessLabel} registration transaction failed`)
          }
        }

        setUploadStatus(`Verifying ${accessLabel} registration...`)
        const permissionReady = await waitForShelbyPaywallRegistration(account.address.toString(), mailBlobName)
        if (!permissionReady) {
          updateOutboxStatus(outboxId, 'submitted', `${accessLabel} transaction confirmed. Shelby permission is syncing`)
          showToast(`${accessLabel} transaction confirmed. Shelby permission may need a moment to sync.`, 'info')
        }
      }

      setUploadStatus('Waiting for Shelby indexer sync...')
      updateOutboxStatus(outboxId, 'submitted', 'Sent. Syncing Shelby indexer')
      setSentHistory(prev => [{
        id: `sent_history_${timestamp}`,
        sender: normalizeAddr(account.address.toString()),
        to: normalizeAddr(safeComposeTo),
        subject: composeSubject,
        body: composeBody,
        preview: composeBody ? composeBody.slice(0, 90) : 'Sent mail',
        timestamp,
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        mailBlobName,
        blobs: formattedBlobs.map((blob: any) => ({
          name: blob.blobName,
          size: `${(blob.blobData.length / 1024).toFixed(1)} KB`,
          hash: 'Syncing...',
          enc: '8+4',
          pending: true,
        })),
      }, ...prev].slice(0, 100))
      rememberContact(safeComposeTo, composeTo)
      
      showToast('Message successfully sent to Shelby Storage!', 'success')

      setComposeOpen(false)
      
      setComposeTo(''); setComposeSubject(''); setComposeBody(''); setAttachedFiles([])
      localStorage.removeItem('aptosblobs_draft')
      
      syncMailboxesSoon()
    } catch (e: any) {
      const errMsg = getFriendlySendError(e)
      if (outboxId) updateOutboxStatus(outboxId, 'failed', 'Send failed', errMsg)
      if (errMsg.includes('Transaction not found')) {
        if (outboxId) updateOutboxStatus(outboxId, 'submitted', 'Submitted, waiting for on-chain confirmation')
        showToast('Transaction submitted! Waiting for on-chain confirmation...', 'info')
        syncMailboxesSoon()
      } else {
        showToast('Failed to send message: ' + errMsg, 'error')
      }
    } finally {
      setSendBusy(false)
      setUploadStatus('')
    }
  }

  const handleDownloadBlob = async (addr: string, blobName: string, isPending?: boolean) => {
    // Guard: do not download blobs that are still pending
    if (isPending) {
      showToast('Blob is still pending confirmation. Please wait...', 'info')
      return
    }
    try {
      showToast(`Downloading ${blobName}...`, 'info')
      const blob = await shelbyClient.download({ account: addr as any, blobName })
      const response = new Response(blob.readable)
      const data = await response.blob()
      
      // If the file is mail.json, parse its content and update the selectedMail UI
      if (blobName.endsWith('.json')) {
        const text = await data.text()
        try {
           JSON.parse(text) // validate it's valid JSON
           showToast('Message content successfully decoded!', 'success')
           return
        } catch(e) {}
      }

      if (blobName.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
        const url = URL.createObjectURL(data)
        setPreviewBlob({ url, name: blobName, type: 'image' })
        showToast('Displaying image preview...', 'success')
        return
      }

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = blobName.split('/').pop() || 'downloaded_blob'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Download complete', 'success')
    } catch (e: any) {
      const errMsg: string = e?.message || String(e)
      if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
        showToast('Blob syncing to download nodes. Retrying in 5s...', 'info')
        setTimeout(() => handleDownloadBlob(addr, blobName), 5000)
      } else {
        showToast(`Download failed: ${errMsg}`, 'error')
      }
    }
  }

  const hideMailLocally = (m: any) => {
    const keys = [m?.mailKey, m?.id ? `sent-history:${m.id}` : null, m?.id ? `outbox:${m.id}` : null].filter(Boolean) as string[]
    if (keys.length > 0) {
      setHiddenMailKeys(prev => Array.from(new Set([...keys, ...prev])).slice(0, 250))
    }
    const blobNames = new Set((m?.blobs || []).map((blob: any) => blob.name).filter(Boolean))
    setSentHistory(prev => prev.filter(item => item.id !== m?.id && (!item.mailBlobName || !blobNames.has(item.mailBlobName))))
    setOutbox(prev => prev.filter(item => item.id !== m?.id))
    if (m?.mailKey) {
      setMailMeta(prev => {
        const next = { ...prev }
        delete next[m.mailKey]
        return next
      })
    }
  }

  const handleDeleteMail = async (m: any) => {
    if (!connected) return showToast('Please connect your wallet to delete on-chain blobs!', 'error')
    const blobNames: string[] = Array.from(new Set<string>((m.blobs || []).map((blob: any) => blob.name).filter((name: any): name is string => typeof name === 'string' && name.length > 0)))
    if (blobNames.length === 0 || String(m.mailKey || '').startsWith('sent-history:') || String(m.mailKey || '').startsWith('outbox:')) {
      hideMailLocally(m)
      setSelectedMailId(null)
      showToast('Removed local mail entry', 'success')
      return
    }
    try {
      showToast('Requesting deletion from Shelby...', 'info')
      await deleteBlobs({
        signer: { account: account!, signAndSubmitTransaction },
        blobNames
      })
      showToast('Blob deleted successfully from Shelby!', 'success')
      hideMailLocally(m)
      refetchBlobs()
      refetchIncoming()
      refetchTransactions()
      setSelectedMailId(null)
    } catch (e: any) {
      showToast(`Failed to delete blob: ${e.message}`, 'error')
    }
  }

  // Derive context for the currently selected message
  const selectedMail = filteredMails.find((m: any) => m.id === selectedMailId)
  const countMailGroups = (blobs?: any[]) => {
    if (!blobs?.length) return 0
    const groups = new Set<string>()
    blobs.forEach((b: any) => {
      if (isShelbyBlobDeleted(b)) return
      const rawName = b.blobNameSuffix || b.name || ''
      if (!rawName.endsWith('-mail.json')) return
      let name = rawName
      if (name.startsWith('@')) name = name.split('/').slice(1).join('/')
      const match = name.match(/^(to_[^_]+_\d+)/i)
      groups.add(match ? match[1] : name)
    })
    return groups.size
  }
  const failedKeys = Object.keys(failedMailMeta)
  const rawInboxCount = Math.max(0, countMailGroups(incomingBlobs || []) - failedKeys.filter(key => key.startsWith('inbox:')).length)
  const rawSentCount = Math.max(0, countMailGroups(onchainBlobs || []) - failedKeys.filter(key => key.startsWith('sent:')).length)
  const inboxCount = currentView === 'inbox' ? filteredMails.length : rawInboxCount
  const sentCount = currentView === 'sent' ? filteredMails.length : rawSentCount
  const failedCount = Object.keys(failedMailMeta).length
  const currentRawMailboxCount = currentView === 'inbox' ? rawInboxCount : currentView === 'sent' ? rawSentCount : 0
  const mailboxHasHiddenLocalState = currentView === 'inbox' || currentView === 'sent'
    ? hiddenMailKeys.some(key => key.startsWith(`${currentView}:`)) || failedKeys.some(key => key.startsWith(`${currentView}:`))
    : false
  const currentListLoading = (currentView === 'inbox' && isIncomingLoading) || (currentView === 'sent' && isBlobsLoading)
  const currentListError = currentView === 'inbox'
    ? (isIncomingError ? incomingError : null)
    : (currentView === 'sent' ? (isBlobsError ? blobsError : null) : null)
  const currentListErrorMessage = currentListError instanceof Error
    ? currentListError.message
    : (currentListError ? String(currentListError) : '')
  const composeAttachmentBytes = attachedFiles.reduce((sum, file) => sum + file.size, 0)
  const timeLockMs = parseTimeLockMs(timeLockUntil)
  const timeLockReady = accessMode !== 'timelock' || (timeLockMs > Date.now())
  const composeRecipientReady = !!composeTo.trim()
  const composeSubjectReady = !!composeSubject.trim()
  const composeWalletReady = connected && !!account && !isWrongNetwork && !apiKeyMissing
  const composeReady = composeRecipientReady && composeSubjectReady && composeWalletReady && timeLockReady
  const composeSendButtonText = sendBusy
    ? 'Sending...'
    : !composeRecipientReady
    ? 'Enter recipient'
    : !composeSubjectReady
    ? 'Add subject'
    : !connected
    ? 'Connect wallet first'
    : isWrongNetwork
    ? `Switch to ${currentNetwork}`
    : apiKeyMissing
    ? 'Set Shelby API key'
    : !timeLockReady
    ? 'Set future unlock'
    : 'Send via Aptos'
  const sendStatusText = uploadStatus.toLowerCase()
  const sendSteps = [
    { label: 'Resolve', active: sendStatusText.includes('resolving'), done: sendBusy && !sendStatusText.includes('resolving') },
    { label: 'Prepare', active: sendStatusText.includes('preparing') || sendStatusText.includes('reading') || sendStatusText.includes('encrypting'), done: sendBusy && (sendStatusText.includes('uploading') || sendStatusText.includes('registering') || sendStatusText.includes('verifying') || sendStatusText.includes('waiting')) },
    { label: 'Upload', active: sendStatusText.includes('uploading'), done: sendBusy && (sendStatusText.includes('registering') || sendStatusText.includes('verifying') || sendStatusText.includes('waiting')) },
    { label: accessMode === 'timelock' ? 'Time Lock' : 'Paywall', active: sendStatusText.includes('registering') || sendStatusText.includes('verifying'), done: sendBusy && sendStatusText.includes('waiting'), optional: accessMode !== 'purchasable' && accessMode !== 'timelock' },
    { label: 'Sync', active: sendStatusText.includes('waiting'), done: false },
  ].filter(step => !step.optional)

  useEffect(() => {
    if (!connected) {
      previousInboxCount.current = inboxCount
      return
    }
    if (previousInboxCount.current !== null && inboxCount > previousInboxCount.current) {
      showToast(`${inboxCount - previousInboxCount.current} new mail received`, 'info')
    }
    previousInboxCount.current = inboxCount
  }, [inboxCount, connected])
  
  // Display titles for different navigation views
  const titles: Record<string, string> = { 
    inbox: 'Inbox', 
    sent: 'Sent Messages', 
    drafts: 'Drafts', 
    outbox: 'Outbox', 
    starred: 'Starred', 
    contacts: 'Contacts',
    blocked: 'Blocked Senders',
    failed: 'Failed Mail',
    blobs: 'On-Chain Blobs', 
    transactions: 'Recent Activity', 
    defi: 'DeFi Hub', 
    dao: 'Governance (DAO)', 
    nft: 'NFT Collections' 
  }

  return (
    <div ref={mainRef} className="app-scale-frame" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', minWidth: 0, overflow: 'hidden' }}>
      <div className="topbar">
        {/* Mobile: hamburger menu */}
        <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(true)} aria-label="Open menu">
          <AppIcon name="menu" size={18} />
        </button>
        <div className="logo">
          <div className="logo-icon"><AppIcon name="mail" size={18} /></div>
          AptosBlobs<span className="logo-tag">MAIL</span>
        </div>
        <div className="network-info">
          <div className="separator"></div>
          <div className="network-switch" aria-label="Network switch">
            {(['shelbynet', 'testnet'] as const).map(net => (
              <button
                key={net}
                className={`network-switch-btn ${currentNetwork === net ? 'active' : ''}`}
                type="button"
                onClick={() => handleNetworkSwitch(net)}
                title={`Switch to ${net}`}
              >
                <span
                  className="chain-dot"
                  style={{
                    background: currentNetwork === net
                      ? (isWrongNetwork ? '#de385d' : 'currentColor')
                      : '#d8cedd',
                    boxShadow: currentNetwork === net && !isWrongNetwork
                      ? '0 0 8px rgba(255,255,255,0.55)'
                      : 'none',
                  }}
                ></span>
                {net === 'shelbynet' ? 'Shelbynet' : 'Testnet'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {false && isWrongNetwork && (
        <div style={{
          background: '#fff1f2',
          borderBottom: '1px solid #fecaca',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#991b1b',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          zIndex: 100
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span>You are connected to the wrong network; the app may not function correctly. Please switch to <b>{currentNetwork}</b>.</span>
          <button 
            onClick={async () => {
              if (changeNetwork) {
                try {
                  const target = currentNetwork === 'shelbynet' ? Network.SHELBYNET : Network.TESTNET;
                  await changeNetwork(target as any);
                } catch (e) {
                  showToast(`Please switch to Aptos ${currentNetwork} manually in your wallet`, 'error');
                }
              }
            }}
            style={{
              background: '#991b1b',
              color: 'white',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Switch to {currentNetwork === 'shelbynet' ? 'Shelbynet' : 'Testnet'}
          </button>
        </div>
      )}



      {/* LAYOUT */}
      <div className="layout">

        {/* Mobile Sidebar Drawer Overlay */}
        {mobileSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
        )}
        
        {/* SIDEBAR */}
        <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          
          <button className="btn-compose" onClick={() => setComposeOpen(true)}>
            <span className="compose-icon"><AppIcon name="compose" size={16} /></span>
            <span>Compose</span>
          </button>

          <div className="nav-section">
            <div className="nav-label">Mailbox</div>
            <div className={`nav-item ${currentView === 'inbox' ? 'active' : ''}`} onClick={() => selectNav('inbox')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="inbox" /></span> Inbox</div>
              <span className="nav-count">{inboxCount}</span>
            </div>
            <div className={`nav-item ${currentView === 'sent' ? 'active' : ''}`} onClick={() => selectNav('sent')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="sent" /></span> Sent</div>
              <span className="nav-count">{sentCount}</span>
            </div>
            <div className={`nav-item ${currentView === 'drafts' ? 'active' : ''}`} onClick={() => selectNav('drafts')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="drafts" /></span> Drafts</div>
              <span className="nav-count" style={{ background: 'rgba(255,255,255,0.15)' }}>{drafts.length}</span>
            </div>
            <div className={`nav-item ${currentView === 'outbox' ? 'active' : ''}`} onClick={() => selectNav('outbox')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="outbox" /></span> Outbox</div>
              <span className="nav-count" style={{ background: 'rgba(255,255,255,0.15)' }}>{outbox.length}</span>
            </div>
            <div className={`nav-item ${currentView === 'failed' ? 'active' : ''}`} onClick={() => selectNav('failed')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="failed" /></span> Failed</div>
              <span className="nav-count" style={{ background: failedCount ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.15)' }}>{failedCount}</span>
            </div>
            <div className={`nav-item ${currentView === 'starred' ? 'active' : ''}`} onClick={() => selectNav('starred')}>
              <div className="nav-item-left"><span className="nav-icon nav-icon-star"><AppIcon name="starred" /></span> Starred</div>
            </div>
            <div className={`nav-item ${currentView === 'contacts' ? 'active' : ''}`} onClick={() => selectNav('contacts')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="contacts" /></span> Contacts</div>
              <span className="nav-count" style={{ background: 'rgba(255,255,255,0.15)' }}>{Object.keys(contacts).length}</span>
            </div>
            <div className={`nav-item ${currentView === 'blocked' ? 'active' : ''}`} onClick={() => selectNav('blocked')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="blocked" /></span> Blocked</div>
              <span className="nav-count" style={{ background: 'rgba(255,255,255,0.15)' }}>{blockedAddrs.length}</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">On-Chain</div>
            <div className={`nav-item ${currentView === 'blobs' ? 'active' : ''}`} onClick={() => selectNav('blobs')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="blob" /></span> Blob</div>
            </div>
            <div className={`nav-item ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => selectNav('transactions')}>
              <div className="nav-item-left"><span className="nav-icon"><AppIcon name="transactions" /></span> Transactions</div>
              {accountTransactions && accountTransactions.length > 0 && (
                <span className="nav-count" style={{ background: 'rgba(96,1,210,0.2)', color: 'var(--brand-purple)' }}>
                  {accountTransactions.length}
                </span>
              )}
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Labels</div>
            <div className={`nav-item ${currentView === 'defi' ? 'active' : ''}`} onClick={() => selectNav('defi')}>
              <div className="nav-item-left"><span className="nav-icon nav-icon-defi"><AppIcon name="defi" /></span> DeFi</div>
            </div>
            <div className={`nav-item ${currentView === 'dao' ? 'active' : ''}`} onClick={() => selectNav('dao')}>
              <div className="nav-item-left"><span className="nav-icon nav-icon-dao"><AppIcon name="dao" /></span> DAO</div>
            </div>
            <div className={`nav-item ${currentView === 'nft' ? 'active' : ''}`} onClick={() => selectNav('nft')}>
              <div className="nav-item-left"><span className="nav-icon nav-icon-nft"><AppIcon name="nft" /></span> NFT</div>
            </div>
          </div>

          <div className="sidebar-utility">
            <button className="utility-item" onClick={() => { setHelpOpen(true); setMobileSidebarOpen(false); }}>
              <span className="utility-icon"><AppIcon name="help" size={15} /></span>
              Help
            </button>
            <button className="utility-item" onClick={() => { setSettingsOpen(true); setMobileSidebarOpen(false); }}>
              <span className="utility-icon"><AppIcon name="settings" size={15} /></span>
              Settings
            </button>
            <button className="utility-item danger" onClick={handleLogout}>
              <span className="utility-icon"><AppIcon name="logout" size={15} /></span>
              Logout
            </button>
          </div>
          {/* Mobile: close sidebar button */}
          <button className="mobile-sidebar-close" onClick={() => setMobileSidebarOpen(false)}><AppIcon name="close" size={14} /> Close</button>
        </div>

        {/* MAIL LIST */}
        <div className={`mail-list ${mobilePanel === 'detail' ? 'mobile-hidden' : ''}`}>
          <div className="mail-list-header">
            <span className="mail-list-title">{titles[currentView] || currentView}</span>
            <div className="mail-list-actions">
              <div className="icon-btn" title="Refresh" onClick={() => { showToast('Syncing with Shelby RPC...', 'info'); refetchBlobs(); refetchIncoming(); refetchTransactions(); }}><AppIcon name="refresh" size={15} /></div>
              <div className={`icon-btn ${listFilter !== 'all' ? 'active' : ''}`} title={`Filter: ${listFilter}`} onClick={cycleListFilter}><AppIcon name="filter" size={15} /></div>
              <div className="icon-btn" title={`Sort: ${sortOrder}`} onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}><AppIcon name="sort" size={15} /></div>
            </div>
          </div>
          <div className="search-box">
            <div className="search-wrap">
              <span className="search-icon"><AppIcon name="search" size={15} /></span>
              <input className="search-input" placeholder="Search by address, subject..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {(listFilter !== 'all' || sortOrder !== 'newest') && (
              <div className="list-controls-summary">
                {listFilter !== 'all' && <span>{listFilter === 'unread' ? 'Unread only' : 'With attachments'}</span>}
                {sortOrder !== 'newest' && <span>Oldest first</span>}
              </div>
            )}
          </div>
          <div className="mail-items">
            {filteredMails.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><AppIcon name={currentListErrorMessage ? 'alert' : currentListLoading ? 'refresh' : 'emptyMail'} size={34} /></div>
                <div style={{ fontWeight: 600, fontSize: 15, color: currentListErrorMessage ? '#b91c1c' : 'var(--text-secondary)' }}>
                  {currentListErrorMessage ? 'Shelby indexer error' : currentListLoading ? 'Syncing mailbox...' : 'No messages yet'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, lineHeight: 1.6 }}>
                  {currentListErrorMessage
                    ? currentListErrorMessage.slice(0, 180)
                    : connected
                      ? currentView === 'sent'
                        ? 'Sent mail will appear here immediately, then sync with Shelby indexer.'
                        : currentRawMailboxCount > 0 || mailboxHasHiddenLocalState || searchQuery || listFilter !== 'all'
                          ? 'Messages exist, but local filters, hidden entries, or failed-content state are hiding them.'
                          : 'Inbox only shows mail sent to this connected wallet address.'
                      : 'Connect your Aptos wallet to get started'}
                </div>
                {connected && !currentListErrorMessage && (currentRawMailboxCount > 0 || mailboxHasHiddenLocalState || searchQuery || listFilter !== 'all') && (
                  <button
                    onClick={handleResetMailboxView}
                    style={{
                      marginTop: 12,
                      padding: '8px 18px',
                      background: '#ffffff',
                      color: 'var(--brand-color)',
                      border: '1px solid rgba(240,64,176,0.28)',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'var(--sans)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reset mailbox view
                  </button>
                )}
                {!connected && (
                  <button
                    onClick={handleConnect}
                    style={{
                      marginTop: 12,
                      padding: '8px 20px',
                      background: 'var(--brand-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'var(--sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(240,64,176,0.35)',
                    }}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            ) : (
              filteredMails.map((m: any) => {
                const [bg, fg] = COLORS[m.color] || COLORS[0]
                return (
                  <div key={m.id} className={`mail-item ${m.unread ? 'unread' : ''} ${selectedMailId === m.id ? 'active' : ''}`} onClick={() => handleOpenMail(m.id as any)}>
                    <div className="mail-item-main">
                      <div className="avatar" style={{ background: bg, color: fg }}>{getAvatarInitial(m)}</div>
                      <div className="mail-item-content">
                        <div className="mail-item-top">
                          <div className="mail-item-from">{m.from}</div>
                          <div className="mail-item-meta-actions">
                            <button
                              className={`mail-star-btn ${m.starred ? 'active' : ''}`}
                              title={m.starred ? 'Remove from Starred' : 'Add to Starred'}
                              onClick={(e) => toggleStarredMail(m, e)}
                            >
                              <AppIcon name="starred" size={13} />
                            </button>
                            <div className="mail-item-time">{m.time}</div>
                          </div>
                        </div>
                        <div className="mail-item-subject">
                          {m.type === 'transaction' ? (
                            <span className={`tx-activity-title tx-tone-${m.txTone || 'default'}`}>{m.subject}</span>
                          ) : (
                            m.subject
                          )}
                        </div>
                        <div className="mail-item-preview">{m.type === 'transaction' ? m.activityDescription || m.preview : m.preview}</div>
                        {m.tags.length > 0 && (
                          <div className="mail-item-tags">
                            {m.pending && <Tag type="pending" />}
                            {m.tags.filter((t: any) => t !== 'pending').slice(0, 3).map((t: any) => (
                              <Tag key={t} type={t} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* MAIL VIEW */}
        <div className={`mail-view ${mobilePanel === 'list' ? 'mobile-hidden' : ''}`}>
          {!selectedMail ? (
            <div className="empty-state" style={{ gap: 0 }}>
              <div className="welcome-logo">
                <AppIcon name="mail" size={30} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>
                AptosBlobs Mail
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7, maxWidth: 320, textAlign: 'center' }}>
                Decentralized mail powered by{' '}
                <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}>Shelby Protocol</span>
                {' '}stored on-chain, finalized on Aptos.
              </div>
              <div className="welcome-features">
                {([
                  { icon: 'blob', label: 'Blobs stored on Shelby Protocol' },
                  { icon: 'transactions', label: 'Finalized on Aptos blockchain' },
                  { icon: 'lock', label: '8+4 erasure-coded encryption' },
                  { icon: 'sent', label: 'Send to any wallet address' },
                ] as const).map(f => (
                  <div key={f.label} className="welcome-feature-item">
                    <span className="welcome-feature-icon"><AppIcon name={f.icon} size={15} /></span>
                    {f.label}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                Stored on Shelby · Finalized on Aptos
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Mobile back button */}
              <button className="mobile-back-btn" onClick={handleMobileBack}>← Back</button>
              <div className="mail-view-header">
                {selectedMail.pending && (
                  <div className="pending-banner">
                    <div className="pending-spinner" />
                    <span>Blob is <b>syncing</b> with Shelby/indexer. Auto-refreshing every 5s...</span>
                    <button className="btn-action" onClick={() => { refetchBlobs(); refetchIncoming(); refetchTransactions(); }}>
                      Refresh
                    </button>
                  </div>
                )}
                <div className="mail-view-subject">
                  {selectedMail.type === 'transaction' ? (
                    <span className={`tx-activity-title tx-activity-title-large tx-tone-${selectedMail.txTone || 'default'}`}>{selectedMail.subject}</span>
                  ) : (
                    realSubjects[selectedMail.id] || selectedMail.subject
                  )}
                </div>
                <div className="mail-view-meta">
                  <div className="mail-meta-left">
                    <div className="avatar-lg" style={{ background: COLORS[selectedMail.color]![0], color: COLORS[selectedMail.color]![1] }}>
                      {getAvatarInitial(selectedMail)}
                    </div>
                    <div className="mail-from-info">
                      <div className="mail-from-name">{selectedMail.from}</div>
                      <div className="mail-from-addr" onClick={() => { navigator.clipboard.writeText(selectedMail.addr); showToast('Address copied', 'success') }}>
                        {selectedMail.addr}
                      </div>
                      <div className="mail-from-date">{formatMailDateTime(selectedMail.timestamp)}</div>
                    </div>
                  </div>
                  <div className="mail-view-actions">
                    {selectedMail.type !== 'transaction' && (
                      <>
                    <button className={`btn-action ${selectedMail.starred ? 'is-starred' : ''}`} onClick={(e) => toggleStarredMail(selectedMail, e)}>
                      <AppIcon name="starred" size={14} />
                      {selectedMail.starred ? 'Starred' : 'Star'}
                    </button>
                    {selectedMail.folder === 'inbox' && (
                      <button className="btn-action" onClick={(e) => toggleReadMail(selectedMail, e)}>
                        <AppIcon name={selectedMail.unread ? 'check' : 'unread'} size={14} />
                        {selectedMail.unread ? 'Mark Read' : 'Mark Unread'}
                      </button>
                    )}
                    {selectedMail.folder === 'inbox' && !selectedMail.pending && (
                      <button
                        className={`btn-action ${hasLocalReadReceipt(selectedMail) ? 'is-starred' : ''}`}
                        onClick={(e) => handleMarkReadOnchain(selectedMail, e)}
                      >
                        <AppIcon name="check" size={14} />
                        {hasLocalReadReceipt(selectedMail) ? 'Receipt On-Chain' : 'Send Receipt'}
                      </button>
                    )}
                    {selectedMail.folder === 'inbox' && (
                      <button className="btn-action" style={{ color: '#b91c1c', borderColor: '#fecaca' }} onClick={(e) => blockSender(selectedMail, e)}>
                        <AppIcon name="blocked" size={14} />
                        Block Sender
                      </button>
                    )}
                    {selectedMail.folder === 'inbox' && !selectedMail.pending && (
                      <button
                        className="btn-action"
                        style={{ color: '#ef0000', borderColor: '#fecaca' }}
                        onClick={(e) => handleReportMail(selectedMail, e)}
                      >
                        <AppIcon name={hasLocalReport(selectedMail) ? 'check' : 'alert'} size={14} />
                        {hasLocalReport(selectedMail) ? 'Reported' : 'Report'}
                      </button>
                    )}
                    {selectedMail.folder === 'blocked' && (
                      <button className="btn-action" onClick={(e) => unblockAddress(selectedMail.addr, e)}>
                        <AppIcon name="check" size={14} />
                        Unblock
                      </button>
                    )}
                    <button className="btn-action" onClick={() => { setComposeTo(selectedMail.addr); setComposeSubject(selectedMail.subject.startsWith('Re:') ? selectedMail.subject : 'Re: ' + selectedMail.subject); setComposeBody(`\n\n> On ${selectedMail.time}, ${selectedMail.from} wrote:\n> ${selectedMail.body.replace(/<[^>]+>/g, '').replace(/\\n/g, '\\n> ')}`); setComposeOpen(true) }}>
                      <AppIcon name="reply" size={14} />
                      Reply
                    </button>
                    <button className="btn-action" onClick={() => { setComposeSubject(selectedMail.subject.startsWith('Fwd:') ? selectedMail.subject : 'Fwd: ' + selectedMail.subject); setComposeBody(`\n\n> Forwarded message from ${selectedMail.from}:\n> ${selectedMail.body.replace(/<[^>]+>/g, '').replace(/\\n/g, '\\n> ')}`); setComposeOpen(true) }}>
                      <AppIcon name="forward" size={14} />
                      Forward
                    </button>
                    <button className="btn-action" style={{ color: '#de385d', borderColor: '#fecdd3' }} disabled={isDeleting} onClick={() => handleDeleteMail(selectedMail)}>
                      <AppIcon name="delete" size={14} />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                      </>
                    )}
                    <button className="btn-action primary" onClick={() => window.open(selectedMail.txHash ? `https://explorer.aptoslabs.com/txn/${selectedMail.txHash}?network=${currentNetwork}` : `https://explorer.aptoslabs.com/account/${account?.address}?network=${currentNetwork}`, '_blank', 'noopener,noreferrer')}>
                      <AppIcon name="explorer" size={14} />
                      Explorer On-Chain
                    </button>
                  </div>
                </div>
              </div>
              <div className="mail-view-body">
                {/* Show decoded body from cache, or loading skeleton, or original body */}
                {blobLoading && selectedMail.id < 0 ? (
                  <div className="blob-pending-skeleton">
                    <div className="skeleton-line" style={{ width: '60%' }} />
                    <div className="skeleton-line" style={{ width: '40%' }} />
                    <div className="skeleton-line" style={{ width: '80%', marginTop: 16 }} />
                    <div className="skeleton-line" style={{ width: '70%' }} />
                    <div className="skeleton-line" style={{ width: '55%' }} />
                    <div className="skeleton-loading-label"><AppIcon name="blob" size={14} /> Fetching blob from Shelby...</div>
                  </div>
                ) : (
                  <div className="mail-content" onClick={handleMailContentClick} dangerouslySetInnerHTML={{ __html: blobBodyCache[selectedMail.id] || selectedMail.body }} />
                )}
                {selectedMail.blobs?.length > 0 && (
                  <details className="storage-blobs-panel">
                    <summary>
                      <span>Storage details</span>
                      <small>{selectedMail.blobs.length} blobs on Shelby</small>
                    </summary>
                    <div id="viewBlobs" className="storage-blobs-list">
                  {selectedMail.blobs.filter((b: any) => {
                    if (selectedMail.private && b.name.includes('-part')) return false;
                    return true;
                  }).map((b: any, idx: any) => (
                    <div
                      className={`blob-info${b.pending ? ' blob-pending' : ''}`}
                      key={idx}
                      style={{ cursor: b.pending ? 'not-allowed' : 'pointer', opacity: b.pending ? 0.6 : 1 }}
                      onClick={() => handleDownloadBlob(
                        selectedMail.from.startsWith('You') ? account?.address?.toString() || selectedMail.addr : selectedMail.addr,
                        b.name,
                        b.pending
                      )}
                    >
                      <div className="blob-icon">
                        <AppIcon name={b.pending ? 'clock' : 'blob'} size={15} />
                      </div>
                      <div className="blob-details">
                        <div className="blob-name" title={b.name}>{b.name}</div>
                        <div className="blob-meta">
                          <span>Size {b.size}</span>
                          <span>Hash {b.hash}</span>
                          <span>Erasure {b.enc}</span>
                        </div>
                      </div>
                      <div className="verify-badge" style={b.pending ? { color: 'var(--brand-purple)', borderColor: 'rgba(96,1,210,0.18)', background: 'rgba(96,1,210,0.06)' } : {}}>
                        {b.pending && <AppIcon name="clock" size={13} />}
                        {!b.pending && blobLoading && b.name.endsWith('.json') && <AppIcon name="clock" size={13} />}
                        {!b.pending && !blobLoading && b.name.endsWith('.json') && <AppIcon name={blobBodyCache[selectedMail.id] ? 'check' : 'eye'} size={13} />}
                        {!b.pending && !b.name.endsWith('.json') && <AppIcon name="download" size={13} />}
                        {b.pending
                          ? 'Pending...'
                          : blobLoading && b.name.endsWith('.json')
                          ? 'Loading...'
                          : b.name.endsWith('.json')
                          ? (blobBodyCache[selectedMail.id] ? 'Loaded' : 'Read Content')
                          : 'Download'}
                      </div>
                    </div>
                  ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-tab ${currentView === 'inbox' ? 'active' : ''}`}
          onClick={() => selectNav('inbox')}
        >
          <span className="mobile-tab-icon"><AppIcon name="inbox" size={18} /></span>
          <span className="mobile-tab-label">Inbox</span>
        </button>
        <button
          className={`mobile-tab ${currentView === 'sent' ? 'active' : ''}`}
          onClick={() => selectNav('sent')}
        >
          <span className="mobile-tab-icon"><AppIcon name="sent" size={18} /></span>
          <span className="mobile-tab-label">Sent</span>
        </button>
        <button
          className="mobile-tab compose-tab"
          onClick={() => setComposeOpen(true)}
        >
          <span className="mobile-tab-icon compose-icon"><AppIcon name="compose" size={18} /></span>
          <span className="mobile-tab-label">Compose</span>
        </button>
        <button
          className={`mobile-tab ${currentView === 'blobs' ? 'active' : ''}`}
          onClick={() => selectNav('blobs')}
        >
          <span className="mobile-tab-icon"><AppIcon name="blob" size={18} /></span>
          <span className="mobile-tab-label">Blob</span>
        </button>
        <button
          className="mobile-tab"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <span className="mobile-tab-icon"><AppIcon name="menu" size={18} /></span>
          <span className="mobile-tab-label">More</span>
        </button>
      </nav>


      {/* COMPOSE OVERLAY */}
      <div className={`compose-overlay ${composeOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && handleCloseCompose()}>
        <div className="compose-panel">
          <div className="compose-header">
            <div className="compose-title">
              <span className="compose-title-icon"><AppIcon name="mail" size={15} /></span>
              <span>New Message</span>
              <span className="compose-badge">Shelby</span>
            </div>
            <div className="close-btn" onClick={handleCloseCompose}><AppIcon name="close" size={16} /></div>
          </div>
          <div className="compose-scroll-content">
            <div className="compose-fields">
              {connected && account && (
                <div className="compose-identity-strip">
                  <span>From</span>
                  <b>{registeredHandle ? formatMailIdentity(registeredHandle, account.address.toString()) : formatAddr(account.address.toString())}</b>
                  <small>{formatAddr(account.address.toString())}</small>
                </div>
              )}
              <div className="compose-field">
                <span className="field-label">To</span>
                <input className="field-input" list="contact-suggestions" placeholder={`name@${MAIL_ID_DOMAIN} or 0x...`} value={composeTo} onChange={e => setComposeTo(e.target.value)} />
                <datalist id="contact-suggestions">
                  {Object.values(contacts)
                    .sort((a, b) => b.lastUsed - a.lastUsed)
                    .map(contact => (
                      <option key={contact.address} value={contact.address} label={contact.label && !contact.label.startsWith('0x') ? `${formatMailIdentity(contact.label, contact.address)} - ${formatAddr(contact.address)}` : formatAddr(contact.address)}>
                        {contact.label && !contact.label.startsWith('0x') ? `${formatMailIdentity(contact.label, contact.address)} - ${formatAddr(contact.address)}` : formatAddr(contact.address)}
                      </option>
                    ))}
                </datalist>
              </div>
              <div className="compose-field">
                <span className="field-label">Subject</span>
                <input className="field-input" placeholder="Subject" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
              </div>
            </div>
            <div className="attached-files">
              {attachedFiles.map((f, i) => (
                <div className="attached-file" key={i}>
                  <AppIcon name="blob" size={14} />
                  <span className="attached-file-name">{f.name}</span>
                  <span className="attached-file-remove" onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}>
                    <AppIcon name="close" size={12} />
                  </span>
                </div>
              ))}
            </div>
            <div className="compose-body-area">
              <textarea className="body-textarea" placeholder="Write your message...&#10;&#10;This message will be stored as a blob on Shelby Protocol and finalized on the Aptos blockchain." value={composeBody} onChange={e => setComposeBody(e.target.value)} />
            </div>
            <div className="send-readiness-panel">
              {[
                { label: 'Recipient', ready: composeRecipientReady, detail: composeRecipientReady ? 'Ready' : 'Add wallet address or handle' },
                { label: 'Subject', ready: composeSubjectReady, detail: composeSubjectReady ? 'Ready' : 'Add a clear subject' },
                { label: 'Wallet', ready: composeWalletReady, detail: composeWalletReady ? currentNetwork : apiKeyMissing ? 'Shelby API key missing' : connected ? `Switch wallet to ${currentNetwork}` : 'Connect wallet' },
                ...(accessMode === 'timelock' ? [{ label: 'Time Lock', ready: timeLockReady, detail: timeLockReady ? formatMailDateTime(timeLockMs) : 'Choose a future unlock time' }] : []),
              ].map(item => (
                <div key={item.label} className={`send-readiness-item ${item.ready ? 'ready' : ''}`}>
                  <span>{item.ready ? <AppIcon name="check" size={12} /> : <AppIcon name="alert" size={12} />}</span>
                  <div>
                    <b>{item.label}</b>
                    <small>{item.detail}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="fee-clarity-panel">
              <div className="fee-clarity-title">
                <AppIcon name="transactions" size={14} />
                Fees before sending
              </div>
              <div className="fee-clarity-grid">
                <div className="fee-clarity-item">
                  <span>Sender gas</span>
                  <b>{accessMode === 'purchasable' || accessMode === 'timelock' ? '2 Aptos tx' : '1 Aptos tx'}</b>
                  <small>{accessMode === 'purchasable' ? 'Upload + paywall registration' : accessMode === 'timelock' ? 'Upload + Time Lock permission' : 'Shelby blob upload'}</small>
                </div>
                <div className="fee-clarity-item">
                  <span>Attachment size</span>
                  <b>{attachedFiles.length ? formatBytes(composeAttachmentBytes) : 'None'}</b>
                  <small>{attachedFiles.length ? `${attachedFiles.length} file${attachedFiles.length === 1 ? '' : 's'} stored as Shelby blobs` : 'No extra blob upload'}</small>
                </div>
                <div className="fee-clarity-item">
                  <span>Receiver unlock</span>
                  <b>{accessMode === 'purchasable' ? `${accessPrice.trim() || '0.1'} ShelbyUSD` : accessMode === 'timelock' ? (timeLockReady ? formatMailDateTime(timeLockMs) : 'Set future time') : 'Free'}</b>
                  <small>{accessMode === 'purchasable' ? 'Receiver also approves unlock gas' : accessMode === 'timelock' ? 'Shelby permission: available after date' : 'Receiver can read without payment'}</small>
                </div>
              </div>
            </div>
          </div>
          {sendBusy && (
            <div className="send-progress-panel">
              {sendSteps.map(step => (
                <div key={step.label} className={`send-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                  <span>{step.done ? <AppIcon name="check" size={12} /> : step.active ? <span className="step-dot" /> : null}</span>
                  {step.label}
                </div>
              ))}
            </div>
          )}
          <div className={`upload-progress ${sendBusy ? 'active' : ''}`}>
            <div className="upload-progress-fill" style={{ width: sendBusy ? '50%' : '0%' }}></div>
          </div>
          <div className="compose-footer">
            <div className="compose-footer-left">
              <label className="btn-action file-upload-btn">
                <input type="file" multiple style={{ display: 'none' }} onChange={e => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files)
                    const total = files.reduce((sum, file) => sum + file.size, 0)
                    if (total >= 5 * MB) {
                      showToast(`Large attachment detected (${formatBytes(total)}). Upload may take longer; keep this tab open.`, 'info')
                    }
                    setAttachedFiles([...attachedFiles, ...files])
                  }
                }} />
                <AppIcon name="attachment" size={14} />
                Attach Blob
              </label>
              <div className="privacy-config-indicator" onClick={() => setAccessControlOpen(true)}>
                {accessMode === 'public' ? (
                  <span className="privacy-status public"><AppIcon name="public" size={13} /> Public</span>
                ) : (
                  <span className="privacy-status private"><AppIcon name="lock" size={13} /> {accessMode.toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="compose-footer-right">
              <button className="btn-action btn-draft" onClick={handleCloseCompose}>Save Draft</button>
              <button className="btn-send" disabled={sendBusy} onClick={handleSend}>
                <AppIcon name="sent" size={15} />
                {composeSendButtonText}
              </button>
            </div>
            {sendBusy && (
              <div className="compose-upload-row">
                <div className="spinner" style={{ display: 'block' }}></div>
                <span>{uploadStatus || 'Uploading to Shelby...'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {draftConfirmOpen && (
        <div className="app-dialog-overlay" onClick={() => setDraftConfirmOpen(false)}>
          <div className="app-dialog" onClick={e => e.stopPropagation()}>
            <div className="app-dialog-icon">✎</div>
            <div className="app-dialog-content">
              <h3>Save draft?</h3>
              <p>Keep this unfinished message in Drafts, or discard it and close compose.</p>
            </div>
            <div className="app-dialog-actions">
              <button className="btn-dialog-secondary" onClick={() => handleDraftDecision(false)}>Discard</button>
              <button className="btn-dialog-primary" onClick={() => handleDraftDecision(true)}>Save Draft</button>
            </div>
          </div>
        </div>
      )}

      {/* ACCESS CONTROL MODAL */}
      <div className={`access-overlay ${accessControlOpen ? 'open' : ''}`} onClick={() => setAccessControlOpen(false)}>
        <div className="access-modal" onClick={e => e.stopPropagation()}>
          <div className="access-body">
            <div className="access-sidebar">
              {[
                { id: 'public', label: 'Public', desc: 'No restrictions' },
                { id: 'allowlist', label: 'Allowlist', desc: 'Specific addresses' },
                { id: 'timelock', label: 'Time Lock', desc: 'Scheduled release' },
                { id: 'purchasable', label: 'Purchasable', desc: 'Requires payment' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  className={`access-tab ${accessMode === opt.id ? 'active' : ''}`}
                  onClick={() => setAccessMode(opt.id as any)}
                >
                  <div className="access-tab-top">
                    <div className="access-radio"></div>
                    <div className="access-tab-label">{opt.label}</div>
                  </div>
                  <div className="access-tab-desc">{opt.desc}</div>
                </button>
              ))}
            </div>
            <div className="access-content">
              {accessMode === 'public' && (
                <>
                  <h2 className="access-title">Public Access</h2>
                  <p className="access-subtitle">Your data can be viewed by anyone on the Shelby Protocol. Ideal for broad content sharing.</p>
                </>
              )}
              {accessMode === 'allowlist' && (
                <>
                  <h2 className="access-title">Allowlist</h2>
                  <p className="access-subtitle">Grant access to specific wallet addresses. Only these users can review your data on Shelby Explorer.</p>
                  
                  <div style={{ padding: '8px 12px', background: 'rgba(96,1,210,0.06)', borderRadius: 8, fontSize: 11, color: 'var(--brand-purple)', marginBottom: 16, border: '1px dashed rgba(96,1,210,0.2)' }}>
                    <b>Tip:</b> The recipient in the "To" field is automatically added to the allowlist.
                  </div>
                  
                  <div className="auto-sync-banner">
                    <div className="auto-sync-info">
                      <span>🔄</span>
                      <span>Sync with Sent Messages history? (Automatically add recipients)</span>
                    </div>
                    <input 
                      type="checkbox" 
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      checked={autoSyncSentHistory}
                      onChange={e => setAutoSyncSentHistory(e.target.checked)}
                    />
                  </div>

                  <div className="access-section-title">
                    <span>Addresses</span>
                    <button className="btn-add-addr" onClick={() => setAllowlistAddrs([...allowlistAddrs, ''])}>
                      + Add Address
                    </button>
                  </div>

                  <div className="addr-list">
                    {allowlistAddrs.map((addr, idx) => (
                      <div className="addr-row" key={idx}>
                        <div className="addr-input-wrap">
                          <input 
                            className="addr-input"
                            placeholder="0x123..."
                            value={addr}
                            onChange={e => {
                              const newAddrs = [...allowlistAddrs]
                              newAddrs[idx] = e.target.value
                              setAllowlistAddrs(newAddrs)
                            }}
                          />
                        </div>
                        {allowlistAddrs.length > 1 && (
                          <button className="btn-remove-addr" onClick={() => setAllowlistAddrs(allowlistAddrs.filter((_, i) => i !== idx))}>
                            <AppIcon name="delete" size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {accessMode === 'timelock' && (
                <>
                  <h2 className="access-title">Time Lock</h2>
                  <p className="access-subtitle">Restrict mail display until a specific date and time. The mail is stored as a private Shelby blob, then released by the dapp after the unlock time.</p>
                  <div style={{ marginTop: 20 }}>
                    <input
                      type="datetime-local"
                      className="addr-input"
                      value={timeLockUntil}
                      min={toLocalDatetimeInputValue(new Date())}
                      onChange={e => setTimeLockUntil(e.target.value)}
                    />
                    <div className="fee-note">
                      Unlocks at <b>{timeLockReady ? formatMailDateTime(timeLockMs) : 'choose a future time'}</b>. Sender approves a second transaction to register Shelby Time Lock permission.
                    </div>
                  </div>
                </>
              )}
              {accessMode === 'purchasable' && (
                <>
                  <h2 className="access-title">Purchasable</h2>
                  <p className="access-subtitle">Monetize your on-chain data. Users must pay a fee in ShelbyUSD to unlock and review content.</p>
                  <div className="fee-note">
                    <b>Cost flow:</b> sender approves upload gas and a second paywall registration transaction. Receiver pays ShelbyUSD plus unlock gas when opening the mail.
                  </div>
                  <div className="addr-input-wrap" style={{ marginTop: 20 }}>
                    <input
                      className="addr-input"
                      placeholder="Price in ShelbyUSD (e.g., 0.1)"
                      value={accessPrice}
                      onChange={e => setAccessPrice(e.target.value)}
                    />
                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: '#666' }}>ShelbyUSD</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="access-footer">
            <button className="btn-access-cancel" onClick={() => setAccessControlOpen(false)}>Cancel</button>
            <button className="btn-access-save" onClick={() => { 
              showToast(`Access updated: ${accessMode.toUpperCase()}`, 'success'); 
              setAccessControlOpen(false); 
            }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast?.type}`}>
            {toast?.msg}
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewBlob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { if(previewBlob) URL.revokeObjectURL(previewBlob.url); setPreviewBlob(null) }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 'min(400px, 92vw)', maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5', paddingBottom: 14 }}>
              <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: 16, fontWeight: 700 }}>{previewBlob?.name}</h3>
              <button style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 8, color: '#666', cursor: 'pointer', fontSize: 18, lineHeight: 1, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { if(previewBlob) URL.revokeObjectURL(previewBlob.url); setPreviewBlob(null) }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              {previewBlob?.type === 'image' && <img src={previewBlob?.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 8 }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid #e5e5e5' }}>
              <button className="btn-action" onClick={() => { if(previewBlob) URL.revokeObjectURL(previewBlob.url); setPreviewBlob(null) }}>Close</button>
              <button className="btn-action primary" onClick={() => {
                if(!previewBlob) return;
                const a = document.createElement('a')
                a.href = previewBlob.url
                a.download = previewBlob.name.split('/').pop() || 'file_download'
                a.click()
              }}><AppIcon name="download" size={14} /> Download File</button>
            </div>
          </div>
        </div>
      )}

      {helpOpen && (
        <div className="app-dialog-overlay" onClick={() => setHelpOpen(false)}>
          <div className="support-modal" onClick={e => e.stopPropagation()}>
            <div className="support-modal-header">
              <div className="support-modal-title">
                <span className="support-title-icon"><AppIcon name="help" size={16} /></span>
                Help
              </div>
              <button className="support-close" onClick={() => setHelpOpen(false)}><AppIcon name="close" size={16} /></button>
            </div>
            <div className="support-modal-body">
              <section className="support-section">
                <h3>Paid Mail</h3>
                <p>Purchasable mail needs two sender approvals: Shelby blob upload, then Shelby paywall registration. The receiver pays ShelbyUSD to unlock the registered mail blob.</p>
              </section>
              <section className="support-section">
                <h3>When Pay Does Not Open</h3>
                <p>Check that the sender approved <b>access_control::register_blobs_v2</b>. If only the upload transaction exists, the paywall card can appear but purchase cannot run.</p>
              </section>
              <section className="support-section">
                <h3>Storage Details</h3>
                <p>Mail usually stores at least one <b>mail.json</b> blob. Attachments are extra Shelby blobs and are opened after the mail is unlocked.</p>
              </section>
              <section className="support-section">
                <h3>Network</h3>
                <p>Use Shelbynet for ShelbyUSD paid mail. Testnet mode is useful for basic blob and app testing.</p>
              </section>
              <section className="support-section">
                <h3>Gas and Fees</h3>
                <p>Sending mail uses Aptos gas for the Shelby blob transaction. Purchasable mail asks the sender to approve a second paywall transaction. Receivers pay the ShelbyUSD price and unlock gas only when they click Pay to unlock.</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="app-dialog-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="support-modal settings-modal" onClick={e => e.stopPropagation()}>
            <div className="support-modal-header">
              <div className="support-modal-title">
                <span className="support-title-icon"><AppIcon name="settings" size={16} /></span>
                Settings
              </div>
              <button className="support-close" onClick={() => setSettingsOpen(false)}><AppIcon name="close" size={16} /></button>
            </div>
            <div className="support-modal-body">
              <section className="support-section">
                <h3>Account</h3>
                {connected && account ? (
                  <div className="settings-account-card">
                    <div className="settings-account-avatar">{(registeredHandle || account.address.toString()).replace(/^@/, '').slice(0, 1).toUpperCase()}</div>
                    <div className="settings-account-main">
                      <strong>{registeredHandle ? formatMailIdentity(registeredHandle, account.address.toString()) : 'Connected Wallet'}</strong>
                      <button onClick={() => { navigator.clipboard.writeText(account.address.toString()); showToast('Address copied', 'success'); }}>
                        {formatAddr(account.address.toString())}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="settings-connect-btn" onClick={handleConnect}>
                    {isPetraApp ? 'Connect Petra' : 'Connect Wallet'}
                  </button>
                )}
                {connected && account && (
                  <div className="settings-handle-row">
                    {registeredHandle && !isEditingHandle ? (
                      <>
                        <button
                          type="button"
                          className="settings-handle-badge"
                          onClick={() => { navigator.clipboard.writeText(formatMailIdentity(registeredHandle, account.address.toString())); showToast('Mail identity copied', 'success'); }}
                        >
                          {formatMailIdentity(registeredHandle, account.address.toString())}
                        </button>
                        <button
                          className="settings-handle-secondary"
                          onClick={() => {
                            setNewHandleInput(registeredHandle)
                            setIsEditingHandle(true)
                          }}
                        >
                          Change
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          placeholder="Choose a username..."
                          value={newHandleInput}
                          onChange={e => setNewHandleInput(e.target.value)}
                        />
                        <button onClick={handleRegisterHandle}>{registeredHandle ? 'Save' : 'Register'}</button>
                        {registeredHandle && (
                          <button
                            className="settings-handle-secondary"
                            onClick={() => {
                              setIsEditingHandle(false)
                              setNewHandleInput('')
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>
              <section className="support-section">
                <h3>Network</h3>
                <div className="settings-segment">
                  {(['shelbynet', 'testnet'] as const).map(net => (
                    <button
                      key={net}
                      className={currentNetwork === net ? 'active' : ''}
                      onClick={() => handleNetworkSwitch(net)}
                    >
                      {net === 'shelbynet' ? 'Shelbynet' : 'Testnet'}
                    </button>
                  ))}
                </div>
              </section>
              <section className="support-section">
                <h3>Default Access</h3>
                <div className="settings-segment wrap">
                  {(['public', 'allowlist', 'timelock', 'purchasable'] as const).map(mode => (
                    <button
                      key={mode}
                      className={accessMode === mode ? 'active' : ''}
                      onClick={() => setAccessMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </section>
              <section className="support-section">
                <h3>Paid Mail Price</h3>
                <div className="settings-field">
                  <input value={accessPrice} onChange={e => setAccessPrice(e.target.value)} />
                  <span>ShelbyUSD</span>
                </div>
              </section>
              <section className="support-section">
                <h3>Time Lock Release</h3>
                <div className="settings-field">
                  <input
                    type="datetime-local"
                    value={timeLockUntil}
                    min={toLocalDatetimeInputValue(new Date())}
                    onChange={e => setTimeLockUntil(e.target.value)}
                  />
                  <span>{timeLockReady ? 'Ready' : 'Future time'}</span>
                </div>
              </section>
              <section className="support-section">
                <h3>Mailbox View</h3>
                <div className="settings-actions">
                  <button onClick={handleResetMailboxView}>Reset Current View</button>
                  <button onClick={handleClearLocalMailboxState}>Clear Local View State</button>
                </div>
              </section>
              {connected && (
                <section className="support-section">
                  <button className="settings-logout-btn" onClick={handleLogout}>
                    <AppIcon name="logout" size={15} />
                    Logout
                  </button>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {isProfileOpen && (
        <div className={`compose-overlay ${isProfileOpen ? 'open' : ''}`} onClick={() => setIsProfileOpen(false)}>
          <div className="compose-modal" onClick={e => e.stopPropagation()} style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 'min(360px, 92vw)',
            bottom: 'auto',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div className="compose-header" style={{ background: 'linear-gradient(135deg, var(--brand-color-dark) 0%, var(--brand-color) 100%)', color: 'white' }}>
              <span style={{ fontWeight: 700 }}>Account Settings</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }} onClick={() => setIsProfileOpen(false)}><AppIcon name="close" size={18} /></button>
            </div>
            <div className="compose-body" style={{ gap: '20px', background: '#fff', padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Username Handle</label>
                {registeredHandle ? (
                  <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #eee' }}>
                    <span style={{ fontSize: '20px' }}>🆔</span>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#333' }}>{registeredHandle}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      className="compose-input" 
                      placeholder="Choose a username..." 
                      value={newHandleInput}
                      onChange={e => setNewHandleInput(e.target.value)}
                      style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 8, fontSize: '14px' }}
                    />
                    <button className="btn-send" onClick={handleRegisterHandle} style={{ padding: '8px 16px' }}>Register</button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              </div>


              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                  onClick={() => { disconnect(); setIsProfileOpen(false); }}
                  style={{ padding: '10px 24px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
