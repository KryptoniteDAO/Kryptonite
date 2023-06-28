import type { Addr, BaseContractConfig, ContractDeployed } from "@/types";

export interface CdpCentralControlContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: string;
    stable_denom: string;
    epoch_period: number;
    redeem_fee: string;
  };
}

export interface CdpCustodyContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: string;
  };
}

export interface CdpLiquidationQueueContractConfig extends BaseContractConfig {
  initMsg?: {
    owner?: string;
    safe_ratio: string;
    bid_fee: string;
    liquidator_fee: string;
    liquidation_threshold: string;
    price_timeframe: number;
    waiting_period: number;
  };
}

export interface CdpStablePoolContractConfig extends BaseContractConfig {
  initMsg?: {
    owner_addr?: string;
    sub_demon: string;
    min_redeem_value: string;
  };
}

export interface CdpCollateralPairsConfig {
  name?: string;
  collateral: string;
  custody: CdpCustodyContractConfig;
}

export interface CdpContractsConfig {
  cdpCentralControl: CdpCentralControlContractConfig;
  cdpStablePool: CdpStablePoolContractConfig;
  cdpLiquidationQueue: CdpLiquidationQueueContractConfig;
  // cdpCustody: CdpCustodyContractConfig;
  cdpCollateralPairs: CdpCollateralPairsConfig[];
}

export interface CdpCollateralPairsDeployed {
  name?: string;
  collateral?: string;
  custody?: ContractDeployed;
}

export interface CdpContractsDeployed {
  cdpCentralControl?: ContractDeployed;
  cdpStablePool?: ContractDeployed;
  cdpLiquidationQueue?: ContractDeployed;
  // cdpCustody?: ContractDeployed;
  cdpCollateralPairs: CdpCollateralPairsDeployed[];
}

export interface CdpCollateralInfo {
  collateral: Addr;
  collateralName: string;
  /// centralControl whitelist
  symbol: string;
  max_ltv: string;
  custody?: Addr;
  /// liquidationQueue whitelist
  bid_threshold: string;
  max_slot: number;
  premium_rate_per_slot: string;
}
