import { useEffect, useState } from 'react'
import { createWalletClient, custom, formatUnits, isAddress, parseUnits } from 'viem'
import { aevum, configured, erc20Abi, escrowAbi, escrowAddress, publicClient, tokenAddress } from './chain'

type WalletProvider = { request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown> }
declare global { interface Window { ethereum?: WalletProvider } }
type Invoice = { payer: string; recipient: string; amount: bigint; refundAfter: number; status: number }
const labels = ['Not found', 'Funded', 'Released', 'Refunded']
const short = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : ''
const errorText = (e: unknown) => e instanceof Error ? e.message : String(e)

export default function App() {
  const [account, setAccount] = useState<`0x${string}` | null>(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [hours, setHours] = useState('24')
  const [confirmed, setConfirmed] = useState(false)
  const [balance, setBalance] = useState<string>('—')
  const [invoiceId, setInvoiceId] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [message, setMessage] = useState('Connect a wallet to begin.')
  const [busy, setBusy] = useState(false)
  const [tx, setTx] = useState<string>('')
  const wallet = () => {
    if (!window.ethereum) throw new Error('Install an EVM wallet such as MetaMask.')
    return createWalletClient({ account: account!, chain: aevum, transport: custom(window.ethereum) })
  }
  async function connect() {
    try {
      if (!window.ethereum) throw new Error('Install MetaMask or another EVM wallet.')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      if (!accounts[0] || !isAddress(accounts[0])) throw new Error('Wallet did not return an address.')
      setAccount(accounts[0] as `0x${string}`)
      setMessage('Wallet connected. Verify the network and recipient before paying.')
    } catch (e) { setMessage(errorText(e)) }
  }
  async function switchChain() {
    if (!window.ethereum) throw new Error('Wallet not detected')
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xabe5' }] })
    } catch (e) {
      const code = (e as { code?: number }).code
      if (code !== 4902) throw e
      if (!import.meta.env.VITE_AEVUM_RPC_URL) throw new Error('Official Aevum RPC is not configured.')
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{
        chainId: '0xabe5', chainName: 'QDay Aevum Testnet',
        nativeCurrency: aevum.nativeCurrency, rpcUrls: [import.meta.env.VITE_AEVUM_RPC_URL]
      }] })
    }
  }
  useEffect(() => {
    if (!account || !configured) return
    publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [account] })
      .then(v => setBalance(formatUnits(v, 6))).catch(() => setBalance('Unavailable'))
  }, [account, tx])
  async function send(action: 'fund' | 'release' | 'refund') {
    if (!account) { setMessage('Connect your wallet first.'); return }
    if (!configured) { setMessage('Aevum RPC and escrow contract address must be configured after deployment.'); return }
    setBusy(true); setTx('')
    try {
      await switchChain()
      const client = wallet()
      if (action === 'fund') {
        if (!isAddress(recipient) || recipient.toLowerCase() === account.toLowerCase()) throw new Error('Enter a valid recipient address different from yours.')
        if (!confirmed) throw new Error('Confirm the full recipient wallet address first.')
        if (!/^\d+(\.\d{1,6})?$/.test(amount)) throw new Error('Enter a positive tUSD8 amount with up to 6 decimal places.')
        const value = parseUnits(amount, 6)
        if (value <= 0n) throw new Error('Amount must be positive.')
        const duration = Number(hours)
        if (!Number.isSafeInteger(duration) || duration < 1 || duration > 720) throw new Error('Refund delay must be 1–720 hours.')
        const deadline = BigInt(Math.floor(Date.now() / 1000) + duration * 3600)
        const allowance = await publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'allowance', args: [account, escrowAddress] })
        if (allowance < value) {
          setMessage('Approve exact tUSD8 amount in your wallet…')
          const approval = await client.writeContract({ address: tokenAddress, abi: erc20Abi, functionName: 'approve', args: [escrowAddress, value] })
          await publicClient.waitForTransactionReceipt({ hash: approval })
        }
        setMessage('Confirm escrow funding in your wallet…')
        const hash = await client.writeContract({ address: escrowAddress, abi: escrowAbi, functionName: 'fund', args: [recipient, value, deadline] })
        setTx(hash)
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status !== 'success') throw new Error('Funding transaction reverted.')
        setMessage('Payment funded on-chain. Find the new invoice ID in the contract event or transaction receipt.')
      } else {
        if (!/^\d+$/.test(invoiceId) || BigInt(invoiceId) < 1n) throw new Error('Enter a valid invoice ID.')
        setMessage(`Confirm ${action} in your wallet…`)
        const hash = await client.writeContract({ address: escrowAddress, abi: escrowAbi, functionName: action, args: [BigInt(invoiceId)] })
        setTx(hash)
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status !== 'success') throw new Error('Transaction reverted.')
        setMessage(`Invoice ${action} transaction confirmed.`)
        await lookup()
      }
    } catch (e) { setMessage(errorText(e)) } finally { setBusy(false) }
  }
  async function lookup() {
    if (!configured || !/^\d+$/.test(invoiceId) || BigInt(invoiceId) < 1n) { setMessage('Enter a valid invoice ID and configure the contract.'); return }
    try {
      const [payer, payee, amount, refundAfter, status] = await publicClient.readContract({ address: escrowAddress, abi: escrowAbi, functionName: 'invoices', args: [BigInt(invoiceId)] })
      setInvoice({ payer, recipient: payee, amount, refundAfter: Number(refundAfter), status })
      setMessage('Invoice loaded from Aevum Testnet.')
    } catch (e) { setMessage(errorText(e)); setInvoice(null) }
  }
  return <div className="shell">
    <header><div className="brand"><span className="logo">S</span><span>SMAJ <strong>PayGuard</strong><small>Powered by Aevum Testnet</small></span></div><button onClick={connect} className="connect">{account ? short(account) : 'Connect wallet'}</button></header>
    <main>
      <section className="hero"><span className="eyebrow">Aevum Builder Challenge 2026</span><h1>Stablecoin payments.<br/><em>With clarity and control.</em></h1><p>Create an invoice payment, confirm the recipient wallet, fund escrow with test tUSD8, and track the result on-chain.</p><div className="notice">Testnet only · Unverified identities · Payer-controlled escrow · No real funds</div></section>
      <div className="columns"><section className="panel"><h2>New escrow payment</h2><p className="muted">Verify every detail before approving a transaction.</p><label>Recipient wallet address<input value={recipient} onChange={e => { setRecipient(e.target.value); setConfirmed(false) }} placeholder="0x…" spellCheck={false}/></label><label>Amount (tUSD8)<input value={amount} onChange={e => setAmount(e.target.value)} placeholder="100.00" inputMode="decimal"/></label><label>Refund available after (hours)<input value={hours} onChange={e => setHours(e.target.value)} inputMode="numeric"/></label><div className="confirm"><strong>Confirm payee wallet</strong><code>{recipient || 'No recipient entered'}</code><label className="checkbox"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/> I have independently checked this wallet address.</label></div><button disabled={busy || !account || !configured || !confirmed} onClick={() => send('fund')} className="primary">{busy ? 'Processing…' : 'Approve and fund escrow'}</button><p className="muted">The payer can release at any time or refund after the specified deadline. No third-party arbitration.</p></section>
      <section className="panel"><h2>Track an invoice</h2><p className="muted">Read the current state directly from the contract.</p><label>On-chain invoice ID<input value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="1" inputMode="numeric"/></label><button className="secondary" disabled={!configured} onClick={lookup}>Look up invoice</button>{invoice && <div className="details"><div><span>Status</span><strong>{labels[invoice.status] || 'Unknown'}</strong></div><div><span>Amount</span><strong>{formatUnits(invoice.amount, 6)} tUSD8</strong></div><div><span>Payer</span><code>{invoice.payer}</code></div><div><span>Recipient</span><code>{invoice.recipient}</code></div><div><span>Refund deadline</span><strong>{new Date(invoice.refundAfter * 1000).toLocaleString()}</strong></div><div className="actions"><button disabled={busy || account?.toLowerCase() !== invoice.payer.toLowerCase() || invoice.status !== 1} onClick={() => send('release')}>Release</button><button disabled={busy || account?.toLowerCase() !== invoice.payer.toLowerCase() || invoice.status !== 1 || Date.now() < invoice.refundAfter * 1000} onClick={() => send('refund')}>Refund</button></div></div>}<div className="balance"><span>Connected wallet balance</span><strong>{balance} tUSD8</strong></div></section></div>
      <div className="status" role="status">{message}{tx && <p>Transaction: <code>{tx}</code></p>}</div>
      {!configured && <div className="notice warning">Deployment pending: configure VITE_AEVUM_RPC_URL and VITE_ESCROW_ADDRESS to enable transactions.</div>}
    </main><footer>© 2026 SMAJ Ecosystem · Experimental testnet prototype · Never share wallet seed phrases</footer>
  </div>
}
