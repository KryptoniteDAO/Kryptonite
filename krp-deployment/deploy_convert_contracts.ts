import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs } from "./env_data";
import type { ConvertDeployContracts, ContractDeployed, WalletData } from "./types";
import { MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
import {
  ConfigOraclePythBaseFeedInfoList,
  ConfigOraclePythFeedInfoList,
  doLiquidationQueueWhitelistCollateral,
  doOraclePythConfigFeedInfo,
  doOverseerWhitelist,
  marketReadArtifact
} from "./modules/market";
import { doSwapExtentionSetWhitelist, swapExtentionReadArtifact } from "./modules/swap";
import { stakingReadArtifact } from "./modules/staking";
import { convertReadArtifact, deployBtoken, deployConverter, deployCustody, doConverterRegisterTokens, printDeployedConvertContracts } from "./modules/convert";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy convert contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    console.error(`--- --- deploy convert contracts error, Please deploy staking contracts first --- ---`);
    process.exit(0);
    return;
  }

  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBSei, oraclePyth } = await loadingMarketData(networkMarket);
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBSei?.address || !oraclePyth?.address) {
    console.log(`--- --- deploy convert contracts error, missing some deployed market address info --- ---`);
    process.exit(0);
    return;
  }

  console.log();
  console.log(`--- --- convert contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  if (chainConfigs?.convertPairs && chainConfigs.convertPairs.length > 0) {
    for (let convertPair of chainConfigs.convertPairs) {
      await deployConverter(walletData, networkConvert, convertPair.native_denom);
      await deployBtoken(walletData, networkConvert, convertPair.native_denom);
      await deployCustody(walletData, networkConvert, convertPair.native_denom, reward, market, overseer, liquidationQueue, networkSwap?.swapExtention);
    }
  }

  console.log();
  console.log(`--- --- convert contracts storeCode & instantiateContract end --- ---`);

  await printDeployedConvertContracts(networkConvert);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- convert contracts configure enter --- ---`);
  const print: boolean = false;

  if (chainConfigs?.convertPairs && chainConfigs.convertPairs.length > 0) {
    for (let convertPairsConfig of chainConfigs.convertPairs) {
      const nativeDenom = convertPairsConfig.native_denom;
      const convertPairsNetwork = networkConvert?.convertPairs?.find((v: any) => nativeDenom === v.native_denom);
      if (!convertPairsConfig || !convertPairsNetwork) {
        continue;
      }
      // const converterConfig = convertPairsConfig?.converter;
      // const btokenConfig = convertPairsConfig?.btoken;
      // const custodyConfig = convertPairsConfig?.custody;

      const converterNetwork = convertPairsNetwork?.converter;
      const btokenNetwork = convertPairsNetwork?.btoken;
      const custodyNetwork = convertPairsNetwork?.custody;

      await doConverterRegisterTokens(walletData, nativeDenom, converterNetwork, btokenNetwork);
      await doOverseerWhitelist(walletData, nativeDenom, overseer, custodyNetwork, btokenNetwork, convertPairsConfig?.overseerWhitelistConfig);
      await doLiquidationQueueWhitelistCollateral(walletData, nativeDenom, liquidationQueue, btokenNetwork, convertPairsConfig?.liquidationQueueWhitelistCollateralConfig);
      // await doOracleRegisterFeeder(walletData, nativeDenom, oracle, btokenNetwork);
      // await doOracleFeedPrice(walletData, nativeDenom, oracle, btokenNetwork, nativeDenomItem?.["price"]);

      const chainIdConfigFeedInfos = ConfigOraclePythFeedInfoList[walletData.chainId];
      if (chainIdConfigFeedInfos && chainIdConfigFeedInfos.length > 0) {
        if (btokenNetwork?.address) {
          const bSeiTokenConfig = chainIdConfigFeedInfos.find(value => btokenNetwork?.address === value.asset);
          if (!bSeiTokenConfig) {
            let configFeedInfo = Object.assign({ asset: btokenNetwork?.address }, ConfigOraclePythBaseFeedInfoList[walletData.chainId]);
            await doOraclePythConfigFeedInfo(walletData, oraclePyth, configFeedInfo);
          }
        }
      }

      /// add custody to swap whitelist
      if (custodyNetwork?.address) {
        await doSwapExtentionSetWhitelist(walletData, networkSwap?.swapExtention, { caller: custodyNetwork?.address, isWhitelist: true }, print);
      }
    }
  }

  console.log();
  console.log(`--- --- convert contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy convert contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
