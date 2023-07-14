import type { ContractDeployed, WalletData } from "@/types";
import type { CdpContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, CdpCollateralPairsConfig, OracleContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
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
  cdpConfigs, oracleReadArtifact, writeDeployed
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

  console.log(`\n  --- --- cdp contracts storeCode & instantiateContract enter --- ---`);

  await deployCdpCentralControl(walletData, networkCdp, networkOracle?.oraclePyth);
  await deployCdpStablePool(walletData, networkCdp);
  await deployCdpLiquidationQueue(walletData, networkCdp, networkOracle?.oraclePyth);

  const cdpCollateralPairsConfig: CdpCollateralPairsConfig[] | undefined = cdpConfigs?.cdpCollateralPairs;
  if (!!cdpCollateralPairsConfig && cdpCollateralPairsConfig.length > 0) {
    const bSeiToken = networkStaking.bSeiToken;
    const stSeiToken = networkStaking.stSeiToken;
    for (const cdpCollateralPairConfig of cdpCollateralPairsConfig) {
      if (!!bSeiToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%bsei_address%", bSeiToken.address);
      }
      if (!!stSeiToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%stsei_address%", stSeiToken.address);
      }
      if (!cdpCollateralPairConfig.collateral || !cdpCollateralPairConfig.collateral.startsWith(walletData.prefix)) {
        continue;
      }
      await deployCdpCustody(walletData, networkCdp, cdpCollateralPairConfig);
    }
  }
  await writeDeployed({});

  console.log(`\n  --- --- cdp contracts storeCode & instantiateContract end --- ---`);

  await printDeployedCdpContracts(networkCdp);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- cdp contracts configure enter --- ---`);
  const print: boolean = true;

  await doCdpCentralControlUpdateConfig(walletData, networkCdp, networkOracle?.oraclePyth, print);
  await doCdpLiquidationQueueConfig(walletData, networkCdp, networkOracle?.oraclePyth, print);

  if (!!cdpCollateralPairsConfig && cdpCollateralPairsConfig.length > 0) {
    const bSeiToken = networkStaking.bSeiToken;
    const stSeiToken = networkStaking.stSeiToken;
    for (const cdpCollateralPairConfig of cdpCollateralPairsConfig) {
      if (!!bSeiToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%bsei_address%", bSeiToken.address);
      }
      if (!!stSeiToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%stsei_address%", stSeiToken.address);
      }
      if (!cdpCollateralPairConfig.collateral || !cdpCollateralPairConfig.collateral.startsWith(walletData.prefix)) {
        continue;
      }
      const cdpCollateralPairNetwork = networkCdp?.cdpCollateralPairs?.find(v => cdpCollateralPairConfig?.collateral === v.collateral);
      const custody: ContractDeployed = cdpCollateralPairNetwork?.custody;
      if (!custody?.address) {
        continue;
      }
      await doCdpCentralControlSetWhitelistCollateral(walletData, networkCdp, cdpCollateralPairConfig, custody, print);
      await doCdpLiquidationQueueSetWhitelistCollateral(walletData, networkCdp, cdpCollateralPairConfig, print);
    }
  }

  console.log(`\n  --- --- cdp contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy cdp contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
