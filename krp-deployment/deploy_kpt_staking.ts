import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData } from "./env_data";
import type { KptDeployContracts, WalletData } from "./types";
import { deployStakingRewards, kptReadArtifact, KptStakingRewardsConfigList, printDeployedKptStakingContracts } from "./modules/kpt";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy kpt staking contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  // const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  // const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptDeployContracts;

  console.log();
  console.log(`--- --- kpt staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  const chainIdKptStakingRewardsConfigList = KptStakingRewardsConfigList[walletData.chainId];
  if (chainIdKptStakingRewardsConfigList && chainIdKptStakingRewardsConfigList.length > 0) {
    for (const stakingRewardsConfig of chainIdKptStakingRewardsConfigList) {
      await deployStakingRewards(walletData, networkKpt, stakingRewardsConfig);
    }
  }

  console.log();
  console.log(`--- --- kpt staking contracts storeCode & instantiateContract end --- ---`);

  await printDeployedKptStakingContracts(networkKpt);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- kpt staking contracts configure enter --- ---`);
  const print: boolean = true;

  // await doKptUpdateConfig(walletData, networkKpt?.kpt, networkKpt?.kptFund, print);
  // await doVeKptUpdateConfig(walletData, networkKpt?.veKpt, networkKpt?.kptFund, print);

  console.log();
  console.log(`--- --- kpt staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy kpt staking contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
