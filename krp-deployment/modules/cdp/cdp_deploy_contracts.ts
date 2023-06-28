import type { WalletData } from "@/types";
import type { CdpCollateralInfo, CdpContractsDeployed, MarketContractsDeployed, StakingContractsDeployed } from "@/modules";
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
  stakingReadArtifact
} from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy cdp contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  // const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  console.log();
  console.log(`--- --- cdp contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployCdpCentralControl(walletData, networkCdp, networkMarket?.oraclePyth);
  await deployCdpStablePool(walletData, networkCdp);
  await deployCdpLiquidationQueue(walletData, networkCdp, networkMarket?.oraclePyth);

  const cdpCollateralList: CdpCollateralInfo[] = [];
  const bSeiToken = networkStaking.bSeiToken;
  if (bSeiToken?.address) {
    cdpCollateralList.push({
      collateral: bSeiToken.address,
      collateralName: "bSEI",
      symbol: "bSEI",
      max_ltv: "0.6",
      bid_threshold: "200000000",
      max_slot: 10,
      premium_rate_per_slot: "0.01"
    });
  }
  const stSeiToken = networkStaking.stSeiToken;
  if (stSeiToken?.address) {
    cdpCollateralList.push({ collateral: stSeiToken.address, collateralName: "stSEI", symbol: "stSEI", max_ltv: "0.6", bid_threshold: "200000000", max_slot: 10, premium_rate_per_slot: "0.01" });
  }
  if (cdpCollateralList.length > 0) {
    for (let cdpCollateralInfo of cdpCollateralList) {
      await deployCdpCustody(walletData, networkCdp, cdpCollateralInfo);
    }
  }

  console.log();
  console.log(`--- --- cdp contracts storeCode & instantiateContract end --- ---`);

  await printDeployedCdpContracts(networkCdp);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- cdp contracts configure enter --- ---`);
  const print: boolean = true;

  await doCdpCentralControlUpdateConfig(walletData, networkCdp, networkMarket?.oraclePyth, print);
  await doCdpLiquidationQueueConfig(walletData, networkCdp, networkMarket?.oraclePyth, print);

  if (cdpCollateralList.length > 0) {
    for (const cdpCollateralInfo of cdpCollateralList) {
      const custodyAddress: string | undefined = networkCdp?.cdpCollateralPairs?.["find"]?.(value => cdpCollateralInfo?.collateral === value.collateral)?.custody?.address;
      if (!custodyAddress) {
        continue;
      }
      cdpCollateralInfo.custody = custodyAddress;
      await doCdpCentralControlSetWhitelistCollateral(walletData, networkCdp, cdpCollateralInfo, print);
      await doCdpLiquidationQueueSetWhitelistCollateral(walletData, networkCdp, cdpCollateralInfo, print);
    }
  }

  console.log();
  console.log(`--- --- cdp contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy cdp contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
