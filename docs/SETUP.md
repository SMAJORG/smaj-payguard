# Build, test, and deploy

**Status:** Instructions only; deployment and passing CI are not yet verified.

## Requirements
- Node.js 22+
- Foundry (`forge`, `cast`)
- EVM wallet funded with official Aevum Testnet gas and tUSD8
- Official Aevum RPC endpoint (verify against starter kit)

## Solidity
```sh
cd contracts
forge install foundry-rs/forge-std --no-git
forge install OpenZeppelin/openzeppelin-contracts --no-git
forge build
forge test -vvv
```

The Solidity code imports OpenZeppelin contracts and forge-std. If compiler or dependency incompatibilities occur, pin compatible versions and commit a lockfile or submodules before submitting.

## Deploy to Aevum Testnet
Confirm token address and RPC from the official documentation first. Never share your private key.
```sh
cd contracts
export TUSD8_ADDRESS=0x456569838f1d43009A91ebA4263147Afd7233483
forge script script/Deploy.s.sol:Deploy --rpc-url "$AEVUM_RPC_URL" --broadcast --private-key "$DEPLOYER_PRIVATE_KEY"
```
Use a dedicated **testnet-only** deployer wallet. Save the deployed escrow address and transaction hash.

## Frontend
```sh
cd web
cp .env.example .env
# Fill VITE_AEVUM_RPC_URL and VITE_ESCROW_ADDRESS
npm install
npm run build
npm run dev
```

Deploy the `web/dist` directory to a static host and set the same VITE variables in its build environment.

## Important behavior
- Wallet-address confirmation does **not** establish the recipient's legal identity.
- The payer can release escrow at any time and can refund after the deadline.
- This MVP has no dispute arbitration.
- All tokens are test tokens; do not send real assets.
- The frontend currently requires a deployed escrow contract and configured RPC.
- The UI asks users to enter invoice IDs to track them; transaction receipt parsing and indexer are future improvements.
