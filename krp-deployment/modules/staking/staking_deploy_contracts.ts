import type { WalletData } from "@/types";
import type { TokenContractsDeployed, OracleContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
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
  tokenReadArtifact,
  writeDeployed,
  cdpReadArtifact,
  CdpContractsDeployed,
  stakingConfigs
} from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy staking contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkOracle = oracleReadArtifact(walletData.chainId) as OracleContractsDeployed;
  const networkCdp = cdpReadArtifact(walletData.chainId) as CdpContractsDeployed;
  const { stable_coin_denom } = networkCdp;
  const networkToken = tokenReadArtifact(walletData.chainId) as TokenContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;

  const validator = stakingConfigs.validator;
  if (!validator) {
    throw new Error("\n  Set the validator in configuration file variable to the validator address of the node");
  }
  const swapSparrow: ContractDeployed | undefined = networkSwap?.swapSparrow;
  if (!swapSparrow?.address) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy swapExtention contracts first --- ---`);
  }
  const oraclePyth: ContractDeployed | undefined = networkOracle.oraclePyth;
  if (!oraclePyth?.address) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy oracle contracts first --- ---`);
  }
  if (!stable_coin_denom) {
    throw new Error(`\n  --- --- deploy staking contracts error, Please deploy cpd contracts first --- ---`);
  }

  console.log(`\n  --- --- staking contracts storeCode & instantiateContract enter --- ---`);

  await deployHub(walletData, networkStaking, swapSparrow, stable_coin_denom);
  await deployReward(walletData, networkStaking, swapSparrow, stable_coin_denom);
  await deployBSeiToken(walletData, networkStaking);
  await deployRewardsDispatcher(walletData, networkStaking, swapSparrow, oraclePyth, networkToken?.keeper?.address, stable_coin_denom);
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
    await doOraclePythConfigFeedInfo(walletData, networkOracle, feedInfo, print);
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
