import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { KptDeployContracts, WalletData } from "./types";
import { deployKpt, deployKptFund, deployVeKpt, deployVeKptBoost, deployVeKptMiner, doKptUpdateConfig, doVeKptUpdateConfig, kptReadArtifact, printDeployedKptContracts } from "./modules/kpt";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy kpt contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  // const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  // const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;

  console.log();
  console.log(`--- --- kpt contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployKpt(walletData, networkKpt);
  await deployVeKpt(walletData, networkKpt);
  await deployKptFund(walletData, networkKpt);
  await deployVeKptBoost(walletData, networkKpt);
  await deployVeKptMiner(walletData, networkKpt);

  console.log();
  console.log(`--- --- kpt contracts storeCode & instantiateContract end --- ---`);

  await printDeployedKptContracts(networkKpt);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- kpt contracts configure enter --- ---`);
  const print: boolean = true;

  await doKptUpdateConfig(walletData, networkKpt?.kpt, networkKpt?.kptFund, print);
  await doVeKptUpdateConfig(walletData, networkKpt?.veKpt, networkKpt?.kptFund, print);

  console.log();
  console.log(`--- --- kpt contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy kpt contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
