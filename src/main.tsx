import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// PRODUCTION CLEANUP: Strip all console noise in final distribution
if (import.meta.env.PROD) {
  const noop = () => {}
  console.log = noop; console.debug = noop; console.info = noop;
  console.warn = noop; console.error = noop;
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider autoConnect={true}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
)
