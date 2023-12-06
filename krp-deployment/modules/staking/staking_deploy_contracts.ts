import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { ContractsDeployed, deployStakingBAssetsToken, deployStakingHub, deployStakingReward, deployStakingRewardsDispatcher, deployStakingStAssetsToken, deployStakingValidatorsRegistry, printDeployedStakingContracts, readDeployedContracts, stakingConfigs } from "@/modules";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  const validators = stakingConfigs.validators;
  if (!validators || validators.length <= 0) {
    throw new Error("\n  Set the validator in configuration file variable to the validator address of the node");
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  await deployStakingHub(walletData, network);
  await deployStakingReward(walletData, network);
  await deployStakingBAssetsToken(walletData, network);
  await deployStakingRewardsDispatcher(walletData, network);
  await deployStakingValidatorsRegistry(walletData, network);
  await deployStakingStAssetsToken(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${STAKING_MODULE_NAME} --- ---`);

  const { stakingNetwork } = network;
  await printDeployedStakingContracts(stakingNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${STAKING_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
