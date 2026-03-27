import React, { useState, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs, useAccountBlobs, useDeleteBlobs } from '@shelby-protocol/react'
import { ShelbyClient } from '@shelby-protocol/sdk/browser'
import { AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { MOCK_MAILS, COLORS, Mail } from './data'

const API_KEY = import.meta.env.VITE_SHELBY_API_KEY || '' // Wajib diisi di .env lalu restart terminal

const aptosConfig = new AptosConfig({
  network: Network.TESTNET,
  clientConfig: {
    API_KEY: API_KEY
  }
})

const shelbyClient = new ShelbyClient({ 
  network: Network.TESTNET,
  apiKey: API_KEY,
  rpc: { apiKey: API_KEY },
  indexer: { apiKey: API_KEY },
  aptos: aptosConfig
})

export default function App() {
  const { connected, account, connect, disconnect, signAndSubmitTransaction, wallets } = useWallet()
  const { mutateAsync: uploadBlobs, isPending } = useUploadBlobs({ client: shelbyClient })
  const { mutateAsync: deleteBlobs, isPending: isDeleting } = useDeleteBlobs({ client: shelbyClient })
  const { data: onchainBlobs, isLoading: isBlobsLoading, refetch: refetchBlobs } = useAccountBlobs({ 
    client: shelbyClient, 
    account: account?.address?.toString() || '0x0000000000000000000000000000000000000000000000000000000000000001', 
    pagination: { limit: 50 }
  })
  
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null)
  
  const [mails, setMails] = useState<Mail[]>(() => {
    const saved = localStorage.getItem('aptosblobs_cache')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return MOCK_MAILS
  })

  useEffect(() => {
    localStorage.setItem('aptosblobs_cache', JSON.stringify(mails))
  }, [mails])
  const [filteredMails, setFilteredMails] = useState<Mail[]>(MOCK_MAILS)
  const [currentView, setCurrentView] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null)
  
  const [composeOpen, setComposeOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  
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
      const targetWallet = wallets?.find(w => w.name === 'Petra') || wallets?.[0]
      if (targetWallet) {
        connect(targetWallet.name)
      } else {
        showToast('Aptos wallet not found. Please install Petra or Martian.', 'error')
      }
    }
  }

  useEffect(() => {
    let list = [...mails]
    
    // Merge onchain blobs into the inbox view
    if (onchainBlobs && onchainBlobs.length > 0) {
      const mappedBlobs: Mail[] = onchainBlobs.map((b, i) => {
        const hexHash = b.blobMerkleRoot ? Array.from(b.blobMerkleRoot).map(byte => byte.toString(16).padStart(2, '0')).join('') : 'Unknown';
        return {
          id: -i - 1, // Negarif agar tidak bertumpuk
          unread: false,
          from: 'Shelby Network',
          addr: account?.address?.toString() || '0x',
          subject: b.blobNameSuffix || 'Unnamed Blob',
          preview: `Commitment Hash: 0x${hexHash.slice(0, 16)}...`,
          time: new Date((b.creationMicros / 1000) || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          tags: ['shelby', 'blobs'],
          body: `<p>This original payload (Blob) is permanently stored on the decentralized Shelby Protocol Testnet.</p>`,
          blobs: [{
            name: b.blobNameSuffix || 'blob',
            size: (b.size / 1024).toFixed(1) + ' KB',
            hash: '0x' + hexHash,
            enc: '8+4'
          }],
          color: i % COLORS.length
        }
      })
      
      // Jika di inbox atau di folder on-chain Blobs, tampilkan blob asli
      if (currentView === 'inbox' || currentView === 'blobs') {
        const existingNames = new Set(list.map(m => m.subject)) // Hindari duplikasi jika ada email buatan lokal dengan nama sama
        list = [...mappedBlobs.filter(mb => !existingNames.has(mb.subject)), ...list]
      }
    }

    if (currentView === 'sent') {
      list = mails.filter(m => m.from.startsWith('You →'))
    } else if (currentView === 'drafts') {
      list = []
    } else if (currentView !== 'inbox') {
      list = mails.filter(m => m.tags.includes(currentView))
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
    setFilteredMails(list)
  }, [currentView, mails, searchQuery])

  const selectNav = (view: string) => {
    setCurrentView(view)
    setSelectedMailId(null)
  }
  
  const handleOpenMail = (id: number) => {
    setSelectedMailId(id)
    setMails(mails.map(m => m.id === id ? { ...m, unread: false } : m))
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
      
      const formattedBlobs = [
        { blobName: 'mail.json', blobData: payloadData }
      ]
      
      for (const file of attachedFiles) {
        const arrayBuf = await file.arrayBuffer()
        formattedBlobs.push({ blobName: file.name, blobData: new Uint8Array(arrayBuf) })
      }
      
      const signer = {
        account,
        signAndSubmitTransaction
      }

      await uploadBlobs({
        signer: signer as any,
        blobs: formattedBlobs,
        expirationMicros: Date.now() * 1000 + 86400 * 1000000,
        options: { }
      })

      showToast('✓ Message sent via Aptos & Shelby!', 'success')
      setComposeOpen(false)
      
      const newMail: Mail = {
        id: Date.now(), unread: false,
        from: 'You → ' + (composeTo.length > 12 ? composeTo.slice(0,8)+'...'+composeTo.slice(-4) : composeTo),
        addr: composeTo,
        subject: composeSubject,
        preview: composeBody.slice(0,80) + (composeBody.length > 80 ? '...' : ''),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        tags: ['shelby','aptos'],
        body: composeBody.split('\n').filter(Boolean).map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join(''),
        blobs: attachedFiles.map(f => ({ name: f.name, size: (f.size/1024).toFixed(1)+' KB', hash: '0x'+Math.random().toString(16).slice(2,10)+'...'+Math.random().toString(16).slice(2,6), enc: '8+4' })),
        color: Math.floor(Math.random()*COLORS.length)
      }
      setMails([newMail, ...mails])
      setComposeTo(''); setComposeSubject(''); setComposeBody(''); setAttachedFiles([])
      localStorage.removeItem('aptosblobs_draft')
    } catch (e: any) {
      const errMsg = e instanceof Error ? e.message : String(e);
      showToast('Error sending message: ' + errMsg, 'error')
    }
  }

  const handleDownloadBlob = async (addr: string, blobName: string) => {
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

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = blobName.split('/').pop() || 'downloaded_blob'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Download complete', 'success')
    } catch (e: any) {
      showToast(`Download failed: ${e.message}`, 'error')
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
            blobNames: [m.subject]
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

  const selectedMail = filteredMails.find(m => m.id === selectedMailId)
  const titles: Record<string, string> = { inbox:'Inbox', sent:'Sent', drafts:'Drafts', starred:'Starred', blobs:'Blobs', transactions:'Transactions', defi:'DeFi', dao:'DAO', nft:'NFT' }

  return (
    <>
      <div className="topbar">
        <div className="logo">
          <div className="logo-icon">✉</div>
          AptosBlobs<span className="logo-tag">MAIL</span>
        </div>
        <div className="network-info">
          <div className="separator"></div>
          <div className="chain-badge" onClick={() => showToast('Switched network', 'info')}>
            <div className="chain-dot"></div>
            <span>Aptos Testnet</span>
          </div>
          <div className="shelby-badge">
            ⬡ Shelby v0.3
          </div>
        </div>
        <div className="topbar-right">
          <button className={`btn-connect ${connected ? 'connected' : ''}`} onClick={handleConnect}>
            {connected && account ? `${account.address.toString().substring(0,6)}...${account.address.toString().substring(account.address.toString().length-4)}` : 'Connect Petra Wallet'}
          </button>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stat-item ok">
          <div className="dot"></div>
          Aptos RPC <span className="stat-val">12ms</span>
        </div>
        <div className="separator"></div>
        <div className="stat-item ok">
          <div className="dot"></div>
          Shelby RPC <span className="stat-val">28ms</span>
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

      {/* LAYOUT */}
      <div className="layout">
        
        {/* SIDEBAR */}
        <div className="sidebar">
          <button className="btn-compose" onClick={() => setComposeOpen(true)}>
            New Message
          </button>
          <button className="btn-compose" style={{ background: 'var(--bg2)', color: 'var(--text2)', marginTop: 8 }} onClick={loadDraft}>
            Load Draft
          </button>

          <div className="nav-section">
            <div className="nav-label">Mailbox</div>
            <div className={`nav-item ${currentView === 'inbox' ? 'active' : ''}`} onClick={() => selectNav('inbox')}>
              <div className="nav-item-left"><span className="nav-icon">📥</span> Inbox</div>
              <span className="nav-count">3</span>
            </div>
            <div className={`nav-item ${currentView === 'sent' ? 'active' : ''}`} onClick={() => selectNav('sent')}>
              <div className="nav-item-left"><span className="nav-icon">📤</span> Sent</div>
            </div>
            <div className={`nav-item ${currentView === 'drafts' ? 'active' : ''}`} onClick={() => selectNav('drafts')}>
              <div className="nav-item-left"><span className="nav-icon">📋</span> Drafts</div>
              <span className="nav-count" style={{ background: 'var(--text3)' }}>1</span>
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
              <div className="nav-item-left"><span className="nav-icon" style={{ color: '#00d4aa' }}>●</span> DeFi</div>
            </div>
            <div className={`nav-item ${currentView === 'dao' ? 'active' : ''}`} onClick={() => selectNav('dao')}>
              <div className="nav-item-left"><span className="nav-icon" style={{ color: '#f59e0b' }}>●</span> DAO</div>
            </div>
            <div className={`nav-item ${currentView === 'nft' ? 'active' : ''}`} onClick={() => selectNav('nft')}>
              <div className="nav-item-left"><span className="nav-icon" style={{ color: '#8b5cf6' }}>●</span> NFT</div>
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
        </div>

        {/* MAIL LIST */}
        <div className="mail-list">
          <div className="mail-list-header">
            <span className="mail-list-title">{titles[currentView] || currentView}</span>
            <div className="mail-list-actions">
              <div className="icon-btn" title="Refresh" onClick={() => showToast('↻ Syncing with Shelby RPC...', 'info')}>↻</div>
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
              <div className="empty-state"><div className="empty-icon">📭</div><div>No messages</div></div>
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
                            {m.tags.map(t => (
                              <span key={t} className={`tag tag-${t}`}>
                                {t === 'shelby' ? '⬡ Shelby' : t === 'aptos' ? '⬡ Aptos' : '🔒 Enc'}
                              </span>
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
        <div className="mail-view">
          {!selectedMail ? (
            <div className="empty-state">
              <div className="empty-icon">✉</div>
              <div>Select a message to read</div>
              <div style={{ fontSize: 10, marginTop: 4, color: 'var(--text3)' }}>Stored on Shelby · Settled on Aptos</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="mail-view-header">
                <div className="mail-view-subject">{selectedMail.subject}</div>
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
                    <button className="btn-action" onClick={() => { setComposeTo(selectedMail.addr); setComposeSubject('Re: ' + selectedMail.subject); setComposeOpen(true) }}>↩ Reply</button>
                    <button className="btn-action" onClick={() => { setComposeSubject('Fwd: ' + selectedMail.subject); setComposeOpen(true) }}>↪ Forward</button>
                    <button className="btn-action" style={{ color: '#ef4444' }} disabled={isDeleting} onClick={() => handleDeleteMail(selectedMail)}>🗑 {isDeleting ? 'Deleting...' : 'Delete'}</button>
                    <button className="btn-action primary" onClick={() => window.open(`https://explorer.aptoslabs.com/account/${account?.address}?network=testnet`, '_blank')}>⛓ On-Chain Explorer</button>
                  </div>
                </div>
              </div>
              <div className="mail-view-body">
                <div className="mail-content" dangerouslySetInnerHTML={{ __html: selectedMail.body }} />
                <div id="viewBlobs">
                  {selectedMail.blobs.map((b, idx) => (
                    <div className="blob-info" key={idx} style={{ cursor: 'pointer' }} onClick={() => handleDownloadBlob(selectedMail.addr, b.name)}>
                      <div className="blob-icon">⬡</div>
                      <div className="blob-details">
                        <div className="blob-name">{b.name}</div>
                        <div className="blob-meta">
                          <span>📦 {b.size}</span>
                          <span>🔗 {b.hash}</span>
                          <span>⚙ Erasure {b.enc}</span>
                        </div>
                      </div>
                      <div className="verify-badge">{b.name.endsWith('.json') ? '👁 Read Body' : '⬇ Download'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </>
  )
}
