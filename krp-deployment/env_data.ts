import type { Config, BaseCurrencyInfo, WalletData } from "./types";
import { DirectSecp256k1Wallet, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { getSigningClient, getSigningCosmWasmClient } from "@sei-js/core";
import { toBeArray } from "ethers";
import { loadAddressesBalances, readArtifact } from "./common";
import { Secp256k1HdWallet } from "@cosmjs/amino/build/secp256k1hdwallet";
import { Secp256k1Wallet } from "@cosmjs/amino";
require("dotenv").config();

const prefix = "sei";
const chain_id_default = "localsei";
const gas_price_default = "0.0025";
const nativeCurrency: BaseCurrencyInfo = {
  coinDenom: "SEI",
  coinMinimalDenom: "usei",
  coinDecimals: 6
};

export const DEPLOY_VERSION = process.env.DEPLOY_VERSION || "00_00_01";
export const DEPLOY_CHAIN_ID = process.env.CHAIN_ID_KEY || chain_id_default;

export const chainConfigs: Config = readArtifact(`${DEPLOY_CHAIN_ID}`, "configs");

async function loadingEnvData() {
  const LCD_ENDPOINT = process.env.LCD_ENDPOINT;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
  const gasPriceValue = process.env.GAS_PRICE || gas_price_default + nativeCurrency.coinMinimalDenom;
  const chainId = DEPLOY_CHAIN_ID;
  const mnemonic = process.env.MNEMONIC;
  const privateKey = process.env.PRIVATE_KEY;
  const mnemonic2 = process.env.MNEMONIC2;
  const privateKey2 = process.env.PRIVATE_KEY2;

  return {
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    mnemonic,
    privateKey,
    mnemonic2,
    privateKey2,
    chainId,
    gasPriceValue
  };
}

export async function loadingWalletData(loadBalances: boolean = true): Promise<WalletData> {
  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, mnemonic2, privateKey2, chainId, gasPriceValue } = await loadingEnvData();

  if (!LCD_ENDPOINT) {
    throw new Error("\n  Set the LCD_ENDPOINT env variable to the LCD URL of the node to use");
  }
  if (!RPC_ENDPOINT) {
    throw new Error("\n  Set the LCD_ENDPOINT env variable to the RPC URL of the node to use");
  }
  // if (!process.env.GAS_PRICE) {
  //   console.error("Set the GAS_PRICE env variable to the gas price to use when creating client");
  //   process.exit(0);
  //   return;
  // }

  if (!mnemonic && !privateKey) {
    throw new Error("\n  Set the PRIVATE_KEY or MNEMONIC env variable to the address1 to use");
  }
  if (!mnemonic2 && !privateKey2) {
    throw new Error("\n  Set the PRIVATE_KEY2 or MNEMONIC2 env variable to the address2 to use");
  }

  const validator = chainConfigs.validator;
  const stable_coin_denom = chainConfigs.stable_coin_denom;
  if (!validator) {
    throw new Error("\n  Set the validator in configuration file variable to the validator address of the node");
  }
  if (!stable_coin_denom) {
    throw new Error("\n  Set the stable_coin_denom in configuration file variable to the stable coin denom");
  }
  // const wallet = privateKey ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
  const wallet = privateKey ? await Secp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
  const [account] = await wallet.getAccounts();

  if (!account?.address) {
    throw new Error("\n  No account1 found in wallet");
  }
  const address = account.address;
  const gasPrice: GasPrice = GasPrice.fromString(gasPriceValue);
  const signingCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet, { gasPrice: gasPrice });
  const netChainId = await signingCosmWasmClient.getChainId();

  if (netChainId !== chainId) {
    throw new Error(`\n  Chain ID mismatch. Expected ${chainId}, got ${netChainId}`);
  }
  const signingStargateClient = await getSigningClient(RPC_ENDPOINT, wallet, { gasPrice: gasPrice });

  // const wallet2 = privateKey2 ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey2), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic2, { prefix });
  const wallet2 = privateKey2 ? await Secp256k1Wallet.fromKey(toBeArray(privateKey2), prefix) : await Secp256k1HdWallet.fromMnemonic(mnemonic2, { prefix });
  const [account2] = await wallet2.getAccounts();
  if (!account2?.address) {
    throw new Error("\n  No account2 found in wallet");
  }
  const address2 = account2.address;
  const signingCosmWasmClient2 = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet2, { gasPrice: gasPrice });
  const signingStargateClient2 = await getSigningClient(RPC_ENDPOINT, wallet2, { gasPrice: gasPrice });

  console.log(`\n  current chainId: ${chainId} / deploy version: ${DEPLOY_VERSION} \n  address1: ${address} / address2: ${address2}`);

  const addressList = [address, address2];
  const denomList = [nativeCurrency.coinMinimalDenom, stable_coin_denom];
  let addressesBalances = [];
  if (loadBalances) {
    addressesBalances = await loadAddressesBalances({ signingStargateClient, signingCosmWasmClient } as WalletData, addressList, denomList);
  }

  return {
    prefix,
    nativeCurrency,
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    chainId,
    gasPrice,

    wallet,
    account,
    address,
    signingCosmWasmClient,
    signingStargateClient,

    wallet2,
    account2,
    address2,
    signingCosmWasmClient2,
    signingStargateClient2,

    validator,
    stable_coin_denom,

    addressList,
    denomList,
    addressesBalances
  };
}

export enum ChainId {
  LOCAL_SEI = "localsei",
  SEI_CHAIN = "sei-chain",
  ATLANTIC_2 = "atlantic-2",
  "localsei" = "localsei",
  "sei-chain" = "sei-chain",
  "atlantic-2" = "atlantic-2"
}
