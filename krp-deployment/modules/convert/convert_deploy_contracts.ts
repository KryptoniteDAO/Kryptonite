import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { convertConfigs, deployConvertPairBAssetsToken, deployConvertPairConverter, deployConvertPairCustodyBAssets, printDeployedConvertContracts, readDeployedContracts } from "@/modules";
import { CONVERT_MODULE_NAME } from "@/modules/convert/convert_constants";
import { MARKET_MODULE_NAME } from "@/modules/market/market_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${CONVERT_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const { swapExtensionNetwork, cdpNetwork, stakingNetwork, marketNetwork } = network;

  if (!marketNetwork) {
    throw new Error(`\n  --- --- deploy ${CONVERT_MODULE_NAME} contracts error, missing some deployed ${MARKET_MODULE_NAME} address info --- ---`);
  }
  const { aToken, market, interestModel, distributionModel, overseer, liquidationQueue, custodyBAssets } = marketNetwork;
  if (!aToken?.address || !market?.address || !interestModel?.address || !distributionModel?.address || !overseer?.address || !liquidationQueue?.address || !custodyBAssets?.address) {
    throw new Error(`\n  --- --- deploy ${CONVERT_MODULE_NAME} contracts error, missing some deployed ${MARKET_MODULE_NAME} address info --- ---`);
  }
  const { reward } = stakingNetwork;
  const { swapSparrow } = swapExtensionNetwork;
  const { stable_coin_denom } = cdpNetwork;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${CONVERT_MODULE_NAME} --- ---`);

  const { convertPairs } = convertConfigs;
  if (!!convertPairs && convertPairs.length > 0) {
    for (const convertPair of convertPairs) {
      const nativeDenom: string = convertPair?.assets?.nativeDenom;
      if (!nativeDenom) {
        console.error(`\n  deploy ${CONVERT_MODULE_NAME} pair error: missing pair's nativeDenom`);
        continue;
      }
      await deployConvertPairConverter(walletData, network, convertPair);
      await deployConvertPairBAssetsToken(walletData, network, convertPair);
      await deployConvertPairCustodyBAssets(walletData, network, convertPair, reward, market, overseer, liquidationQueue, swapSparrow, stable_coin_denom);
    }
  }

  console.log(`\n  --- --- store code & instantiate contracts end: ${CONVERT_MODULE_NAME} --- ---`);

  const { convertNetwork } = network;
  await printDeployedConvertContracts(convertNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${CONVERT_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
