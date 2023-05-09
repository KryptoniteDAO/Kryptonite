import { DirectSecp256k1Wallet, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { toBeArray } from "ethers";
import { loadAddressesBalances } from "./common";
import type { DeployContractInfo } from "./types";

require("dotenv").config();

export async function loadingBaseData() {
  const LCD_ENDPOINT = process.env.LCD_ENDPOINT;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
  const mnemonic = process.env.MNEMONIC;
  const privateKey = process.env.PRIVATE_KEY;
  const mnemonic2 = process.env.MNEMONIC2;
  const privateKey2 = process.env.PRIVATE_KEY2;
  const validator = process.env.validator;
  const stable_coin_denom = process.env.stable_coin_denom;

  if (!LCD_ENDPOINT || !RPC_ENDPOINT || !validator || !stable_coin_denom) {
    console.log(`--- --- loading data error, missing some attributes --- ---`);
    process.exit(0);
    return;
  }
  if (!mnemonic && !privateKey) {
    console.log(`--- --- loading data error, missing address1 info --- ---`);
    process.exit(0);
    return;
  }
  if (!mnemonic2 && !privateKey2) {
    console.log(`--- --- loading data error, missing address2 info --- ---`);
    process.exit(0);
    return;
  }

  const prefix = process.env.PREFIX || "sei";
  const wallet = privateKey ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
  const [account] = await wallet.getAccounts();
  const wallet2 = privateKey2 ? await DirectSecp256k1Wallet.fromKey(toBeArray(privateKey2), prefix) : await DirectSecp256k1HdWallet.fromMnemonic(mnemonic2, { prefix });
  const [account2] = await wallet2.getAccounts();

  const addressesBalances = await loadAddressesBalances(LCD_ENDPOINT, [account.address, account2.address], ["usei", stable_coin_denom]);

  return {
    LCD_ENDPOINT,
    RPC_ENDPOINT,
    mnemonic,
    privateKey,
    wallet,
    account,
    mnemonic2,
    privateKey2,
    wallet2,
    account2,
    validator,
    stable_coin_denom,
    prefix,
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
export async function loadingStakingData() {
  let hub: DeployContractInfo = {
    codeId: (process.env.hubCodeId && Number(process.env.hubCodeId)) || 0,
    address: process.env.hubAddress,
    filePath: process.env.hubFilePath || "../krp-staking-contracts/artifacts/basset_sei_hub.wasm",
    deploy: false
  };
  let reward: DeployContractInfo = {
    codeId: (process.env.rewardCodeId && Number(process.env.rewardCodeId)) || 0,
    address: process.env.rewardAddress,
    filePath: process.env.rewardFilePath || "../krp-staking-contracts/artifacts/basset_sei_reward.wasm",
    deploy: false
  };
  let bSeiToken: DeployContractInfo = {
    codeId: (process.env.bSeiTokenCodeId && Number(process.env.bSeiTokenCodeId)) || 0,
    address: process.env.bSeiTokenAddress,
    filePath: process.env.bSeiTokenFilePath || "../krp-staking-contracts/artifacts/basset_sei_token_bsei.wasm",
    deploy: false
  };
  let rewardsDispatcher: DeployContractInfo = {
    codeId: (process.env.rewardsDispatcherCodeId && Number(process.env.rewardsDispatcherCodeId)) || 0,
    address: process.env.rewardsDispatcherAddress,
    filePath: process.env.rewardsDispatcherFilePath || "../krp-staking-contracts/artifacts/basset_sei_rewards_dispatcher.wasm",
    deploy: false
  };
  let validatorsRegistry: DeployContractInfo = {
    codeId: (process.env.validatorsRegistryCodeId && Number(process.env.validatorsRegistryCodeId)) || 0,
    address: process.env.validatorsRegistryAddress,
    filePath: process.env.validatorsRegistryFilePath || "../krp-staking-contracts/artifacts/basset_sei_validators_registry.wasm",
    deploy: false
  };
  let stSeiToken: DeployContractInfo = {
    codeId: (process.env.stSeiTokenCodeId && Number(process.env.stSeiTokenCodeId)) || 0,
    address: process.env.stSeiTokenAddress,
    filePath: process.env.stSeiTokenFilePath || "../krp-staking-contracts/artifacts/basset_sei_token_stsei.wasm",
    deploy: false
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
 * market
 * aToken
 * interestModel
 * distributionModel
 * oracle
 * liquidationQueue
 * overseer
 * custodyBSei
 */
export async function loadingMarketData() {
  let overseer: DeployContractInfo = {
    codeId: (process.env.overseerCodeId && Number(process.env.overseerCodeId)) || 0,
    address: process.env.overseerAddress,
    filePath: process.env.overseerFilePath || "../krp-market-contracts/artifacts/moneymarket_overseer.wasm",
    deploy: false
  };
  let market: DeployContractInfo = {
    codeId: (process.env.marketCodeId && Number(process.env.marketCodeId)) || 0,
    address: process.env.marketAddress,
    filePath: process.env.marketFilePath || "../krp-market-contracts/artifacts/moneymarket_market.wasm",
    deploy: false
  };
  let custodyBSei: DeployContractInfo = {
    codeId: (process.env.custodyBSeiCodeId && Number(process.env.custodyBSeiCodeId)) || 0,
    address: process.env.custodyBSeiAddress,
    filePath: process.env.custodyBSeiFilePath || "../krp-market-contracts/artifacts/moneymarket_custody_bsei.wasm",
    deploy: false
  };
  let interestModel: DeployContractInfo = {
    codeId: (process.env.interestModelCodeId && Number(process.env.interestModelCodeId)) || 0,
    address: process.env.interestModelAddress,
    filePath: process.env.interestModelFilePath || "../krp-market-contracts/artifacts/moneymarket_interest_model.wasm",
    deploy: false
  };
  let distributionModel: DeployContractInfo = {
    codeId: (process.env.distributionModelCodeId && Number(process.env.distributionModelCodeId)) || 0,
    address: process.env.distributionModelAddress,
    filePath: process.env.distributionModelFilePath || "../krp-market-contracts/artifacts/moneymarket_distribution_model.wasm",
    deploy: false
  };
  let oracle: DeployContractInfo = {
    codeId: (process.env.oracleCodeId && Number(process.env.oracleCodeId)) || 0,
    address: process.env.oracleAddress,
    filePath: process.env.oracleFilePath || "../krp-market-contracts/artifacts/moneymarket_oracle.wasm",
    deploy: false
  };
  let aToken: DeployContractInfo = {
    codeId: (process.env.aTokenCodeId && Number(process.env.aTokenCodeId)) || 0,
    address: process.env.aTokenAddress,
    filePath: process.env.aTokenFilePath || "../cw-plus/artifacts/cw20_base.wasm",
    deploy: false
  };
  let liquidationQueue: DeployContractInfo = {
    codeId: (process.env.liquidationQueueCodeId && Number(process.env.liquidationQueueCodeId)) || 0,
    address: process.env.liquidationQueueAddress,
    filePath: process.env.liquidationQueueFilePath || "../krp-market-contracts/artifacts/moneymarket_liquidation_queue.wasm",
    deploy: false
  };

  return {
    overseer,
    market,
    custodyBSei,
    interestModel,
    distributionModel,
    oracle,
    aToken,
    liquidationQueue
  };
}
