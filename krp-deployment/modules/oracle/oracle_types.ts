import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";

export interface OraclePythContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    pyth_contract: string;
  };
}

export interface OracleContractsConfig {
  oraclePyth: OraclePythContractConfig;
  mockOracle: BaseContractConfig;
  baseFeedInfoConfig: BaseFeedInfo;
  feedInfoConfigList: FeedInfo[];
}

export interface OracleContractsDeployed {
  oraclePyth?: ContractDeployed;
  mockOracle?: ContractDeployed;
}

export interface BaseFeedInfo {
  checkFeedAge: boolean;
  priceFeedAge: number;
  priceFeedDecimal: number;
  priceFeedId: string;
  priceFeedSymbol: string;
  mockPrice?: number;
}

export interface FeedInfo extends Partial<BaseFeedInfo> {
  asset: Addr;
}
