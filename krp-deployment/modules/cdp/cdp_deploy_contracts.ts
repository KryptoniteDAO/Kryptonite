import type { ContractDeployed, WalletData } from "@/types";
import type { CdpContractsDeployed, OracleContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { cdpReadArtifact, deployCdpCentralControl, deployCdpLiquidationQueue, deployCdpStablePool, doCdpCentralControlUpdateConfig, doCdpLiquidationQueueConfig, printDeployedCdpContracts, oracleReadArtifact, writeDeployed, oracleConfigs, doOraclePythConfigFeedInfo, FeedInfo } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy cdp contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;

  const oraclePyth: ContractDeployed | undefined = networkOracle.oraclePyth;
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy oracle contracts first --- ---`);
  }

  console.log(`\n  --- --- cdp contracts storeCode & instantiateContract enter --- ---`);

  await deployCdpCentralControl(walletData, networkCdp, networkOracle?.oraclePyth);
  await deployCdpStablePool(walletData, networkCdp);
  await deployCdpLiquidationQueue(walletData, networkCdp, networkOracle?.oraclePyth);

  await writeDeployed({});

  console.log(`\n  --- --- cdp contracts storeCode & instantiateContract end --- ---`);

  await printDeployedCdpContracts(networkCdp);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- cdp contracts configure enter --- ---`);
  const print: boolean = true;

  await doCdpCentralControlUpdateConfig(walletData, networkCdp, networkOracle?.oraclePyth, print);
  await doCdpLiquidationQueueConfig(walletData, networkCdp, networkOracle?.oraclePyth, print);

  if (networkCdp?.stable_coin_denom) {
    const feedInfo: FeedInfo = oracleConfigs?.feedInfoConfigList?.find(value => "%stable_coin_denom%" === value.asset);
    if (!feedInfo) {
      return;
    }
    feedInfo.asset = feedInfo.asset.replace("%stable_coin_denom%", networkCdp?.stable_coin_denom);
    const feedInfo2 = Object.assign({}, oracleConfigs.baseFeedInfoConfig, feedInfo);
    await doOraclePythConfigFeedInfo(walletData, networkOracle, feedInfo2, print);
  }

  console.log(`\n  --- --- cdp contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy cdp contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
