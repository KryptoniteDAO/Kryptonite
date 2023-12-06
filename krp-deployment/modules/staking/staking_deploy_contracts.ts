import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { ContractsDeployed, deployStakingBAssetsToken, deployStakingHub, deployStakingReward, deployStakingRewardsDispatcher, deployStakingStAssetsToken, deployStakingValidatorsRegistry, printDeployedStakingContracts, readDeployedContracts, stakingConfigs } from "@/modules";
import { CDP_MODULE_NAME } from "@/modules/cdp/cdp_constants";
import { ORACLE_MODULE_NAME } from "@/modules/oracle/oracle_constants";
import { STAKING_MODULE_NAME } from "@/modules/staking/staking_constants";
import { SWAP_EXTENSION_MODULE_NAME } from "@/modules/swap-extension/swap-extension_constants";
import type { WalletData } from "@/types";

(async (): Promise<void> => {
  console.log(`\n  --- --- deploy contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const network: ContractsDeployed = readDeployedContracts(walletData.chainId);

  const { swapExtensionNetwork, oracleNetwork, cdpNetwork, tokenNetwork } = network;
  const swapSparrow = swapExtensionNetwork?.swapSparrow;
  const oraclePyth = oracleNetwork?.oraclePyth;
  const stable_coin_denom = cdpNetwork?.stable_coin_denom;
  const keeper = tokenNetwork?.keeper;

  const validators = stakingConfigs?.validators;
  if (!validators || validators.length <= 0) {
    throw new Error("\n  Set the validators in configuration file variable to the validators address of the node");
  }
  if (!swapSparrow?.address) {
    throw new Error(`\n  --- --- deploy ${STAKING_MODULE_NAME} contracts error, Please deploy ${SWAP_EXTENSION_MODULE_NAME} contracts first --- ---`);
  }
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- deploy ${STAKING_MODULE_NAME} contracts error, Please deploy ${ORACLE_MODULE_NAME} contracts first --- ---`);
  }
  if (!stable_coin_denom) {
    throw new Error(`\n  --- --- deploy ${STAKING_MODULE_NAME} contracts error, Please deploy ${CDP_MODULE_NAME} contracts first --- ---`);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- store code & instantiate contracts enter: ${STAKING_MODULE_NAME} --- ---`);

  await deployStakingHub(walletData, network);
  await deployStakingReward(walletData, network);
  await deployStakingBAssetsToken(walletData, network);
  await deployStakingRewardsDispatcher(walletData, network, keeper?.address);
  await deployStakingValidatorsRegistry(walletData, network);
  await deployStakingStAssetsToken(walletData, network);

  console.log(`\n  --- --- store code & instantiate contracts end: ${STAKING_MODULE_NAME} --- ---`);

  const { stakingNetwork } = network;
  await printDeployedStakingContracts(stakingNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy contracts end: ${STAKING_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
