import type { WalletData } from "@/types";
import type { SwapExtentionContractsDeployed, StakingContractsDeployed, MarketContractsDeployed, ConvertContractsDeployed } from "@/modules";
import { loadingWalletData } from "@/env_data";
import {
  swapExtentionReadArtifact,
  stakingReadArtifact,
  convertReadArtifact,
  marketReadArtifact,
  deployBtoken,
  deployConverter,
  deployCustody,
  doConverterRegisterTokens,
  printDeployedConvertContracts,
  loadingStakingData,
  loadingMarketData,
  doSwapSparrowSetWhitelist,
  doLiquidationQueueWhitelistCollateral,
  doOraclePythConfigFeedInfo,
  doOverseerWhitelist,
  convertConfigs,
  oracleConfigs,
  oracleReadArtifact,
  OracleContractsDeployed,
  writeDeployed, cdpReadArtifact, CdpContractsDeployed
} from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy convert contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const stable_coin_denom: string | undefined = networkCdp?.stable_coin_denom;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  if (!hub?.address || !reward?.address || !bSeiToken?.address || !rewardsDispatcher?.address || !validatorsRegistry?.address || !stSeiToken?.address) {
    throw new Error(`\n  --- --- deploy convert contracts error, Please deploy staking contracts first --- ---`);
  }

  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBSei } = await loadingMarketData(networkMarket);
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBSei?.address) {
    throw new Error(`\n  --- --- deploy convert contracts error, missing some deployed market address info --- ---`);
  }
  const swapSparrow = networkSwap?.swapSparrow;
  const oraclePyth = networkOracle?.oraclePyth;

  console.log(`\n  --- --- convert contracts storeCode & instantiateContract enter --- ---`);

  if (convertConfigs?.convertPairs && convertConfigs.convertPairs.length > 0) {
    for (const convertPair of convertConfigs.convertPairs) {
      await deployConverter(walletData, networkConvert, convertPair.native_denom);
      await deployBtoken(walletData, networkConvert, convertPair.native_denom);
      await deployCustody(walletData, networkConvert, convertPair.native_denom, reward, market, overseer, liquidationQueue, swapSparrow, stable_coin_denom);
    }
  }
  await writeDeployed({});

  console.log(`\n  --- --- convert contracts storeCode & instantiateContract end --- ---`);

  await printDeployedConvertContracts(networkConvert);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- convert contracts configure enter --- ---`);
  const print: boolean = false;

  if (convertConfigs?.convertPairs && convertConfigs.convertPairs.length > 0) {
    for (let convertPairsConfig of convertConfigs.convertPairs) {
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
      await doOverseerWhitelist(walletData, overseer, custodyNetwork, btokenNetwork?.address, convertPairsConfig?.overseerWhitelistConfig);
      await doLiquidationQueueWhitelistCollateral(walletData, liquidationQueue, btokenNetwork?.address, convertPairsConfig?.liquidationQueueWhitelistCollateralConfig);
      // await doOracleRegisterFeeder(walletData, nativeDenom, oracle, btokenNetwork);
      // await doOracleFeedPrice(walletData, nativeDenom, oracle, btokenNetwork, nativeDenomItem?.["price"]);

      /// add bToken feed price
      if (btokenNetwork?.address) {
        const feedInfo = Object.assign({ asset: btokenNetwork?.address }, oracleConfigs.baseFeedInfoConfig);
        await doOraclePythConfigFeedInfo(walletData, oraclePyth, feedInfo, print);
      }

      /// add custody to swap whitelist
      if (custodyNetwork?.address) {
        await doSwapSparrowSetWhitelist(walletData, swapSparrow, { caller: custodyNetwork?.address, isWhitelist: true }, print);
      }
    }
  }

  console.log(`\n  --- --- convert contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy convert contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
