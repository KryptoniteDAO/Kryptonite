import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { checkAndGetStableCoinDemon, deployMarket, deployMarketCustodyBAssets, deployMarketDistributionModel, deployMarketInterestModel, deployMarketLiquidationQueue, deployMarketOverseer, marketConfigs, printDeployedMarketContracts, readDeployedContracts } from "@/modules";
import { MARKET_MODULE_NAME } from "@/modules/market/market_constants";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${MARKET_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const { stakingNetwork } = network;

  if (!stakingNetwork) {
    throw new Error(`\n  --- --- deploy ${MARKET_MODULE_NAME} contracts error, Please deploy ${STAKING_MODULE_NAME} contracts first --- ---`);
  }
  const { hub, reward, bAssetsToken, rewardsDispatcher, validatorsRegistry, stAssetsToken } = stakingNetwork;
  if (!hub?.address || !reward?.address || !bAssetsToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stAssetsToken?.address) {
    throw new Error(`\n  --- --- deploy ${MARKET_MODULE_NAME} contracts error, Please deploy ${STAKING_MODULE_NAME} contracts first --- ---`);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${MARKET_MODULE_NAME} --- ---`);

  // check stable coin demon amount
  let stableAmount = marketConfigs?.market?.initCoins?.[0]?.amount;
  if (!!stableAmount && !network?.marketNetwork?.market?.address) {
    if (!(await checkAndGetStableCoinDemon(walletData, stableAmount))) {
      throw new Error(`\n  --- --- deploy ${MARKET_MODULE_NAME} contracts error, stable coin demon is insufficient balance --- ---`);
    }
  }

  await deployMarket(walletData, network);
  await deployMarketInterestModel(walletData, network);
  await deployMarketDistributionModel(walletData, network);
  await deployMarketOverseer(walletData, network);
  await deployMarketLiquidationQueue(walletData, network);
  await deployMarketCustodyBAssets(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${MARKET_MODULE_NAME} --- ---`);

  const { marketNetwork } = network;
  await printDeployedMarketContracts(marketNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${MARKET_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
