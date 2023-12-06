import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { convertConfigs, doConverterRegisterTokens, doLiquidationQueueWhitelistCollateral, doOraclePythConfigFeedInfo, doOverseerWhitelist, doSwapSparrowSetWhitelist, oracleConfigs, printDeployedConvertContracts, readDeployedContracts } from "@/modules";
import { MARKET_MODULE_NAME } from "@/modules/market/market_constants";
import type { WalletData } from "@/types";
import { CONVERT_MODULE_NAME } from "./convert_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${CONVERT_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { convertNetwork, swapExtensionNetwork, oracleNetwork, marketNetwork } = readDeployedContracts(walletData.chainId);

  if (!convertNetwork) {
    throw new Error(`\n  --- --- config ${CONVERT_MODULE_NAME} contracts error, missing some deployed ${CONVERT_MODULE_NAME} address info --- ---`);
  }
  if (!marketNetwork) {
    throw new Error(`\n  --- --- config ${CONVERT_MODULE_NAME} contracts error, missing some deployed ${MARKET_MODULE_NAME} address info --- ---`);
  }
  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBAssets } = marketNetwork;
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBAssets?.address) {
    throw new Error(`\n  --- --- config ${CONVERT_MODULE_NAME} contracts error, missing some deployed ${MARKET_MODULE_NAME} address info --- ---`);
  }
  const { swapSparrow } = swapExtensionNetwork;

  await printDeployedConvertContracts(convertNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const print: boolean = false;

  const { baseFeedInfoConfig } = oracleConfigs;
  const { convertPairs } = convertConfigs;
  if (convertPairs && convertPairs.length > 0) {
    for (let convertPairsConfig of convertPairs) {
      const nativeDenom = convertPairsConfig?.assets?.nativeDenom;
      const nativeDenomDecimals = convertPairsConfig?.assets?.nativeDenomDecimals;
      if (!nativeDenom) {
        console.error(`\n  config ${CONVERT_MODULE_NAME} pair error: missing pair's nativeDenom or nativeDenomDecimals`);
        continue;
      }
      const convertPairsNetwork = convertNetwork?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
      if (!convertPairsConfig || !convertPairsNetwork) {
        continue;
      }
      // const converterConfig = convertPairsConfig?.converter;
      // const bAssetsTokenConfig = convertPairsConfig?.bAssetsToken;
      // const custodyConfig = convertPairsConfig?.custody;

      const converterNetwork = convertPairsNetwork?.converter;
      const bAssetsTokenNetwork = convertPairsNetwork?.bAssetsToken;
      const custodyNetwork = convertPairsNetwork?.custody;

      await doConverterRegisterTokens(walletData, nativeDenom, converterNetwork, bAssetsTokenNetwork, nativeDenomDecimals);

      // reset collateral name & symbol
      convertPairsConfig.overseerWhitelistConfig.name = convertPairsConfig?.bAssetsToken?.initMsg?.name ?? convertPairsConfig?.overseerWhitelistConfig?.name;
      convertPairsConfig.overseerWhitelistConfig.symbol = convertPairsConfig?.bAssetsToken?.initMsg?.symbol ?? convertPairsConfig?.overseerWhitelistConfig?.symbol;

      await doOverseerWhitelist(walletData, overseer, custodyNetwork, bAssetsTokenNetwork?.address, convertPairsConfig?.overseerWhitelistConfig);
      await doLiquidationQueueWhitelistCollateral(walletData, liquidationQueue, bAssetsTokenNetwork?.address, convertPairsConfig?.liquidationQueueWhitelistCollateralConfig);
      // await doOracleRegisterFeeder(walletData, nativeDenom, oracle, bAssetsTokenNetwork);
      // await doOracleFeedPrice(walletData, nativeDenom, oracle, bAssetsTokenNetwork, nativeDenomItem?.["price"]);

      /// add nativeDenom feed price
      const feedInfo = Object.assign({ asset: nativeDenom }, baseFeedInfoConfig, convertPairsConfig?.oracleFeedInfoConfig);
      await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);

      /// add bAssetsToken feed price
      if (bAssetsTokenNetwork?.address) {
        const feedInfo = Object.assign({ asset: bAssetsTokenNetwork?.address }, baseFeedInfoConfig, convertPairsConfig?.oracleFeedInfoConfig);
        await doOraclePythConfigFeedInfo(walletData, oracleNetwork, feedInfo, print);
      }

      /// add custody to swap whitelist
      if (custodyNetwork?.address) {
        await doSwapSparrowSetWhitelist(walletData, swapSparrow, { caller: custodyNetwork?.address, isWhitelist: true }, print);
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${CONVERT_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
