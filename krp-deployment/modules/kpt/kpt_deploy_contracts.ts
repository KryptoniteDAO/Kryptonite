import type { WalletData } from "@/types";
import type { KptContractsDeployed, StakingRewardsPairsContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { deployStakingRewards, doVeKptSetMinters, kptConfigs, deployKpt, deployKptFund, deployVeKpt, deployVeKptBoost, doKptUpdateConfig, doVeKptUpdateConfig, kptReadArtifact, printDeployedKptContracts, deployKptDistribute } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy kpt contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;
  if (!kptConfigs?.kusd_denom || !kptConfigs?.kusd_reward_controller) {
    throw new Error(`\n  --- --- deploy kpt contracts error, Please set the kusd info in configuration file variable --- ---`);
  }

  console.log(`\n  --- --- kpt contracts storeCode & instantiateContract enter --- ---`);

  await deployKpt(walletData, networkKpt);
  await deployVeKpt(walletData, networkKpt);
  await deployKptFund(walletData, networkKpt);
  await deployVeKptBoost(walletData, networkKpt);
  /// no need
  // await deployVeKptMiner(walletData, networkKpt);
  // await deployBlindBox(walletData, networkKpt);
  await deployKptDistribute(walletData, networkKpt);
  // await deployBlindBoxReward(walletData, networkKpt);
  // await deployBlindBoxInviterReward(walletData, networkKpt);

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

  await doKptUpdateConfig(walletData, networkKpt, print);
  await doVeKptUpdateConfig(walletData, networkKpt, print);
  // await doBlindBoxConfig(walletData, networkKpt, print);
  // await doKptDistributeUpdateRuleConfig(walletData, networkKpt, { ruleType: "loot_box", ruleOwner: networkKpt?.blindBoxInviterReward?.address }, print);

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
