import type { WalletData } from "@/types";
import type { BaseFeedInfo, OracleContractsDeployed, FeedInfo } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { ChainId, loadingWalletData } from "@/env_data";
import { oracleReadArtifact, printDeployedOracleContracts, deployOraclePyth, oracleConfigs, doOraclePythConfigFeedInfo, writeDeployed, deployMockOracle } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy oracle contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;

  console.log(`\n  --- --- oracle contracts storeCode & instantiateContract enter --- ---`);

  if (ChainId.ATLANTIC_2 !== walletData.chainId) {
    await deployMockOracle(walletData, networkOracle);
  }
  await deployOraclePyth(walletData, networkOracle);
  await writeDeployed({});

  console.log(`\n  --- --- oracle contracts storeCode & instantiateContract end --- ---`);

  await printDeployedOracleContracts(networkOracle);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- oracle contracts configure enter --- ---`);
  const print: boolean = true;

  const baseFeedInfoConfig: BaseFeedInfo | undefined = oracleConfigs?.baseFeedInfoConfig;
  const feedInfoConfigList: FeedInfo[] | undefined = oracleConfigs?.feedInfoConfigList;
  if (!!feedInfoConfigList && feedInfoConfigList.length > 0) {
    for (const feedInfoConfig of feedInfoConfigList) {
      const feedInfo = Object.assign({}, baseFeedInfoConfig, feedInfoConfig);
      // feedInfo.asset = feedInfo.asset.replace("%stable_coin_denom%", stable_coin_denom);
      // if (feedInfo.asset.startsWith("%")) {
      feedInfo.asset = feedInfo.asset.replace("%native_coin_minimal_denom%", walletData.nativeCurrency?.coinMinimalDenom).replaceAll(/%.*%/g, "");
      if (!feedInfo.asset) {
        continue;
      }
      await doOraclePythConfigFeedInfo(walletData, networkOracle, feedInfo, print);
    }
  }

  console.log(`\n  --- --- oracle contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy oracle contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
