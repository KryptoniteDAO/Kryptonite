import type { ConfigResponse as StakingHubConfigResponse } from "@/contracts/staking/Hub.types";
import { loadingWalletData } from "@/env_data";
import { printDeployedStakingContracts, readDeployedContracts, stakingConfigs } from "@/modules";
import type { ContractDeployed, WalletData } from "@/types";
import { coins } from "@cosmjs/stargate";
import Decimal from "decimal.js";
import { executeContractByWalletData, printChangeBalancesByWalletData, queryAddressBalance, queryAddressTokenBalance, queryStaking, queryStakingDelegations, queryStakingParameters, queryWasmContractByWalletData } from "../../common";
import { STAKING_MODULE_NAME } from "./staking_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  const walletData = await loadingWalletData();

  const { cdpNetwork, stakingNetwork } = readDeployedContracts(walletData.chainId);

  if (!stakingNetwork) {
    throw new Error(`\n  --- --- verify deployed error, missing some deployed address info --- ---`);
  }
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;
  if (!hub?.address || !reward?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stAssetsToken?.address) {
    throw new Error(`\n  --- --- verify deployed error, missing some deployed address info --- ---`);
  }
  const { stable_coin_denom } = cdpNetwork;
  await printDeployedStakingContracts(stakingNetwork);
  console.log(`  stable_coin_denom: ${stable_coin_denom}`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  await queryHubConfig(walletData, hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken);

  // 1 + 1 + 1 + 0.5 + txFee
  let address1NativeBalance = walletData?.addressesBalances.find(v => walletData?.activeWallet?.address === v?.address && walletData?.nativeCurrency?.coinMinimalDenom === v?.balance?.denom)?.balance?.amount;

  if (Number(address1NativeBalance) < 4000000) {
    console.error("********* ********* wallet native balance insufficient 4_000_000. balance: " + address1NativeBalance);
    process.exit(0);
    return;
  }

  // await doHubBondForStAssets(walletData, walletData?.nativeCurrency?.coinMinimalDenom, hub, stAssetsToken, "100000");
  await doHubBondForBAssets(walletData, walletData?.nativeCurrency?.coinMinimalDenom, hub, bAssetsToken, "1000000");
  await doHubUnbondBAssetsToNative(walletData, walletData?.nativeCurrency?.coinMinimalDenom, bAssetsToken, hub, "100000");
  await doHubWithdrawUnbondedToNative(walletData, walletData?.nativeCurrency?.coinMinimalDenom, hub);

  await doHubUpdateRewards(walletData, walletData?.nativeCurrency?.coinMinimalDenom, hub, stable_coin_denom, "100000000");
  await doClaimRewards(walletData, walletData?.nativeCurrency?.coinMinimalDenom, reward, stable_coin_denom);

  await printMoreInfo(walletData, walletData?.nativeCurrency?.coinMinimalDenom, hub);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${STAKING_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);

async function queryHubConfig(walletData: WalletData, hub: ContractDeployed, reward: ContractDeployed, bAssetsToken: ContractDeployed, rewardsDispatcher: ContractDeployed, validatorsRegistry: ContractDeployed, stAssetsToken: ContractDeployed): Promise<any> {
  if (!hub?.address || !reward?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stAssetsToken?.address) {
    console.error("Query hub.address config error: missing address");
    return;
  }

  console.log(`\n  Query hub.address config enter`);
  const hubConfigRes = await queryWasmContractByWalletData<StakingHubConfigResponse>(walletData, hub.address, { config: {} });
  console.log(`Query hub.address config ok.: \n  ${JSON.stringify(hubConfigRes)}`);
  console.log(
    "check hub.address config result: ",
    rewardsDispatcher.address === hubConfigRes?.reward_dispatcher_contract && validatorsRegistry.address === hubConfigRes?.validators_registry_contract && bAssetsToken.address === hubConfigRes?.bsei_token_contract && stAssetsToken.address === hubConfigRes?.stsei_token_contract
  );

  return hubConfigRes;
}

async function doHubBondForStAssets(walletData: WalletData, nativeDenom: string, hub: ContractDeployed, stAssets: ContractDeployed, amount: number | string): Promise<void> {
  if (!hub?.address || !stAssets?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.warn(`\n  Do hub.address bond_for_st_assets enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  if (new Decimal(beforeNativeBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeNativeBalanceRes?.amount ?? 0}`);
    return;
  }
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, stAssets.address);

  console.log(`before native balance: ${beforeNativeBalanceRes.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${stAssets.address}`);
  const doRes = await executeContractByWalletData(walletData, hub.address, { bond_for_st_sei: {} }, "bond native to stAssets", coins(amount, nativeDenom));
  console.log(`Do hub.address bond_for_st_assets ok. nativeDenom: ${nativeDenom} / amount: ${amount} \n  ${doRes?.transactionHash}`);
  const afterNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`after native balance: ${afterNativeBalanceRes.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, stAssets.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${stAssets.address}`);
}

async function doHubBondForBAssets(walletData: WalletData, nativeDenom: string, hub: ContractDeployed, bAssets: ContractDeployed, amount: number | string): Promise<void> {
  if (!hub?.address || !bAssets?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address bond native coin to bAssets enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  if (new Decimal(beforeNativeBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeNativeBalanceRes?.amount ?? 0}`);
    return;
  }

  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssets.address);
  console.log(`before native balance: ${beforeNativeBalanceRes?.amount} ${nativeDenom}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${bAssets.address}`);
  const doRes = await executeContractByWalletData(walletData, hub.address, { bond: {} }, "bond native to bAssets", coins(amount, nativeDenom));
  console.log(`Do hub.address bond native coin to bAssets ok. \n  ${doRes?.transactionHash}`);
  const afterNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`after native balance: ${afterNativeBalanceRes?.amount} ${nativeDenom}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssets.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${bAssets.address}`);
}

async function doHubUnbondBAssetsToNative(walletData: WalletData, nativeDenom: string, bAssetsToken: ContractDeployed, hub: ContractDeployed, amount: string): Promise<void> {
  if (!bAssetsToken?.address || !hub?.address) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address unbond bAssets to native coin enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);
  const beforeTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssetsToken.address);
  if (new Decimal(beforeTokenBalanceRes?.balance ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The nativeDenom balance is insufficient. ${amount} but ${beforeTokenBalanceRes?.balance ?? 0}`);
    return;
  }
  const beforeUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData?.activeWallet?.address } });
  console.log(`before unbond_requests ok. \n  ${JSON.stringify(beforeUnbondRequestRes)}`);
  console.log(`before token balance: ${beforeTokenBalanceRes.balance} ${bAssetsToken.address}`);
  const doRes = await executeContractByWalletData(
    walletData,
    bAssetsToken.address,
    {
      send: {
        contract: hub.address,
        amount: amount,
        msg: Buffer.from(JSON.stringify({ unbond: {} })).toString("base64")
      }
    },
    "unbond bAssets to native"
  );
  console.log(`Do hub.address unbond bAssets to native coin ok. \n  ${doRes?.transactionHash}`);
  const afterTokenBalanceRes = await queryAddressTokenBalance(walletData?.cosmWasmClient, walletData?.activeWallet?.address, bAssetsToken.address);
  console.log(`after token balance: ${afterTokenBalanceRes.balance} ${bAssetsToken.address}`);
  const afterUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData?.activeWallet?.address } });
  console.log(`after unbond_requests ok. \n  ${JSON.stringify(afterUnbondRequestRes)}`);
}

async function doHubWithdrawUnbondedToNative(walletData: WalletData, nativeDenom: string, hub: ContractDeployed): Promise<void> {
  if (!hub?.address) {
    return;
  }
  console.log(`\n  Do hub.address withdraw unbonded enter`);

  const beforeWithdrawAbleRes = await queryWasmContractByWalletData(walletData, hub.address, { withdrawable_unbonded: { address: walletData?.activeWallet?.address } });
  console.log(`Query hub.address withdrawable_unbonded ok. address: ${walletData?.activeWallet?.address} \n  ${JSON.stringify(beforeWithdrawAbleRes)}`);
  if (!beforeWithdrawAbleRes?.["withdrawable"] || new Decimal(beforeWithdrawAbleRes?.["withdrawable"]).comparedTo(0) <= 0) {
    console.error(`\n  ********* unable to withdraw`, beforeWithdrawAbleRes?.["withdrawable"]);
    return;
  }
  const beforeNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`before native balance: ${beforeNativeBalanceRes?.amount} ${nativeDenom}`);

  // const doRes = await executeContractByWalletData(walletData, hub.address, { withdraw_unbonded: {} });
  // console.log(`Do hub.address withdraw_unbonded ok. \n  ${doRes?.transactionHash}`);
  const afterNativeBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, nativeDenom);
  console.log(`after native balance: ${afterNativeBalanceRes.amount} ${nativeDenom}`);
  const afterWithdrawAbleRes = await queryWasmContractByWalletData(walletData, hub.address, { withdrawable_unbonded: { address: walletData?.activeWallet?.address } });
  console.log(`Query hub.address withdrawable_unbonded ok. \n  ${JSON.stringify(afterWithdrawAbleRes)}`);
}

async function doHubUpdateRewards(walletData: WalletData, nativeDenom: string, hub: ContractDeployed, rewardDemon: string, amount: string): Promise<void> {
  if (!hub?.address || !rewardDemon) {
    return;
  }
  if (!amount || new Decimal(amount).comparedTo(0) < 0) {
    console.error(`\n  ********* The amount is missing.`);
    return;
  }
  console.log(`\n  Do hub.address update_global_index enter. nativeDenom: ${nativeDenom} / amount: ${amount}`);

  const beforeRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, rewardDemon);
  if (new Decimal(beforeRewardsDemonBalanceRes?.amount ?? 0).comparedTo(new Decimal(amount)) < 0) {
    console.error(`\n  ********* The rewardDemon balance is insufficient. ${amount} but ${beforeRewardsDemonBalanceRes?.amount ?? 0}`);
    return;
  }

  console.log(`before rewardDemon balance: ${beforeRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
  const doRes = await executeContractByWalletData(
    walletData,
    hub.address,
    {
      update_global_index: {}
    },
    "send rewards",
    coins(amount, rewardDemon)
  );
  console.log(`Do hub.address update_global_index ok. \n  ${doRes?.transactionHash}`);

  const afterRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, rewardDemon);
  console.log(`after rewardDemon balance: ${afterRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
}

async function doClaimRewards(walletData: WalletData, nativeDenom: string, reward: ContractDeployed, rewardDemon: string): Promise<void> {
  if (!reward?.address || !rewardDemon) {
    return;
  }

  console.log(`\n  Do reward.address claim rewards enter. rewardDemon: ${rewardDemon}`);

  const beforeAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, { accrued_rewards: { address: walletData?.activeWallet?.address } });
  console.log(`Query reward.address accrued_rewards ok. address: ${walletData?.activeWallet?.address} \n  ${JSON.stringify(beforeAccruedRewardsRes)}`);
  if (!beforeAccruedRewardsRes?.["rewards"] || new Decimal(beforeAccruedRewardsRes?.["rewards"]).comparedTo(0) <= 0) {
    console.error(`\n  ********* unable to claim`, beforeAccruedRewardsRes?.["rewards"]);
    return;
  }

  const beforeRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, rewardDemon);
  console.log(`before rewardDemon balance: ${beforeRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
  const doRes = await executeContractByWalletData(
    walletData,
    reward.address,
    {
      claim_rewards: {
        recipient: walletData?.activeWallet?.address
      }
    },
    "claim rewards"
  );
  console.log(`Do reward.address claim_rewards ok. \n  ${doRes?.transactionHash}`);

  const afterRewardsDemonBalanceRes = await queryAddressBalance(walletData, walletData?.activeWallet?.address, rewardDemon);
  console.log(`after rewardDemon balance: ${afterRewardsDemonBalanceRes?.amount} ${rewardDemon}`);
  const afterAccruedRewardsRes = await queryWasmContractByWalletData(walletData, reward.address, { accrued_rewards: { address: walletData?.activeWallet?.address } });
  console.log(`Query reward.address accrued_rewards ok. address: ${walletData?.activeWallet?.address} \n  ${JSON.stringify(afterAccruedRewardsRes)}`);
}

async function printMoreInfo(walletData: WalletData, nativeDenom: string, hub: ContractDeployed) {
  console.log(`\n  Query staking pool enter`);
  const stakingPoolRes = await queryStaking(walletData.LCD_ENDPOINT);
  console.log(`Query staking pool ok. \n  ${JSON.stringify(stakingPoolRes)}`);

  console.log(`\n  Query hub.address unbond_requests enter`);
  const hubUnbondRequestRes = await queryWasmContractByWalletData(walletData, hub.address, { unbond_requests: { address: walletData?.activeWallet?.address } });
  console.log(`Query hub.address unbond_requests ok. \n  ${JSON.stringify(hubUnbondRequestRes)}`);

  console.log(`\n  Query staking parameter enter`);
  const stakingParametersRes = await queryStakingParameters(walletData.LCD_ENDPOINT);
  console.log(`Query staking parameter ok. \n  ${JSON.stringify(stakingParametersRes)}`);

  console.log(`\n  Query hub.address staking delegations enter`);
  const stakingDelegationsRes = await queryStakingDelegations(walletData.LCD_ENDPOINT, hub.address, stakingConfigs.validators?.[0]);
  console.log(`Query hub.address staking delegations ok. \n  ${JSON.stringify(stakingDelegationsRes)}`);
}
