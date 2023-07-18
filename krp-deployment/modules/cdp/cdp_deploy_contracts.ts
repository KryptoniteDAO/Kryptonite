import type { ContractDeployed, WalletData } from "@/types";
import type { CdpContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, CdpCollateralPairsConfig, OracleContractsDeployed } from "@/modules";
import { getStableCoinDenom, printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import {
  cdpReadArtifact,
  deployCdpCentralControl,
  deployCdpCustody,
  deployCdpLiquidationQueue,
  deployCdpStablePool,
  doCdpCentralControlSetWhitelistCollateral,
  doCdpCentralControlUpdateConfig,
  doCdpLiquidationQueueConfig,
  doCdpLiquidationQueueSetWhitelistCollateral,
  printDeployedCdpContracts,
  marketReadArtifact,
  stakingReadArtifact,
  cdpConfigs,
  oracleReadArtifact,
  writeDeployed,
  cdpWriteArtifact,
  deployCdpRewardBook,
  doCdpRewardBookUpdateConfig,
  CdpCollateralPairsDeployed,
  doCdpCustodyUpdateConfig,
  oracleConfigs,
  doOraclePythConfigFeedInfo,
  FeedInfo
} from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy cdp contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  // const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  const oraclePyth: ContractDeployed | undefined = networkOracle.oraclePyth;
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy oracle contracts first --- ---`);
  }

  console.log(`\n  --- --- cdp contracts storeCode & instantiateContract enter --- ---`);

  await deployCdpCentralControl(walletData, networkCdp, networkOracle?.oraclePyth);
  await deployCdpStablePool(walletData, networkCdp);
  await deployCdpLiquidationQueue(walletData, networkCdp, networkOracle?.oraclePyth);

  // if (networkCdp?.cdpStablePool?.address && !networkCdp.stable_coin_denom) {
  //   networkCdp.stable_coin_denom = getStableCoinDenom(networkCdp?.cdpStablePool?.address);
  //   cdpWriteArtifact(networkCdp, walletData.chainId);
  // }
  // const cdpCollateralPairsConfig: CdpCollateralPairsConfig[] | undefined = cdpConfigs?.cdpCollateralPairs;
  // if (!!cdpCollateralPairsConfig && cdpCollateralPairsConfig.length > 0) {
  //   const bSeiToken = networkStaking.bSeiToken;
  //   const stSeiToken = networkStaking.stSeiToken;
  //   for (const cdpCollateralPairConfig of cdpCollateralPairsConfig) {
  //     if (!!bSeiToken?.address) {
  //       cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%bsei_address%", bSeiToken.address);
  //     }
  //     if (!!stSeiToken?.address) {
  //       cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%stsei_address%", stSeiToken.address);
  //     }
  //     if (!cdpCollateralPairConfig.collateral || !cdpCollateralPairConfig.collateral.startsWith(walletData.prefix)) {
  //       continue;
  //     }
  //     await deployCdpRewardBook(walletData, networkCdp, cdpCollateralPairConfig, networkStaking?.reward);
  //     await deployCdpCustody(walletData, networkCdp, cdpCollateralPairConfig);
  //   }
  // }
  await writeDeployed({});

  console.log(`\n  --- --- cdp contracts storeCode & instantiateContract end --- ---`);

  await printDeployedCdpContracts(networkCdp);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- cdp contracts configure enter --- ---`);
  const print: boolean = true;

  await doCdpCentralControlUpdateConfig(walletData, networkCdp, networkOracle?.oraclePyth, print);
  await doCdpLiquidationQueueConfig(walletData, networkCdp, networkOracle?.oraclePyth, print);

  // if (!!cdpCollateralPairsConfig && cdpCollateralPairsConfig.length > 0) {
  //   const bSeiToken = networkStaking.bSeiToken;
  //   const stSeiToken = networkStaking.stSeiToken;
  //   for (const cdpCollateralPairConfig of cdpCollateralPairsConfig) {
  //     if (!!bSeiToken?.address) {
  //       cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%bsei_address%", bSeiToken.address);
  //     }
  //     if (!!stSeiToken?.address) {
  //       cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%stsei_address%", stSeiToken.address);
  //     }
  //     if (!cdpCollateralPairConfig.collateral || !cdpCollateralPairConfig.collateral.startsWith(walletData.prefix)) {
  //       continue;
  //     }
  //     const cdpCollateralPairNetwork = networkCdp?.cdpCollateralPairs?.find(v => cdpCollateralPairConfig?.collateral === v.collateral);
  //     const custody: ContractDeployed = cdpCollateralPairNetwork?.custody;
  //     if (!custody?.address) {
  //       continue;
  //     }
  //
  //     let cdpCollateralPairDeployed: CdpCollateralPairsDeployed | undefined = networkCdp?.cdpCollateralPairs?.["find"]?.(value => cdpCollateralPairConfig?.collateral === value.collateral);
  //
  //     await doCdpRewardBookUpdateConfig(walletData, networkCdp, cdpCollateralPairDeployed, networkStaking?.reward, print);
  //     await doCdpCustodyUpdateConfig(walletData, networkCdp, cdpCollateralPairDeployed, print);
  //
  //     await doCdpCentralControlSetWhitelistCollateral(walletData, networkCdp, cdpCollateralPairConfig, custody, print);
  //     await doCdpLiquidationQueueSetWhitelistCollateral(walletData, networkCdp, cdpCollateralPairConfig, print);
  //   }
  // }

  if (networkCdp?.stable_coin_denom) {
    const feedInfo: FeedInfo = oracleConfigs?.feedInfoConfigList?.find(value => "%stable_coin_denom%" === value.asset);
    if (!feedInfo) {
      return;
    }
    feedInfo.asset = feedInfo.asset.replace("%stable_coin_denom%", networkCdp?.stable_coin_denom);
    const feedInfo2 = Object.assign({}, oracleConfigs.baseFeedInfoConfig, feedInfo);
    await doOraclePythConfigFeedInfo(walletData, oraclePyth, feedInfo2, print);
  }

  console.log(`\n  --- --- cdp contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy cdp contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
