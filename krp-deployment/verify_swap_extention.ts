import { coins } from "@cosmjs/stargate";
import { queryStakingDelegations, queryAddressBalance, queryStaking, queryStakingParameters, readArtifact, queryWasmContractByWalletData, executeContractByWalletData, logChangeBalancesByWalletData, queryAddressTokenBalance } from "./common";
import { loadingWalletData, loadingStakingData, STAKING_ARTIFACTS_PATH, MARKET_ARTIFACTS_PATH, SWAP_EXTENSION_ARTIFACTS_PATH, CONVERT_ARTIFACTS_PATH } from "./env_data";
import { ConvertDeployContracts, DeployContract, MarketDeployContracts, StakingDeployContracts, SwapDeployContracts, WalletData } from "./types";
import Decimal from "decimal.js";
import { ConfigSwapPairConfigList, doSwapExtentionSetWhitelist, doSwapExtentionUpdatePairConfig } from "./modules/swap";
import { SwapExtentionClient, SwapExtentionQueryClient } from "./contracts/SwapExtention.client";

main().catch(console.error);

async function main(): Promise<void> {
  console.log(`--- --- verify deployed swap contracts enter --- ---`);

  const walletData = await loadingWalletData();

  const networkStaking = readArtifact(walletData.chainId, STAKING_ARTIFACTS_PATH) as StakingDeployContracts;
  const networkMarket = readArtifact(walletData.chainId, MARKET_ARTIFACTS_PATH) as MarketDeployContracts;
  const networkSwap = readArtifact(walletData.chainId, SWAP_EXTENSION_ARTIFACTS_PATH) as SwapDeployContracts;
  const networkConvert = readArtifact(walletData.chainId, CONVERT_ARTIFACTS_PATH) as ConvertDeployContracts;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const swapExtention = networkSwap?.swapExtention;
  if (!swapExtention?.address) {
    throw new Error(`********* no deploy`);
  }
  const swapExtentionClient: SwapExtentionClient = new SwapExtentionClient(walletData.signingCosmWasmClient, walletData.address, swapExtention.address);
  const swapExtentionQueryClient: SwapExtentionQueryClient = new SwapExtentionQueryClient(walletData.signingCosmWasmClient, swapExtention.address);

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
      const isSwapWhitelistRes = await swapExtentionQueryClient.queryIsSwapWhitelist({ caller: swapWhitelist?.caller });
      console.log(`is_swap_whitelist: ${isSwapWhitelistRes} / ${swapWhitelist?.caller}`);
    }
  }

  const chainIdSwapPairConfigList = ConfigSwapPairConfigList[walletData.chainId];
  if (chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
    for (let pairConfig of chainIdSwapPairConfigList) {
      const configRes = await swapExtentionQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
      console.log(`pair config info: pairAddress: ${pairConfig.pairAddress} \n${JSON.stringify(configRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log();
  console.log(`--- --- verify deployed swap contracts end --- ---`);

  console.log();
  await logChangeBalancesByWalletData(walletData);
  console.log();
}
