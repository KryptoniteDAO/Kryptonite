import type { WalletData } from "@/types";
import type { KptContractsDeployed, StakingRewardsPairsContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { deployBlindBox, deployBlindBoxReward, deployStakingRewards, doVeKptSetMinters, kptConfigs, deployKpt, deployKptFund, deployVeKpt, deployVeKptBoost, deployVeKptMiner, doKptUpdateConfig, doVeKptUpdateConfig, kptReadArtifact, printDeployedKptContracts } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy kpt contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  // const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  // const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  // const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  // const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;

  console.log(`\n  --- --- kpt contracts storeCode & instantiateContract enter --- ---`);

  await deployKpt(walletData, networkKpt);
  await deployVeKpt(walletData, networkKpt);
  await deployKptFund(walletData, networkKpt);
  await deployVeKptBoost(walletData, networkKpt);
  // await deployVeKptMiner(walletData, networkKpt);
  await deployBlindBox(walletData, networkKpt);
  await deployBlindBoxReward(walletData, networkKpt);

  const stakingRewardsPairsConfig = kptConfigs.stakingRewardsPairs;
  if (!!stakingRewardsPairsConfig && stakingRewardsPairsConfig.length > 0) {
    for (const stakingRewardsPairConfig of stakingRewardsPairsConfig) {
      await deployStakingRewards(walletData, networkKpt, stakingRewardsPairConfig);
    }
  }

  console.log(`\n  --- --- kpt contracts storeCode & instantiateContract end --- ---`);

  await printDeployedKptContracts(networkKpt);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- kpt contracts configure enter --- ---`);
  const print: boolean = true;

  await doKptUpdateConfig(walletData, networkKpt?.kpt, networkKpt?.kptFund, print);
  await doVeKptUpdateConfig(walletData, networkKpt?.veKpt, networkKpt?.kptFund, print);

  if (!!stakingRewardsPairsConfig && stakingRewardsPairsConfig.length > 0) {
    for (const stakingRewardsPairConfig of stakingRewardsPairsConfig) {
      const stakingRewardsPairsNetwork = networkKpt?.stakingRewardsPairs?.find((v: StakingRewardsPairsContractsDeployed) => stakingRewardsPairConfig.staking_token === v.staking_token);
      await doVeKptSetMinters(walletData, networkKpt?.veKpt, stakingRewardsPairsNetwork?.stakingRewards, true, print);
    }
  }

  console.log(`\n  --- --- kpt contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy kpt contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
