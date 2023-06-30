import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";
import { InitialBalance, TokenInfo } from "@/types";

export interface ConvertConverterContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
  };
}
export interface ConvertBtokenContractConfig extends BaseContractConfig {
  initMsg?: {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: InitialBalance[];
    // mint: string;
  };
}
export interface ConvertCustodyContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    basset_info: TokenInfo;
  };
}

export interface ConvertPairsConfig {
  name?: string;
  native_denom: string;
  converter: ConvertConverterContractConfig;
  btoken: ConvertBtokenContractConfig;
  custody: ConvertCustodyContractConfig;
  overseerWhitelistConfig?: {
    name: string;
    symbol: string;
    max_ltv: string;
  };
  liquidationQueueWhitelistCollateralConfig?: {
    bid_threshold: string;
    max_slot: number;
    premium_rate_per_slot: string;
  };
}

export interface ConvertContractsConfig {
  convertPairs: ConvertPairsConfig[];
}

export interface ConvertPairsContractsDeployed {
  native_denom?: string;
  converter?: ContractDeployed;
  btoken?: ContractDeployed;
  custody?: ContractDeployed;
}

export interface ConvertContractsDeployed {
  convertPairs?: ConvertPairsContractsDeployed[];
}
