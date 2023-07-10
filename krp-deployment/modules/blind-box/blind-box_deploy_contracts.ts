import type { WalletData } from "@/types";
import type { BlindBoxContractsDeployed, KptContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { kptConfigs, kptReadArtifact, doKptDistributeUpdateRuleConfig, deployBlindBox, deployBlindBoxReward, deployBlindBoxInviterReward, printDeployedBlindBoxContracts, doBlindBoxConfig, blindBoxReadArtifact } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy blindBox contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;
  const networkBlindBox = blindBoxReadArtifact(walletData.chainId) as BlindBoxContractsDeployed;
  if (!kptConfigs?.kusd_denom || !kptConfigs?.kusd_reward_controller) {
    throw new Error(`\n  --- --- deploy blindBox contracts error, Please set the kusd info in configuration file variable --- ---`);
  }

  console.log(`\n  --- --- blindBox contracts storeCode & instantiateContract enter --- ---`);

  await deployBlindBox(walletData, networkBlindBox, networkKpt);
  await deployBlindBoxReward(walletData, networkBlindBox, networkKpt);
  await deployBlindBoxInviterReward(walletData, networkBlindBox, networkKpt);

  console.log(`\n  --- --- blindBox contracts storeCode & instantiateContract end --- ---`);

  await printDeployedBlindBoxContracts(networkBlindBox);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- blindBox contracts configure enter --- ---`);
  const print: boolean = true;

  await doBlindBoxConfig(walletData, networkBlindBox, print);
  await doKptDistributeUpdateRuleConfig(walletData, networkKpt, { ruleType: "loot_box", ruleOwner: networkBlindBox?.blindBoxInviterReward?.address }, print);

  console.log(`\n  --- --- blindBox contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy blindBox contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
