import { defineChain, createPublicClient, http, parseAbi } from 'viem'

export const aevum = defineChain({
  id: 44005,
  name: 'QDay Aevum Testnet',
  nativeCurrency: { name: 'Test QDAY', symbol: 'tQDAY', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_AEVUM_RPC_URL || 'https://invalid.example'] } },
  testnet: true
})
export const tokenAddress = (import.meta.env.VITE_TUSD8_ADDRESS || '0x456569838f1d43009A91ebA4263147Afd7233483') as `0x${string}`
export const escrowAddress = (import.meta.env.VITE_ESCROW_ADDRESS || '') as `0x${string}`
export const erc20Abi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)'
])
export const escrowAbi = parseAbi([
  'function fund(address,uint256,uint64) returns (uint256)',
  'function release(uint256)',
  'function refund(uint256)',
  'function nextInvoiceId() view returns (uint256)',
  'function invoices(uint256) view returns (address payer,address recipient,uint256 amount,uint64 refundAfter,uint8 status)'
])
export const publicClient = createPublicClient({ chain: aevum, transport: http(import.meta.env.VITE_AEVUM_RPC_URL || 'https://invalid.example') })
export const configured = Boolean(import.meta.env.VITE_AEVUM_RPC_URL && import.meta.env.VITE_ESCROW_ADDRESS)
