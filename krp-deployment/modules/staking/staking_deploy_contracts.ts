import type { WalletData } from "@/types";
import type { KptContractsDeployed, OracleContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import type { ContractDeployed } from "@/types";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import {
  doSwapSparrowSetWhitelist,
  swapExtentionReadArtifact,
  deployOraclePyth,
  loadingStakingData,
  deployBSeiToken,
  deployHub,
  deployReward,
  deployRewardsDispatcher,
  deployStSeiToken,
  deployValidatorsRegistry,
  doHubConfig,
  printDeployedStakingContracts,
  queryHubParameters,
  stakingReadArtifact,
  oracleReadArtifact,
  doOraclePythConfigFeedInfo,
  oracleConfigs,
  kptReadArtifact,
  writeDeployed
} from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy staking contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkKpt = kptReadArtifact(walletData.chainId) as KptContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;

  const swapSparrow: ContractDeployed | undefined = networkSwap?.swapSparrow;
  if (!swapSparrow?.address) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy swapExtention contracts first --- ---`);
  }
  const oraclePyth: ContractDeployed | undefined = networkOracle.oraclePyth;
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy oracle contracts first --- ---`);
  }

  console.log(`\n  --- --- staking contracts storeCode & instantiateContract enter --- ---`);

  await deployOraclePyth(walletData, networkOracle);

  await deployHub(walletData, networkStaking, swapSparrow);
  await deployReward(walletData, networkStaking, swapSparrow);
  await deployBSeiToken(walletData, networkStaking);
  await deployRewardsDispatcher(walletData, networkStaking, swapSparrow, oraclePyth, networkKpt?.keeper?.address);
  await deployValidatorsRegistry(walletData, networkStaking);
  await deployStSeiToken(walletData, networkStaking);
  await writeDeployed({});

  console.log(`\n  --- --- staking contracts storeCode & instantiateContract end --- ---`);

  await printDeployedStakingContracts(networkStaking);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- staking contracts configure enter --- ---`);

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);
  const print: boolean = true;

  await doHubConfig(walletData, networkStaking);
  await queryHubParameters(walletData, hub);

  /// add bseiToken feed price
  if (bSeiToken?.address) {
    const feedInfo = Object.assign({ asset: bSeiToken?.address }, oracleConfigs.baseFeedInfoConfig);
    await doOraclePythConfigFeedInfo(walletData, oraclePyth, feedInfo, print);
  }

  /// add staking.reward & staking.rewardsDispatcher to swap whitelist
  const swapWhitelistList: {
    caller: string;
    isWhitelist: boolean;
  }[] = [];
  if (reward?.address) {
    swapWhitelistList.push({ caller: reward?.address, isWhitelist: true });
  }
  if (rewardsDispatcher?.address) {
    swapWhitelistList.push({ caller: rewardsDispatcher?.address, isWhitelist: true });
  }
  if (swapWhitelistList.length > 0) {
    for (const swapWhitelist of swapWhitelistList) {
      await doSwapSparrowSetWhitelist(walletData, swapSparrow, swapWhitelist, print);
    }
  }

  console.log(`\n  --- --- staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy staking contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
