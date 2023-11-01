import type { Addr, BaseContractConfig, ContractDeployed, AssetInfo } from "@/types";
import type { InstantiateMsg as SwapSparrowInstantiateMsg } from "@/contracts/swap-extension/SwapSparrow.types";
import type { InstantiateMsg as MockSwapPairInstantiateMsg } from "@/contracts/swap-extension/MockSwapPair.types";

export interface SwapSparrowContractConfig extends BaseContractConfig {
  initMsg?: SwapSparrowInstantiateMsg;
  // initMsg?: {
  //   owner?: Addr;
  // };
}

export interface SwapExtensionContractsConfig {
  swapSparrow: SwapSparrowContractConfig;
  /// update PairConfig list
  swapPairConfigList?: SwapPairInfo[];
}

export interface SwapExtensionContractsDeployed {
  swapSparrow?: ContractDeployed;
}

export interface SwapPairInfo {
  assetInfos?: AssetInfo[];
  pairAddress: Addr;
  maxSpread?: string;
  to?: Addr;
}
