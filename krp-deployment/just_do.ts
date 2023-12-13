import { readDeployedContracts } from "@/modules";
import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { WalletData } from "./types";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- just do enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const {
    swapExtensionNetwork: { swapSparrow } = {},
    oracleNetwork: { oraclePyth } = {},
    cdpNetwork: { stable_coin_denom, cdpCentralControl, cdpLiquidationQueue, cdpStablePool, cdpCollateralPairs } = {},
    stakingNetwork: { hub, reward, rewardsDispatcher, validatorsRegistry, bAssetsToken, stAssetsToken } = {},
    marketNetwork: { aToken, market, liquidationQueue, overseer, custodyBAssets, interestModel, distributionModel } = {},
    convertNetwork: { convertPairs } = {},
    tokenNetwork: { platToken, veToken, keeper, boost, dispatcher, fund, distribute, treasure, stakingPairs } = {}
  } = readDeployedContracts(walletData?.chainId);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- just do end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
