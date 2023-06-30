import type { ContractDeployed, WalletData } from "@/types";
import type { MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed, OracleContractsDeployed, CollateralPairsConfig } from "@/modules";
import { printChangeBalancesByWalletData, queryContractConfig } from "@/common";
import { loadingWalletData } from "@/env_data";
import {
  marketConfigs,
  loadingMarketData,
  loadingStakingData,
  doSwapExtentionSetWhitelist,
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
  queryOverseerWhitelist
} from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy market contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    throw new Error(`\n  --- --- deploy market contracts error, Please deploy staking contracts first --- ---`);
  }

  const swapExtention: ContractDeployed | undefined = networkSwap.swapExtention;
  const oraclePyth: ContractDeployed | undefined = networkOracle.oraclePyth;

  console.log(`\n  --- --- market contracts storeCode & instantiateContract enter --- ---`);

  await deployMarket(walletData, networkMarket);
  await deployInterestModel(walletData, networkMarket);
  await deployDistributionModel(walletData, networkMarket);
  await deployOverseer(walletData, networkMarket, oraclePyth);
  await deployLiquidationQueue(walletData, networkMarket, oraclePyth);
  await deployCustodyBSei(walletData, networkMarket, oraclePyth, reward, bSeiToken, swapExtention);

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
  await doCustodyBSeiConfig(walletData, custodyBSeiConfigRes?.config, custodyBSei, liquidationQueue);
  await doLiquidationQueueConfig(walletData, liquidationQueueConfigRes?.config, liquidationQueue, oraclePyth, overseer);

  /// add market.custodyBSei to swap whitelist
  if (custodyBSei?.address) {
    await doSwapExtentionSetWhitelist(walletData, swapExtention, { caller: custodyBSei?.address, isWhitelist: true }, print);
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
