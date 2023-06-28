import type { ContractDeployed, WalletData } from "@/types";
import type { ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { deploySwapExtention, doSwapExtentionSetWhitelist, doSwapExtentionUpdatePairConfig, printDeployedSwapContracts, swapExtentionReadArtifact, stakingReadArtifact, convertReadArtifact, marketReadArtifact, swapExtentionConfigs } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- deploy swap extends contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;

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
  const print: boolean = false;

  const swapExtention: ContractDeployed = networkSwap?.swapExtention;

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
  const chainIdSwapPairConfigList = swapExtentionConfigs?.swapPairConfigList;
  if (!!chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
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
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
