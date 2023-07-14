import type { ContractDeployed, WalletData } from "@/types";
import type { BaseFeedInfo, OracleContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { oracleReadArtifact, printDeployedOracleContracts, deployOraclePyth, oracleConfigs, FeedInfo, doOraclePythConfigFeedInfo, writeDeployed } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy oracle contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;

  console.log(`\n  --- --- oracle contracts storeCode & instantiateContract enter --- ---`);

  await deployOraclePyth(walletData, networkOracle);
  await writeDeployed({});

  console.log(`\n  --- --- oracle contracts storeCode & instantiateContract end --- ---`);

  await printDeployedOracleContracts(networkOracle);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- oracle contracts configure enter --- ---`);
  const print: boolean = true;
  const oraclePyth: ContractDeployed | undefined = networkOracle?.oraclePyth;

  const baseFeedInfoConfig: BaseFeedInfo | undefined = oracleConfigs?.baseFeedInfoConfig;
  const feedInfoConfigList: FeedInfo[] | undefined = oracleConfigs?.feedInfoConfigList;
  if (!!feedInfoConfigList && feedInfoConfigList.length > 0) {
    for (const feedInfoConfig of feedInfoConfigList) {
      const feedInfo = Object.assign({}, baseFeedInfoConfig, feedInfoConfig);
      feedInfo.asset = feedInfo.asset.replace("%stable_coin_denom%", walletData.stable_coin_denom)
      await doOraclePythConfigFeedInfo(walletData, oraclePyth, feedInfo, print);
    }
  }

  console.log(`\n  --- --- oracle contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy oracle contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
