import type { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import type { AccountData, DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Secp256k1Wallet, Secp256k1HdWallet } from "@cosmjs/amino";

export type Addr = string;
export type Uint64 = string;
export type Uint128 = string;
export type Uint256 = string;
export type Binary = string;
export type TokenAssetInfo = {
  token: {
    contract_addr: Addr;
  };
};
export type NativeAssetInfo = {
  native_token: {
    denom: string;
  };
};
export type AssetInfo = TokenAssetInfo | NativeAssetInfo;

export interface Coin {
  amount: Uint128;
  denom: string;

  [k: string]: unknown;
}

export type Balance = {
  address: Addr;
  balance: any;
};

export interface BaseCurrencyInfo {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export interface WalletData {
  prefix: string;
  nativeCurrency: BaseCurrencyInfo;
  LCD_ENDPOINT: string;
  RPC_ENDPOINT: string;
  chainId: string;
  gasPrice: GasPrice;

  wallet: DirectSecp256k1Wallet | DirectSecp256k1HdWallet | Secp256k1Wallet | Secp256k1HdWallet;
  walletAmino: Secp256k1Wallet | Secp256k1HdWallet;
  account: AccountData;
  address: Addr;
  signingCosmWasmClient: SigningCosmWasmClient;
  signingCosmWasmClientAmino: SigningCosmWasmClient;
  signingStargateClient: SigningStargateClient;
  signingStargateClientAmino: SigningStargateClient;

  wallet2: DirectSecp256k1Wallet | DirectSecp256k1HdWallet | Secp256k1Wallet | Secp256k1HdWallet;
  wallet2Amino: Secp256k1Wallet | Secp256k1HdWallet;
  account2: AccountData;
  address2: Addr;
  signingCosmWasmClient2: SigningCosmWasmClient;
  signingCosmWasmClient2Amino: SigningCosmWasmClient;
  signingStargateClient2: SigningStargateClient;
  signingStargateClient2Amino: SigningStargateClient;

  validator: Addr;

  addressList: Addr[];
  denomList: Addr[];
  addressesBalances: Balance[];
}

export interface ClientData {
  signingCosmWasmClient?: SigningCosmWasmClient;
  signingStargateClient?: SigningStargateClient;
  senderAddress?: Addr;
  gasPrice?: GasPrice;
}

export type InitialBalance = {
  address?: Addr;
  amount?: string;
};

export interface ContractDeployed {
  codeId?: number;
  address?: Addr;
}

export interface BaseContractConfig {
  admin?: Addr;
  initMsg?: {
    [key: string]: any;
  };
  initCoins?: Coin[];
  label?: string;
  codeId?: number;
  address?: Addr;
  filePath?: string;
  deploy?: boolean;

  [key: string]: any;
}

export interface Config {
  readonly validator: Addr;
  // readonly stable_coin_denom: Addr;
}

export interface Cw20InstantiateMsg {
  name: string;
  symbol: string;
  decimals: number;
  initial_balances: Cw20Coin[];
  marketing?: Cw20InstantiateMarketingInfo | null;
  mint?: Cw20MinterResponse | null;
}

export interface Cw20Coin {
  address: Addr;
  amount: Uint128;
}

export interface Cw20InstantiateMarketingInfo {
  description?: string | null;
  logo?: Cw20Logo | null;
  marketing?: string | null;
  project?: string | null;
}

export interface Cw20MinterResponse {
  cap?: Uint128 | null;
  minter: string;
}

export type Cw20Logo =
  | {
      url: string;
    }
  | {
      embedded: Cw20EmbeddedLogo;
    };
export type Cw20EmbeddedLogo =
  | {
      svg: Binary;
    }
  | {
      png: Binary;
    };
