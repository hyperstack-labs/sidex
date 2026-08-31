// Chain: SidraChain (97453)

export const SIDRACHAIN_CHAIN_ID = 97453 as const;

export const CONTRACT_ADDRESSES = {
  factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ||
    "0xD33B40dd3a482d58C1F6a3dF8284A6ee05A378fC") as `0x${string}`,
  router: (process.env.NEXT_PUBLIC_ROUTER_ADDRESS ||
    "0x8f58131528C2F37e5221296937d8AEee3Df26E22") as `0x${string}`,
  sGold: (process.env.NEXT_PUBLIC_SGOLD_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  sUsd: (process.env.NEXT_PUBLIC_SUSD_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

export const SIDEX_FACTORY_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_feeToSetter", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allPairs",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allPairsLength",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createPair",
    inputs: [
      { name: "tokenA", type: "address", internalType: "address" },
      { name: "tokenB", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "pair", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "feeTo",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeToSetter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPair",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setFeeTo",
    inputs: [{ name: "_feeTo", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeToSetter",
    inputs: [{ name: "_feeToSetter", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "PairCreated",
    inputs: [
      { name: "token0", type: "address", indexed: true, internalType: "address" },
      { name: "token1", type: "address", indexed: true, internalType: "address" },
      { name: "pair", type: "address", indexed: false, internalType: "address" },
      { name: "pairIndex", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
] as const;

export const SIDEX_ROUTER_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_factory", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addLiquidity",
    inputs: [
      { name: "tokenA", type: "address", internalType: "address" },
      { name: "tokenB", type: "address", internalType: "address" },
      { name: "amountADesired", type: "uint256", internalType: "uint256" },
      { name: "amountBDesired", type: "uint256", internalType: "uint256" },
      { name: "amountAMin", type: "uint256", internalType: "uint256" },
      { name: "amountBMin", type: "uint256", internalType: "uint256" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256", internalType: "uint256" },
      { name: "amountB", type: "uint256", internalType: "uint256" },
      { name: "liquidity", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAmountOut",
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "reserveIn", type: "uint256", internalType: "uint256" },
      { name: "reserveOut", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getAmountsIn",
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
    ],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAmountsOut",
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
    ],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quote",
    inputs: [
      { name: "amountA", type: "uint256", internalType: "uint256" },
      { name: "reserveA", type: "uint256", internalType: "uint256" },
      { name: "reserveB", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amountB", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "removeLiquidity",
    inputs: [
      { name: "tokenA", type: "address", internalType: "address" },
      { name: "tokenB", type: "address", internalType: "address" },
      { name: "liquidity", type: "uint256", internalType: "uint256" },
      { name: "amountAMin", type: "uint256", internalType: "uint256" },
      { name: "amountBMin", type: "uint256", internalType: "uint256" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256", internalType: "uint256" },
      { name: "amountB", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapTokensForExactTokens",
    inputs: [
      { name: "amountOut", type: "uint256", internalType: "uint256" },
      { name: "amountInMax", type: "uint256", internalType: "uint256" },
      { name: "path", type: "address[]", internalType: "address[]" },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "nonpayable",
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;