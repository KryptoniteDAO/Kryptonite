import { readDeployedContracts } from "@/modules";
import { getClientDataByWalletData, printChangeBalancesByWalletData, storeCodeByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { WalletData } from "./types";
import { ClientData } from "./types";

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

  // const filePath = "distribute.wasm";
  // const codeId = await storeCodeByWalletData(walletData, filePath, "", { gasLimit: 2525925 });
  // console.log(`\n  --- --- codeId --- ---`, codeId);// test codeId 6608 product codeId  3474

  // const clientData: ClientData = getClientDataByWalletData(walletData);
  // await clientData.signingCosmWasmClient.migrate(walletData?.activeWallet?.address, distribute.address, 6608, {}, "auto");
  const blockHeight = await walletData.stargateClient.getHeight();
  console.log(`\n  --- --- blockHeight: ${blockHeight} --- ---`);




  console.log(`\n  --- --- just do end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
