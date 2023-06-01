import { printChangeBalancesByWalletData, queryContractConfig } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs } from "./env_data";
import type { DeployContract, MarketDeployContracts, WalletData } from "./types";
import { ConvertDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
import {
  ConfigOraclePythBaseFeedInfoList,
  ConfigOraclePythFeedInfoList,
  deployCustodyBSei,
  deployDistributionModel,
  deployInterestModel,
  deployLiquidationQueue,
  deployMarket,
  deployOraclePyth,
  deployOverseer,
  doCustodyBSeiConfig,
  doLiquidationQueueConfig,
  doLiquidationQueueWhitelistCollateral,
  doMarketConfig,
  doOraclePythConfigFeedInfo,
  doOverseerConfig,
  doOverseerWhitelist,
  marketReadArtifact,
  printDeployedMarketContracts,
  queryOverseerWhitelist
} from "./modules/market";
import { doSwapExtentionSetWhitelist, swapExtentionReadArtifact } from "./modules/swap";
import { stakingReadArtifact } from "./modules/staking";
import { convertReadArtifact } from "./modules/convert";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy market contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);

  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`--- --- deploy market contracts error, Please deploy staking contracts first --- ---`);
    process.exit(0);
    return;
  }

  console.log();
  console.log(`--- --- market contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployOraclePyth(walletData, networkMarket);
  await deployMarket(walletData, networkMarket);
  await deployInterestModel(walletData, networkMarket);
  await deployDistributionModel(walletData, networkMarket);
  // await deployOracle(walletData, network);
  await deployOverseer(walletData, networkMarket);
  await deployLiquidationQueue(walletData, networkMarket);
  await deployCustodyBSei(walletData, networkMarket, reward?.address, bSeiToken?.address, networkSwap?.swapExtention);

  console.log();
  console.log(`--- --- market contracts storeCode & instantiateContract end --- ---`);

  const { aToken, market, interestModel, distributionModel, oraclePyth, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(networkMarket);

  await printDeployedMarketContracts(networkMarket);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- market contracts configure enter --- ---`);
  const print: boolean = false;

  /**oracle for local test, because local test enviroment has no oracle_pyth*/
  const marketConfigRes = await queryContractConfig(walletData, market, false);
  const interestModelConfigRes = await queryContractConfig(walletData, interestModel, false);
  const distributionModelConfigRes = await queryContractConfig(walletData, distributionModel, false);
  // const oracleConfigRes = await queryContractConfig(walletData, oracle, false);
  const overseerConfigRes = await queryContractConfig(walletData, overseer, false);
  const liquidationQueueConfigRes = await queryContractConfig(walletData, liquidationQueue, false);
  const custodyBSeiConfigRes = await queryContractConfig(walletData, custodyBSei, false);
  const overseerWhitelistRes = await queryOverseerWhitelist(walletData, overseer, false);

  await doMarketConfig(walletData, marketConfigRes.initFlag, marketConfigRes?.config, market, interestModel, distributionModel, overseer, bSeiToken, rewardsDispatcher);
  await doOverseerConfig(walletData, overseerConfigRes?.config, overseer, liquidationQueue);
  await doCustodyBSeiConfig(walletData, custodyBSeiConfigRes?.config, custodyBSei, liquidationQueue);
  await doLiquidationQueueConfig(walletData, liquidationQueueConfigRes?.config, liquidationQueue, oraclePyth, overseer);
  await doOverseerWhitelist(walletData, walletData.nativeCurrency.coinMinimalDenom, overseer, custodyBSei, bSeiToken, chainConfigs?.overseer?.updateMsg);
  await doLiquidationQueueWhitelistCollateral(walletData, walletData.nativeCurrency.coinMinimalDenom, liquidationQueue, bSeiToken, chainConfigs?.liquidationQueue?.updateMsg);

  const chainIdConfigFeedInfos = ConfigOraclePythFeedInfoList[walletData.chainId];
  if (chainIdConfigFeedInfos && chainIdConfigFeedInfos.length > 0) {
    for (let configFeedInfo of chainIdConfigFeedInfos) {
      await doOraclePythConfigFeedInfo(walletData, oraclePyth, configFeedInfo);
    }
    if (bSeiToken?.address) {
      const bSeiTokenConfig = chainIdConfigFeedInfos.find(value => bSeiToken?.address === value.asset);
      if (!bSeiTokenConfig) {
        let configFeedInfo = Object.assign({ asset: bSeiToken?.address }, ConfigOraclePythBaseFeedInfoList[walletData.chainId]);
        await doOraclePythConfigFeedInfo(walletData, oraclePyth, configFeedInfo);
      }
    }
  }

  /// add market.custodyBSei to swap whitelist
  if (networkMarket?.custodyBSei?.address) {
    await doSwapExtentionSetWhitelist(walletData, networkSwap?.swapExtention, { caller: networkMarket?.custodyBSei?.address, isWhitelist: true }, print);
  }

  console.log();
  console.log(`--- --- market contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy market contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
