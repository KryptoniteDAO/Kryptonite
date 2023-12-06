import { printChangeBalancesByWalletData } from "@/common";
import { swapExtensionContracts } from "@/contracts";
import { loadingWalletData } from "@/env_data";
import { printDeployedSwapContracts, readDeployedContracts } from "@/modules";
import type { WalletData } from "@/types";
import { swapExtensionConfigs } from "./index";
import { SWAP_EXTENSION_MODULE_NAME } from "./swap-extension_constants";

(async (): Promise<void> => {
  console.log(`\n  --- --- verify deployed contracts enter: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);

  const walletData: WalletData = await loadingWalletData();

  const { swapExtensionNetwork, marketNetwork, stakingNetwork, convertNetwork } = readDeployedContracts(walletData.chainId);
  await printDeployedSwapContracts(swapExtensionNetwork);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // just a few simple tests to make sure the contracts are not failing
  // // for more accurate tests we must use integration-tests repo
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const doFunc: boolean = false;
  const print: boolean = true;

  const swapSparrow = swapExtensionNetwork?.swapSparrow;
  if (!swapSparrow?.address) {
    throw new Error(`\n  ********* no deploy`);
  }
  const swapSparrowClient = new swapExtensionContracts.SwapSparrow.SwapSparrowClient(walletData?.activeWallet?.signingCosmWasmClient, walletData?.activeWallet?.address, swapSparrow.address);
  const swapSparrowQueryClient = new swapExtensionContracts.SwapSparrow.SwapSparrowQueryClient(walletData?.activeWallet?.signingCosmWasmClient, swapSparrow.address);

  const swapWhitelistList: {
    name: string;
    caller: string;
    isWhitelist: boolean;
  }[] = [];
  if (stakingNetwork?.reward?.address) {
    swapWhitelistList.push({ name: "staking.reward", caller: stakingNetwork?.reward?.address, isWhitelist: true });
  }
  if (stakingNetwork?.rewardsDispatcher?.address) {
    swapWhitelistList.push({ name: "staking.rewardsDispatcher", caller: stakingNetwork?.rewardsDispatcher?.address, isWhitelist: true });
  }
  if (marketNetwork?.custodyBAssets?.address) {
    swapWhitelistList.push({ name: "market.custodyNAsset", caller: marketNetwork?.custodyBAssets?.address, isWhitelist: true });
  }
  if (convertNetwork?.convertPairs) {
    for (const convertPair of convertNetwork.convertPairs) {
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

  const chainIdSwapPairConfigList = swapExtensionConfigs?.swapPairConfigList;
  if (chainIdSwapPairConfigList && chainIdSwapPairConfigList.length > 0) {
    for (let pairConfig of chainIdSwapPairConfigList) {
      const configRes = await swapSparrowQueryClient.queryPairConfig({ assetInfos: pairConfig.assetInfos });
      print && console.log(`pair config info: pairAddress: ${pairConfig.pairAddress} \n  ${JSON.stringify(configRes)}`);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(`\n  --- --- verify deployed contracts end: ${SWAP_EXTENSION_MODULE_NAME} --- ---`);

  await printChangeBalancesByWalletData(walletData);
})().catch(console.error);
