import { DirectSecp256k1Wallet, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { getSigningClient, getSigningCosmWasmClient } from "@sei-js/core";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClient } from "@cosmjs/stargate";
import { toBeArray } from "ethers";
import { loadAddressesBalances, readArtifact } from "./common";
import type { Config, BaseCurrencyInfo, DeployContract, WalletData } from "./types";
require("dotenv").config();

const prefix = "sei";
const chain_id_default = "localsei";
const gas_price_default = "0.0025";
const nativeCurrency: BaseCurrencyInfo = {
  coinDenom: "SEI",
  coinMinimalDenom: "usei",
  coinDecimals: 6
};
export const STAKING_ARTIFACTS_PATH = "../krp-staking-contracts/artifacts";
export const MARKET_ARTIFACTS_PATH = "../krp-market-contracts/artifacts";
export const CONVERT_ARTIFACTS_PATH = "../krp-basset-convert/artifacts";

export const chainConfigs: Config = readArtifact(`${process.env.CHAIN_ID || chain_id_default}`, "configs", "");
// console.log(process.env.CHAIN_ID);
// console.log(chainConfigs);
// console.log(loadingEnvData());

async function loadingEnvData() {
  const LCD_ENDPOINT = process.env.LCD_ENDPOINT;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
  const gasPriceValue = process.env.GAS_PRICE || gas_price_default + nativeCurrency.coinMinimalDenom;
  const chainId = process.env.CHAIN_ID || chain_id_default;
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

export async function loadingWalletData(): Promise<WalletData> {
  const { LCD_ENDPOINT, RPC_ENDPOINT, mnemonic, privateKey, mnemonic2, privateKey2, chainId, gasPriceValue } = await loadingEnvData();

  if (!LCD_ENDPOINT) {
    console.error("Set the LCD_ENDPOINT env variable to the LCD URL of the node to use");
    process.exit(0);
    return;
  }
  if (!RPC_ENDPOINT) {
    console.error("Set the LCD_ENDPOINT env variable to the RPC URL of the node to use");
    process.exit(0);
    return;
  }
  // if (!process.env.GAS_PRICE) {
  //   console.error("Set the GAS_PRICE env variable to the gas price to use when creating client");
  //   process.exit(0);
  //   return;
  // }

  if (!mnemonic && !privateKey) {
    console.error("Set the PRIVATE_KEY or MNEMONIC env variable to the address1 to use");
    process.exit(0);
    return;
  }
  if (!mnemonic2 && !privateKey2) {
    console.error("Set the PRIVATE_KEY2 or MNEMONIC2 env variable to the address2 to use");
    process.exit(0);
    return;
  }

  const validator = chainConfigs.validator;
  const stable_coin_denom = chainConfigs.stable_coin_denom;
  if (!validator) {
    console.error("Set the validator in configuration file variable to the validator address of the node");
    process.exit(0);
    return;
  }
  if (!stable_coin_denom) {
    console.error("Set the stable_coin_denom in configuration file variable to the stable coin denom");
    process.exit(0);
    return;
  }
  const wallet = privateKey ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
  const [account] = await wallet.getAccounts();

  if (!account || !account?.address) {
    console.error("No account1 found in wallet");
    process.exit(0);
    return;
  }
  const address = account.address;
  const gasPrice: GasPrice = GasPrice.fromString(gasPriceValue);
  const signingCosmWasmClient = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet, { gasPrice: gasPrice } as unknown as undefined);
  const netChainId = await signingCosmWasmClient.getChainId();

  if (netChainId !== chainId) {
    console.error(`Chain ID mismatch. Expected ${chainId}, got ${netChainId}`);
    process.exit(0);
    return;
  }
  const signingStargateClient = await getSigningClient(RPC_ENDPOINT, wallet);

  const wallet2 = privateKey2 ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey2), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic2, { prefix });
  const [account2] = await wallet2.getAccounts();
  if (!account2 || !account2?.address) {
    console.error("No account2 found in wallet");
    process.exit(0);
    return;
  }
  const address2 = account2.address;
  const signingCosmWasmClient2 = await getSigningCosmWasmClient(RPC_ENDPOINT, wallet2, { gasPrice: gasPrice } as unknown as undefined);
  const signingStargateClient2 = await getSigningClient(RPC_ENDPOINT, wallet2);

  const addressList = [address, address2];
  const denomList = [nativeCurrency.coinMinimalDenom, stable_coin_denom];
  const addressesBalances = await loadAddressesBalances(LCD_ENDPOINT, addressList, denomList);

  return {
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

/**
 * hub,
 * reward,
 * bSeiToken,
 * rewardsDispatcher,
 * validatorsRegistry,
 * stSeiToken,
 */
export async function loadingStakingData(network: any = {}) {
  let hub: DeployContract = {
    codeId: (network?.hub?.codeId && Number(network?.hub?.codeId)) || 0,
    address: network?.hub?.address
  };
  let reward: DeployContract = {
    codeId: (network?.reward?.codeId && Number(network?.reward?.codeId)) || 0,
    address: network?.reward?.address
  };
  let bSeiToken: DeployContract = {
    codeId: (network?.bSeiToken?.codeId && Number(network?.bSeiToken?.codeId)) || 0,
    address: network?.bSeiToken?.address
  };
  let rewardsDispatcher: DeployContract = {
    codeId: (network?.rewardsDispatcher?.codeId && Number(network?.rewardsDispatcher?.codeId)) || 0,
    address: network?.rewardsDispatcher?.address
  };
  let validatorsRegistry: DeployContract = {
    codeId: (network?.validatorsRegistry?.codeId && Number(network?.validatorsRegistry?.codeId)) || 0,
    address: network?.validatorsRegistry?.address
  };
  let stSeiToken: DeployContract = {
    codeId: (network?.stSeiToken?.codeId && Number(network?.stSeiToken?.codeId)) || 0,
    address: network?.stSeiToken?.address
  };

  return {
    hub,
    reward,
    bSeiToken,
    rewardsDispatcher,
    validatorsRegistry,
    stSeiToken
  };
}

/**
 * aToken
 * market
 * interestModel
 * distributionModel
 * oracle
 * overseer
 * liquidationQueue
 * custodyBSei
 */
export async function loadingMarketData(network: any = {}) {
  let aToken: DeployContract = {
    codeId: (network?.aToken?.codeId && Number(network?.aToken?.codeId)) || 0,
    address: network?.aToken?.address
  };
  let market: DeployContract = {
    codeId: (network?.market?.codeId && Number(network?.market?.codeId)) || 0,
    address: network?.market?.address
  };
  let interestModel: DeployContract = {
    codeId: (network?.interestModel?.codeId && Number(network?.interestModel?.codeId)) || 0,
    address: network?.interestModel?.address
  };
  let distributionModel: DeployContract = {
    codeId: (network?.distributionModel?.codeId && Number(network?.distributionModel?.codeId)) || 0,
    address: network?.distributionModel?.address
  };
  let oracle: DeployContract = {
    codeId: (network?.oracle?.codeId && Number(network?.oracle?.codeId)) || 0,
    address: network?.oracle?.address
  };
  let overseer: DeployContract = {
    codeId: (network?.overseer?.codeId && Number(network?.overseer?.codeId)) || 0,
    address: network?.overseer?.address
  };
  let liquidationQueue: DeployContract = {
    codeId: (network?.liquidationQueue?.codeId && Number(network?.liquidationQueue?.codeId)) || 0,
    address: network?.liquidationQueue?.address
  };
  let custodyBSei: DeployContract = {
    codeId: (network?.custodyBSei?.codeId && Number(network?.custodyBSei?.codeId)) || 0,
    address: network?.custodyBSei?.address
  };

  return {
    aToken,
    market,
    interestModel,
    distributionModel,
    oracle,
    overseer,
    liquidationQueue,
    custodyBSei
  };
}
