import { printChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingStakingData } from "./env_data";
import type { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";
import { doSwapExtentionSetWhitelist, swapExtentionReadArtifact } from "./modules/swap";
import { deployBSeiToken, deployHub, deployReward, deployRewardsDispatcher, deployStSeiToken, deployValidatorsRegistry, doHubConfig, printDeployedStakingContracts, queryHubConfig, queryHubParameters, stakingReadArtifact } from "./modules/staking";
import { deployOraclePyth, marketReadArtifact } from "./modules/market";
import { convertReadArtifact } from "./modules/convert";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy staking contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapDeployContracts;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingDeployContracts;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketDeployContracts;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertDeployContracts;
  // console.log(networkStaking);
  // console.log(networkMarket);
  // console.log(networkSwap);
  // console.log(networkConvert);

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
