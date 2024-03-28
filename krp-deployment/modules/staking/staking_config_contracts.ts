import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import {
  doOraclePythConfigFeedInfo,
  doStakingHubUpdateConfig,
  doStakingHubUpdateParameters,
  doStakingRewardsDispatcherUpdateConfig,
  doStakingRewardUpdateConfig,
  doSwapSparrowSetWhitelist,
  oracleConfigs,
  printDeployedStakingContracts,
  queryHubParameters,
  readDeployedContracts
} from "@/modules";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const { swapExtensionNetwork: { swapSparrow } = {}, oracleNetwork = {}, cdpNetwork: { stable_coin_denom } = {}, tokenNetwork: { keeper } = {}, stakingNetwork = {} } = network;

  await printDeployedStakingContracts(stakingNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;

  await doStakingHubUpdateConfig(walletData, stakingNetwork);
  await doStakingHubUpdateParameters(walletData, network);
  await doStakingRewardUpdateConfig(walletData, network);
  await doStakingRewardsDispatcherUpdateConfig(walletData, network, print);
  await queryHubParameters(walletData, hub);

  /// add bAssetsToken feed price
  if (bAssetsToken?.address) {
    const feedInfo = Object.assign({ asset: bAssetsToken?.address }, oracleConfigs.baseFeedInfoConfig);
    await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
  }
  if (stAssetsToken?.address) {
    const feedInfo = Object.assign({ asset: stAssetsToken?.address }, oracleConfigs.baseFeedInfoConfig);
    await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
  }

  /// add staking.reward & staking.rewardsDispatcher to swap whitelist
  const swapWhitelistList: {
    caller: string;
    isWhitelist: boolean;
  }[] = [];
  if (reward?.address) {
    swapWhitelistList.push({ caller: reward?.address, isWhitelist: true });
  }
  if (rewardsDispatcher?.address) {
    swapWhitelistList.push({ caller: rewardsDispatcher?.address, isWhitelist: true });
  }
  if (swapWhitelistList.length > 0) {
    for (const swapWhitelist of swapWhitelistList) {
      await doSwapSparrowSetWhitelist(walletData, swapSparrow, swapWhitelist, print);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${STAKING_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
