import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { deployBSeiToken, deployHub, deployReward, deployRewardsDispatcher, deployStSeiToken, deployValidatorsRegistry, doHubConfig, printDeployedStakingContracts, queryHubConfig, queryHubParameters, stakingReadArtifact } from "./index";
import { doSwapExtentionSetWhitelist, swapExtentionReadArtifact, deployOraclePyth, marketReadArtifact, convertReadArtifact, loadingStakingData } from "@/modules";
import type { WalletData } from "@/types";
import type { ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy staking contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;

  console.log(`--- --- staking contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deployOraclePyth(walletData, networkMarket);

  await deployHub(walletData, networkStaking, networkSwap?.swapExtention);
  await deployReward(walletData, networkStaking, networkSwap?.swapExtention);
  await deployBSeiToken(walletData, networkStaking);
  await deployRewardsDispatcher(walletData, networkStaking, networkSwap?.swapExtention, networkMarket?.oraclePyth);
  await deployValidatorsRegistry(walletData, networkStaking);
  await deployStSeiToken(walletData, networkStaking);

  console.log();
  console.log(`--- --- staking contracts storeCode & instantiateContract end --- ---`);

  const { hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken } = await loadingStakingData(networkStaking);

  await printDeployedStakingContracts(networkStaking);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- staking contracts configure enter --- ---`);
  const print: boolean = false;

  await doHubConfig(walletData, hub, reward, bSeiToken, rewardsDispatcher, validatorsRegistry, stSeiToken);
  await queryHubConfig(walletData, hub);
  await queryHubParameters(walletData, hub);

  /// add staking.reward & staking.rewardsDispatcher to swap whitelist
  const swapWhitelistList: {
    caller: string;
    isWhitelist: boolean;
  }[] = [];
  if (networkStaking?.reward?.address) {
    swapWhitelistList.push({ caller: networkStaking?.reward?.address, isWhitelist: true });
  }
  if (networkStaking?.rewardsDispatcher?.address) {
    swapWhitelistList.push({ caller: networkStaking?.rewardsDispatcher?.address, isWhitelist: true });
  }
  if (swapWhitelistList.length > 0) {
    for (let swapWhitelist of swapWhitelistList) {
      await doSwapExtentionSetWhitelist(walletData, networkSwap?.swapExtention, swapWhitelist, print);
    }
  }

  console.log();
  console.log(`--- --- staking contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy staking contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
