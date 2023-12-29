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
import { oracleContracts, stakingContracts } from "@/contracts";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const {
    swapExtensionNetwork: { swapSparrow } = {},
    oracleNetwork: { oraclePyth } = {},
    oracleNetwork = {},
    cdpNetwork: { stable_coin_denom } = {},
    tokenNetwork: { keeper } = {},
    stakingNetwork = {}
  } = network;

  await printDeployedStakingContracts(stakingNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;

  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;

  /// add stAssetsToken feed price
  if (stAssetsToken?.address) {
    const feedInfo = Object.assign({ asset: stAssetsToken?.address }, oracleConfigs.baseFeedInfoConfig);
    await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
  }

  const hubQueryClient = new stakingContracts.Hub.HubQueryClient(walletData?.activeWallet?.signingCosmWasmClient, hub?.address);
  const parameters = await hubQueryClient.parameters();
  if (parameters.reward_denom) {
    const oraclePythQueryClient = new oracleContracts.OraclePyth.OraclePythQueryClient(walletData?.activeWallet?.signingCosmWasmClient, oraclePyth.address);
    try {
      await oraclePythQueryClient.queryPrice({ "asset": parameters.reward_denom });
    } catch (e) {
      const feedInfo = oracleConfigs.feedInfoConfigList[0];
      let feedInfoParams = {
        asset: parameters.reward_denom,
        checkFeedAge: feedInfo.checkFeedAge,
        priceFeedAge: feedInfo.priceFeedAge,
        priceFeedDecimal: feedInfo.priceFeedDecimal,
        priceFeedId: feedInfo.priceFeedId,
        priceFeedSymbol: feedInfo.priceFeedSymbol
      };

      await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfoParams, print);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${STAKING_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
