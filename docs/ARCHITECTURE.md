# SMAJ PayGuard MVP architecture

- **UI (planned):** React + TypeScript + viem; connect EVM wallet, confirm recipient address, approve tUSD8, fund escrow, release/refund, display receipts.
- **Chain:** Aevum Testnet, chain ID 44005.
- **Test token:** tUSD8 at `0x456569838f1d43009A91ebA4263147Afd7233483` (6 decimals); verify against the official starter kit before deploying.
- **Contract:** `PayGuardEscrow`, payer-controlled escrow for ERC-20 token supplied at deployment.

## Trust boundaries
Recipient confirmation is wallet-address confirmation, **not legal identity verification**. Payer can release funds at any time; if not released, payer may refund after the deadline. No third-party arbitration is implemented. The contract has not been audited or tested yet.

## Pending
Foundry unit tests, deployment configuration, frontend, testnet deployment, transaction evidence, README expansion, and demo video.
