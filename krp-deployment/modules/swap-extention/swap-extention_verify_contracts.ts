import type { WalletData } from "@/types";
import type { ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { swapExtentionConfigs, swapExtentionReadArtifact } from "./index";
import {stakingReadArtifact, marketReadArtifact, convertReadArtifact, printDeployedSwapContracts} from "@/modules";
import { swapExtentionContracts } from "@/contracts";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`\n  --- --- verify deployed swap contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;
  await printDeployedSwapContracts(networkSwap);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  const swapSparrow = networkSwap?.swapSparrow;
  if (!swapSparrow?.address) {
    throw new Error(`\n  ********* no deploy`);
  }
  const swapSparrowClient = new swapExtentionContracts.SwapSparrow.SwapSparrowClient(walletData.signingCosmWasmClient, walletData.address, swapSparrow.address);
  const swapSparrowQueryClient = new swapExtentionContracts.SwapSparrow.SwapSparrowQueryClient(walletData.signingCosmWasmClient, swapSparrow.address);

  const swapWhitelistList: {
    name: string;
    caller: string;
    isWhitelist: boolean;
  }[] = [];
  if (networkStaking?.reward?.address) {
    swapWhitelistList.push({ name: "staking.reward", caller: networkStaking?.reward?.address, isWhitelist: true });
  }
  if (networkStaking?.rewardsDispatcher?.address) {
    swapWhitelistList.push({ name: "staking.rewardsDispatcher", caller: networkStaking?.rewardsDispatcher?.address, isWhitelist: true });
  }
  if (networkMarket?.custodyBSei?.address) {
    swapWhitelistList.push({ name: "market.custodyBSei", caller: networkMarket?.custodyBSei?.address, isWhitelist: true });
  }
  if (networkConvert?.convertPairs) {
    for (const convertPair of networkConvert.convertPairs) {
      if (convertPair?.custody?.address) {
        swapWhitelistList.push({ name: "convert.convertPairs." + convertPair?.native_denom, caller: convertPair?.custody?.address, isWhitelist: true });
      }
    }
  }
  if (swapWhitelistList.length > 0) {
    for (const swapWhitelist of swapWhitelistList) {
      const isSwapWhitelistRes = await swapSparrowQueryClient.queryIsSwapWhitelist({ caller: swapWhitelist?.caller });
      print && console.log(`is_swap_whitelist: ${swapWhitelist?.name} / ${swapWhitelist?.caller} / ${isSwapWhitelistRes}`);
    }
  }

  const chainIdSwapPairConfigList = swapExtentionConfigs?.swapPairConfigList;
  if (chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
    for (let pairConfig of chainIdSwapPairConfigList) {
      const configRes = await swapSparrowQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
      print && console.log(`pair config info: pairAddress: ${pairConfig.pairAddress} \n  ${JSON.stringify(configRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed swap contracts end --- ---`);

  await printChangeBalancesByWalletData(walletData);
}
