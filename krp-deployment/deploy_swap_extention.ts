import { readArtifact, storeCodeByWalletData, writeArtifact, instantiateContractByWalletData, instantiateContract2ByWalletData, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData } from "./common";
import { loadingWalletData, loadingMarketData, loadingStakingData, chainConfigs, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import type { DeployContract, WalletData } from "./types";
import { ConvertDeployContracts, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts } from "./types";
import { ConfigSwapPairConfigList, deploySwapExtention, doSwapExtentionSetWhitelist, doSwapExtentionUpdatePairConfig, printDeployedSwapContracts } from "./modules/swap";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy swap extends contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH) as StakingDeployContracts;
  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
  const networkSwap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH) as SwapDeployContracts;
  const networkConvert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH) as ConvertDeployContracts;

  console.log();
  console.log(`--- --- swap extends contracts storeCode & instantiateContract enter --- ---`);
  console.log();

  await deploySwapExtention(walletData, networkSwap);

  console.log();
  console.log(`--- --- swap extends contracts storeCode & instantiateContract end --- ---`);

  await printDeployedSwapContracts(networkSwap);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log();
  console.log(`--- --- swap extends contracts configure enter --- ---`);

  const swapExtention: DeployContract = networkSwap?.swapExtention;
  const print: boolean = false;

  /// add staking.reward & staking.rewardsDispatcher & market.custodyBSei & multi convert.custody to whitelist
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
  if (networkMarket?.custodyBSei?.address) {
    swapWhitelistList.push({ caller: networkMarket?.custodyBSei?.address, isWhitelist: true });
  }
  if (networkConvert?.convertPairs) {
    for (let convertPair of networkConvert.convertPairs) {
      if (convertPair?.custody?.address) {
        swapWhitelistList.push({ caller: convertPair?.custody?.address, isWhitelist: true });
      }
    }
  }
  if (swapWhitelistList.length > 0) {
    for (let swapWhitelist of swapWhitelistList) {
      await doSwapExtentionSetWhitelist(walletData, swapExtention, swapWhitelist, print);
    }
  }

  /// config swap pair
  const chainIdSwapPairConfigList = ConfigSwapPairConfigList[walletData.chainId];
  if (chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
    for (let pairConfig of chainIdSwapPairConfigList) {
      await doSwapExtentionUpdatePairConfig(walletData, swapExtention, pairConfig, print);
    }
  }

  console.log();
  console.log(`--- --- swap extends contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- deploy swap extends contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}
