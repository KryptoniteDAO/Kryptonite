import type { Addr, BaseContractConfig, ContractDeployed, TokenInfo } from "@/types";
import { CdpCustodyContractConfig } from "@/modules";

export interface MarketContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: Addr;
    anc_emission_rate: string;
    max_borrow_factor: string;
    reserve_factor: string;
  };
}

export interface InterestModelContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    base_rate: string;
    interest_multiplier: string;
  };
}

export interface DistributionModelContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    decrement_multiplier: string;
    emission_cap: string;
    emission_floor: string;
    increment_multiplier: string;
  };
}

// export interface OracleContractConfig extends BaseContractConfig {
//   initMsg?: {
//     owner?: Addr;
//   };
// }

export interface OverseerContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: Addr;
    collector_contract: Addr;
    anc_purchase_factor: string;
    buffer_distribution_factor: string;
    epoch_period: number;
    price_timeframe: number;
    target_deposit_rate: string;
    threshold_deposit_rate: string;
    dyn_rate_epoch: number;
    dyn_rate_maxchange: string;
    dyn_rate_yr_increase_expectation: string;
    dyn_rate_min: string;
    dyn_rate_max: string;
  };
}

export interface LiquidationQueueContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    safe_ratio: string;
    bid_fee: string;
    liquidator_fee: string;
    liquidation_threshold: string;
    price_timeframe: number;
    waiting_period: number;
  };
}

export interface CustodyBSeiContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: Addr;
    basset_info: TokenInfo;
  };
}

// export interface OraclePythContractConfig extends BaseContractConfig {
//   initMsg?: {
//     owner?: Addr;
//     pyth_contract: string;
//   };
// }

export interface CollateralPairsConfig {
  name: string;
  collateral: Addr;
  /// overseer whitelist
  overseerWhitelistConfig: {
    name: string;
    symbol: string;
    max_ltv: string;
  };
  /// liquidationQueue whitelist
  liquidationQueueWhitelistConfig: {
    bid_threshold: string;
    max_slot: number;
    premium_rate_per_slot: string;
  };
}

export interface MarketContractsConfig {
  aToken: BaseContractConfig;
  market: MarketContractConfig;
  interestModel: InterestModelContractConfig;
  distributionModel: DistributionModelContractConfig;
  // oracle: OracleContractConfig;
  overseer: OverseerContractConfig;
  liquidationQueue: LiquidationQueueContractConfig;
  custodyBSei: CustodyBSeiContractConfig;
  // oraclePyth: OraclePythContractConfig;
  collateralPairs: CollateralPairsConfig[];
}

export interface MarketContractsDeployed {
  aToken?: ContractDeployed;
  market?: ContractDeployed;
  market_stable_denom?: string;
  interestModel?: ContractDeployed;
  distributionModel?: ContractDeployed;
  // oracle?: ContractDeployed;
  overseer?: ContractDeployed;
  liquidationQueue?: ContractDeployed;
  custodyBSei?: ContractDeployed;
  // oraclePyth?: ContractDeployed;
}
