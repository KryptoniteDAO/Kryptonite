import type { WalletData } from "@/types";
import type { ConvertContractsDeployed, MarketContractsDeployed, StakingContractsDeployed, SwapExtentionContractsDeployed } from "@/modules";
import { printChangeBalancesByWalletData } from "@/common";
import { loadingWalletData } from "@/env_data";
import { swapExtentionConfigs, swapExtentionReadArtifact } from "./index";
import { stakingReadArtifact, marketReadArtifact, convertReadArtifact } from "@/modules";
import { swapExtentionContracts } from "@/contracts";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- verify deployed swap contracts enter --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const networkSwap = swapExtentionReadArtifact(walletData.chainId) as SwapExtentionContractsDeployed;
  const networkStaking = stakingReadArtifact(walletData.chainId) as StakingContractsDeployed;
  const networkMarket = marketReadArtifact(walletData.chainId) as MarketContractsDeployed;
  const networkConvert = convertReadArtifact(walletData.chainId) as ConvertContractsDeployed;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const swapExtention = networkSwap?.swapExtention;
  if (!swapExtention?.address) {
    throw new Error(`********* no deploy`);
  }
  const swapExtentionClient = new swapExtentionContracts.SwapExtention.SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapExtentionQueryClient = new swapExtentionContracts.SwapExtention.SwapExtentionQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

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
      const isSwapWhitelistRes = await swapExtentionQueryClient.queryIsSwapWhitelist({ caller: swapWhitelist?.caller });
      console.log(`is_swap_whitelist: ${swapWhitelist?.name} / ${swapWhitelist?.caller} / ${isSwapWhitelistRes}`);
    }
  }

  const chainIdSwapPairConfigList = swapExtentionConfigs?.swapPairConfigList;
  if (chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
    for (let pairConfig of chainIdSwapPairConfigList) {
      const configRes = await swapExtentionQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
      console.log(`pair config info: pairAddress: ${pairConfig.pairAddress} \n  ${JSON.stringify(configRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed swap contracts end --- ---`);

  console.log();
  await printChangeBalancesByWalletData(walletData);
  console.log();
}
