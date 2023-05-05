import {DirectSecp256k1Wallet, DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {parseCoins, coins} from "@cosmjs/stargate";
import {toBeArray} from "ethers";
import {
  storeCode, instantiateContract, executeContract, queryStakingDelegations,
  queryWasmContract, queryAddressBalance, queryStaking, queryStakingParameters, sendCoin, queryAddressAllBalances
} from "./common";
import type {DeployContractInfo} from "./types";

require("dotenv").config();

export async function loadingStakingData() {

  const LCD_ENDPOINT = process.env.LCD_ENDPOINT;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
  const mnemonic = process.env.MNEMONIC;
  const privateKey = process.env.PRIVATE_KEY;
  const mnemonic2 = process.env.MNEMONIC2;
  const privateKey2 = process.env.PRIVATE_KEY2;
  const validator = process.env.validator;
  const stable_coin_denom = process.env.stable_coin_denom;

  if (!LCD_ENDPOINT || !RPC_ENDPOINT || !validator || !stable_coin_denom) {
    console.log(`--- --- loading data error, missing some attributes --- ---`)
    process.exit(0);
    return;
  }
  if (!mnemonic && !privateKey) {
    console.log(`--- --- loading data error, missing address1 info --- ---`)
    process.exit(0);
    return;
  }
  if (!mnemonic2 && !privateKey2) {
    console.log(`--- --- loading data error, missing address2 info --- ---`)
    process.exit(0);
    return;
  }

  const prefix = process.env.PREFIX ?? "sei";
  const wallet = privateKey ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix});
  const [account] = await wallet.getAccounts();
  const wallet2 = privateKey2 ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey2), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic2, {prefix});
  const [account2] = await wallet2.getAccounts();

  const address1NativeBalance = await queryAddressBalance(LCD_ENDPOINT, account.address, "usei");
  const address1StableCoinBalance = await queryAddressBalance(LCD_ENDPOINT, account.address, stable_coin_denom);
  const address2NativeBalance = await queryAddressBalance(LCD_ENDPOINT, account2.address, "usei");
  const address2StableCoinBalance = await queryAddressBalance(LCD_ENDPOINT, account2.address, stable_coin_denom);

  console.log()
  console.log(`--- --- before balances --- ---`);
  console.table([
    {address: account.address, nativeBalance: JSON.stringify(address1NativeBalance.balance), stableCoinBalance: JSON.stringify(address1StableCoinBalance.balance)},
    {address: account2.address, nativeBalance: JSON.stringify(address2NativeBalance.balance), stableCoinBalance: JSON.stringify(address2StableCoinBalance.balance)},
  ], [`address`, `nativeBalance`, `stableCoinBalance`]);

  let hub: DeployContractInfo = {
    codeId: (process.env.hubCodeId && Number(process.env.hubCodeId)) ?? 0,
    address: process.env.hubAddress,
    filePath: process.env.hubFilePath ?? "../krp-staking/artifacts/basset_sei_hub.wasm",
    deploy: false
  }
  let reward: DeployContractInfo = {
    codeId: (process.env.rewardCodeId && Number(process.env.rewardCodeId)) ?? 0,
    address: process.env.rewardAddress,
    filePath: process.env.rewardFilePath ?? "../krp-staking/artifacts/basset_sei_reward.wasm",
    deploy: false
  }
  let bSeiToken: DeployContractInfo = {
    codeId: (process.env.bSeiTokenCodeId && Number(process.env.bSeiTokenCodeId)) ?? 0,
    address: process.env.bSeiTokenAddress,
    filePath: process.env.bSeiTokenFilePath ?? "../krp-staking/artifacts/basset_sei_token_bsei.wasm",
    deploy: false
  }
  let rewardsDispatcher: DeployContractInfo = {
    codeId: (process.env.rewardsDispatcherCodeId && Number(process.env.rewardsDispatcherCodeId)) ?? 0,
    address: process.env.rewardsDispatcherAddress,
    filePath: process.env.rewardsDispatcherFilePath ?? "../krp-staking/artifacts/basset_sei_rewards_dispatcher.wasm",
    deploy: false
  }
  let validatorsRegistry: DeployContractInfo = {
    codeId: (process.env.validatorsRegistryCodeId && Number(process.env.validatorsRegistryCodeId)) ?? 0,
    address: process.env.validatorsRegistryAddress,
    filePath: process.env.validatorsRegistryFilePath ?? "../krp-staking/artifacts/basset_sei_validators_registry.wasm",
    deploy: false
  }
  let stSeiToken: DeployContractInfo = {
    codeId: (process.env.stSeiTokenCodeId && Number(process.env.stSeiTokenCodeId)) ?? 0,
    address: process.env.stSeiTokenAddress,
    filePath: process.env.stSeiTokenFilePath ?? "../krp-staking/artifacts/basset_sei_token_stsei.wasm",
    deploy: false
  }

  return {
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    mnemonic,
    privateKey,
    account,
    mnemonic2,
    privateKey2,
    account2,
    validator,
    stable_coin_denom,
    prefix,
    wallet,
    wallet2,
    hub,
    reward,
    bSeiToken,
    rewardsDispatcher,
    validatorsRegistry,
    stSeiToken,
  }
}

