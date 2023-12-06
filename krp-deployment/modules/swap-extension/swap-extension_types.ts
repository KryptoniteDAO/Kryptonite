import type { InstantiateMsg as SwapSparrowInstantiateMsg } from "@/contracts/swap-extension/SwapSparrow.types";
import type { FeedInfo } from "@/modules";
import type { Addr, AssetInfo, BaseContractConfig, ContractDeployed } from "@/types";

export interface SwapSparrowContractConfig extends BaseContractConfig {
  initMsg?: SwapSparrowInstantiateMsg;
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
  lpTokenAddress: Addr;
  maxSpread?: string;
  to?: Addr;
  oracleFeedInfoConfigs?: FeedInfo[];
}
