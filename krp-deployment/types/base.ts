import type { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import type { AccountData, DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin } from "@cosmjs/amino";

export enum ChainId {
  LOCAL_SEI = "localsei",
  SEI_CHAIN = "sei-chain",
  ATLANTIC_2 = "atlantic-2",
  "localsei" = "localsei",
  "sei-chain" = "sei-chain",
  "atlantic-2" = "atlantic-2"
}

export type Addr = string;

export type Balance = {
  address: string;
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
  nativeCurrency: BaseCurrencyInfo;
  LCD_ENDPOINT: string;
  RPC_ENDPOINT: string;
  chainId: string;
  gasPrice: GasPrice;

  wallet: DirectSecp256k1Wallet | DirectSecp256k1HdWallet;
  account: AccountData;
  address: string;
  signingCosmWasmClient: SigningCosmWasmClient | any;
  signingStargateClient: SigningStargateClient | any;

  wallet2: DirectSecp256k1Wallet | DirectSecp256k1HdWallet;
  account2: AccountData;
  address2: string;
  signingCosmWasmClient2: SigningCosmWasmClient | any;
  signingStargateClient2: SigningStargateClient | any;

  validator: string;
  stable_coin_denom: string;

  addressList: string[];
  denomList: string[];
  addressesBalances: Balance[];
}

export interface ClientData {
  signingCosmWasmClient?: SigningCosmWasmClient | any;
  signingStargateClient?: SigningStargateClient | any;
  senderAddress?: string;
  gasPrice?: GasPrice;
}

export type InitialBalance = {
  address?: string;
  amount?: string;
};

export interface ContractDeployed {
  codeId?: number;
  address?: string;
}

export interface BaseContractConfig {
  admin?: string;
  initMsg?: {
    [key: string]: any;
  };
  initCoins?: Coin[];
  updateMsg?: {
    [key: string]: any;
  };
  label?: string;
  codeId?: number;
  address?: string;
  filePath?: string;
  deploy?: boolean;
}
