import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import type { CdpCollateralPairsConfig, ContractsDeployed } from "@/modules";
import { cdpConfigs, deployCdpPairCustody, deployCdpPairRewardBook, printDeployedCdpContracts, readDeployedContracts } from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants.ts";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${CDP_MODULE_NAME}:collaterals --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);
  const { oracleNetwork, stakingNetwork } = network;
  const { oraclePyth } = oracleNetwork;
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- deploy ${CDP_MODULE_NAME} contracts error, Please deploy ${ORACLE_MODULE_NAME} contracts first --- ---`);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${CDP_MODULE_NAME}:collaterals --- ---`);

  const cdpCollateralPairsConfig: CdpCollateralPairsConfig[] | undefined = cdpConfigs?.cdpCollateralPairs;
  if (!!cdpCollateralPairsConfig && cdpCollateralPairsConfig.length > 0) {
    const { bAssetsToken, stAssetsToken } = stakingNetwork;
    for (const cdpCollateralPairConfig of cdpCollateralPairsConfig) {
      if (!!bAssetsToken?.address) {
        cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%bassets_address%", bAssetsToken.address);
      }
      // if (!!stAssetsToken?.address) {
      //   cdpCollateralPairConfig.collateral = cdpCollateralPairConfig.collateral.replaceAll("%stassets_address%", stAssetsToken.address);
      // }
      if (!cdpCollateralPairConfig.collateral || !cdpCollateralPairConfig.collateral.startsWith(walletData.prefix)) {
        continue;
      }
      await deployCdpPairRewardBook(walletData, network, cdpCollateralPairConfig);
      await deployCdpPairCustody(walletData, network, cdpCollateralPairConfig);
    }
  }

  console.log(`\n  --- --- store code & instantiate contracts end: ${CDP_MODULE_NAME}:collaterals --- ---`);

  const { cdpNetwork } = network;
  await printDeployedCdpContracts(cdpNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${CDP_MODULE_NAME}:collaterals --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
