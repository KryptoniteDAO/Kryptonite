import type { Addr, BaseContractConfig, ContractDeployed, AssetInfo } from "@/types";

export interface SwapSparrowContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
  };
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
