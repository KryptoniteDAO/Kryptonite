import type { Addr, BaseContractConfig, ContractDeployed, AssetInfo } from "@/types";

export interface SwapExtentionContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
  };
}

export interface SwapExtentionContractsConfig {
  swapExtention: SwapExtentionContractConfig;
  /// update PairConfig list
  swapPairConfigList?: SwapPairInfo[];
}

export interface SwapExtentionContractsDeployed {
  swapExtention?: ContractDeployed;
}

export interface SwapPairInfo {
  assetInfos: AssetInfo[];
  pairAddress: Addr;
  maxSpread?: string;
  to?: Addr;
}
