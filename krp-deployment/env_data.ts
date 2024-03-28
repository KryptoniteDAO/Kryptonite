import { Secp256k1Wallet } from "@cosmjs/amino";
import { Secp256k1HdWallet } from "@cosmjs/amino/build/secp256k1hdwallet";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { stringToPath } from "@cosmjs/crypto";
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { getCosmWasmClient, getSigningClient, getSigningCosmWasmClient, getStargateClient } from "@sei-js/core";
import { toBeArray } from "ethers";
import { loadAddressesBalances } from "./common";
import type { BaseCurrencyInfo, WalletData, WalletInstantiate } from "./types";

require("dotenv").config();

export enum ChainId {
  PACIFIC_1 = "pacific-1",
  ATLANTIC_2 = "atlantic-2",
  ARCTIC_1 = "arctic-1",
  SEI_CHAIN = "sei-chain",
  LOCAL_SEI = "localsei",
  "pacific-1" = "pacific-1",
  "atlantic-2" = "atlantic-2",
  "sei-chain" = "sei-chain",
  "localsei" = "localsei",
  "arctic-1" = "arctic-1"
}

const default_cosmos_native_token_decimals: number = 6;
const default_evm_token_decimals: number = 18;
const prefix = "sei";
const chain_id_default = "localsei";
const gas_price_default = "0.0025";
const nativeCurrency: BaseCurrencyInfo = {
  coinDenom: "SEI",
  coinMinimalDenom: "usei",
  coinDecimals: 6
};

export const DEPLOY_VERSION = process.env.DEPLOY_VERSION || "00_00_01";
export const DEPLOY_CHAIN_ID = ChainId[process.env.CHAIN_ID_KEY || chain_id_default];

// export const chainConfigs: Config = readArtifact(`${DEPLOY_CHAIN_ID}`, "configs");

export async function loadingEnvData() {
  const LCD_ENDPOINT = process.env.LCD_ENDPOINT;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
  const GRPC_ENDPOINT = process.env.GRPC_ENDPOINT;
  const EVM_RPC_ENDPOINT = process.env.EVM_RPC_ENDPOINT;
  const chainId = DEPLOY_CHAIN_ID;
  const BIPS = process.env.BIPS ?? 118;
  const ACCOUNT_INDEX = process.env.ACCOUNT_INDEX ?? 0;

  const gasPriceValue = process.env.GAS_PRICE || gas_price_default + nativeCurrency?.coinMinimalDenom;
  const wallets = JSON.parse(process.env.WALLETS) || [];

  return {
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    GRPC_ENDPOINT,
    EVM_RPC_ENDPOINT,
    chainId,
    BIPS,
    ACCOUNT_INDEX,
    gasPriceValue,
    wallets
  };
}

export async function loadingWalletData(loadBalances: boolean = true, denomList: string[] = [], printAble = true): Promise<WalletData> {
  const { LCD_ENDPOINT, RPC_ENDPOINT, GRPC_ENDPOINT, EVM_RPC_ENDPOINT, BIPS, ACCOUNT_INDEX, chainId, gasPriceValue, wallets } = await loadingEnvData();

  if (!LCD_ENDPOINT) {
    throw new Error("\n  Set the LCD_ENDPOINT env variable to the LCD URL of the node to use");
  }
  if (!RPC_ENDPOINT) {
    throw new Error("\n  Set the LCD_ENDPOINT env variable to the RPC URL of the node to use");
  }
  if (!GRPC_ENDPOINT) {
    throw new Error("\n  Set the GRPC_ENDPOINT env variable to the GRPC URL of the node to use");
  }
  // if (!process.env.GAS_PRICE) {
  //   console.error("Set the GAS_PRICE env variable to the gas price to use when creating client");
  //   process.exit(0);
  //   return;
  // }
  // if (!mnemonic && !privateKey) {
  //   throw new Error("\n  Set the PRIVATE_KEY or MNEMONIC env variable to the address1 to use");
  // }
  // if (!mnemonic2 && !privateKey2) {
  //   throw new Error("\n  Set the PRIVATE_KEY2 or MNEMONIC2 env variable to the address2 to use");
  // }
  // const validator = chainConfigs.validator;
  // // const stable_coin_denom = chainConfigs.stable_coin_denom;
  // if (!validator) {
  //   throw new Error("\n  Set the validator in configuration file variable to the validator address of the node");
  // }
  // if (!stable_coin_denom) {
  //   throw new Error("\n  Set the stable_coin_denom in configuration file variable to the stable coin denom");
  // }
  const gasPrice: GasPrice = GasPrice.fromString(gasPriceValue);

  const stargateClient: StargateClient = await getStargateClient(RPC_ENDPOINT);
  const cosmWasmClient: CosmWasmClient = await getCosmWasmClient(RPC_ENDPOINT);
  const netChainId = await cosmWasmClient.getChainId();
  if (netChainId !== chainId) {
    throw new Error(`\n  Chain ID mismatch. Expected ${chainId}, got ${netChainId}`);
  }

  const walletInstantiates: WalletInstantiate[] = [];
  const addressList = [];
  for (const walletInfo of wallets) {
    const privateKey: string = walletInfo?.privateKey;
    const mnemonic: string = walletInfo?.mnemonic;
    const active: boolean = walletInfo?.active;
    if (!privateKey && !mnemonic) {
      continue;
    }

    const hdPaths = [stringToPath(`m/44'/${BIPS}'/0'/0/${ACCOUNT_INDEX}`)];
    const wallet = !!privateKey ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix, hdPaths });
    const [account] = await wallet.getAccounts();
    if (!account?.address) {
      throw new Error("\n  No account found in wallet");
    }
    const address: string = account.address;
    const signingStargateClient: SigningStargateClient = await getSigningClient(RPC_ENDPOINT, wallet, { gasPrice });
    const signingCosmWasmClient: SigningCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet, { gasPrice });

    const walletAmino = !!privateKey ? await Secp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
    const signingStargateClientAmino: SigningStargateClient = await getSigningClient(RPC_ENDPOINT, walletAmino, { gasPrice });
    const signingCosmWasmClientAmino: SigningCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, walletAmino, { gasPrice });

    walletInstantiates.push({
      active,
      address,
      account,
      wallet,
      signingStargateClient,
      signingCosmWasmClient,
      walletAmino,
      signingStargateClientAmino,
      signingCosmWasmClientAmino
    });
    addressList.push(address);
  }
  // if (!walletInstantiates || walletInstantiates.length <= 0) {
  //   throw new Error("\n  Set the WALLETS env variable to the address to use");
  // }

  const activeWallet: WalletInstantiate = walletInstantiates?.find((wallet: WalletInstantiate) => wallet.active) || walletInstantiates?.[0];
  printAble && console.log(`\n  --- --- env data --- ---`);
  printAble && console.log(`  current chainId: ${chainId}`);
  printAble && console.log(`  deploy version: ${DEPLOY_VERSION}`);
  printAble && console.log(`  active address: ${activeWallet?.address}`);
  printAble && console.log(`  address list: ${addressList}`);

  denomList.push(nativeCurrency.coinMinimalDenom);
  let addressesBalances = [];
  if (loadBalances && addressList.length > 0) {
    addressesBalances = await loadAddressesBalances({ stargateClient, cosmWasmClient, walletInstantiates, activeWallet, nativeCurrency } as WalletData, addressList, denomList);
  }

  return {
    prefix,
    nativeCurrency,
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    GRPC_ENDPOINT,
    EVM_RPC_ENDPOINT,
    chainId,
    gasPrice,
    stargateClient,
    cosmWasmClient,
    activeWallet,
    walletInstantiates,
    addressList,
    denomList,
    addressesBalances
  };
}
