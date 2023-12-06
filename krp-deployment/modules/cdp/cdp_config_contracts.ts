import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { CdpCollateralPairsDeployed, CdpContractsDeployed, FeedInfo, StakingContractsDeployed } from "@/modules";
import {
  cdpConfigs,
  doCdpCentralControlSetWhitelistCollateral,
  doCdpCentralControlUpdateConfig,
  doCdpCustodyUpdateConfig,
  doCdpLiquidationQueueConfig,
  doCdpLiquidationQueueSetWhitelistCollateral,
  doCdpRewardBookUpdateConfig,
  doCdpStableCoinDenomMetadata,
  doOraclePythConfigFeedInfo,
  oracleConfigs,
  printDeployedCdpContracts,
  readDeployedContracts,
  stakingConfigs
} from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import type { ContractDeployed, WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${CDP_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network = readDeployedContracts(walletData.chainId);
  const { oracleNetwork: { oraclePyth } = {}, cdpNetwork = {} as CdpContractsDeployed, stakingNetwork = {} as StakingContractsDeployed } = network;
  const { stable_coin_denom } = cdpNetwork;

  await printDeployedCdpContracts(cdpNetwork);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;

  await doCdpStableCoinDenomMetadata(walletData, cdpNetwork, print);
  await doCdpCentralControlUpdateConfig(walletData, cdpNetwork, oraclePyth, stakingNetwork?.bAssetsToken, print);
  await doCdpLiquidationQueueConfig(walletData, cdpNetwork, oraclePyth, print);

  if (!!stable_coin_denom) {
    const feedInfo: FeedInfo = oracleConfigs?.feedInfoConfigList?.find(value => "%stable_coin_denom%" === value.asset);
    if (!feedInfo) {
      return;
    }
    feedInfo.asset = feedInfo.asset.replace("%stable_coin_denom%", stable_coin_denom);
    const feedInfo2 = Object.assign({}, oracleConfigs.baseFeedInfoConfig, feedInfo);
    await doOraclePythConfigFeedInfo(walletData, network?.oracleNetwork, feedInfo2, print);
  }

  const { cdpCollateralPairs } = cdpConfigs;
  if (!!cdpCollateralPairs && cdpCollateralPairs.length > 0) {
    const bAssetsToken = stakingNetwork.bAssetsToken;
    const stAssetsToken = stakingNetwork.stAssetsToken;
    for (const cdpCollateralPairConfig of cdpCollateralPairs) {
      if (!!bAssetsToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%bassets_address%", bAssetsToken.address);
      }
      if (!!stAssetsToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%stassets_address%", stAssetsToken.address);
      }
      if (!cdpCollateralPairConfig.collateral || !cdpCollateralPairConfig.collateral.startsWith(walletData.prefix)) {
        continue;
      }
      const cdpCollateralPairNetwork = cdpNetwork?.cdpCollateralPairs?.find(v => cdpCollateralPairConfig?.collateral === v.collateral);
      const custody: ContractDeployed = cdpCollateralPairNetwork?.custody;
      const rewardBook: ContractDeployed = cdpCollateralPairNetwork?.rewardBook;
      if (!custody?.address || !rewardBook?.address) {
        continue;
      }

      let cdpCollateralPairDeployed: CdpCollateralPairsDeployed | undefined = cdpNetwork?.cdpCollateralPairs?.["find"]?.(value => cdpCollateralPairConfig?.collateral === value.collateral);

      await doCdpRewardBookUpdateConfig(walletData, cdpNetwork, cdpCollateralPairDeployed, stakingNetwork?.reward, print);
      await doCdpCustodyUpdateConfig(walletData, cdpNetwork, cdpCollateralPairDeployed, print);

      // reset collateral name & symbol
      if (cdpCollateralPairConfig.collateral === bAssetsToken?.address) {
        cdpCollateralPairConfig.centralControlWhitelistConfig.name = stakingConfigs?.bAssetsToken?.initMsg?.name ?? cdpCollateralPairConfig?.centralControlWhitelistConfig?.name;
        cdpCollateralPairConfig.centralControlWhitelistConfig.symbol = stakingConfigs?.bAssetsToken?.initMsg?.symbol ?? cdpCollateralPairConfig?.centralControlWhitelistConfig?.symbol;
      } else if (cdpCollateralPairConfig.collateral === stAssetsToken?.address) {
        cdpCollateralPairConfig.centralControlWhitelistConfig.name = stakingConfigs?.stAssetsToken?.initMsg?.name ?? cdpCollateralPairConfig?.centralControlWhitelistConfig?.name;
        cdpCollateralPairConfig.centralControlWhitelistConfig.symbol = stakingConfigs?.stAssetsToken?.initMsg?.symbol ?? cdpCollateralPairConfig?.centralControlWhitelistConfig?.symbol;
      }

      await doCdpCentralControlSetWhitelistCollateral(walletData, cdpNetwork, cdpCollateralPairConfig, custody, rewardBook, print);
      await doCdpLiquidationQueueSetWhitelistCollateral(walletData, cdpNetwork, cdpCollateralPairConfig, print);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${CDP_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
