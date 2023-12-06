import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { doOraclePythConfigFeedInfo, doSwapSparrowUpdatePairConfig, oracleConfigs, printDeployedSwapContracts, readDeployedContracts, swapExtensionConfigs } from "@/modules";
import { SWAP_EXTENSION_MODULE_NAME } from "@/modules/swap-extension/swap-extension_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { swapExtensionNetwork, oracleNetwork } = readDeployedContracts(walletData.chainId);
  const { swapSparrow } = swapExtensionNetwork;

  await printDeployedSwapContracts(swapExtensionNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = true;

  /// config swap pair
  const { baseFeedInfoConfig } = oracleConfigs;
  const { swapPairConfigList } = swapExtensionConfigs;
  if (!!swapPairConfigList && swapPairConfigList.length > 0) {
    for (let pairConfig of swapPairConfigList) {
      await doSwapSparrowUpdatePairConfig(walletData, swapSparrow, pairConfig, print);

      /// add assetInfos feed price
      if (!!oracleNetwork?.oraclePyth) {
        const { oracleFeedInfoConfigs } = pairConfig;
        if (!!oracleFeedInfoConfigs && oracleFeedInfoConfigs.length > 0) {
          for (const feedInfoConfig of oracleFeedInfoConfigs) {
            if (!feedInfoConfig?.asset || !feedInfoConfig?.priceFeedId) {
              console.log(`\n  skip oracle.oraclePyth assets feedInfo: ${feedInfoConfig?.asset} / ${feedInfoConfig?.priceFeedId}`);
              continue;
            }
            const feedInfo = Object.assign({}, baseFeedInfoConfig, feedInfoConfig);
            await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
          }
        }
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
