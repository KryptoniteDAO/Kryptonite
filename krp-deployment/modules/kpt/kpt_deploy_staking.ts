import { loadingWalletData } from "@/env_data";
import type { WalletData } from "@/types";
import type { KptContractsDeployed, StakingRewardsPairsContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { kptReadArtifact } from "./index";
import { deployStakingRewards, doVeKptSetMinters, KptStakingRewardsConfigList, printDeployedKptStakingContracts } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy kpt:staking contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  // const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  // const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;

  console.log();
  console.log(`--- --- kpt:staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  const chainIdKptStakingRewardsConfigList = KptStakingRewardsConfigList[walletData.chainId];
  if (chainIdKptStakingRewardsConfigList && chainIdKptStakingRewardsConfigList.length > 0) {
    for (const stakingRewardsConfig of chainIdKptStakingRewardsConfigList) {
      await deployStakingRewards(walletData, networkKpt, stakingRewardsConfig);
    }
  }

  console.log();
  console.log(`--- --- kpt:staking contracts storeCode & instantiateContract end --- ---`);

  await printDeployedKptStakingContracts(networkKpt);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- kpt:staking contracts configure enter --- ---`);
  const print: boolean = true;

  if (chainIdKptStakingRewardsConfigList && chainIdKptStakingRewardsConfigList.length > 0) {
    for (const stakingRewardsConfig of chainIdKptStakingRewardsConfigList) {
      const stakingRewardsPairsNetwork = networkKpt?.stakingRewardsPairs?.find((v: StakingRewardsPairsContractsDeployed) => stakingRewardsConfig.staking_token === v.staking_token);
      await doVeKptSetMinters(walletData, networkKpt?.veKpt, stakingRewardsPairsNetwork?.stakingRewards, true, print);
    }
  }

  console.log();
  console.log(`--- --- kpt:staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy kpt:staking contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
