import { printChangeBalancesByWalletData, queryContractConfig } from "@/common";
import { loadingWalletData } from "@/env_data";
import { doLiquidationQueueConfig, doLiquidationQueueWhitelistCollateral, doMarketConfig, doOverseerConfig, doOverseerWhitelist, doSwapSparrowSetWhitelist, marketConfigs, printDeployedMarketContracts, queryOverseerWhitelist, readDeployedContracts, stakingConfigs } from "@/modules";
import { MARKET_MODULE_NAME } from "@/modules/market/market_constants";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import type { ContractDeployed, WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- config deployed contracts enter: ${MARKET_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();
  const { swapExtensionNetwork, oracleNetwork, stakingNetwork, marketNetwork } = readDeployedContracts(walletData.chainId);

  if (!stakingNetwork) {
    throw new Error(`\n  --- --- deploy ${MARKET_MODULE_NAME} contracts error, Please deploy ${STAKING_MODULE_NAME} contracts first --- ---`);
  }
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;
  if (!hub?.address || !reward?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stAssetsToken?.address) {
    throw new Error(`\n  --- --- config ${MARKET_MODULE_NAME} contracts error, Please deploy ${STAKING_MODULE_NAME} contracts first --- ---`);
  }

  const { swapSparrow } = swapExtensionNetwork;
  const { oraclePyth } = oracleNetwork;

  await printDeployedMarketContracts(marketNetwork);

  ////////////////////////////////////////configure contracts///////////////////////////////////////////

  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBAssets } = marketNetwork;
  const print: boolean = true;

  const marketConfigRes = await queryContractConfig(walletData, market, false);
  const interestModelConfigRes = await queryContractConfig(walletData, interestModel, false);
  const distributionModelConfigRes = await queryContractConfig(walletData, distributionModel, false);
  // const oracleConfigRes = await queryContractConfig(walletData, oracle, false);
  const overseerConfigRes = await queryContractConfig(walletData, overseer, false);
  const liquidationQueueConfigRes = await queryContractConfig(walletData, liquidationQueue, false);
  const custodyBAssetsConfigRes = await queryContractConfig(walletData, custodyBAssets, false);
  const overseerWhitelistRes = await queryOverseerWhitelist(walletData, overseer, false);

  await doMarketConfig(walletData, marketNetwork, marketConfigRes.initFlag, marketConfigRes?.config, bAssetsToken, rewardsDispatcher, oraclePyth);
  await doOverseerConfig(walletData, overseerConfigRes?.config, overseer, liquidationQueue);
  /// no need
  // await doCustodyBAssetsConfig(walletData, custodyBAssetsConfigRes?.config, custodyBAssets, liquidationQueue);
  await doLiquidationQueueConfig(walletData, liquidationQueueConfigRes?.config, liquidationQueue, oraclePyth, overseer);

  /// add market.custodyBAssets to swap whitelist
  if (custodyBAssets?.address) {
    await doSwapSparrowSetWhitelist(walletData, swapSparrow, { caller: custodyBAssets?.address, isWhitelist: true }, print);
  }
  const { collateralPairs } = marketConfigs;
  if (!!collateralPairs && collateralPairs.length > 0) {
    for (const collateralPairConfig of collateralPairs) {
      let custody: ContractDeployed | undefined = undefined;
      if (!!bAssetsToken?.address) {
        if (collateralPairConfig.collateral === "%bassets_address%") {
          custody = custodyBAssets;
        }
        collateralPairConfig.collateral = collateralPairConfig.collateral.replaceAll("%bassets_address%", bAssetsToken.address);
        if (!collateralPairConfig.collateral || !collateralPairConfig.collateral.startsWith(walletData.prefix)) {
          continue;
        }
      }
      // if (!!stAssetsToken?.address) {
      //   collateralPairConfig.collateral = collateralPairConfig.collateral.replaceAll("%stassets_address%", stAssetsToken.address);
      // }
      if (!collateralPairConfig.collateral || !collateralPairConfig.collateral.startsWith(walletData.prefix)) {
        continue;
      }
      if (!custody?.address) {
        continue;
      }
      // reset collateral name & symbol
      if (collateralPairConfig.collateral === bAssetsToken?.address) {
        collateralPairConfig.overseerWhitelistConfig.name = stakingConfigs?.bAssetsToken?.initMsg?.name ?? collateralPairConfig?.overseerWhitelistConfig?.name;
        collateralPairConfig.overseerWhitelistConfig.symbol = stakingConfigs?.bAssetsToken?.initMsg?.symbol ?? collateralPairConfig?.overseerWhitelistConfig?.symbol;
      } else if (collateralPairConfig.collateral === stAssetsToken?.address) {
        collateralPairConfig.overseerWhitelistConfig.name = stakingConfigs?.stAssetsToken?.initMsg?.name ?? collateralPairConfig?.overseerWhitelistConfig?.name;
        collateralPairConfig.overseerWhitelistConfig.symbol = stakingConfigs?.stAssetsToken?.initMsg?.symbol ?? collateralPairConfig?.overseerWhitelistConfig?.symbol;
      }

      await doOverseerWhitelist(walletData, overseer, custody, collateralPairConfig.collateral, collateralPairConfig?.overseerWhitelistConfig);
      await doLiquidationQueueWhitelistCollateral(walletData, liquidationQueue, collateralPairConfig.collateral, collateralPairConfig?.liquidationQueueWhitelistConfig);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- config deployed contracts end: ${MARKET_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
