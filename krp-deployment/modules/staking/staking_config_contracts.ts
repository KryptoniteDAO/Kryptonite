import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { doHubConfig, doOraclePythConfigFeedInfo, doStakingRewardsDispatcherUpdateConfig, doSwapSparrowSetWhitelist, oracleConfigs, printDeployedStakingContracts, queryHubParameters, readDeployedContracts } from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import { SWAP_EXTENSION_MODULE_NAME } from "@/modules/swap-extension/swap-extension_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { swapExtensionNetwork, oracleNetwork, cdpNetwork, tokenNetwork, stakingNetwork } = readDeployedContracts(walletData.chainId);
  const { swapSparrow } = swapExtensionNetwork;
  const { oraclePyth } = oracleNetwork;
  const { stable_coin_denom } = cdpNetwork;
  const { keeper } = tokenNetwork;

  if (!swapSparrow?.address) {
    throw new Error(`\n  --- --- config ${STAKING_MODULE_NAME} contracts error, Please deploy ${SWAP_EXTENSION_MODULE_NAME} contracts first --- ---`);
  }
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- config ${STAKING_MODULE_NAME} contracts error, Please deploy ${ORACLE_MODULE_NAME} contracts first --- ---`);
  }
  if (!stable_coin_denom) {
    throw new Error(`\n  --- --- config ${STAKING_MODULE_NAME} contracts error, Please deploy ${CDP_MODULE_NAME} contracts first --- ---`);
  }

  await printDeployedStakingContracts(stakingNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;

  await doHubConfig(walletData, stakingNetwork);
  await doStakingRewardsDispatcherUpdateConfig(walletData, stakingNetwork, keeper?.address, stable_coin_denom, print);
  await queryHubParameters(walletData, hub);

  /// add bAssetsToken feed price
  if (bAssetsToken?.address) {
    const feedInfo = Object.assign({ asset: bAssetsToken?.address }, oracleConfigs.baseFeedInfoConfig);
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
