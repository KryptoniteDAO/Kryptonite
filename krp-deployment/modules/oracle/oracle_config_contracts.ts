import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { BaseFeedInfo, FeedInfo } from "@/modules";
import { doOraclePythConfigFeedInfo, oracleConfigs, printDeployedOracleContracts, readDeployedContracts } from "@/modules";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${ORACLE_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const { oracleNetwork } = readDeployedContracts(walletData.chainId);
  await printDeployedOracleContracts(oracleNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

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
      await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${ORACLE_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
