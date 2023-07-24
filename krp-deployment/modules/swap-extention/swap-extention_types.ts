import type { Addr, BaseContractConfig, ContractDeployed, AssetInfo } from "@/types";

export interface SwapSparrowContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
  };
}

export interface SwapExtentionContractsConfig {
  swapSparrow: SwapSparrowContractConfig;
  /// update PairConfig list
  swapPairConfigList?: SwapPairInfo[];
}

export interface SwapExtentionContractsDeployed {
  swapSparrow?: ContractDeployed;
}

export interface SwapPairInfo {
  assetInfos?: AssetInfo[];
  pairAddress: Addr;
  maxSpread?: string;
  to?: Addr;
}
