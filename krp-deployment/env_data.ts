import { DirectSecp256k1Wallet, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { getSigningClient, getSigningCosmWasmClient } from "@sei-js/core";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClient } from "@cosmjs/stargate";
import { toBeArray } from "ethers";
import { loadAddressesBalances, readArtifact } from "./common";
import type { Config, BaseCurrencyInfo, DeployContract, WalletData } from "./types";
import { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
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
export const SWAP_EXTENSION_ARTIFACTS_PATH = "../swap-extention/artifacts";

export const STAKING_MODULE_NAME = "staking";
export const MARKET_MODULE_NAME = "market";
export const CONVERT_MODULE_NAME = "convert";
export const SWAP_EXTENSION_MODULE_NAME = "swap-extention";

export const DEPLOY_VERSION = process.env.DEPLOY_VERSION || "00_00_01";

export const chainConfigs: Config = readArtifact(`${process.env.CHAIN_ID_KEY || chain_id_default}`, "configs");
// console.log(process.env.CHAIN_ID);
// console.log(chainConfigs);
// console.log(loadingEnvData());

async function loadingEnvData() {
  const LCD_ENDPOINT = process.env.LCD_ENDPOINT;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
  const gasPriceValue = process.env.GAS_PRICE || gas_price_default + nativeCurrency.coinMinimalDenom;
  const chainId = process.env.CHAIN_ID_KEY || chain_id_default;
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

  console.log(`\ncurrent chainId: ${chainId} / deploy version: ${DEPLOY_VERSION} \naddress1: ${address} / address2: ${address2}`);

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
export async function loadingStakingData(networkStaking: StakingDeployContracts | undefined) {
  let hub: DeployContract = {
    codeId: networkStaking?.hub?.codeId || 0,
    address: networkStaking?.hub?.address
  };
  let reward: DeployContract = {
    codeId: networkStaking?.reward?.codeId || 0,
    address: networkStaking?.reward?.address
  };
  let bSeiToken: DeployContract = {
    codeId: networkStaking?.bSeiToken?.codeId || 0,
    address: networkStaking?.bSeiToken?.address
  };
  let rewardsDispatcher: DeployContract = {
    codeId: networkStaking?.rewardsDispatcher?.codeId || 0,
    address: networkStaking?.rewardsDispatcher?.address
  };
  let validatorsRegistry: DeployContract = {
    codeId: networkStaking?.validatorsRegistry?.codeId || 0,
    address: networkStaking?.validatorsRegistry?.address
  };
  let stSeiToken: DeployContract = {
    codeId: networkStaking?.stSeiToken?.codeId || 0,
    address: networkStaking?.stSeiToken?.address
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
 * oraclePyth
 */
export async function loadingMarketData(networkMarket: MarketDeployContracts | undefined) {
  let aToken: DeployContract = {
    codeId: networkMarket?.aToken?.codeId || 0,
    address: networkMarket?.aToken?.address
  };
  let market: DeployContract = {
    codeId: networkMarket?.market?.codeId || 0,
    address: networkMarket?.market?.address
  };
  let interestModel: DeployContract = {
    codeId: networkMarket?.interestModel?.codeId || 0,
    address: networkMarket?.interestModel?.address
  };
  let distributionModel: DeployContract = {
    codeId: networkMarket?.distributionModel?.codeId || 0,
    address: networkMarket?.distributionModel?.address
  };
  let oracle: DeployContract = {
    codeId: networkMarket?.oracle?.codeId || 0,
    address: networkMarket?.oracle?.address
  };
  let overseer: DeployContract = {
    codeId: networkMarket?.overseer?.codeId || 0,
    address: networkMarket?.overseer?.address
  };
  let liquidationQueue: DeployContract = {
    codeId: networkMarket?.liquidationQueue?.codeId || 0,
    address: networkMarket?.liquidationQueue?.address
  };
  let custodyBSei: DeployContract = {
    codeId: networkMarket?.custodyBSei?.codeId || 0,
    address: networkMarket?.custodyBSei?.address
  };
  let oraclePyth: DeployContract = {
    codeId: networkMarket?.oraclePyth?.codeId || 0,
    address: networkMarket?.oraclePyth?.address
  };

  return {
    aToken,
    market,
    interestModel,
    distributionModel,
    // oracle,
    overseer,
    liquidationQueue,
    custodyBSei,
    oraclePyth
  };
}
