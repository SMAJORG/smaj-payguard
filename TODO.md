# SMAJ PayGuard — Complete TODO

Aevum Builder Challenge #1 | Build window: 2026-11-16 to 2026-12-11 08:00 UTC | Demo Day: 2026-12-15.

**Legend:** [x] present in repository; [ ] not yet verified complete. Do not mark deployment, testing or security audit complete without evidence.

## Phase 0 — Hackathon eligibility and scope
- [ ] Register the project/team on DoraHacks; verify participant and prize eligibility.
- [ ] Download and read the official Aevum starter kit and judging/submission rules.
- [ ] Confirm that all submitted code was authored during the permitted build window.
- [ ] Verify Aevum RPC, explorer, faucet, tUSD8 address and decimals against official documentation.
- [ ] Define one clear end-to-end payment demo and acceptance criteria.
- [ ] Confirm public repository, open-source license and contributor roles.

## Phase 1 — Foundation
- [x] Create public GitHub repository `SMAJORG/smaj-payguard`.
- [x] Add initial Solidity escrow contract `contracts/src/PayGuardEscrow.sol`.
- [x] Add initial `contracts/foundry.toml`.
- [x] Add `docs/ARCHITECTURE.md` and `.gitignore`.
- [ ] Expand README with setup, screenshots, architecture, deployment and demonstration.
- [ ] Add an open-source LICENSE and contributing/security disclosure guidance.
- [ ] Set up Foundry and install pinned OpenZeppelin dependencies.
- [ ] Add reproducible install/build/test commands and CI workflow.
- [ ] Add `.env.example` with placeholders only; never commit secrets.

## Phase 2 — Smart contracts
- [ ] Compile contract successfully with pinned dependencies.
- [ ] Review and document escrow trust model: payer controls release and refund after expiry.
- [ ] Specify invoice identifiers, recipient address, amount, expiry and immutable payment terms.
- [ ] Decide whether invoice creation occurs on-chain or off-chain; prevent mismatched recipient/amount.
- [ ] Handle ERC-20 transfers, approvals, insufficient balances and failure cases safely.
- [ ] Check accounting behavior for fee-on-transfer, rebasing or malicious tokens; restrict supported token if appropriate.
- [ ] Confirm reentrancy protection, checks-effects-interactions and access controls.
- [ ] Ensure release/refund are mutually exclusive and cannot be repeated.
- [ ] Specify expiry edge cases and whether release remains possible after expiry.
- [ ] Add indexed events for funding, release and refund.
- [ ] Add deployment script for Aevum Testnet with verified tUSD8 address.
- [ ] Consider dispute/cancellation feature only if time permits and the trust model remains clear.

## Phase 3 — Automated testing and security
- [ ] Test successful funding, release and refund.
- [ ] Test zero address, zero amount, self-payment and invalid deadline.
- [ ] Test unauthorized callers for release and refund.
- [ ] Test refund before and after deadline.
- [ ] Test double-release, double-refund and release-after-refund.
- [ ] Test insufficient allowance/balance and failed token transfers.
- [ ] Add fuzz/invariant tests for conservation of escrowed token balances.
- [ ] Run static analysis (e.g., Slither) and resolve material findings.
- [ ] Review gas usage and document known limitations.
- [ ] Clearly label the contract unaudited unless an actual audit is completed.

## Phase 4 — Frontend
- [ ] Scaffold React + TypeScript + Vite + Tailwind frontend.
- [ ] Build responsive landing page and payment dashboard.
- [ ] Add connect/disconnect wallet and account/network state.
- [ ] Detect wrong chain and support switching to chain 44005.
- [ ] Build invoice form: recipient, amount, expiry, description.
- [ ] Display a confirmation screen with full recipient address and amount.
- [ ] Implement tUSD8 balance and allowance reads with 6-decimal formatting.
- [ ] Implement exact-amount approval and funding transactions.
- [ ] Display wallet prompts, pending/confirmed/failed states and explorer links.
- [ ] Build invoice detail page with escrow status and transaction history.
- [ ] Implement payer-only release and eligible refund actions.
- [ ] Handle rejected signatures, RPC errors, disconnects and transaction reverts.
- [ ] Test mobile responsiveness, keyboard navigation and basic accessibility.

## Phase 5 — Optional off-chain services
- [ ] Decide whether a backend is necessary; prefer minimal architecture for MVP.
- [ ] If used, add Supabase schema for invoice descriptions and metadata only.
- [ ] Validate inputs and ensure sensitive data is not exposed.
- [ ] Treat on-chain events/state as source of truth for payment status.
- [ ] Do not claim identity verification from wallet-address matching alone.

## Phase 6 — Aevum integration and deployment
- [ ] Obtain testnet gas and tUSD8 from official faucets.
- [ ] Deploy contract to Aevum Testnet and record address/transaction hash.
- [ ] Verify contract source on the official explorer if supported.
- [ ] Test full payment flow using two independent wallets and test tokens.
- [ ] Capture funding, release and refund transaction evidence.
- [ ] Configure production frontend environment with deployed contract address.
- [ ] Deploy frontend to a publicly accessible HTTPS URL.
- [ ] Test deployed app on Android/mobile and desktop browsers.
- [ ] Confirm no mainnet transactions or real funds are involved.

## Phase 7 — Innovation and judging quality
- [ ] Clearly explain the invoice/payee problem and target users.
- [ ] Demonstrate payee address confirmation and transparent escrow status.
- [ ] Explain security tradeoffs and what happens if the payer never releases.
- [ ] Add polished empty/loading/error/success states.
- [ ] Highlight Aevum-specific integration with verifiable on-chain evidence.
- [ ] Avoid feature creep: prioritize a reliable complete flow over untested AI features.

## Phase 8 — Documentation and submission
- [ ] Publish architecture diagram, contract state machine and data flow.
- [ ] Document prerequisites, installation, tests, deployment and known risks.
- [ ] Add screenshots, sample test wallets and transaction/explorer links.
- [ ] Record a concise demo showing invoice → approval → funding → release.
- [ ] Prepare a 3–5 minute live presentation for top-five selection.
- [ ] Complete DoraHacks submission: repository, live demo, video, description and team.
- [ ] Submit before **2026-12-11 08:00 UTC**; verify submission receipt.

## Timeline
- **Nov 16–19:** eligibility, starter kit, contract compilation and initial tests.
- **Nov 20–26:** core contract behavior and working frontend payment flow.
- **Nov 27–Dec 3:** test coverage, trust controls, mobile UX and failure handling.
- **Dec 4–8:** testnet deployment, explorer evidence and documentation.
- **Dec 9–10:** final QA, video and DoraHacks submission.
- **Dec 11 08:00 UTC:** hard submission deadline.
- **Dec 15:** Demo Day if selected among top five.

## Definition of done
The MVP is complete only when an independent reviewer can open the live URL, connect an Aevum Testnet wallet, confirm the recipient, approve and fund tUSD8, observe the on-chain receipt, and release funds or execute a valid post-deadline refund. Source, setup steps, tests and transaction evidence must be publicly available.

## Immediate next actions
1. Install Foundry dependencies and compile `PayGuardEscrow.sol`.
2. Write Foundry unit tests for funding/release/refund and authorization.
3. Verify official Aevum configuration and deploy only after tests pass.
4. Scaffold React frontend and wire it to the verified contract ABI.
