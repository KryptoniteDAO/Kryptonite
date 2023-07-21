import type { ContractDeployed, WalletData } from "@/types";
import type { KptContractsDeployed, CdpContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed, OracleContractsDeployed, CollateralPairsConfig } from "@/modules";
import { printChangeBalancesByWalletData, queryContractConfig } from "@/common";
import { loadingWalletData } from "@/env_data";
import {
  marketConfigs,
  loadingMarketData,
  loadingStakingData,
  doSwapSparrowSetWhitelist,
  swapExtentionReadArtifact,
  stakingReadArtifact,
  oracleReadArtifact,
  deployCustodyBSei,
  deployDistributionModel,
  deployInterestModel,
  deployLiquidationQueue,
  deployMarket,
  deployOverseer,
  doCustodyBSeiConfig,
  doLiquidationQueueConfig,
  doLiquidationQueueWhitelistCollateral,
  doMarketConfig,
  doOverseerConfig,
  doOverseerWhitelist,
  marketReadArtifact,
  printDeployedMarketContracts,
  queryOverseerWhitelist,
  writeDeployed,
  checkAndGetStableCoinDemon,
  cdpReadArtifact,
  kptReadArtifact
} from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy market contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const stable_coin_denom: string | undefined = networkCdp?.stable_coin_denom;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    throw new Error(`\n  --- --- deploy market contracts error, Please deploy staking contracts first --- ---`);
  }

  const swapSparrow: ContractDeployed | undefined = networkSwap.swapSparrow;
  const oraclePyth: ContractDeployed | undefined = networkOracle.oraclePyth;

  console.log(`\n  --- --- market contracts storeCode & instantiateContract enter --- ---`);

  // check stable coin demon amount
  let stableAmount = marketConfigs?.market?.initCoins?.[0]?.amount;
  if (!!stableAmount) {
    if (!(await checkAndGetStableCoinDemon(walletData, oraclePyth, networkCdp?.cdpCentralControl, stableAmount))) {
      throw new Error(`\n  --- --- deploy market contracts error, stable coin demon is insufficient balance --- ---`);
    }
  }

  await deployMarket(walletData, networkMarket, stable_coin_denom);
  await deployInterestModel(walletData, networkMarket);
  await deployDistributionModel(walletData, networkMarket);
  await deployOverseer(walletData, networkMarket, oraclePyth, stable_coin_denom);
  await deployLiquidationQueue(walletData, networkMarket, oraclePyth, stable_coin_denom);
  await deployCustodyBSei(walletData, networkMarket, oraclePyth, reward, bSeiToken, swapSparrow, stable_coin_denom);
  await writeDeployed({});

  console.log(`\n  --- --- market contracts storeCode & instantiateContract end --- ---`);

  await printDeployedMarketContracts(networkMarket);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- market contracts configure enter --- ---`);

  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(networkMarket);
  const print: boolean = true;

  const marketConfigRes = await queryContractConfig(walletData, market, false);
  const interestModelConfigRes = await queryContractConfig(walletData, interestModel, false);
  const distributionModelConfigRes = await queryContractConfig(walletData, distributionModel, false);
  // const oracleConfigRes = await queryContractConfig(walletData, oracle, false);
  const overseerConfigRes = await queryContractConfig(walletData, overseer, false);
  const liquidationQueueConfigRes = await queryContractConfig(walletData, liquidationQueue, false);
  const custodyBSeiConfigRes = await queryContractConfig(walletData, custodyBSei, false);
  const overseerWhitelistRes = await queryOverseerWhitelist(walletData, overseer, false);

  await doMarketConfig(walletData, networkMarket, marketConfigRes.initFlag, marketConfigRes?.config, bSeiToken, rewardsDispatcher, oraclePyth);
  await doOverseerConfig(walletData, overseerConfigRes?.config, overseer, liquidationQueue);
  /// no need
  // await doCustodyBSeiConfig(walletData, custodyBSeiConfigRes?.config, custodyBSei, liquidationQueue);
  await doLiquidationQueueConfig(walletData, liquidationQueueConfigRes?.config, liquidationQueue, oraclePyth, overseer);

  /// add market.custodyBSei to swap whitelist
  if (custodyBSei?.address) {
    await doSwapSparrowSetWhitelist(walletData, swapSparrow, { caller: custodyBSei?.address, isWhitelist: true }, print);
  }
  const collateralPairsConfig: CollateralPairsConfig[] | undefined = marketConfigs?.collateralPairs;
  if (!!collateralPairsConfig && collateralPairsConfig.length > 0) {
    for (const collateralPairConfig of collateralPairsConfig) {
      let custody: ContractDeployed | undefined = undefined;
      if (!!bSeiToken?.address) {
        if (collateralPairConfig.collateral === "%bsei_address%") {
          custody = custodyBSei;
        }
        collateralPairConfig.collateral = collateralPairConfig.collateral.replaceAll("%bsei_address%", bSeiToken.address);
        if (collateralPairConfig.collateral || !collateralPairConfig.collateral.startsWith(walletData.prefix)) {
          continue;
        }
      }
      // if (!!stSeiToken?.address) {
      //   collateralPairConfig.collateral = collateralPairConfig.collateral.replaceAll("%stsei_address%", stSeiToken.address);
      // }
      if (!collateralPairConfig.collateral || !collateralPairConfig.collateral.startsWith(walletData.prefix)) {
        continue;
      }
      if (!custody?.address) {
        continue;
      }
      await doOverseerWhitelist(walletData, overseer, custody, collateralPairConfig.collateral, collateralPairConfig?.overseerWhitelistConfig);
      await doLiquidationQueueWhitelistCollateral(walletData, liquidationQueue, collateralPairConfig.collateral, collateralPairConfig?.liquidationQueueWhitelistConfig);
    }
  }

  console.log(`\n  --- --- market contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy market contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
