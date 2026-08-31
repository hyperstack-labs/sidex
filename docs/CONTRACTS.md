# SidEx — Contract Deployment & ABI Reference

> **Network:** SidraChain · Chain ID `97453` · RPC `https://node.sidrachain.com`  
> **Explorer:** https://ledger.sidrachain.com  
> **Branch:** `feature/liquidity-pool-contracts`

---

## Deployed Addresses

| Contract | Address | Block |
|---|---|---|
| `SidExFactory` | `0xD33B40dd3a482d58C1F6a3dF8284A6ee05A378fC` | 34238593 |
| `SidExRouter` | `0x8f58131528C2F37e5221296937d8AEee3Df26E22` | 34238593 |

> **feeToSetter:** `0x770733bb6eb63B4bEe668Dc06284F54bF287C533`  
> Pair contracts are deployed dynamically by the Factory when `createPair()` is called.

---

## Architecture

```
SidExFactory
  └── createPair(tokenA, tokenB) → SidExPair
        ├── mint(to)             ← called by Router.addLiquidity
        ├── burn(to)             ← called by Router.removeLiquidity
        └── swap(...)            ← called by Router.swap*

SidExRouter  (inherits RibaGuard)
  ├── addLiquidity(...)
  ├── removeLiquidity(...)
  ├── swapExactTokensForTokens(...)
  └── swapTokensForExactTokens(...)

RibaGuard  (abstract — AAOIFI Sharia compliance)
  ├── noFarDeadline        max 2-hour deadline window
  ├── noLeveragedPosition  blocks debt-funded deposits
  ├── noOneSidedDeposit    both token amounts must be > 0
  └── noFlashBurn          min 1 block between removeLiquidity calls
```

---

## foundry.toml Reference

This is the required `foundry.toml` configuration for this project. Do not add duplicate keys.

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.36"
evm_version = "paris"
via_ir = true
optimizer = true
optimizer_runs = 200
remappings = ["forge-std/=lib/forge-std/src/", "@openzeppelin/=lib/openzeppelin-contracts/"]
fs_permissions = [{ access = "write", path = "out/" }]

[rpc_endpoints]
sidrachain = "https://node.sidrachain.com"

[etherscan]
sidrachain = { key = "nokey", url = "https://ledger.sidrachain.com/api" }
```

---

## Deployment Command

SidraChain requires legacy transactions. Always include `--legacy`:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://node.sidrachain.com \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --legacy \
  -vvvv
```

---

## ABI Reference

### SidExFactory

```solidity
// Create a new trading pair
function createPair(address tokenA, address tokenB) external returns (address pair)

// Look up existing pair
function getPair(address tokenA, address tokenB) external view returns (address pair)

// All pairs ever created
function allPairs(uint256 index) external view returns (address pair)
function allPairsLength() external view returns (uint256)

// Fee configuration (admin only)
function feeTo() external view returns (address)
function feeToSetter() external view returns (address)
function setFeeTo(address) external
function setFeeToSetter(address) external

// Events
event PairCreated(address indexed token0, address indexed token1, address pair, uint256)
```

### SidExRouter

```solidity
// -- Liquidity ----------------------------------------------------------------

function addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,      // slippage protection
    uint256 amountBMin,      // slippage protection
    address to,              // LP token recipient
    uint256 deadline         // max block.timestamp + 2 hours (RibaGuard)
) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)

function removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,       // LP tokens to burn
    uint256 amountAMin,      // slippage protection
    uint256 amountBMin,      // slippage protection
    address to,              // token recipient
    uint256 deadline
) external returns (uint256 amountA, uint256 amountB)

// -- Swaps --------------------------------------------------------------------

function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
) external returns (uint256[] memory amounts)

function swapTokensForExactTokens(
    uint256 amountOut,
    uint256 amountInMax,
    address[] calldata path,
    address to,
    uint256 deadline
) external returns (uint256[] memory amounts)

// -- View helpers -------------------------------------------------------------

function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256)
function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256)
function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory)
function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory)
```

### SidExPair (per-pool, deployed by Factory)

```solidity
// State
function token0() external view returns (address)
function token1() external view returns (address)
function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)
function factory() external view returns (address)
function kLast() external view returns (uint256)

// LP Token (ERC20)
function totalSupply() external view returns (uint256)
function balanceOf(address) external view returns (uint256)
function approve(address spender, uint256 amount) external returns (bool)
function transfer(address to, uint256 amount) external returns (bool)
function transferFrom(address from, address to, uint256 amount) external returns (bool)

// Low-level (called by Router -- do not call directly)
function mint(address to) external returns (uint256 liquidity)
function burn(address to) external returns (uint256 amount0, uint256 amount1)
function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external

// Events
event Mint(address indexed sender, uint256 amount0, uint256 amount1)
event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)
event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)
event Sync(uint112 reserve0, uint112 reserve1)
```

### RibaGuard (inherited by Router)

```solidity
// Constants
uint256 public constant MAX_DEADLINE_WINDOW = 2 hours
uint256 public constant MIN_BLOCKS_BETWEEN_BURNS = 1

// View
function firstDepositAt(address provider) external view returns (uint256)
function hasLeveragedPosition(address provider) external view returns (bool)
function lastBurnBlock(address provider) external view returns (uint256)
```

---

## Sharia Compliance Notes

| Rule | Implementation |
|---|---|
| No Riba (interest) | Swap fee is a flat spot-exchange fee (0.3%), not time-based |
| No Gharar (uncertainty) | All swaps settle atomically; no open positions |
| No leveraged positions | `noLeveragedPosition` modifier blocks debt-funded deposits |
| No time-locked yield | `noFarDeadline` limits deadline to 2 hours |
| No one-sided deposits | `noOneSidedDeposit` requires both tokens > 0 |
| No flash-burn cycling | `noFlashBurn` requires minimum 1 block between burns |

---

## LP Token Behaviour

- The **first deposit** into a new pair permanently locks `MINIMUM_LIQUIDITY` (1000 wei) into `address(0xdead)`. This amount is never recoverable.
- The first depositor receives `sqrt(amountA * amountB) - 1000` LP tokens.
- All subsequent depositors receive the full proportional amount with no deduction.
- This means the second depositor will always receive slightly more LP tokens than the first for the same deposit amount. This is expected and correct behaviour.

---

## Troubleshooting

### `invalid opcode: PUSH0` on deployment

**Cause:** SidraChain's EVM does not support the `PUSH0` opcode introduced in the Shanghai upgrade. Solidity 0.8.20+ emits `PUSH0` by default.

**Fix:** Add `evm_version = "paris"` to `foundry.toml`. Paris is the EVM version just before Shanghai.

```toml
evm_version = "paris"
```

---

### Transactions fail with `type 2` (EIP-1559 not supported)

**Cause:** SidraChain does not support EIP-1559 transaction types. Forge defaults to type 2.

**Fix:** Always add `--legacy` to all `forge script` and `forge send` commands:

```bash
forge script script/Deploy.s.sol:Deploy --rpc-url https://node.sidrachain.com --broadcast --legacy
```

---

### `Stack too deep` compiler error

**Cause:** The Router has functions with many local variables. Solidity's default codegen hits the EVM stack limit.

**Fix:** Add `via_ir = true` to `foundry.toml`. This routes compilation through Yul IR which handles deep stacks. Note: compilation will be slower.

```toml
via_ir = true
```

---

### `duplicate key` error in foundry.toml

**Cause:** A key such as `evm_version` appears twice in `[profile.default]`.

**Fix:** Search for and remove the duplicate line. Each key must appear only once.

---

### `vm.writeFile` not allowed

**Cause:** Foundry blocks file writes by default for security.

**Fix:** Add `fs_permissions` to `foundry.toml`:

```toml
fs_permissions = [{ access = "write", path = "out/" }]
```

---

### Contract shows as EOA on Blockscout after deployment

**Cause:** Blockscout's indexer can lag behind the chain by several blocks. The contract is on-chain even if the explorer shows EOA immediately after deployment.

**Fix:** Wait 30-60 seconds and refresh. Confirm by searching the transaction hash directly -- if it shows `[Contract 0x... created]` with a green checkmark, the contract exists.

---

### Blockscout verification fails with `Unable to verify`

**Cause:** Compiler settings mismatch between what was used to deploy and what was submitted for verification.

**Fix:** Pass all compiler flags explicitly:

```bash
forge verify-contract <ADDRESS> src/<Contract>.sol:<Contract> \
  --verifier blockscout \
  --verifier-url "https://ledger.sidrachain.com/api?" \
  --chain-id 97453 \
  --etherscan-api-key nokey \
  --compiler-version 0.8.36 \
  --evm-version paris \
  --optimizer-runs 200 \
  --watch
```

> Note: This Blockscout instance does not require a real API key. Pass `nokey` as the value.

---

### `BLOCKSCOUT_API_KEY not found` error

**Cause:** `foundry.toml` references `${BLOCKSCOUT_API_KEY}` as an environment variable but it is not set.

**Fix:** Replace the variable reference with a hardcoded dummy value in `foundry.toml`:

```toml
[etherscan]
sidrachain = { key = "nokey", url = "https://ledger.sidrachain.com/api" }
```

---

### Unicode characters in Solidity string literals

**Cause:** Solidity does not allow non-ASCII characters (e.g. em dashes) in regular string literals.

**Fix:** Use only ASCII characters in revert strings. Replace em dashes with hyphens:

```solidity
// Wrong
require(condition, "Error — message");

// Correct
require(condition, "Error - message");
```

---

### `MockERC20` constructor argument count mismatch

**Cause:** Some test files call `MockERC20` with 2 args, others with 3.

**Fix:** Use the 3-argument constructor consistently across all test files:

```solidity
constructor(string memory _name, string memory _symbol, uint8 _decimals) {
    name     = _name;
    symbol   = _symbol;
    decimals = _decimals;
}

// Usage in tests
tokenA = new MockERC20("Token A", "TKNA", 18);
```

---

## Usage Example (ethers.js / viem)

```typescript
import { CONTRACT_ADDRESSES, SIDEX_ROUTER_ABI } from "@/config/contracts";

// Add liquidity -- deadline must be within 2 hours (RibaGuard requirement)
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

await routerContract.addLiquidity(
  tokenA,
  tokenB,
  amountADesired,
  amountBDesired,
  amountAMin,   // e.g. 99% of desired for 1% slippage tolerance
  amountBMin,
  userAddress,
  deadline
);
```