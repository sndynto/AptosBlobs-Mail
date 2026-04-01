import React, { useState, useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs, useAccountBlobs, useDeleteBlobs } from '@shelby-protocol/react'
import { useQuery } from '@tanstack/react-query'
import { ShelbyClient } from '@shelby-protocol/sdk/browser'
import { AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk'
import { COLORS, Mail } from './data'

const API_KEY_SHELBYNET = import.meta.env.VITE_SHELBY_API_KEY_SHELBYNET || ''
const API_KEY_TESTNET = import.meta.env.VITE_SHELBY_API_KEY_TESTNET || ''

export default function App() {
  const [currentNetwork, setCurrentNetwork] = useState<any>('testnet') // shelbynet, testnet
  
  const key = currentNetwork === 'shelbynet' ? API_KEY_SHELBYNET : API_KEY_TESTNET
  const noKey = !key || key.startsWith('masukkan_api_key')
  const envVar = currentNetwork === 'shelbynet' ? 'VITE_SHELBY_API_KEY_SHELBYNET' : 'VITE_SHELBY_API_KEY_TESTNET'

  return (
    <>
      {noKey && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#fffbeb', borderBottom: '1px solid #fde68a',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#92400e',
        }}>
          <span>⚠️</span>
          <span>
            <b>{envVar}</b> not found for {currentNetwork}.
            Check your <code style={{background:'#fef3c7',padding:'1px 6px',borderRadius:4,border:'1px solid #fde68a'}}>.env</code> file.
            <a href="https://geomi.dev" target="_blank" rel="noreferrer" style={{color:'#6001D2', fontWeight:600, marginLeft: 8}}>Get Key →</a>
          </span>
        </div>
      )}
      <MailApp key={currentNetwork} currentNetwork={currentNetwork} setCurrentNetwork={setCurrentNetwork} apiKey={key} />
    </>
  )
}

// -------------------------------------------------------------------------
//  Utilities & Formatting
// -------------------------------------------------------------------------
const formatAddr = (addr: string) => {
  if (!addr || addr === '0x') return 'Unknown'
  const clean = addr.replace(/^to_/, '').split('_')[0]
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`
}

// Helper to normalize address to 64-hex canonical form (0x + 64 chars)
const normalizeAddr = (addr: string) => {
  try {
    if (!addr || addr === '0x') return addr;
    let clean = addr.trim().toLowerCase();
    // Strip common prefixes like 'to_0x...' or internal routing labels
    clean = clean.replace(/^to_/, '').split('_')[0];
    if (!clean.startsWith('0x')) clean = '0x' + clean;
    // Ensure 64-character canonical form for Shelby Indexer
    return AccountAddress.from(clean).toString();
  } catch (e) {
    // If it fails, strip known prefix anyway but return as is
    return addr.replace(/^to_/, '').split('_')[0].toLowerCase().trim();
  }
}

const getTags = (subject: string, isPending: boolean, hasAttachments: boolean) => {
  let tags = ['shelby', 'blobs']
  const lower = subject.toLowerCase()
  if (lower.includes('swap') || lower.includes('yield') || lower.includes('defi')) tags.push('defi')
  if (lower.includes('vote') || lower.includes('proposal') || lower.includes('dao')) tags.push('dao')
  if (lower.includes('mint') || lower.includes('collection') || lower.includes('nft')) tags.push('nft')
  if (isPending) tags.push('pending')
  return tags
}

const TAG_ICONS: Record<string, string> = {
  shelby: '⬡', aptos: '⬡', blobs: '⬡', blob: '⬡',
  nft: '🖼', defi: '💱', dao: '🏛', attachment: '📎',
  pending: '⏳', starred: '⭐'
}

const TAG_LABELS: Record<string, string> = {
  shelby: 'Shelby', aptos: 'Aptos', blobs: 'Blob',
  nft: 'NFT', defi: 'DeFi', dao: 'DAO', attachment: 'Attach',
  pending: 'Pending', starred: 'Starred'
}

const Tag = ({ type }: { type: string }) => (
  <span className={`tag tag-${type}`}>
    {TAG_ICONS[type] || ''} {TAG_LABELS[type] || type}
  </span>
)

function MailApp({ currentNetwork, setCurrentNetwork, apiKey }: any) {
  const { aptosConfig, shelbyClient } = useMemo(() => {
    // Shelbynet runs on Aptos Testnet, others use their direct names
    const mappedNet = currentNetwork === 'shelbynet' ? Network.TESTNET : currentNetwork;
    const shelbyNet = currentNetwork === 'shelbynet' ? 'shelbynet' : currentNetwork;
    
    const aptos = new AptosConfig({
      network: mappedNet
    })
    
    // Official endpoints based on SDK constants (testnet/shelbynet)
    const indexerUrl = currentNetwork === 'shelbynet' 
      ? 'https://api.shelbynet.aptoslabs.com/nocode/v1/public/alias/shelby/shelbynet/v1/graphql'
      : 'https://api.testnet.aptoslabs.com/nocode/v1/public/alias/shelby/testnet/v1/graphql';
    
    const rpcUrl = currentNetwork === 'shelbynet'
      ? 'https://api.shelbynet.shelby.xyz/shelby'
      : 'https://api.testnet.shelby.xyz/shelby';

    const client = new ShelbyClient({
      network: shelbyNet as any,
      aptos: aptos,
      indexer: { apiKey: apiKey, baseUrl: indexerUrl },
      rpc: { apiKey: apiKey, baseUrl: rpcUrl }
    })
    
    return { aptosConfig: aptos, shelbyClient: client }
  }, [currentNetwork, apiKey])

  const { connected, account, connect, disconnect, signAndSubmitTransaction, wallets, changeNetwork, network: walletNetwork } = useWallet()
  const { mutateAsync: uploadBlobs, isPending } = useUploadBlobs({ client: shelbyClient })
  const { mutateAsync: deleteBlobs, isPending: isDeleting } = useDeleteBlobs({ client: shelbyClient })
  const { data: onchainBlobs, isLoading: isBlobsLoading, refetch: refetchBlobs } = useAccountBlobs({ 
    client: shelbyClient, 
    account: normalizeAddr(account?.address?.toString() || '0x0000000000000000000000000000000000000000000000000000000000000001'), 
    pagination: { limit: 100 }
  })
  
  // Custom fetch for incoming blobs destined to our address
  const myAddress = account?.address?.toString()?.toLowerCase();
  const { data: incomingBlobs, refetch: refetchIncoming } = useQuery({
    queryKey: ['incomingBlobs', 'testnet', myAddress],
    queryFn: async () => {
      if (!myAddress) return [];
      
      // We search for both normalized (canonical 64-char) and likely short forms
      // Some wallets or users might use 'to_0x1...' instead of full 'to_0x00000...1...'
      const normalizedMyAddr = normalizeAddr(myAddress);
      // Short form: removing leading zeros after 0x if any, or just using input if raw
      const shortAddr = myAddress.startsWith('0x') ? '0x' + myAddress.substring(2).replace(/^0+/, '') : myAddress;

      try {
        if (import.meta.env.DEV) console.log(`Fetching inbox for: ${normalizedMyAddr} (${shortAddr})`);
        
        const res = await shelbyClient.coordination.getBlobs({
          where: {
            _or: [
              { blob_name: { _ilike: `%to_${normalizedMyAddr}%` } },
              { blob_name: { _ilike: `%to_${shortAddr}%` } }
            ]
          },
          pagination: { limit: 100 }
        });
        
        if (import.meta.env.DEV) console.log("Incoming blobs count:", res?.length || 0);
        return res;
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed fetching incoming blobs:", err);
        return [];
      }
    },
    enabled: !!myAddress && !!shelbyClient,
    refetchInterval: 10000
  })

  // Network validation logic
  const isWrongNetwork = useMemo(() => {
    if (!connected || !walletNetwork) return false;
    // Both Shelbynet and Testnet modes in this app expect the wallet to be on Testnet
    const currentWalletNet = (walletNetwork.name || '').toLowerCase();
    // Broaden matching for different wallet name formats (e.g., 'Aptos Testnet', 'testnet')
    return !currentWalletNet.includes('testnet');
  }, [connected, walletNetwork]);

  const [hiddenMailIds, setHiddenMailIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`aptosblobs_hidden_${currentNetwork}`)
    try { return saved ? JSON.parse(saved) : [] } catch (e) { return [] }
  })

  useEffect(() => {
    localStorage.setItem(`aptosblobs_hidden_${currentNetwork}`, JSON.stringify(hiddenMailIds))
  }, [hiddenMailIds, currentNetwork])

  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null)
  
  const cacheKey = `aptosblobs_cache_${currentNetwork}`
  const [mails, setMails] = useState<Mail[]>(() => {
    let saved = localStorage.getItem(cacheKey)
    if (!saved || saved === '[]') {
      const oldCache = localStorage.getItem('aptosblobs_cache')
      if (oldCache && oldCache !== '[]') {
        saved = oldCache;
        localStorage.setItem(cacheKey, oldCache);
      }
    }
    
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(mails))
  }, [mails, cacheKey])
  const [filteredMails, setFilteredMails] = useState<Mail[]>([])
  const [currentView, setCurrentView] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null)
  
  // Mobile-specific state
  const [mobilePanel, setMobilePanel] = useState<'list' | 'detail'>('list')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [composeOpen, setComposeOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [previewBlob, setPreviewBlob] = useState<{ url: string, name: string, type: 'image' | 'unknown' } | null>(null)

  // Auto-fetch blob content state
  const [blobLoading, setBlobLoading] = useState(false)
  const [blobBodyCache, setBlobBodyCache] = useState<Record<number, string>>({})
  const [realSubjects, setRealSubjects] = useState<Record<number, string>>({})

  const [aptosPing, setAptosPing] = useState('--')
  const [shelbyPing, setShelbyPing] = useState('--')

  // Deteksi apakah user membuka via Petra mobile dApp browser
  const isPetraApp = typeof window !== 'undefined' && !!(window as any).aptos

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const ping = async () => {
      try {
        const mappedNet = currentNetwork === 'shelbynet' ? 'testnet' : currentNetwork
        const aptosNode = currentNetwork === 'shelbynet'
          ? 'https://api.shelbynet.shelby.xyz/v1'
          : `https://api.${mappedNet}.aptoslabs.com/v1`
        const startAptos = Date.now()
        await fetch(aptosNode, { method: 'HEAD', mode: 'no-cors' }).catch(() => null)
        setAptosPing(String(Date.now() - startAptos))
        
        const startShelby = Date.now()
        await fetch(currentNetwork === 'shelbynet' ? 'https://api.shelbynet.shelby.xyz/v1' : 'https://api.testnet.shelby.xyz/v1', { method: 'HEAD', mode: 'no-cors' }).catch(() => null)
        setShelbyPing(String(Date.now() - startShelby))
      } catch (e) {}
    }
    ping()
    const interval = setInterval(ping, 10000)
    return () => clearInterval(interval)
  }, [currentNetwork])

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
    const hasPending = onchainBlobs.some((b: any) => {
      const st = ((b as any).status || '').toLowerCase()
      return !b.blobMerkleRoot
        || b.blobMerkleRoot.every((byte: number) => byte === 0)
        || st === 'pending' || st === 'processing' || st === 'unconfirmed'
    })
    if (!hasPending) return
    const timer = setInterval(() => refetchBlobs(), 5000)
    return () => clearInterval(timer)
  }, [onchainBlobs])

  // Auto-save drafts
  useEffect(() => {
    if (composeTo || composeSubject || composeBody) {
      const timer = setTimeout(() => {
        localStorage.setItem('aptosblobs_draft', JSON.stringify({ composeTo, composeSubject, composeBody }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [composeTo, composeSubject, composeBody])

  const loadDraft = () => {
    const draft = JSON.parse(localStorage.getItem('aptosblobs_draft') || '{}')
    if (draft.composeSubject || draft.composeBody || draft.composeTo) {
      setComposeTo(draft.composeTo || '')
      setComposeSubject(draft.composeSubject || '')
      setComposeBody(draft.composeBody || '')
      setComposeOpen(true)
      showToast('Draft restored', 'success')
    } else {
      showToast('No saved drafts found', 'info')
    }
  }

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleConnect = () => {
    if (connected) {
      disconnect()
      showToast('Wallet disconnected', 'info')
    } else {
      // Di Petra mobile dApp browser, wallet inject otomatis sebagai window.aptos
      if (isPetraApp) {
        const petraWallet = wallets?.find(w => w.name === 'Petra')
        if (petraWallet) {
          connect(petraWallet.name)
          return
        }
      }
      // Di browser biasa: cari Petra dulu, fallback ke wallet pertama
      const targetWallet = wallets?.find(w => w.name === 'Petra') || wallets?.[0]
      if (targetWallet) {
        connect(targetWallet.name)
      } else {
        // Mobile: arahkan ke Petra deep link atau halaman download
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isMobile) {
          showToast('Open this dApp in Petra Wallet app browser', 'info')
          // Deep link ke Petra mobile
          window.open('https://petra.app', '_blank')
        } else {
          showToast('Aptos wallet not found. Please install Petra or Martian.', 'error')
        }
      }
    }
  }

  useEffect(() => {
    // Universal Filter: Only use mock/local messages if wallet is NOT connected
    const baseMails = connected ? [] : [...mails]
    let list = [...baseMails]
    
    // Merge onchain blobs into the inbox view — grouped by send operation (same timestamp in name)
    if (incomingBlobs && incomingBlobs.length > 0) {
      // Helper: extract group key = "to_<addr>_<timestamp>" from blob name
      const getGroupKey = (rawName: string) => {
        let name = rawName
        if (name.startsWith('@')) name = name.split('/').slice(1).join('/')
        // format: to_<addr>_<ts>-<filename>
        const match = name.match(/^(to_[^_]+_\d+)/i)
        return match ? match[1] : name
      }

      // Group all blobs by their send-operation key
      const groups = new Map<string, typeof incomingBlobs>()
      for (const b of incomingBlobs) {
        let rawName = (b as any).blobNameSuffix || b.name || ''
        const key = getGroupKey(rawName)
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(b)
      }

      const mappedBlobs: Mail[] = Array.from(groups.entries()).map(([groupKey, blobs], i) => {
        // Sort: .json first so it becomes the primary blob
        blobs.sort((a: any, b: any) => {
          const aJson = (a.blobNameSuffix || a.name || '').endsWith('.json')
          const bJson = (b.blobNameSuffix || b.name || '').endsWith('.json')
          return aJson === bJson ? 0 : aJson ? -1 : 1
        })
        const primary = blobs[0] as any
        const isPending = !primary.blobMerkleRoot || primary.blobMerkleRoot.every((byte: number) => byte === 0)
        const senderAddr = (primary.owner || primary.account || primary.creator || '').toString() || 'Unknown Sender'
        const tsMs = (primary.creationMicros ? Math.floor(primary.creationMicros / 1000) : 0) || Date.now()

        // Extract subject from .json blob name suffix: to_<addr>_<ts>-<subject>.json
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
          const bPending = !b.blobMerkleRoot || (b.blobMerkleRoot as number[]).every((byte: number) => byte === 0)
          return {
            name: bn,
            size: ((b.size || 0) / 1024).toFixed(1) + ' KB',
            hash: bPending ? '⏳ Pending...' : '0x' + hexHash,
            enc: '8+4',
            pending: bPending
          }
        })

        const hasAttachments = blobs.length > 1
        return {
          id: -2000 - i,
          unread: isPending,
          pending: isPending,
          from: `From: ${formatAddr(senderAddr)}`,
          addr: senderAddr,
          subject,
          preview: isPending
            ? '🕐 Awaiting confirmation...'
            : hasAttachments
              ? `📎 ${blobs.length - 1} attachment(s) · ${formatAddr(senderAddr)}`
              : `From ${formatAddr(senderAddr)}`,
          time: new Date(tsMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: tsMs,
          tags: sTags,
          body: isPending
            ? `<p>⏳ This message is <b>pending on-chain confirmation</b>.</p>`
            : `<p>Loading message body...</p>`,
          blobs: blobItems,
          color: (i + 1) % COLORS.length
        }
      })

      if (currentView === 'inbox') {
        const existingKeys = new Set(list.map(m => m.subject))
        list = [...mappedBlobs.filter(mb => !existingKeys.has(mb.subject)), ...list]
      }
    }
    
    // Blobs list (all raw)
    if (currentView === 'blobs' && onchainBlobs && onchainBlobs.length > 0) {
      const mappedBlobs: Mail[] = onchainBlobs.map((b, i) => {
        const hexHash = b.blobMerkleRoot ? Array.from(b.blobMerkleRoot).map((byte: number) => byte.toString(16).padStart(2, '0')).join('') : ''
        let bName = (b as any).blobNameSuffix || b.name || '';
        if (bName.startsWith('@')) {
          bName = bName.split('/').slice(1).join('/');
        }
        const tsMs = ((b as any).creationMicros ? Math.floor((b as any).creationMicros / 1000) : 0) || Date.now()
        return {
          id: -100 - i,
          unread: false, pending: false, from: 'Raw Blob',
          addr: account?.address?.toString() || '0x',
          subject: bName || 'Unnamed Blob',
          preview: `Raw Blob Hash...`,
          time: new Date(tsMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: tsMs,
          tags: ['blobs'],
          body: `<p>Raw on-chain Blob data.</p>`,
          blobs: [{ name: bName || 'blob', size: 'Unknown', hash: '0x' + hexHash, enc: '8+4', pending: false }], color: 0
        }
      })
      list = [...mappedBlobs, ...list]
    }

    if (currentView === 'sent') {
      // Sent view: group blobs by timestamp prefix (same send operation)
      if (onchainBlobs && onchainBlobs.length > 0) {
        const getSentGroupKey = (b: any) => {
          const rawName = b.blobNameSuffix || b.name || ''
          const ts = b.creationMicros || 0
          const owner = b.owner || b.account || ''
          
          let name = rawName
          if (name.startsWith('@')) name = name.split('/').slice(1).join('/')
          
          const match = name.match(/^(to_[^_]+_\d+)/i)
          if (match) return `prefix_${match[1]}`
          
          if (ts) return `ts_${Math.floor(Number(ts)/1000000)}_${owner}`
          return name
        }
        const sentGroups = new Map<string, typeof onchainBlobs>()
        for (const b of onchainBlobs) {
          const key = getSentGroupKey(b)
          if (!sentGroups.has(key)) sentGroups.set(key, [])
          sentGroups.get(key)!.push(b)
        }
        list = Array.from(sentGroups.entries()).map(([groupKey, blobs], i) => {
          blobs.sort((a: any, b: any) => {
            const aJson = (a.blobNameSuffix || a.name || '').endsWith('.json')
            const bJson = (b.blobNameSuffix || b.name || '').endsWith('.json')
            return aJson === bJson ? 0 : aJson ? -1 : 1
          })
          const primary = blobs[0] as any
          const blobStatus = (primary.status || '').toLowerCase()
          const isPending = !primary.blobMerkleRoot
            || (primary.blobMerkleRoot as number[]).every((byte: number) => byte === 0)
            || blobStatus === 'pending' || blobStatus === 'processing' || blobStatus === 'unconfirmed'
          const tsMs = (primary.creationMicros ? Math.floor(primary.creationMicros / 1000) : 0) || Date.now()

          let subject = groupKey.replace(/^prefix_to_[^_]+_\d+-?/, '').replace(/^prefix_/, '').replace(/^ts_\d+_/, '')
          const jsonBlob = blobs.find((b: any) => (b.blobNameSuffix || b.name || '').endsWith('.json')) as any
          if (jsonBlob) {
            const rawN = jsonBlob.blobNameSuffix || jsonBlob.name || ''
            // Enhanced cleanup: remove to_0x..._timestamp- from the start
            const cleaner = rawN.replace(/^to_[^_]+_\d+-?/, '').replace(/\.json$/, '')
            if (cleaner) subject = cleaner
          }

          const sTags = getTags(subject, isPending, blobs.length > 1)

          const blobItems = blobs.map((b: any) => {
            let bn = b.blobNameSuffix || b.name || ''
            if (bn.startsWith('@')) bn = bn.split('/').slice(1).join('/')
            const hexHash = b.blobMerkleRoot ? Array.from(b.blobMerkleRoot as number[]).map((byte: number) => byte.toString(16).padStart(2, '0')).join('') : ''
            const bPending = !b.blobMerkleRoot || (b.blobMerkleRoot as number[]).every((byte: number) => byte === 0)
              || (b.status || '').toLowerCase() === 'pending'
            return {
              name: bn,
              size: ((b.size || 0) / 1024).toFixed(1) + ' KB',
              hash: bPending ? '⏳ Pending...' : '0x' + hexHash,
              enc: '8+4',
              pending: bPending
            }
          })

          return {
            id: -1000 - i,
            unread: isPending,
            pending: isPending,
            from: 'You (sent)',
            addr: account?.address?.toString() || '0x',
            subject,
            preview: isPending
              ? '🕐 Awaiting on-chain confirmation...'
              : blobs.length > 1
                ? `📎 ${blobs.length - 1} attachment(s) · Sent`
                : `On-chain message · Sent`,
            time: new Date(tsMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: tsMs,
            tags: sTags,
            body: isPending
              ? `<p>⏳ This message is <b>pending on-chain confirmation</b>.</p><p>Shelby Protocol is committing your data to Aptos. Usually takes 10–30 seconds.</p>`
              : `<p>Loading message body...</p>`,
            blobs: blobItems,
            color: i % COLORS.length
          }
        })
      } else {
        list = []
      }
    } else if (currentView === 'drafts') {
      list = []
    } else if (currentView !== 'inbox') {
      list = baseMails.filter(m => m.tags.includes(currentView))
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(m => 
        m.from.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.addr.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
      )
    }

    // Final Sort: terbaru paling atas (Strict timestamp first)
    list = [...list].sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0))
    setFilteredMails(list)
  }, [currentView, mails, searchQuery, onchainBlobs, incomingBlobs, account])

  // Auto-fetch blob content when an on-chain mail is selected
  useEffect(() => {
    if (selectedMailId === null) return
    if (selectedMailId >= 0) return // only on-chain blobs have negative IDs
    if (blobBodyCache[selectedMailId]) return // already fetched

    const mail = filteredMails.find(m => m.id === selectedMailId)
    if (!mail) return

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
        const text = await data.text()
        
        let decodedBody = ''
        try {
          const parsed = JSON.parse(text)
          if (parsed.subject) {
            setRealSubjects(prev => ({ ...prev, [selectedMailId]: parsed.subject }))
          }
          const pureAddr = ownerAddr.replace('to_', '').split('_')[0]
          decodedBody = `
            <div class="decoded-mail">
              <div class="mail-header-info">
                <p><b>From:</b> <code>${pureAddr}</code></p>
                <p><b>To:</b> <code>${parsed.to || 'Unknown'}</code></p>
                <p><b>Subject:</b> ${parsed.subject || 'No Subject'}</p>
              </div>
              <hr/>
              <div class="mail-text-body">${(parsed.body || '').replace(/\n/g, '<br/>')}</div>
            </div>
          `
        } catch (jsonErr) {
          // Fallback if not valid JSON mail format
          decodedBody = `<div class="raw-blob-view"><h3>Raw Blob Data</h3><pre>${text.slice(0, 1000)}${text.length > 1000 ? '...' : ''}</pre></div>`
        }
        
        setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: decodedBody }))
      } catch (e: any) {
        if (import.meta.env.DEV) console.error("Fetch blob error:", e)
        const errMsg = e?.message || String(e)
        setBlobBodyCache(prev => ({ ...prev, [selectedMailId]: `<div class="fetch-error">⚠️ <b>Failed to fetch message body:</b> ${errMsg}<br/><button onclick="window.location.reload()" style="margin-top:10px; cursor:pointer; padding:4px 12px; background:var(--brand-color); color:white; border:none; border-radius:4px; font-size:11px;">Retry Sync</button></div>` }))
      } finally {
        setBlobLoading(false)
      }
    }

    fetchBlobBody()
  }, [selectedMailId, filteredMails])

  const selectNav = (view: string) => {
    setCurrentView(view)
    setSelectedMailId(null)
    setMobilePanel('list')
    setMobileSidebarOpen(false)
  }
  
  const handleOpenMail = (id: number) => {
    setSelectedMailId(id)
    setMobilePanel('detail') // Di mobile: switch ke panel detail
    // Only update unread for local mails (positive ids)
    if (id > 0) {
      setMails(mails.map(m => m.id === id ? { ...m, unread: false } : m))
    }
  }

  const handleMobileBack = () => {
    setMobilePanel('list')
    setSelectedMailId(null)
  }

  const handleSend = async () => {
    if (!composeTo) return showToast('Enter recipient', 'error')
    if (!composeSubject) return showToast('Enter subject', 'error')
    if (!connected || !account) return showToast('Connect wallet first', 'error')

    try {
      showToast('Preparing upload via Shelby...', 'info')
      
      const payloadString = JSON.stringify({ to: composeTo, subject: composeSubject, body: composeBody })
      const textEncoder = new TextEncoder()
      const payloadData = textEncoder.encode(payloadString)
      
      const timestamp = Date.now()
      const safeComposeTo = normalizeAddr(composeTo)
      
      const formattedBlobs = [
        { blobName: `to_${safeComposeTo}_${timestamp}-mail.json`, blobData: payloadData }
      ]
      
      for (const file of attachedFiles) {
        const arrayBuf = await file.arrayBuffer()
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        formattedBlobs.push({ blobName: `to_${safeComposeTo}_${timestamp}-${safeName}`, blobData: new Uint8Array(arrayBuf) })
      }
      
      // Per docs: signer must use account.accountAddress (AccountAddress), not account object
      // Per wallet adapter docs: AccountInfo.address is the AccountAddress
      const signer = {
        account: account.address,
        signAndSubmitTransaction
      }

      await uploadBlobs({
        signer: signer as any,
        blobs: formattedBlobs,
        expirationMicros: Date.now() * 1000 + 86400000000, // 1 day in microseconds per docs
      })
      
      // Sending native Aptos notification transfer logic: Option 2
      showToast('Shelby Upload complete! Sending native Aptos notification...', 'info');
      try {
        await signAndSubmitTransaction({
          data: {
            function: "0x1::aptos_account::transfer",
            typeArguments: [],
            functionArguments: [composeTo, "100"], // Send 100 Octa ping
          } as any
        });
        showToast('✓ Message sent & recipient notified on-chain!', 'success')
      } catch (e: any) {
        showToast('✓ Message stored on Shelby, but notification tx skipped.', 'info')
      }

      setComposeOpen(false)
      
      setComposeTo(''); setComposeSubject(''); setComposeBody(''); setAttachedFiles([])
      localStorage.removeItem('aptosblobs_draft')
      
      // Wait for Aptos indexer to process the transaction before fetching
      setTimeout(() => refetchBlobs(), 8000)
      setTimeout(() => refetchBlobs(), 20000) // retry again after 20s
    } catch (e: any) {
      const errMsg = e instanceof Error ? e.message : String(e)
      if (errMsg.includes('Transaction not found')) {
        showToast('Transaction submitted! Waiting for on-chain confirmation...', 'info')
        setTimeout(() => refetchBlobs(), 15000)
      } else {
        showToast('Error sending message: ' + errMsg, 'error')
      }
    }
  }

  const handleDownloadBlob = async (addr: string, blobName: string, isPending?: boolean) => {
    // Guard: jangan download blob yang masih pending
    if (isPending) {
      showToast('⏳ Blob is still pending confirmation. Please wait...', 'info')
      return
    }
    try {
      showToast(`Downloading ${blobName}...`, 'info')
      const blob = await shelbyClient.download({ account: addr as any, blobName })
      const response = new Response(blob.readable)
      const data = await response.blob()
      
      // Jika file berupa mail.json, kita parse isinya dan perbarui UI selectedMail
      if (blobName.endsWith('.json')) {
        const text = await data.text()
        try {
           const parsed = JSON.parse(text)
           setMails(prev => prev.map(m => m.id === selectedMailId ? { ...m, body: `<p><b>Sender:</b> ${addr}</p><p><b>To:</b> ${parsed.to}</p><p><b>Subject:</b> ${parsed.subject}</p><hr/>${parsed.body.replace(/\\n/g, '<br/>')}` } : m))
           showToast('Message body decoded successfully!', 'success')
           return
        } catch(e) {}
      }

      if (blobName.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
        const url = URL.createObjectURL(data)
        setPreviewBlob({ url, name: blobName, type: 'image' })
        showToast('Previewing image...', 'success')
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
        showToast('⏳ Blob syncing to download nodes. Retrying in 5s...', 'info')
        setTimeout(() => handleDownloadBlob(addr, blobName), 5000)
      } else {
        showToast(`Download failed: ${errMsg}`, 'error')
      }
    }
  }

  const handleDeleteMail = async (m: Mail) => {
    if (m.id < 0) {
      // Blob On-chain
      if (!connected) return showToast('Please connect your wallet to delete on-chain blobs!', 'error')
      try {
         showToast('Requesting deletion from Shelby...', 'info')
         await deleteBlobs({
            signer: { account: account!, signAndSubmitTransaction },
            blobNames: [m.blobs?.[0]?.name || m.subject]
         })
         showToast('Blob deleted successfully from Shelby!', 'success')
         refetchBlobs()
         setSelectedMailId(null)
      } catch (e: any) {
         showToast(`Failed to delete blob: ${e.message}`, 'error')
      }
    } else {
      // Cache lokal
      setMails(mails.filter(mail => mail.id !== m.id))
      setSelectedMailId(null)
      showToast('Deleted from local cache', 'success')
    }
  }

  const handleToggleStar = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setMails(mails.map(m => m.id === id ? { ...m, tags: m.tags.includes('starred') ? m.tags.filter(t => t !== 'starred') : [...m.tags, 'starred'] } : m))
  }

  // Derive context for the currently selected message
  const selectedMail = filteredMails.find(m => m.id === selectedMailId)
  
  // Display titles for different navigation views
  const titles: Record<string, string> = { 
    inbox: 'Inbox', 
    sent: 'Sent Messages', 
    drafts: 'Drafts', 
    starred: 'Starred', 
    blobs: 'On-Chain Blobs', 
    transactions: 'Recent Activity', 
    defi: 'DeFi Hub', 
    dao: 'Governance', 
    nft: 'Collectibles' 
  }

  return (
    <div ref={mainRef} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="topbar">
        {/* Mobile: hamburger menu */}
        <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <div className="logo">
          <div className="logo-icon">✉</div>
          AptosBlobs<span className="logo-tag">MAIL</span>
        </div>
        <div className="network-info">
          <div className="separator"></div>
          <div className="chain-badge" onClick={async () => {
            const nets = ['shelbynet', 'testnet']
            const next = nets[(nets.indexOf(currentNetwork) + 1) % nets.length]
            setCurrentNetwork(next)
            if (changeNetwork) {
              try {
                const targetNet = Network.TESTNET;
                const currentWalletNet = (walletNetwork?.name || '').toLowerCase();
                if (!currentWalletNet.includes('testnet')) {
                  await changeNetwork(targetNet as any);
                }
              } catch (e) {
                if (import.meta.env.DEV) console.warn("Wallet changeNetwork failed", e)
              }
            }
            showToast(`Switched UI to ${next}`, 'info')
          }}>
            <div className="chain-dot" style={{ background: isWrongNetwork ? '#ef4444' : '#10b981' }}></div>
            <span>Aptos {String(currentNetwork)}</span>
          </div>
        </div>
        <div className="topbar-right">
          <button className={`btn-connect ${connected ? 'connected' : ''}`} onClick={handleConnect}>
            {connected && account
              ? `${account.address.toString().substring(0,6)}...${account.address.toString().substring(account.address.toString().length-4)}`
              : isPetraApp ? 'Connect Petra' : 'Connect Wallet'
            }
          </button>
        </div>
      </div>

      {isWrongNetwork && (
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
          <span>You are connected to the wrong network, the application may not work as expected. Please switch to <b>testnet</b>.</span>
          <button 
            onClick={async () => {
              if (changeNetwork) {
                try {
                  const target = Network.TESTNET;
                  await changeNetwork(target as any);
                } catch (e) {
                  showToast(`Please switch to Aptos Testnet manually in your wallet`, 'error');
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
            Switch to Testnet
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
            New Message
          </button>
          <button className="btn-compose" style={{ marginTop: 4 }} onClick={loadDraft}>
            Load Draft
          </button>

          <div className="nav-section">
            <div className="nav-label">Mailbox</div>
            <div className={`nav-item ${currentView === 'inbox' ? 'active' : ''}`} onClick={() => selectNav('inbox')}>
              <div className="nav-item-left"><span className="nav-icon">📥</span> Inbox</div>
              <span className="nav-count">{onchainBlobs?.length ?? 0}</span>
            </div>
            <div className={`nav-item ${currentView === 'sent' ? 'active' : ''}`} onClick={() => selectNav('sent')}>
              <div className="nav-item-left"><span className="nav-icon">📤</span> Sent</div>
            </div>
            <div className={`nav-item ${currentView === 'drafts' ? 'active' : ''}`} onClick={() => selectNav('drafts')}>
              <div className="nav-item-left"><span className="nav-icon">📋</span> Drafts</div>
              <span className="nav-count" style={{ background: 'rgba(255,255,255,0.15)' }}>1</span>
            </div>
            <div className={`nav-item ${currentView === 'starred' ? 'active' : ''}`} onClick={() => selectNav('starred')}>
              <div className="nav-item-left"><span className="nav-icon">⭐</span> Starred</div>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">On-Chain</div>
            <div className={`nav-item ${currentView === 'blobs' ? 'active' : ''}`} onClick={() => selectNav('blobs')}>
              <div className="nav-item-left"><span className="nav-icon">⬡</span> Blobs</div>
            </div>
            <div className={`nav-item ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => selectNav('transactions')}>
              <div className="nav-item-left"><span className="nav-icon">⛓</span> Transactions</div>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Labels</div>
            <div className={`nav-item ${currentView === 'defi' ? 'active' : ''}`} onClick={() => selectNav('defi')}>
              <div className="nav-item-left"><span className="nav-icon" style={{ color: '#6ee7b7' }}>●</span> DeFi</div>
            </div>
            <div className={`nav-item ${currentView === 'dao' ? 'active' : ''}`} onClick={() => selectNav('dao')}>
              <div className="nav-item-left"><span className="nav-icon" style={{ color: '#fcd34d' }}>●</span> DAO</div>
            </div>
            <div className={`nav-item ${currentView === 'nft' ? 'active' : ''}`} onClick={() => selectNav('nft')}>
              <div className="nav-item-left"><span className="nav-icon" style={{ color: '#c4b5fd' }}>●</span> NFT</div>
            </div>
          </div>

          <div className="sidebar-storage">
            <div className="storage-label">Shelby Storage</div>
            <div className="storage-bar">
              <div className="storage-fill" style={{ width: `${Math.min((onchainBlobs?.reduce((a,b)=>a+b.size,0)||0) / (100 * 1024 * 1024) * 100, 100)}%` }}></div>
            </div>
            <div className="storage-info">
              <span>{((onchainBlobs?.reduce((a,b)=>a+b.size,0)||0) / (1024 * 1024)).toFixed(2)} MB used</span>
              <span>100 MB</span>
            </div>
          </div>
          {/* Mobile: close sidebar button */}
          <button className="mobile-sidebar-close" onClick={() => setMobileSidebarOpen(false)}>✕ Close</button>
        </div>

        {/* MAIL LIST */}
        <div className={`mail-list ${mobilePanel === 'detail' ? 'mobile-hidden' : ''}`}>
          <div className="mail-list-header">
            <span className="mail-list-title">{titles[currentView] || currentView}</span>
            <div className="mail-list-actions">
              <div className="icon-btn" title="Refresh" onClick={() => { showToast('↻ Syncing with Shelby RPC...', 'info'); refetchBlobs(); }}>↻</div>
              <div className="icon-btn" title="Filter">⚡</div>
              <div className="icon-btn" title="Sort">↕</div>
            </div>
          </div>
          <div className="search-box">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search by address, subject..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="mail-items">
            {filteredMails.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-secondary)' }}>No messages yet</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, lineHeight: 1.6 }}>
                  {connected
                    ? 'Connect wallet and send blobs to see messages here'
                    : 'Connect your Aptos wallet to get started'}
                </div>
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
              filteredMails.map(m => {
                const [bg, fg] = COLORS[m.color] || COLORS[0]
                return (
                  <div key={m.id} className={`mail-item ${m.unread ? 'unread' : ''} ${selectedMailId === m.id ? 'active' : ''}`} onClick={() => handleOpenMail(m.id)}>
                    <div className="mail-item-main">
                      <div className="avatar" style={{ background: bg, color: fg }}>{m.from[0]}</div>
                      <div className="mail-item-content">
                        <div className="mail-item-top">
                          <div className="mail-item-from">{m.from}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span onClick={(e) => handleToggleStar(e, m.id)} style={{ cursor: 'pointer', color: m.tags.includes('starred') ? '#f59e0b' : 'var(--text3)' }}>★</span>
                            <div className="mail-item-time">{m.time}</div>
                          </div>
                        </div>
                        <div className="mail-item-subject">{m.subject}</div>
                        <div className="mail-item-preview">{m.preview}</div>
                        {m.tags.length > 0 && (
                          <div className="mail-item-tags">
                            {m.pending && <Tag type="pending" />}
                            {m.tags.filter(t => t !== 'pending').slice(0, 3).map(t => (
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
              <div style={{
                width: 72, height: 72,
                background: 'linear-gradient(135deg, var(--brand-color) 0%, var(--brand-color-light) 100%)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 20,
                boxShadow: '0 8px 28px rgba(240,64,176,0.35)',
                animation: 'pulse 3s ease-in-out infinite',
              }}>✉️</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>
                AptosBlobs Mail
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7, maxWidth: 320, textAlign: 'center' }}>
                Decentralized email powered by{' '}
                <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}>Shelby Protocol</span>
                {' '}— stored on-chain, settles on Aptos.
              </div>
              <div className="welcome-features">
                {[
                  { icon: '⬡', label: 'Blobs stored on Shelby Protocol' },
                  { icon: '⛓', label: 'Settled on Aptos blockchain' },
                  { icon: '🔒', label: 'Erasure-coded 8+4 encryption' },
                  { icon: '📬', label: 'Send to any wallet address' },
                ].map(f => (
                  <div key={f.label} className="welcome-feature-item">
                    <span className="welcome-feature-icon">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                Stored on Shelby · Settled on Aptos
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
                    <span>Blob is <b>Pending</b> — awaiting on-chain confirmation. Auto-refreshing every 5s...</span>
                  </div>
                )}
                <div className="mail-view-subject">{realSubjects[selectedMail.id] || selectedMail.subject}</div>
                <div className="mail-view-meta">
                  <div className="mail-meta-left">
                    <div className="avatar-lg" style={{ background: COLORS[selectedMail.color]![0], color: COLORS[selectedMail.color]![1] }}>
                      {selectedMail.from[0]}
                    </div>
                    <div className="mail-from-info">
                      <div className="mail-from-name">{selectedMail.from}</div>
                      <div className="mail-from-addr" onClick={() => { navigator.clipboard.writeText(selectedMail.addr); showToast('Address copied', 'success') }}>
                        {selectedMail.addr}
                      </div>
                    </div>
                  </div>
                  <div className="mail-view-actions">
                    <button className="btn-action" onClick={() => { setComposeTo(selectedMail.addr); setComposeSubject(selectedMail.subject.startsWith('Re:') ? selectedMail.subject : 'Re: ' + selectedMail.subject); setComposeBody(`\n\n> On ${selectedMail.time}, ${selectedMail.from} wrote:\n> ${selectedMail.body.replace(/<[^>]+>/g, '').replace(/\\n/g, '\\n> ')}`); setComposeOpen(true) }}>↩ Reply</button>
                    <button className="btn-action" onClick={() => { setComposeSubject(selectedMail.subject.startsWith('Fwd:') ? selectedMail.subject : 'Fwd: ' + selectedMail.subject); setComposeBody(`\n\n> Forwarded message from ${selectedMail.from}:\n> ${selectedMail.body.replace(/<[^>]+>/g, '').replace(/\\n/g, '\\n> ')}`); setComposeOpen(true) }}>↪ Forward</button>
                    <button className="btn-action" style={{ color: '#de385d', borderColor: '#fecdd3' }} disabled={isDeleting} onClick={() => handleDeleteMail(selectedMail)}>🗑 {isDeleting ? 'Deleting...' : 'Delete'}</button>
                    <button className="btn-action primary" onClick={() => window.open(`https://explorer.aptoslabs.com/account/${account?.address}?network=${currentNetwork === 'shelbynet' ? 'testnet' : currentNetwork}`, '_blank')}>⛓ On-Chain Explorer</button>
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
                    <div className="skeleton-loading-label">⬡ Fetching blob from Shelby...</div>
                  </div>
                ) : (
                  <div className="mail-content" dangerouslySetInnerHTML={{ __html: blobBodyCache[selectedMail.id] || selectedMail.body }} />
                )}
                <div id="viewBlobs">
                  {selectedMail.blobs.map((b, idx) => (
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
                      <div className="blob-icon">{b.pending ? '⏳' : '⬡'}</div>
                      <div className="blob-details">
                        <div className="blob-name">{b.name}</div>
                        <div className="blob-meta">
                          <span>📦 {b.size}</span>
                          <span>🔗 {b.hash}</span>
                          <span>⚙ Erasure {b.enc}</span>
                        </div>
                      </div>
                      <div className="verify-badge" style={b.pending ? { color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' } : {}}>
                        {b.pending
                          ? '⏳ Pending...'
                          : blobLoading && b.name.endsWith('.json')
                          ? '⏳ Loading...'
                          : b.name.endsWith('.json')
                          ? (blobBodyCache[selectedMail.id] ? '✓ Loaded' : '👁 Read Body')
                          : '⬇ Download'}
                      </div>
                    </div>
                  ))}
                </div>
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
          <span className="mobile-tab-icon">📥</span>
          <span className="mobile-tab-label">Inbox</span>
        </button>
        <button
          className={`mobile-tab ${currentView === 'sent' ? 'active' : ''}`}
          onClick={() => selectNav('sent')}
        >
          <span className="mobile-tab-icon">📤</span>
          <span className="mobile-tab-label">Sent</span>
        </button>
        <button
          className="mobile-tab compose-tab"
          onClick={() => setComposeOpen(true)}
        >
          <span className="mobile-tab-icon compose-icon">✏️</span>
          <span className="mobile-tab-label">Compose</span>
        </button>
        <button
          className={`mobile-tab ${currentView === 'blobs' ? 'active' : ''}`}
          onClick={() => selectNav('blobs')}
        >
          <span className="mobile-tab-icon">⬡</span>
          <span className="mobile-tab-label">Blobs</span>
        </button>
        <button
          className="mobile-tab"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <span className="mobile-tab-icon">☰</span>
          <span className="mobile-tab-label">More</span>
        </button>
      </nav>

      {/* STATS BAR (Dev only - moved to bottom) */}
      {import.meta.env.DEV && (
        <div className="stats-bar" style={{ borderTop: '1px solid #f0e8f5', borderBottom: 'none' }}>
          <div className="stat-item ok">
            <div className="dot"></div>
            Aptos RPC <span className="stat-val">{aptosPing}ms</span>
          </div>
          <div className="separator"></div>
          <div className="stat-item ok">
            <div className="dot"></div>
            Shelby RPC <span className="stat-val">{shelbyPing}ms</span>
          </div>
          <div className="separator"></div>
          <div className="stat-item warn">
            <div className="dot" style={{ background: 'var(--shelby)' }}></div>
            Storage Providers <span className="stat-val">7 active</span>
          </div>
          <div className="separator"></div>
          <div className="stat-item ok">
            <div className="dot"></div>
            Erasure Coding <span className="stat-val">8+4</span>
          </div>
        </div>
      )}

      {/* COMPOSE OVERLAY */}
      <div className={`compose-overlay ${composeOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setComposeOpen(false)}>
        <div className="compose-panel">
          <div className="compose-header">
            <div className="compose-title">
              New Message
              <span className="compose-badge">via Shelby</span>
            </div>
            <div className="close-btn" onClick={() => setComposeOpen(false)}>✕</div>
          </div>
          <div className="compose-fields">
            <div className="compose-field">
              <span className="field-label">To</span>
              <input className="field-input" placeholder="0x... (Aptos address)" value={composeTo} onChange={e => setComposeTo(e.target.value)} />
            </div>
            <div className="compose-field">
              <span className="field-label">Subject</span>
              <input className="field-input" placeholder="Subject" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
            </div>
          </div>
          <div className="attached-files">
            {attachedFiles.map((f, i) => (
              <div className="attached-file" key={i}>
                ⬡ {f.name} <span className="attached-file-remove" onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}>✕</span>
              </div>
            ))}
          </div>
          <div className="compose-body-area">
            <textarea className="body-textarea" placeholder="Write your message...&#10;&#10;This message will be stored as a blob on Shelby Protocol and settled on the Aptos blockchain." value={composeBody} onChange={e => setComposeBody(e.target.value)} />
          </div>
          <div className={`upload-progress ${isPending ? 'active' : ''}`}>
            <div className="upload-progress-fill" style={{ width: isPending ? '50%' : '0%' }}></div>
          </div>
          <div className="compose-footer">
            <div className="compose-footer-left">
              <label className="file-upload-btn">
                <input type="file" multiple style={{ display: 'none' }} onChange={e => {
                  if (e.target.files) setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)])
                }} />
                ⬡ Attach Blob
              </label>
              {isPending && (
                <div className="upload-status">
                  <div className="spinner" style={{ display: 'block' }}></div>
                  <span>Uploading to Shelby...</span>
                </div>
              )}
            </div>
            <button className="btn-send" disabled={isPending} onClick={handleSend}>
              {isPending ? '➤ Sending...' : '➤ Send via Aptos'}
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewBlob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { URL.revokeObjectURL(previewBlob.url); setPreviewBlob(null) }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: '90vw', maxHeight: '90vh', minWidth: 400, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5', paddingBottom: 14 }}>
              <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: 16, fontWeight: 700 }}>{previewBlob.name}</h3>
              <button style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 8, color: '#666', cursor: 'pointer', fontSize: 18, lineHeight: 1, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { URL.revokeObjectURL(previewBlob.url); setPreviewBlob(null) }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              {previewBlob.type === 'image' && <img src={previewBlob.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 8 }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid #e5e5e5' }}>
              <button className="btn-action" onClick={() => { URL.revokeObjectURL(previewBlob.url); setPreviewBlob(null) }}>Close</button>
              <button className="btn-action primary" onClick={() => {
                const a = document.createElement('a')
                a.href = previewBlob.url
                a.download = previewBlob.name.split('/').pop() || 'download_file'
                a.click()
              }}>⬇ Download File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
