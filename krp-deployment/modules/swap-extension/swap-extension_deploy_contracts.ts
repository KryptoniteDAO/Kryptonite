import type { ContractDeployed, WalletData } from "@/types";
import type { SwapExtensionContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { deploySwapSparrow, doSwapSparrowUpdatePairConfig, printDeployedSwapContracts, swapExtensionReadArtifact, swapExtensionConfigs, writeDeployed } from "@/modules";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- deploy swap:extends contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtensionReadArtifact(walletData.chainId) as SwapExtensionContractsDeployed;

  console.log(`\n  --- --- swap:extends contracts storeCode & instantiateContract enter --- ---`);

  await deploySwapSparrow(walletData, networkSwap);
  await writeDeployed({});

  console.log(`\n  --- --- swap:extends contracts storeCode & instantiateContract end --- ---`);

  await printDeployedSwapContracts(networkSwap);

  // //////////////////////////////////////configure contracts///////////////////////////////////////////

  console.log(`\n  --- --- swap:extends contracts configure enter --- ---`);
  const print: boolean = true;

  const swapExtension: ContractDeployed = networkSwap?.swapSparrow;

  /// add staking.reward & staking.rewardsDispatcher & market.custodyBSei & multi convert.custody to whitelist
  // const swapWhitelistList: {
  //   caller: string;
  //   isWhitelist: boolean;
  // }[] = [];
  // if (networkStaking?.reward?.address) {
  //   swapWhitelistList.push({ caller: networkStaking?.reward?.address, isWhitelist: true });
  // }
  // if (networkStaking?.rewardsDispatcher?.address) {
  //   swapWhitelistList.push({ caller: networkStaking?.rewardsDispatcher?.address, isWhitelist: true });
  // }
  // if (networkMarket?.custodyBSei?.address) {
  //   swapWhitelistList.push({ caller: networkMarket?.custodyBSei?.address, isWhitelist: true });
  // }
  // if (networkConvert?.convertPairs) {
  //   for (let convertPair of networkConvert.convertPairs) {
  //     if (convertPair?.custody?.address) {
  //       swapWhitelistList.push({ caller: convertPair?.custody?.address, isWhitelist: true });
  //     }
  //   }
  // }
  // if (swapWhitelistList.length > 0) {
  //   for (let swapWhitelist of swapWhitelistList) {
  //     await doSwapExtensionSetWhitelist(walletData, swapExtension, swapWhitelist, print);
  //   }
  // }

  /// config swap pair
  const chainIdSwapPairConfigList = swapExtensionConfigs?.swapPairConfigList;
  if (!!chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
    for (let pairConfig of chainIdSwapPairConfigList) {
      await doSwapSparrowUpdatePairConfig(walletData, swapExtension, pairConfig, print);
    }
  }

  console.log(`\n  --- --- swap:extends contracts configure end --- ---`);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- deploy swap:extends contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}