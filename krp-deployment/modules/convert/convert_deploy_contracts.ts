import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { ContractsDeployed } from "@/modules";
import { convertConfigs, deployConvertPairBAssetsToken, deployConvertPairConverter, deployConvertPairCustodyBAssets, printDeployedConvertContracts, readDeployedContracts } from "@/modules";
import { CONVERT_MODULE_NAME } from "@/modules/convert/convert_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${CONVERT_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const { swapExtensionNetwork: { swapSparrow } = {}, cdpNetwork: { stable_coin_denom } = {}, stakingNetwork: { reward } = {}, marketNetwork: { market, interestModel, distributionModel, overseer, liquidationQueue, custodyBAssets } = {} } = network;

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

      if (convertPair.marketCollateralWhitelist) {
        await deployConvertPairCustodyBAssets(walletData, network, convertPair, reward, market, overseer, liquidationQueue, swapSparrow, stable_coin_denom);
      }
    }
  }

  console.log(`\n  --- --- store code & instantiate contracts end: ${CONVERT_MODULE_NAME} --- ---`);

  const { convertNetwork } = network;
  await printDeployedConvertContracts(convertNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${CONVERT_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
